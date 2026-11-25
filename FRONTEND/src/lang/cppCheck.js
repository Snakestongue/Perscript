// Semantic checks for C++ (tree-sitter-cpp tree): undeclared names and types, missing standard #includes,
// redeclarations, call arity for functions in the same file, missing returns, unreachable code, simple
// literal mismatches. Conservative: name checks run only when every #include is a standard header and the
// file has no `using namespace` other than std, because otherwise names could come from anywhere.

const STD_HEADERS = new Set(("algorithm array atomic bitset cassert cctype chrono climits cmath complex condition_variable cstdint cstdio cstdlib cstring ctime deque exception " +
  "fstream functional initializer_list iomanip ios iostream istream iterator limits list map memory mutex new numeric optional ostream queue random regex set sstream stack stdexcept " +
  "string string_view thread tuple type_traits typeinfo unordered_map unordered_set utility variant vector span numbers cfloat cinttypes cstddef cstdarg cerrno csignal cwchar " +
  "stdio.h stdlib.h string.h math.h time.h ctype.h limits.h stdint.h stdbool.h assert.h float.h errno.h signal.h").split(" "));

// std symbol -> headers that provide it (any one is enough)
const PROVIDERS = {
  vector: ["vector"], string: ["string", "iostream", "sstream", "fstream", "iomanip", "istream", "ostream", "string_view", "regex", "stdexcept"], map: ["map"], unordered_map: ["unordered_map"], set: ["set"], unordered_set: ["unordered_set"],
  array: ["array"], deque: ["deque"], list: ["list"], queue: ["queue"], stack: ["stack"], pair: ["utility", "map", "unordered_map", "algorithm", "tuple", "set", "functional", "vector"], tuple: ["tuple"],
  cout: ["iostream", "ostream"], cin: ["iostream", "istream"], cerr: ["iostream", "ostream"], endl: ["iostream", "ostream"], ostringstream: ["sstream"], stringstream: ["sstream"], istringstream: ["sstream"],
  ifstream: ["fstream"], ofstream: ["fstream"], unique_ptr: ["memory"], shared_ptr: ["memory"], make_unique: ["memory"], make_shared: ["memory"], function: ["functional"],
  sort: ["algorithm"], min: ["algorithm"], max: ["algorithm"], swap: ["utility", "algorithm"], find: ["algorithm"], reverse: ["algorithm"], accumulate: ["numeric"], sqrt: ["cmath", "math.h"], pow: ["cmath", "math.h"],
  sin: ["cmath", "math.h"], cos: ["cmath", "math.h"], tan: ["cmath", "math.h"], atan2: ["cmath", "math.h"], fabs: ["cmath", "math.h"], floor: ["cmath", "math.h"], ceil: ["cmath", "math.h"], hypot: ["cmath", "math.h"],
  thread: ["thread"], mutex: ["mutex"], optional: ["optional"], variant: ["variant"], string_view: ["string_view"], numeric_limits: ["limits"], to_string: ["string"],
};
const STD_TYPES = new Set(["vector", "string", "map", "unordered_map", "set", "unordered_set", "array", "deque", "list", "queue", "stack", "pair", "tuple", "ostringstream", "stringstream", "istringstream", "ifstream", "ofstream",
  "unique_ptr", "shared_ptr", "function", "thread", "mutex", "optional", "variant", "string_view", "size_t", "ostream", "istream", "exception", "runtime_error", "invalid_argument", "out_of_range", "nullptr_t"]);
const C_NAMES = new Set(("printf scanf puts putchar getchar malloc calloc free exit abort atoi atof rand srand strlen strcpy strcmp strcat memcpy memset fabs sqrt pow sin cos tan floor ceil fmod abs labs " +
  "NULL EOF INT_MAX INT_MIN M_PI RAND_MAX assert sizeof stdin stdout stderr fprintf fopen fclose time clock main true false size_t uint8_t uint16_t uint32_t uint64_t int8_t int16_t int32_t int64_t " +
  "__FILE__ __LINE__ __func__ nullptr this").split(" "));
const PRIM = new Set(["int", "long", "short", "char", "float", "double", "bool", "void", "unsigned", "signed", "auto", "wchar_t", "size_t"]);
const INTLIKE = new Set(["int", "long", "short", "char", "unsigned", "signed", "size_t"]);

function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function closest(name, candidates) {
  let best = null, bestD = Infinity;
  for (const c of new Set(candidates)) { const dist = editDistance(name.toLowerCase(), c.toLowerCase()); if (dist < bestD) { bestD = dist; best = c; } }
  return best && bestD <= Math.max(1, Math.floor(name.length / 3)) ? best : null;
}

export function diagnoseCpp(parse, src) {
  const tree = parse(src);
  if (!tree || tree.rootNode.hasError()) return [];
  const root = tree.rootNode;
  const out = [];
  const report = (node, message, severity = "error") =>
    out.push({ startLine: node.startPosition.row + 1, startCol: node.startPosition.column + 1, endLine: node.endPosition.row + 1, endCol: node.endPosition.column + 1, message, severity });
  const walk = (n, fn) => { fn(n); for (const c of n.namedChildren) walk(c, fn); };

  // ---- includes and using-directives ----------------------------------------------
  const includes = new Set();
  let foreignInclude = false;
  for (const inc of root.descendantsOfType("preproc_include")) {
    const t = inc.namedChildren[0];
    const name = t?.text?.replace(/^[<"]|[>"]$/g, "") ?? "";
    includes.add(name);
    if (t?.type !== "system_lib_string" || !STD_HEADERS.has(name)) foreignInclude = true;
  }
  let usingStd = false, foreignUsing = false;
  const usingNames = new Set();
  for (const u of root.descendantsOfType("using_declaration")) {
    const text = u.text.replace(/\s+/g, " ");
    if (/^using namespace std\s*;?$/.test(text)) usingStd = true;
    else if (/^using namespace/.test(text)) foreignUsing = true;
    else { const m = text.match(/^using std::(\w+)/); if (m) usingNames.add(m[1]); }
  }

  // ---- declared names ---------------------------------------------------------------
  const declared = new Set(), declaredTypes = new Set();
  const unwrap = (d, into) => {
    if (!d) return;
    switch (d.type) {
      case "identifier": case "field_identifier": into.add(d.text); break;
      case "type_identifier": into.add(d.text); break;
      case "init_declarator": case "pointer_declarator": case "reference_declarator": case "array_declarator": case "function_declarator": case "parenthesized_declarator": case "attributed_declarator":
        unwrap(d.childForFieldName("declarator") || d.namedChildren[0], into); break;
      case "structured_binding_declarator": for (const c of d.namedChildren) unwrap(c, into); break;
      case "qualified_identifier": break;
      default: break;
    }
  };
  const DECLISH = ["declaration", "field_declaration", "parameter_declaration", "optional_parameter_declaration", "variadic_parameter_declaration"];
  walk(root, (n) => {
    if (DECLISH.includes(n.type)) {
      for (const c of n.namedChildren) if (["init_declarator", "identifier", "pointer_declarator", "reference_declarator", "array_declarator", "function_declarator", "field_identifier", "parenthesized_declarator", "structured_binding_declarator"].includes(c.type)) unwrap(c, declared);
    } else if (n.type === "function_definition") {
      const d = n.childForFieldName("declarator");
      unwrap(d, declared);
    } else if (n.type === "for_range_loop") unwrap(n.childForFieldName("declarator"), declared);
    else if (n.type === "enumerator") declared.add(n.namedChildren[0].text);
    else if (["class_specifier", "struct_specifier", "union_specifier", "enum_specifier"].includes(n.type)) { const nm = n.childForFieldName("name"); if (nm) { declared.add(nm.text); declaredTypes.add(nm.text); } }
    else if (n.type === "namespace_definition") { const nm = n.childForFieldName("name"); if (nm) declared.add(nm.text); }
    else if (n.type === "type_definition") { for (const c of n.namedChildren) if (c.type === "type_identifier") { declared.add(c.text); declaredTypes.add(c.text); } }
    else if (n.type === "alias_declaration") { const nm = n.childForFieldName("name"); if (nm) { declared.add(nm.text); declaredTypes.add(nm.text); } }
    else if (n.type === "type_parameter_declaration" || n.type === "template_parameter_declaration") { for (const c of n.namedChildren) if (c.type === "type_identifier" || c.type === "identifier") { declared.add(c.text); declaredTypes.add(c.text); } }
    else if (n.type === "preproc_def" || n.type === "preproc_function_def") { const nm = n.childForFieldName("name"); if (nm) declared.add(nm.text); }
    else if (n.type === "lambda_capture_specifier") { /* captures reference existing names */ }
  });

  // base classes we cannot see
  let unknownBase = false;
  for (const bc of root.descendantsOfType("base_class_clause")) for (const t of bc.namedChildren) if ((t.type === "type_identifier" || t.type === "qualified_identifier" || t.type === "template_type") && !declaredTypes.has(t.text.replace(/<.*$/s, ""))) unknownBase = true;
  const strict = !foreignInclude && !foreignUsing && !unknownBase && root.descendantsOfType("template_declaration").length === 0;

  // ---- 1. missing standard #includes ------------------------------------------------
  const needInclude = (node, sym) => {
    const providers = PROVIDERS[sym];
    if (!providers || providers.some((h) => includes.has(h))) return;
    report(node, `'std::${sym}' needs #include <${providers[0]}>`);
  };
  walk(root, (n) => {
    if (n.type === "qualified_identifier") {
      const scope = n.childForFieldName("scope");
      if (scope?.text !== "std") return;
      const nm = n.childForFieldName("name");
      const sym = nm?.type === "template_type" ? nm.childForFieldName("name")?.text : nm?.text;
      if (sym) needInclude(n, sym);
    }
  });
  if (usingStd) walk(root, (n) => {
    if ((n.type === "identifier" || n.type === "type_identifier") && PROVIDERS[n.text] && !declared.has(n.text) && n.parent?.type !== "qualified_identifier" && n.parent?.type !== "using_declaration" && !(["declaration", "parameter_declaration"].includes(n.parent?.type) && false)) needInclude(n, n.text);
  });

  // ---- 2. undeclared names and types ---------------------------------------------------
  if (strict) {
    const stdOk = (name) => (usingStd && (PROVIDERS[name] || STD_TYPES.has(name))) || usingNames.has(name);
    walk(root, (n) => {
      if (n.type === "identifier") {
        if (n.parent?.type === "qualified_identifier" || n.parent?.type === "using_declaration" || n.parent?.type === "preproc_include") return;
        const name = n.text;
        if (declared.has(name) || C_NAMES.has(name) || stdOk(name)) return;
        const near = closest(name, [...declared]);
        report(n, `Use of undeclared identifier '${name}'${near ? `. Did you mean '${near}'?` : ""}`);
      } else if (n.type === "type_identifier") {
        const p = n.parent?.type;
        if (p === "qualified_identifier" || p === "base_class_clause") return;
        if (p === "template_type" && n.parent.parent?.type === "qualified_identifier") return; // std::vector<int>
        const name = n.text;
        if (declared.has(name) || declaredTypes.has(name) || PRIM.has(name) || C_NAMES.has(name) || stdOk(name) || STD_TYPES.has(name) && usingStd) return;
        const near = closest(name, [...declaredTypes]);
        report(n, `Unknown type name '${name}'${near ? `. Did you mean '${near}'?` : ""}`);
      }
    });
  }

  // ---- 3. redeclarations ------------------------------------------------------------
  const declaresIn = (block) => {
    const names = [];
    for (const st of block.namedChildren) {
      if (st.type !== "declaration") continue;
      const into = new Set(); const ids = [];
      for (const c of st.namedChildren) if (["init_declarator", "identifier", "pointer_declarator", "reference_declarator", "array_declarator"].includes(c.type)) { const tmp = new Set(); unwrap(c, tmp); for (const nm of tmp) { into.add(nm); ids.push(c); } }
      for (const c of st.namedChildren) if (["init_declarator", "identifier", "pointer_declarator", "reference_declarator", "array_declarator"].includes(c.type)) { const tmp = new Set(); unwrap(c, tmp); for (const nm of tmp) names.push([nm, c]); }
    }
    return names;
  };
  for (const fn of root.descendantsOfType("function_definition")) {
    const params = new Set();
    const pl = fn.childForFieldName("declarator")?.childForFieldName("parameters");
    for (const p of pl?.namedChildren || []) { const t = new Set(); unwrap(p.childForFieldName("declarator"), t); for (const nm of t) { if (params.has(nm)) report(p, `Redefinition of parameter '${nm}'`); params.add(nm); } }
    const body = fn.childForFieldName("body");
    if (body?.type === "compound_statement") {
      const scan = (block, inherited) => {
        const here = new Map(inherited);
        for (const [nm, node] of declaresIn(block)) { if (here.has(nm) && !(inherited.has(nm) && here.get(nm) !== "local")) report(node, `Redeclaration of '${nm}'`); else here.set(nm, "local"); }
        for (const st of block.namedChildren) for (const inner of st.type === "compound_statement" ? [st] : st.namedChildren.filter((c) => c.type === "compound_statement")) scan(inner, new Map(params.size ? [...params].map((p) => [p, "param"]) : []));
      };
      const first = new Map([...params].map((p) => [p, "param"]));
      const names = declaresIn(body);
      const seen = new Map(first);
      for (const [nm, node] of names) { if (seen.has(nm)) report(node, seen.get(nm) === "param" ? `Redeclaration of parameter '${nm}'` : `Redeclaration of '${nm}'`); else seen.set(nm, "local"); }
      for (const st of body.namedChildren) for (const inner of st.type === "compound_statement" ? [st] : st.namedChildren.filter((c) => c.type === "compound_statement")) scan(inner, new Map());
    }
  }

  // ---- 4. control flow: missing return, unreachable code ----------------------------------
  const EXITS = new Set(["exit", "abort", "std::terminate", "terminate", "quick_exit", "_Exit"]);
  const or = (a, b) => (a === "yes" || b === "yes" ? "yes" : a === "no" && b === "no" ? "no" : "maybe");
  const LOOPS = new Set(["while_statement", "for_statement", "do_statement", "for_range_loop"]);
  const breaksOut = (loop) => {
    let labeled = false, direct = false;
    const visit = (n, nested) => { for (const c of n.namedChildren) { if (c.type === "break_statement") { if (!nested) direct = true; continue; } if (c.type === "goto_statement") labeled = true; if (c.type === "lambda_expression" || c.type === "function_definition") continue; visit(c, nested || LOOPS.has(c.type) || c.type === "switch_statement"); } };
    visit(loop, false);
    return labeled ? "maybe" : direct ? "yes" : "no";
  };
  const isTrue = (c) => !!c && /^\(?\s*(true|1)\s*\)?$/.test(c.text.trim());
  function completes(s) {
    if (!s) return "yes";
    switch (s.type) {
      case "return_statement": case "throw_statement": case "break_statement": case "continue_statement": case "goto_statement": case "co_return_statement": return "no";
      case "compound_statement": { let r = "yes"; for (const st of s.namedChildren.filter((c) => c.type !== "comment")) { r = completes(st); if (r !== "yes") return r; } return r; }
      case "if_statement": {
        const cons = s.childForFieldName("consequence"), alt = s.childForFieldName("alternative");
        if (!alt) return "yes";
        const altBody = alt.type === "else_clause" ? alt.namedChildren[0] : alt;
        return or(completes(cons), completes(altBody));
      }
      case "while_statement": return isTrue(s.childForFieldName("condition")) ? breaksOut(s) : "yes";
      case "do_statement": return isTrue(s.childForFieldName("condition")) ? breaksOut(s) : "yes";
      case "for_statement": return s.childForFieldName("condition") ? "yes" : breaksOut(s);
      case "for_range_loop": return "yes";
      case "try_statement": { let r = completes(s.childForFieldName("body")); for (const c of s.namedChildren.filter((x) => x.type === "catch_clause")) r = or(r, completes(c.childForFieldName("body"))); return r; }
      case "expression_statement": { const c = s.namedChildren[0]; if (c?.type === "call_expression" && EXITS.has(c.childForFieldName("function")?.text)) return "no"; return "yes"; }
      case "declaration": case "empty_statement": case "using_declaration": case "type_definition": case "static_assert_declaration": return "yes";
      default: return "maybe"; // switch, labeled statements, anything unfamiliar
    }
  }
  walk(root, (n) => {
    if (n.type !== "compound_statement") return;
    const sts = n.namedChildren.filter((c) => c.type !== "comment");
    for (let i = 0; i + 1 < sts.length; i++) {
      if (completes(sts[i]) === "no" && sts[i + 1].type !== "labeled_statement" && sts[i + 1].type !== "case_statement") { report(sts[i + 1], "Unreachable code: nothing before this line lets it run", "warning"); break; }
    }
  });
  for (const fn of root.descendantsOfType("function_definition")) {
    const type = fn.childForFieldName("type");
    const decl = fn.childForFieldName("declarator");
    const body = fn.childForFieldName("body");
    if (!type || !decl || body?.type !== "compound_statement") continue; // constructors and destructors have no return type
    if (type.text === "void" || type.type === "placeholder_type_specifier" && /^decltype/.test(type.text)) continue;
    const nameNode = decl.type === "function_declarator" ? decl.childForFieldName("declarator") : null;
    const name = nameNode?.text ?? "";
    if (name === "main" || /^operator/.test(name) || /^~/.test(name)) continue;
    if (fn.parent?.type === "template_declaration") continue;
    if (completes(body) === "yes") report(nameNode || fn, `Missing return: '${name}' returns ${type.text} but can reach the end without returning a value`);
  }

  // ---- 5. literal mismatches ---------------------------------------------------------------
  const litKind = (v) => {
    if (!v) return null;
    if (v.type === "string_literal" || v.type === "concatenated_string" || v.type === "raw_string_literal") return "string";
    if (v.type === "char_literal") return "char";
    if (v.type === "true" || v.type === "false") return "bool";
    if (v.type === "number_literal") return /^[0-9]*\.|[eE][+-]?\d|^0[xX]/.test(v.text) && !/^0[xX]/.test(v.text) ? "float" : "int";
    if (v.type === "unary_expression" || v.type === "parenthesized_expression") return litKind(v.namedChildren[0]);
    return null;
  };
  walk(root, (n) => {
    if (n.type !== "declaration" && n.type !== "field_declaration") return;
    const ty = n.childForFieldName("type");
    if (!ty) return;
    const tn = ty.text.replace(/^(const|static|constexpr|unsigned|signed)\s+/g, "");
    for (const d of n.namedChildren.filter((c) => c.type === "init_declarator")) {
      if (d.childForFieldName("declarator")?.type !== "identifier") continue;
      const v = d.childForFieldName("value");
      const braces = v?.type === "initializer_list";
      const lit = litKind(braces ? v.namedChildren[0] : v);
      if (!lit) continue;
      const isInt = INTLIKE.has(tn), isFloat = tn === "double" || tn === "float", isStr = tn === "std::string" || tn === "string";
      const target = braces ? v.namedChildren[0] : v;
      if ((isInt || isFloat) && lit === "string") report(target, `Cannot initialize '${tn}' with a string literal`);
      else if (isStr && (lit === "int" || lit === "float")) report(target, `Cannot initialize '${tn}' with a number`);
      else if (isStr && lit === "char") report(target, `Cannot initialize '${tn}' with a single character; use a string literal`);
      else if (isInt && lit === "float") report(target, braces ? `Narrowing conversion: a floating-point value does not fit in '${tn}'` : `Implicit conversion from floating point to '${tn}' drops the fractional part`, braces ? "error" : "warning");
    }
  });

  // ---- 6. call arity for functions defined once in this file ---------------------------
  const funcs = new Map(); // name -> [{min,max}] one entry per declaration/definition
  const addFn = (decl) => {
    const nameNode = decl.childForFieldName("declarator");
    if (!nameNode || nameNode.type !== "identifier") return;
    const ps = decl.childForFieldName("parameters")?.namedChildren || [];
    if (ps.some((p) => p.type === "variadic_parameter_declaration")) { funcs.set(nameNode.text, [{ skip: true }]); return; }
    const voidOnly = ps.length === 1 && ps[0].text === "void";
    const max = voidOnly ? 0 : ps.length, min = voidOnly ? 0 : ps.filter((p) => p.type !== "optional_parameter_declaration").length;
    if (!funcs.has(nameNode.text)) funcs.set(nameNode.text, []);
    funcs.get(nameNode.text).push({ min, max });
  };
  for (const c of root.namedChildren) {
    if (c.type === "function_definition" && c.childForFieldName("declarator")?.type === "function_declarator") addFn(c.childForFieldName("declarator"));
    else if (c.type === "declaration") for (const d of c.namedChildren.filter((x) => x.type === "function_declarator")) addFn(d);
    else if (c.type === "template_declaration" || c.type === "namespace_definition") for (const x of c.descendantsOfType("function_declarator")) if (x.childForFieldName("declarator")) funcs.set(x.childForFieldName("declarator").text, [{ skip: true }]);
  }
  const localNames = new Set(); // a local variable or parameter named like a function hides it
  walk(root, (n) => { if (["parameter_declaration", "optional_parameter_declaration"].includes(n.type)) unwrap(n.childForFieldName("declarator"), localNames); });
  walk(root, (n) => {
    if (n.type !== "call_expression") return;
    const f = n.childForFieldName("function");
    if (f?.type !== "identifier" || localNames.has(f.text)) return;
    const sigs = funcs.get(f.text);
    if (!sigs || sigs.some((s) => s.skip)) return;
    const uniq = new Set(sigs.map((s) => `${s.min}-${s.max}`));
    if (uniq.size !== 1) return;
    const { min, max } = sigs[0];
    const have = n.childForFieldName("arguments")?.namedChildren.length ?? 0;
    if (have > max) report(n, `Too many arguments to function '${f.text}': expected ${max === min ? max : `at most ${max}`}, have ${have}`);
    else if (have < min) report(n, `Too few arguments to function '${f.text}': expected ${max === min ? min : `at least ${min}`}, have ${have}`);
  });

  // ---- 7. unused locals (warning) -----------------------------------------------------------
  for (const fn of root.descendantsOfType("function_definition")) {
    const body = fn.childForFieldName("body"); if (body?.type !== "compound_statement") continue;
    for (const d of body.descendantsOfType("init_declarator")) {
      if (d.parent?.type !== "declaration" || d.childForFieldName("declarator")?.type !== "identifier") continue;
      const idn = d.childForFieldName("declarator");
      const used = body.descendantsOfType("identifier").some((i) => i.text === idn.text && i.id !== idn.id);
      if (!used) report(idn, `Variable '${idn.text}' is never used`, "warning");
    }
  }

  const seen = new Set();
  return out.filter((d) => { const k = `${d.startLine}:${d.startCol}:${d.message}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => a.startLine - b.startLine || a.startCol - b.startCol).slice(0, 40);
}
