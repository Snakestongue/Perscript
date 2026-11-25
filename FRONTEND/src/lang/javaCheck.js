// Semantic checks for Java: names, types, members and call shapes that the syntax linter cannot see.
// Works on the tree-sitter tree plus the engine's symbol index (WPILib, CTRE, ...). Conservative by
// design: when something cannot be resolved with confidence the check stays quiet, so a student is
// never told "error" about code that would compile.
//
// diagnose(api, src, { extraTypes }) -> [{ startLine, startCol, endLine, endCol, message, severity }]
//   api         engine internals (see javaEngine.js)
//   extraTypes  Set of class names that live in other files of the same project (same package)

// Everything in java.lang that student code commonly uses without an import.
const JAVA_LANG = new Set(("Object String StringBuilder StringBuffer Math StrictMath System Integer Long Short Byte Double Float Boolean Character Number " +
  "Void Class Enum Record Iterable Comparable Runnable Thread ThreadLocal Process Runtime Override Deprecated SuppressWarnings FunctionalInterface SafeVarargs " +
  "Exception RuntimeException Error Throwable AssertionError ArithmeticException ArrayIndexOutOfBoundsException IndexOutOfBoundsException " +
  "StringIndexOutOfBoundsException IllegalArgumentException IllegalStateException NullPointerException NumberFormatException " +
  "UnsupportedOperationException ClassCastException InterruptedException CloneNotSupportedException ClassNotFoundException " +
  "StackOverflowError OutOfMemoryError CharSequence AutoCloseable Appendable Readable Cloneable").split(" "));
const PRIMS = new Set(["int", "long", "short", "byte", "double", "float", "boolean", "char", "void"]);
const OBJECT_METHODS = new Set(["toString", "equals", "hashCode", "getClass", "notify", "notifyAll", "wait", "clone", "finalize"]);
const NUMERIC = new Set(["int", "long", "short", "byte", "double", "float", "char"]);
const WHOLE = new Set(["int", "long", "short", "byte", "char"]);

function lastSeg(s) { return s.split(".").pop(); }

function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

function closest(name, candidates) {
  let best = null, bestD = Infinity;
  for (const c of new Set(candidates)) {
    const dist = editDistance(name.toLowerCase(), c.toLowerCase());
    if (dist < bestD) { bestD = dist; best = c; }
  }
  return best && bestD <= Math.max(2, Math.floor(name.length / 3)) ? best : null;
}

export function diagnose(api, src, opts = {}) {
  const tree = api.parse(src);
  if (!tree || tree.rootNode.hasError()) return []; // never judge code the parser could not read
  const out = [];
  const extraTypes = opts.extraTypes || new Set();
  const root = tree.rootNode;
  const report = (node, message, severity = "error", from = node, to = node) =>
    out.push({ startLine: from.startPosition.row + 1, startCol: from.startPosition.column + 1, endLine: to.endPosition.row + 1, endCol: to.endPosition.column + 1, message, severity });

  // ---- file-level facts -----------------------------------------------------------
  const imports = []; // { fqn, simple, wildcard, isStatic, node }
  const declaredTypes = new Set(); // classes/interfaces/enums/records/type params declared in this file
  const typeParams = new Set();
  const fileClasses = []; // class-like declaration nodes
  const CLASSY = new Set(["class_declaration", "interface_declaration", "enum_declaration", "record_declaration", "annotation_type_declaration"]);

  const walkAll = (n, fn) => { fn(n); for (const c of n.namedChildren) walkAll(c, fn); };

  walkAll(root, (n) => {
    if (n.type === "import_declaration") {
      const isStatic = n.children.some((c) => c.type === "static");
      const wildcard = n.children.some((c) => c.type === "asterisk");
      const name = n.namedChildren.find((c) => c.type === "scoped_identifier" || c.type === "identifier");
      if (name) imports.push({ fqn: name.text, simple: wildcard ? "*" : lastSeg(name.text), wildcard, isStatic, node: n });
    } else if (CLASSY.has(n.type)) {
      declaredTypes.add(n.childForFieldName("name")?.text);
      fileClasses.push(n);
    } else if (n.type === "type_parameter") {
      const id = n.namedChildren.find((c) => c.type === "type_identifier" || c.type === "identifier");
      if (id) typeParams.add(id.text);
    }
  });

  const explicit = new Map(imports.filter((i) => !i.wildcard && !i.isStatic).map((i) => [i.simple, i.fqn]));
  const wildcards = imports.filter((i) => i.wildcard && !i.isStatic).map((i) => i.fqn);
  const hasStaticImports = imports.some((i) => i.isStatic);

  // Wildcards over packages the index does not cover (java.util.*) could provide any name: stay quiet then.
  const indexedPackages = api.packages();
  const opaqueWildcard = wildcards.some((p) => !indexedPackages.has(p) && !p.startsWith("edu.wpi") && !p.startsWith("com.ctre"));

  const classByName = (name) => api.classesNamed(name);

  function typeKnown(name) {
    return declaredTypes.has(name) || typeParams.has(name) || JAVA_LANG.has(name) || explicit.has(name) || extraTypes.has(name);
  }

  // Looks a class up the way the compiler would: file, explicit import, wildcard import, java.lang.
  function indexedViaImports(name) {
    const list = classByName(name);
    if (!list.length) return null;
    const fqn = explicit.get(name);
    if (fqn) return list.find((c) => `${c.p}.${c.n}` === fqn) || null; // same simple name in a package we do not index
    return list.find((c) => wildcards.includes(c.p)) || null;
  }

  // ---- 1. unknown classes, missing imports ----------------------------------------
  const usedSimpleNames = new Set();
  const checkTypeName = (node, name) => {
    if (name === "var") return;
    usedSimpleNames.add(name);
    if (typeKnown(name)) return;
    const candidates = classByName(name).filter((c) => !c.outer);
    if (candidates.length) {
      if (indexedViaImports(name)) return;
      const c = candidates[0];
      report(node, `Cannot find symbol: class ${name}. Add: import ${c.p}.${c.n};`);
      return;
    }
    if (opaqueWildcard) return;
    const near = closest(name, [...declaredTypes, ...explicit.keys(), ...extraTypes, ...JAVA_LANG].filter(Boolean));
    report(node, `Cannot find symbol: class ${name}${near ? `. Did you mean ${near}?` : ""}`);
  };

  walkAll(root, (n) => {
    if (n.type === "type_identifier") {
      // names of declarations and type parameters are not uses
      const p = n.parent;
      if (!p) return;
      if (CLASSY.has(p.type) && p.childForFieldName("name")?.id === n.id) return;
      if (p.type === "type_parameter") return;
      if (p.type === "scoped_type_identifier" && p.namedChildren[0]?.id !== n.id) return; // Outer.Inner: check Outer only
      if (p.type === "scoped_type_identifier" && /^[a-z]/.test(n.text)) return; // java.util.List: a package path
      checkTypeName(n, n.text);
    }
  });

  // ---- 2. names: variables, fields, uppercase receivers ---------------------------
  // Strategy: a name is fine if it is declared ANYWHERE in the enclosing method/initializer or in any
  // class of the file, or is an inherited member from a resolvable superclass.
  const fieldNames = new Set();
  let supersResolvable = true;
  for (const cls of fileClasses) {
    const body = cls.childForFieldName("body");
    for (const m of body?.namedChildren || []) {
      if (m.type === "field_declaration" || m.type === "constant_declaration") for (const d of m.namedChildren.filter((x) => x.type === "variable_declarator")) fieldNames.add(d.childForFieldName("name").text);
      if (m.type === "enum_constant") fieldNames.add(m.childForFieldName("name")?.text ?? m.namedChildren[0]?.text);
    }
    if (cls.type === "enum_declaration") for (const c of cls.namedChildren) if (c.type === "enum_body") for (const m of c.namedChildren) {
      if (m.type === "enum_constant") fieldNames.add(m.childForFieldName("name")?.text ?? m.namedChildren[0]?.text);
      if (m.type === "enum_body_declarations") for (const f of m.namedChildren) if (f.type === "field_declaration") for (const d of f.namedChildren.filter((x) => x.type === "variable_declarator")) fieldNames.add(d.childForFieldName("name").text);
    }
    if (cls.type === "record_declaration") for (const p of cls.childForFieldName("parameters")?.namedChildren || []) fieldNames.add(p.childForFieldName("name")?.text);
    // superclass: fields come from the index when we can see it
    const sup = cls.childForFieldName("superclass");
    if (sup) {
      const sname = sup.namedChildren.find((c) => c.type === "type_identifier" || c.type === "generic_type" || c.type === "scoped_type_identifier");
      const base = sname ? lastSeg(sname.text.replace(/<.*$/s, "")) : null;
      const rec = base ? (indexedViaImports(base) || classByName(base)[0]) : null;
      if (rec) { for (const x of api.membersOf(rec)) if (x.m.k === "field" || x.m.k === "const") fieldNames.add(x.m.n); }
      else if (!(base && declaredTypes.has(base))) supersResolvable = false; // fields of an unseen class are unknown
    }
    const ifaces = cls.childForFieldName("interfaces");
    if (ifaces) for (const t of ifaces.descendantsOfType("type_identifier")) {
      const rec = classByName(t.text)[0];
      if (rec) { for (const x of api.membersOf(rec)) if (x.m.k === "field" || x.m.k === "const") fieldNames.add(x.m.n); }
      else if (!declaredTypes.has(t.text) && !JAVA_LANG.has(t.text)) supersResolvable = false;
    }
  }

  const METHODISH = new Set(["method_declaration", "constructor_declaration", "compact_constructor_declaration", "static_initializer", "initializer_block", "block"]);
  const localsCache = new Map();
  const localsOf = (scopeNode) => {
    if (localsCache.has(scopeNode.id)) return localsCache.get(scopeNode.id);
    const names = new Set();
    walkAll(scopeNode, (x) => {
      if (x.type === "variable_declarator") names.add(x.childForFieldName("name")?.text);
      else if (x.type === "formal_parameter" || x.type === "spread_parameter" || x.type === "catch_formal_parameter") names.add(x.childForFieldName("name")?.text || x.namedChildren.filter((c) => c.type === "identifier").pop()?.text);
      else if (x.type === "enhanced_for_statement") names.add(x.childForFieldName("name")?.text);
      else if (x.type === "resource") names.add(x.childForFieldName("name")?.text);
      else if (x.type === "inferred_parameters") for (const c of x.namedChildren) names.add(c.text);
      else if (x.type === "lambda_expression") { const ps = x.childForFieldName("parameters"); if (ps?.type === "identifier") names.add(ps.text); }
      else if (x.type === "instanceof_expression" || x.type === "pattern" || x.type === "type_pattern" || x.type === "record_pattern") for (const c of x.namedChildren) if (c.type === "identifier") names.add(c.text);
    });
    localsCache.set(scopeNode.id, names);
    return names;
  };
  const outerLocals = (n) => { // locals of every enclosing method/lambda (lambdas see their method's locals)
    const names = new Set(); let p = n;
    while (p) { if (["method_declaration", "constructor_declaration", "compact_constructor_declaration", "static_initializer", "lambda_expression"].includes(p.type)) for (const x of localsOf(p)) names.add(x); p = p.parent; }
    return names;
  };

  if (!hasStaticImports && supersResolvable && !opaqueWildcard) {
    walkAll(root, (n) => {
      if (n.type !== "identifier") return;
      const p = n.parent; if (!p) return;
      // positions where an identifier is NOT a variable read
      if (p.type === "method_invocation" && p.childForFieldName("name")?.id === n.id) return;
      if (p.type === "field_access" && p.childForFieldName("field")?.id === n.id) return;
      if (["labeled_statement", "break_statement", "continue_statement"].includes(p.type)) return;
      if (CLASSY.has(p.type) || p.type === "method_declaration" || p.type === "constructor_declaration" || p.type === "formal_parameter" || p.type === "variable_declarator" && p.childForFieldName("name")?.id === n.id) return;
      if (["scoped_identifier", "package_declaration", "import_declaration", "annotation", "marker_annotation", "element_value_pair", "enum_constant", "inferred_parameters", "catch_formal_parameter", "spread_parameter", "resource", "enhanced_for_statement", "method_reference", "type_pattern", "pattern", "instanceof_expression", "record_pattern", "lambda_expression", "switch_label", "enum_body"].includes(p.type)) {
        if (p.type === "enhanced_for_statement" && p.childForFieldName("value")?.id !== n.id) return;
        if (p.type === "resource" && p.childForFieldName("name")?.id === n.id) return;
        if (p.type === "lambda_expression" && p.childForFieldName("parameters")?.id === n.id) return;
        if (p.type === "instanceof_expression" && p.namedChildren[0]?.id !== n.id) return;
        if (["method_reference", "switch_label", "enum_constant", "enum_body", "scoped_identifier", "package_declaration", "import_declaration", "annotation", "marker_annotation", "element_value_pair", "inferred_parameters", "catch_formal_parameter", "spread_parameter", "type_pattern", "pattern", "record_pattern"].includes(p.type)) return;
      }
      if (p.type === "field_access" && p.childForFieldName("object")?.id === n.id) { /* checked below: a.b */ }
      const name = n.text;
      if (outerLocals(n).has(name) || fieldNames.has(name)) return;
      if (/^[A-Z]/.test(name)) { // a class used as a receiver (Math.abs, Constants.kP)
        if (typeKnown(name) || classByName(name).length) { if (!typeKnown(name)) checkTypeName(n, name); usedSimpleNames.add(name); return; }
        if (/^[A-Z0-9_]+$/.test(name) && name.length > 1) return; // CONSTANT_LIKE names: could come from anywhere
        report(n, `Cannot find symbol: ${name}`);
        return;
      }
      if (name === "length" && p.type === "field_access") return;
      const near = closest(name, [...outerLocals(n), ...fieldNames]);
      report(n, `Cannot find symbol: variable ${name}${near ? `. Did you mean ${near}?` : ""}`);
    });
  }

  // ---- 3. members and call shapes on known types ----------------------------------
  const ownMethods = new Set();
  const ownMethodArity = new Map(); // name -> Set(arity)
  for (const cls of fileClasses) for (const m of cls.descendantsOfType("method_declaration")) {
    const nm = m.childForFieldName("name").text;
    ownMethods.add(nm);
    const params = m.childForFieldName("parameters")?.namedChildren || [];
    if (!ownMethodArity.has(nm)) ownMethodArity.set(nm, new Set());
    ownMethodArity.get(nm).add(params.some((p) => p.type === "spread_parameter") ? -1 : params.length);
  }

  const argCountOf = (call) => call.childForFieldName("arguments")?.namedChildren.length ?? 0;
  const paramCount = (m) => api.parseMember(m).params.length;
  const hasVarargs = (m) => /\.\.\./.test(m.s || "");
  const sigText = (c, m) => api.parseMember(m).label;
  const arityOk = (ms, n) => ms.some((m) => hasVarargs(m) || paramCount(m) === n);
  const arityMsg = (ms, owner, name, n, isCtor) => {
    const sigs = ms.slice(0, 3).map((m) => "  " + sigText(owner, m)).join("\n");
    const expected = [...new Set(ms.map(paramCount))].sort((a, b) => a - b).join(" or ");
    return `${isCtor ? "Constructor" : "Method"} ${name} expects ${expected} argument${expected === "1" ? "" : "s"}, but ${n} given.\n${sigs}`;
  };

  walkAll(root, (n) => {
    if (n.type === "method_invocation") {
      const obj = n.childForFieldName("object");
      const nameNode = n.childForFieldName("name");
      const name = nameNode.text;
      const count = argCountOf(n);
      if (obj) {
        if (obj.type === "string_literal") return;
        const ctx = api.buildCtx(src, n.startIndex, tree);
        const t = api.typeOfExpr(obj.text, ctx);
        if (!t) return;
        const all = api.membersOf(t.cls);
        const methods = all.filter((x) => x.m.n === name && x.m.k === "method").map((x) => x.m);
        if (!methods.length) {
          if (OBJECT_METHODS.has(name)) return;
          const near = closest(name, all.filter((x) => x.m.k === "method").map((x) => x.m.n));
          report(nameNode, `Cannot find symbol: method ${name}() in ${t.cls.n}${near ? `. Did you mean ${near}?` : ""}`);
        } else if (!arityOk(methods, count)) {
          report(nameNode, arityMsg(methods, t.cls, name, count, false));
        }
      } else if (!hasStaticImports && supersResolvable) {
        // unqualified call: own methods, or inherited from an indexed superclass
        if (ownMethods.has(name) || OBJECT_METHODS.has(name)) {
          const ar = ownMethodArity.get(name);
          if (ar && !ar.has(-1) && !ar.has(count) && !inheritedHas(n, name)) report(nameNode, `Method ${name} expects ${[...ar].join(" or ")} argument${ar.size === 1 && [...ar][0] === 1 ? "" : "s"}, but ${count} given.`);
          return;
        }
        const inh = inheritedMethods(n, name);
        if (inh === null) return; // could not see the superclass
        if (!inh.length) {
          const near = closest(name, [...ownMethods]);
          report(nameNode, `Cannot find symbol: method ${name}()${near ? `. Did you mean ${near}?` : ""}`);
        } else if (!arityOk(inh.map((x) => x.m), count)) report(nameNode, arityMsg(inh.map((x) => x.m), null, name, count, false));
      }
    } else if (n.type === "object_creation_expression") {
      if (n.childForFieldName("body")) return; // anonymous class
      const tn = n.childForFieldName("type");
      if (!tn) return;
      const base = lastSeg(tn.text.replace(/<.*$/s, ""));
      const full = tn.text.replace(/<.*$/s, "");
      const list = full.includes(".") ? classByName(full.split(".").slice(-2).join(".")).concat(classByName(base)) : classByName(base);
      const rec = (full.includes(".") ? list.find((c) => c.n === full.split(".").slice(-2).join(".")) : null) || indexedViaImports(base) || (typeKnown(base) ? null : list[0]);
      if (!rec) return;
      const ctors = rec.m.filter((m) => m.k === "ctor");
      if (!ctors.length) return;
      const count = argCountOf(n);
      if (!arityOk(ctors, count)) report(tn, arityMsg(ctors, rec, rec.n, count, true));
    }
  });

  function selfClassOf(n) { let p = n; while (p) { if (CLASSY.has(p.type)) return p; p = p.parent; } return null; }
  function inheritedMethods(n, name) {
    const cls = selfClassOf(n);
    const sup = cls?.childForFieldName("superclass");
    if (!sup) return cls ? [] : null;
    const t = sup.namedChildren.find((c) => c.type === "type_identifier" || c.type === "generic_type" || c.type === "scoped_type_identifier");
    const base = t ? lastSeg(t.text.replace(/<.*$/s, "")) : null;
    if (base && declaredTypes.has(base)) return null; // extends a class from this file: trust its methods
    const rec = base ? (indexedViaImports(base) || classByName(base)[0]) : null;
    if (!rec) return null;
    const ifaces = cls.childForFieldName("interfaces");
    if (ifaces) return null; // default methods from interfaces: stay quiet
    return api.membersOf(rec).filter((x) => x.m.n === name && x.m.k === "method");
  }
  function inheritedHas(n, name) { const r = inheritedMethods(n, name); return !!(r && r.length); }

  // ---- 4. types: erasure first, type-argument substitution where the index allows ----
  // Anything we cannot work out is `null` ("unknown"), and unknown matches everything, so it never
  // produces an error. Generic type arguments are only used to substitute a class's own type parameter
  // into a member's return type (SendableChooser<Command>.getSelected() -> Command); they are never
  // compared against each other (List<Double> and List<String> are both just List).
  const PRIM_ORDER = ["byte", "short", "int", "long", "float", "double"];
  const BOX = { int: "Integer", long: "Long", short: "Short", byte: "Byte", double: "Double", float: "Float", boolean: "Boolean", char: "Character" };
  const UNBOX = Object.fromEntries(Object.entries(BOX).map(([k, v]) => [v, k]));
  const BOX_SUPERS = new Set(["Object", "Number", "Comparable", "Serializable", "Constable"]);
  const FUNC_ARITY = { Runnable: 0, Callable: 0, Supplier: 0, BooleanSupplier: 0, DoubleSupplier: 0, IntSupplier: 0, LongSupplier: 0, Consumer: 1, DoubleConsumer: 1, IntConsumer: 1, BooleanConsumer: 1, Function: 1, DoubleFunction: 1, IntFunction: 1, Predicate: 1, DoublePredicate: 1, IntPredicate: 1, UnaryOperator: 1, DoubleUnaryOperator: 1, IntUnaryOperator: 1, ToDoubleFunction: 1, ToIntFunction: 1, BiConsumer: 2, BiFunction: 2, BiPredicate: 2, BinaryOperator: 2, DoubleBinaryOperator: 2, IntBinaryOperator: 2 };

  // "Map<String, List<Double>>" -> { name: "Map", args: [{name:"String"}, {name:"List", args:[...]}] }. Arrays and wildcards are unknown.
  const splitArgs = (s) => { const parts = []; let depth = 0, cur = ""; for (const ch of s) { if (ch === "<") depth++; if (ch === ">") depth--; if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; } else cur += ch; } if (cur.trim()) parts.push(cur.trim()); return parts; };
  const parseType = (text) => {
    if (!text) return null;
    let t = text.replace(/\b(final|static)\b/g, "").replace(/@\w+/g, "").trim();
    if (!t || /\[/.test(t) || t.startsWith("?") || t === "var") return null;
    const lt = t.indexOf("<");
    const base = lastSeg((lt < 0 ? t : t.slice(0, lt)).trim());
    if (!/^[A-Za-z_]\w*$/.test(base)) return null;
    if (lt < 0) return PRIMS.has(base) ? { name: base, prim: true } : { name: base };
    const inner = t.slice(lt + 1, t.lastIndexOf(">"));
    return { name: base, args: inner.trim() ? splitArgs(inner).map(parseType) : [] };
  };
  const show = (t) => (t.args && t.args.length ? `${t.name}<${t.args.map((a) => (a ? show(a) : "?")).join(", ")}>` : t.name);

  // Class type parameters. The API database does not record them, so they are inferred: single-letter type
  // variables used in a class's member signatures. Only classes with exactly ONE such variable are used for
  // substitution; more than that and the order is a guess, so those stay unknown.
  const tpCache = new Map();
  const typeParamsOf = (rec) => {
    if (tpCache.has(rec)) return tpCache.get(rec);
    const found = new Set();
    for (const m of rec.m) {
      if (/^\s*<[^>]*>/.test(m.s || "")) continue; // method-level type parameters
      for (const x of (m.s || "").matchAll(/\b([A-Z][0-9]?)\b/g)) if (!api.classesNamed(x[1]).length) found.add(x[1]);
    }
    const r = found.size === 1 ? [...found] : [];
    tpCache.set(rec, r);
    return r;
  };

  // Everything a class is a subtype of, by simple name. complete=false when part of the hierarchy is unseen.
  const declaredSupers = new Map();
  for (const cls of fileClasses) {
    const names = [];
    for (const part of [cls.childForFieldName("superclass"), cls.childForFieldName("interfaces")]) if (part) for (const t of part.descendantsOfType("type_identifier")) names.push(t.text);
    declaredSupers.set(cls.childForFieldName("name").text, names);
  }
  const ancestors = (name, seen = new Set()) => {
    const out = { set: new Set([name, "Object"]), complete: true };
    const visit = (n) => {
      if (seen.has(n)) return; seen.add(n);
      let direct = null;
      if (declaredSupers.has(n)) direct = declaredSupers.get(n);
      else {
        const rec = indexedViaImports(n) || (typeKnown(n) ? null : classByName(n)[0]);
        if (rec) direct = [rec.ext, rec.impl].filter(Boolean).flatMap((s) => splitArgs(s).map((x) => lastSeg(x.replace(/<.*$/s, "").trim())));
        else if (n !== "Object" && !JAVA_LANG.has(n)) out.complete = false;
      }
      for (const d of direct || []) { out.set.add(d); visit(d); }
    };
    visit(name);
    return out;
  };

  // Scope-lenient table of declared variable types: name -> parsed type, or null when ambiguous.
  const varTypes = new Map();
  const noteVar = (name, type) => { if (!name) return; if (varTypes.has(name)) { const old = varTypes.get(name); if (!old || !type || show(old) !== show(type)) varTypes.set(name, null); } else varTypes.set(name, type); };

  const literalType = (v) => {
    if (!v) return null;
    switch (v.type) {
      case "string_literal": return { name: "String" };
      case "decimal_integer_literal": case "hex_integer_literal": case "octal_integer_literal": case "binary_integer_literal": return { name: /[lL]$/.test(v.text) ? "long" : "int", prim: true, literal: true };
      case "decimal_floating_point_literal": case "hex_floating_point_literal": return { name: /[fF]$/.test(v.text) ? "float" : "double", prim: true, literal: true };
      case "true": case "false": return { name: "boolean", prim: true };
      case "character_literal": return { name: "char", prim: true, literal: true };
      case "unary_expression": { const t = literalType(v.namedChildren[0]); return t && t.prim && t.name !== "boolean" && /^[-+]/.test(v.text) ? t : null; }
      case "parenthesized_expression": return typeOf(v.namedChildren[0]);
      default: return null;
    }
  };

  // Type of an expression, or null when unknown. Deliberately small: literals, `new`, casts, names with
  // a declared type, and calls on those when the index tells us the return type.
  function typeOf(e) {
    if (!e) return null;
    const lit = literalType(e);
    if (lit) return lit;
    switch (e.type) {
      case "parenthesized_expression": return typeOf(e.namedChildren[0]);
      case "cast_expression": return parseType(e.childForFieldName("type")?.text);
      case "identifier": return varTypes.get(e.text) ?? null;
      case "object_creation_expression": { if (e.childForFieldName("body")) return null; return parseType(e.childForFieldName("type")?.text); }
      case "method_invocation": {
        const obj = e.childForFieldName("object");
        const name = e.childForFieldName("name").text;
        if (!obj) return null;
        const recv = obj.type === "identifier" || obj.type === "object_creation_expression" || obj.type === "method_invocation" || obj.type === "parenthesized_expression" ? typeOf(obj) : null;
        const isStatic = obj.type === "identifier" && !varTypes.has(obj.text) && /^[A-Z]/.test(obj.text);
        const recvName = recv ? recv.name : isStatic ? obj.text : null;
        if (!recvName || (recv && recv.prim)) return null;
        const rec = indexedViaImports(recvName) || (typeKnown(recvName) ? null : classByName(recvName)[0]);
        if (!rec) return null;
        const cands = api.membersOf(rec).filter((x) => x.m.n === name && x.m.k === "method");
        const count = argCountOf(e);
        const fit = cands.filter((x) => hasVarargs(x.m) || paramCount(x.m) === count);
        if (!fit.length) return null;
        const rts = new Set(fit.map((x) => api.parseMember(x.m).returnType));
        if (rts.size !== 1) return null; // overloads disagree: unknown
        const rtText = [...rts][0];
        if (/^\s*<[^>]*>/.test(fit[0].m.s || "")) return null; // method has its own type parameters
        const rt = parseType(rtText);
        if (!rt) return null;
        // substitute the receiver's type argument for the class's single type parameter
        const tp = typeParamsOf(fit[0].owner);
        const subst = (t) => {
          if (!t) return null;
          if (tp.includes(t.name) && !t.args) { const idx = tp.indexOf(t.name); const arg = recv && recv.args && recv.args.length === tp.length ? recv.args[idx] : null; return arg ? { ...arg } : null; }
          if (/^[A-Z][0-9]?$/.test(t.name) && !api.classesNamed(t.name).length) return null; // a type variable we cannot resolve
          return t.args ? { name: t.name, args: t.args.map(subst) } : t;
        };
        return subst(rt);
      }
      default: return null;
    }
  }

  // Why `from` cannot be assigned to `to`, or null when it can (or when we cannot tell).
  function whyNot(from, to) {
    if (!from || !to) return null;
    const f = from.name, t = to.name;
    if (f === t) return null;
    const fp = !!from.prim, tp = !!to.prim;
    if (fp && tp) {
      if (f === "boolean" || t === "boolean") return `incompatible types: ${f} cannot be converted to ${t}`;
      if (t === "char") return from.literal && f === "int" ? null : `incompatible types: possible lossy conversion from ${f} to char`;
      if (f === "char") return PRIM_ORDER.indexOf(t) >= PRIM_ORDER.indexOf("int") ? null : `incompatible types: possible lossy conversion from char to ${t}`;
      if (from.literal && f === "int" && (t === "short" || t === "byte")) return null; // constant fits
      return PRIM_ORDER.indexOf(f) <= PRIM_ORDER.indexOf(t) ? null : `incompatible types: possible lossy conversion from ${f} to ${t}`;
    }
    if (fp && !tp) { // boxing
      if (BOX[f] === t || BOX_SUPERS.has(t)) return null;
      if (UNBOX[t]) return from.literal && f === "int" && ["Short", "Byte", "Character"].includes(t) ? null : `incompatible types: ${f} cannot be converted to ${t}`;
      if (t === "String" || indexedViaImports(t) || declaredTypes.has(t)) return `incompatible types: ${f} cannot be converted to ${t}`;
      return null;
    }
    if (!fp && tp) { // unboxing
      const u = UNBOX[f];
      if (u) return u === t || (u !== "boolean" && t !== "boolean" && u !== "char" && PRIM_ORDER.indexOf(u) <= PRIM_ORDER.indexOf(t)) ? null : `incompatible types: ${f} cannot be converted to ${t}`;
      if (f === "String") return `incompatible types: String cannot be converted to ${t}`;
      if (indexedViaImports(f) || declaredTypes.has(f)) { const a = ancestors(f); return a.complete ? `incompatible types: ${show(from)} cannot be converted to ${t}` : null; }
      return null;
    }
    // reference to reference: by erasure, is `to` among from's ancestors?
    if (t === "Object") return null;
    const known = (n) => n === "String" || UNBOX[n] || declaredTypes.has(n) || !!indexedViaImports(n);
    if (!known(f) || !known(t)) return null;
    const a = ancestors(f);
    if (a.set.has(t)) return null;
    if (!a.complete) return null;
    // a closed leaf such as String or a boxed type cannot become anything else
    return `incompatible types: ${show(from)} cannot be converted to ${show(to)}`;
  }

  // Collect declared variable types first (needed for typeOf).
  walkAll(root, (n) => {
    if (n.type === "local_variable_declaration" || n.type === "field_declaration") {
      const tn = n.childForFieldName("type");
      for (const d of n.namedChildren.filter((x) => x.type === "variable_declarator")) {
        const nm = d.childForFieldName("name")?.text;
        let ty = tn && tn.text === "var" ? null : parseType(tn?.text);
        if (tn && tn.text === "var") ty = typeOf(d.childForFieldName("value")); // var: take the type from the right-hand side
        if (tn && /^(int|long|short|byte|double|float|boolean|char)$/.test(tn.text)) ty = { name: tn.text, prim: true };
        noteVar(nm, d.namedChildren.some((c) => c.type === "dimensions") ? null : ty);
      }
    } else if (n.type === "formal_parameter" || n.type === "catch_formal_parameter") {
      const nm = n.childForFieldName("name")?.text;
      const tn = n.childForFieldName("type");
      noteVar(nm, tn ? (/^(int|long|short|byte|double|float|boolean|char)$/.test(tn.text) ? { name: tn.text, prim: true } : parseType(tn.text)) : null);
    } else if (n.type === "spread_parameter" || n.type === "enhanced_for_statement" || n.type === "resource") {
      const nm = n.childForFieldName("name")?.text || n.namedChildren.filter((c) => c.type === "variable_declarator")[0]?.childForFieldName("name")?.text;
      if (nm) noteVar(nm, null);
    } else if (n.type === "lambda_expression") {
      const ps = n.childForFieldName("parameters");
      if (ps) for (const x of ps.type === "identifier" ? [ps] : ps.namedChildren) { const id = x.type === "identifier" ? x : x.childForFieldName("name"); if (id) noteVar(id.text, null); }
    }
  });
  // Pattern variables and anything else only seen as a name: unknown.
  walkAll(root, (n) => { if (n.type === "instanceof_expression" || n.type === "pattern" || n.type === "type_pattern") for (const c of n.namedChildren) if (c.type === "identifier") noteVar(c.text, null); });

  const isAnn = (t) => !!t;
  void isAnn;

  walkAll(root, (n) => {
    if (n.type === "local_variable_declaration" || n.type === "field_declaration") {
      const tn = n.childForFieldName("type");
      if (!tn || tn.text === "var") return;
      const to = /^(int|long|short|byte|double|float|boolean|char)$/.test(tn.text) ? { name: tn.text, prim: true } : parseType(tn.text);
      for (const d of n.namedChildren.filter((x) => x.type === "variable_declarator")) {
        if (d.namedChildren.some((c) => c.type === "dimensions")) continue;
        const v = d.childForFieldName("value");
        if (!v || v.type === "array_initializer" || v.type === "lambda_expression" || v.type === "method_reference") continue;
        const msg = whyNot(typeOf(v), to);
        if (msg) report(v, msg);
      }
    } else if (n.type === "return_statement") {
      const v = n.namedChildren[0];
      let p = n.parent; while (p && p.type !== "method_declaration" && p.type !== "lambda_expression") p = p.parent;
      if (!p || p.type !== "method_declaration") return;
      const rt = p.childForFieldName("type");
      if (!rt) return;
      if (rt.type === "void_type" && v) { report(v, "incompatible types: unexpected return value in a void method"); return; }
      if (rt.type !== "void_type" && !v) { report(n, "This method must return a value"); return; }
      if (!v || v.type === "lambda_expression" || v.type === "method_reference") return;
      const to = /^(int|long|short|byte|double|float|boolean|char)$/.test(rt.text) ? { name: rt.text, prim: true } : parseType(rt.text);
      const msg = whyNot(typeOf(v), to);
      if (msg) report(v, msg);
    } else if (n.type === "assignment_expression" && n.children.some((c) => c.type === "=")) {
      const l = n.childForFieldName("left"), r = n.childForFieldName("right");
      if (l?.type !== "identifier" || !r || r.type === "lambda_expression") return;
      const msg = whyNot(typeOf(r), varTypes.get(l.text) ?? null);
      if (msg) report(r, msg);
    } else if (n.type === "generic_type") {
      // type arguments must be classes: List<double> is invalid, List<Double> is right
      const targs = n.namedChildren.find((c) => c.type === "type_arguments");
      for (const a of targs?.namedChildren || []) {
        if (["integral_type", "floating_point_type", "boolean_type"].includes(a.type)) report(a, `Type arguments must be objects: use ${BOX[a.text] || a.text} instead of ${a.text}`);
      }
    }
  });

  // Lambda arity: a lambda handed to a known functional interface must take the right number of parameters.
  const lambdaArity = (l) => { const ps = l.childForFieldName("parameters"); if (!ps) return 0; if (ps.type === "identifier") return 1; return ps.namedChildren.length; };
  const checkLambdas = (call, params) => {
    const args = call.childForFieldName("arguments")?.namedChildren || [];
    args.forEach((a, i) => {
      if (a.type !== "lambda_expression" || !params[i]) return;
      const pt = parseType(params[i].type);
      if (!pt || FUNC_ARITY[pt.name] === undefined || typeKnown(pt.name) && declaredTypes.has(pt.name)) return;
      const want = FUNC_ARITY[pt.name], got = lambdaArity(a);
      if (want !== got) report(a, `This lambda takes ${got} parameter${got === 1 ? "" : "s"}, but ${pt.name} needs ${want}`);
    });
  };
  walkAll(root, (n) => {
    if (n.type === "method_invocation" && n.childForFieldName("object")) {
      const obj = n.childForFieldName("object");
      const rt = typeOf(obj) || (obj.type === "identifier" && /^[A-Z]/.test(obj.text) && !varTypes.has(obj.text) ? { name: obj.text } : null);
      if (!rt || rt.prim) return;
      const rec = indexedViaImports(rt.name) || (typeKnown(rt.name) ? null : classByName(rt.name)[0]);
      if (!rec) return;
      const count = argCountOf(n);
      const fit = api.membersOf(rec).filter((x) => x.m.n === n.childForFieldName("name").text && x.m.k === "method" && !hasVarargs(x.m) && paramCount(x.m) === count);
      if (fit.length === 1) checkLambdas(n, api.parseMember(fit[0].m).params);
    } else if (n.type === "object_creation_expression" && !n.childForFieldName("body")) {
      const tn = n.childForFieldName("type"); if (!tn) return;
      const base = lastSeg(tn.text.replace(/<.*$/s, ""));
      const rec = indexedViaImports(base) || (typeKnown(base) ? null : classByName(base)[0]);
      if (!rec) return;
      const fit = rec.m.filter((m) => m.k === "ctor" && !hasVarargs(m) && paramCount(m) === argCountOf(n));
      if (fit.length === 1) checkLambdas(n, api.parseMember(fit[0]).params);
    }
  });

  // ---- 5. control flow: missing return and unreachable code ------------------------
  // completes(stmt) says whether execution can run off the end of a statement:
  //   "yes" it can, "no" it never does (return / throw / endless loop), "maybe" we cannot tell.
  // Missing return needs a confident "yes"; unreachable code needs a confident "no".
  const LOOPS = new Set(["while_statement", "for_statement", "do_statement", "enhanced_for_statement"]);
  const isTrueText = (n) => !!n && /^\(?\s*true\s*\)?$/.test(n.text.trim());
  const breaksOut = (loop) => { // an unlabeled break that targets this loop, or any labeled break (then we cannot tell)
    let labeled = false, direct = false;
    const visit = (n, nested) => {
      for (const c of n.namedChildren) {
        if (c.type === "break_statement") { if (c.namedChildren.some((x) => x.type === "identifier")) labeled = true; else if (!nested) direct = true; continue; }
        if (c.type === "lambda_expression" || CLASSY.has(c.type) || c.type === "method_declaration") continue;
        visit(c, nested || LOOPS.has(c.type) || c.type === "switch_expression" || c.type === "switch_statement");
      }
    };
    visit(loop, false);
    return labeled ? "maybe" : direct ? "yes" : "no";
  };
  const or = (a, b) => (a === "yes" || b === "yes" ? "yes" : a === "no" && b === "no" ? "no" : "maybe");

  function completes(s) {
    if (!s) return "yes";
    switch (s.type) {
      case "return_statement": case "throw_statement": case "break_statement": case "continue_statement": case "yield_statement": return "no";
      case "block": case "synchronized_statement": { const b = s.type === "block" ? s : s.namedChildren.find((c) => c.type === "block"); let r = "yes"; for (const st of b?.namedChildren || []) { r = completes(st); if (r !== "yes") return r === "no" ? "no" : "maybe"; } return r; }
      case "if_statement": {
        const cons = s.childForFieldName("consequence"), alt = s.childForFieldName("alternative");
        return alt ? or(completes(cons), completes(alt)) : "yes";
      }
      case "while_statement": return isTrueText(s.childForFieldName("condition")) ? breaksOut(s) : "yes";
      case "do_statement": return isTrueText(s.childForFieldName("condition")) ? breaksOut(s) : "yes";
      case "for_statement": return s.childForFieldName("condition") ? "yes" : breaksOut(s);
      case "enhanced_for_statement": return "yes";
      case "try_statement": case "try_with_resources_statement": {
        const fin = s.namedChildren.find((c) => c.type === "finally_clause");
        if (fin && completes(fin.namedChildren.find((c) => c.type === "block")) === "no") return "no";
        let r = completes(s.childForFieldName("body"));
        for (const c of s.namedChildren.filter((x) => x.type === "catch_clause")) r = or(r, completes(c.childForFieldName("body")));
        return r;
      }
      case "expression_statement": case "local_variable_declaration": case "assert_statement": case "empty_statement": case "local_class_declaration": return "yes";
      default: return "maybe"; // switch, labeled statements, anything unfamiliar
    }
  }

  // unreachable code: a statement directly after one that never completes
  walkAll(root, (n) => {
    if (n.type !== "block" && n.type !== "switch_block_statement_group") return;
    const sts = n.namedChildren.filter((c) => c.type !== "line_comment" && c.type !== "block_comment");
    for (let i = 0; i + 1 < sts.length; i++) {
      if (completes(sts[i]) === "no" && !["local_class_declaration"].includes(sts[i + 1].type)) {
        report(sts[i + 1], "Unreachable code: nothing before this line lets it run");
        break;
      }
    }
  });

  // missing return: a method that needs a value but can run off the end of its body
  for (const m of root.descendantsOfType("method_declaration")) {
    const rt = m.childForFieldName("type");
    const body = m.childForFieldName("body");
    if (!rt || !body || rt.type === "void_type") continue;
    if (completes(body) === "yes") {
      const close = { startPosition: body.endPosition, endPosition: body.endPosition };
      void close;
      report(m.childForFieldName("name"), `Method ${m.childForFieldName("name").text} must return a ${rt.text} value on every path`);
    }
  }

  // ---- 6. duplicate variables and unused things ------------------------------------
  function dupScan(node, chain) {
    const declare = (id) => {
      if (!id) return;
      const nm = id.text;
      if (chain.some((sc) => sc.has(nm))) report(id, `Variable ${nm} is already defined in this method`);
      else chain[chain.length - 1].add(nm);
    };
    for (const c of node.namedChildren) {
      if (CLASSY.has(c.type) || c.type === "method_declaration" || c.type === "constructor_declaration") continue;
      switch (c.type) {
        case "block": case "switch_block": dupScan(c, [...chain, new Set()]); break;
        case "resource": declare(c.childForFieldName("name")); dupScan(c, chain); break;
        case "local_variable_declaration":
          for (const d of c.namedChildren.filter((x) => x.type === "variable_declarator")) { dupScan(d, chain); declare(d.childForFieldName("name")); }
          break;
        case "for_statement": case "enhanced_for_statement": case "try_with_resources_statement": case "catch_clause": case "lambda_expression": {
          const inner = [...chain, new Set()];
          if (c.type === "enhanced_for_statement") declare2(c.childForFieldName("name"), inner);
          if (c.type === "catch_clause") { const p = c.namedChildren.find((x) => x.type === "catch_formal_parameter"); declare2(p?.childForFieldName("name") || p?.namedChildren.filter((x) => x.type === "identifier").pop(), inner); }
          if (c.type === "lambda_expression") { const ps = c.childForFieldName("parameters"); for (const x of !ps ? [] : ps.type === "identifier" ? [ps] : ps.namedChildren) declare2(x.type === "identifier" ? x : x.childForFieldName("name"), inner); }
          dupScan(c, inner);
          break;
        }
        default: dupScan(c, chain);
      }
    }
  }
  function declare2(id, chain) {
    if (!id) return;
    if (chain.some((sc) => sc.has(id.text))) report(id, `Variable ${id.text} is already defined in this method`);
    else chain[chain.length - 1].add(id.text);
  }
  for (const m of root.descendantsOfType(["method_declaration", "constructor_declaration"])) {
    const body = m.childForFieldName("body"); if (!body) continue;
    const params = new Set();
    for (const p of m.childForFieldName("parameters")?.namedChildren || []) {
      const id = p.childForFieldName("name") || p.namedChildren.filter((c) => c.type === "identifier").pop();
      if (!id) continue;
      if (params.has(id.text)) report(id, `Parameter ${id.text} is declared twice`); else params.add(id.text);
    }
    dupScan(body, [params, new Set()]);

    // unused locals
    for (const d of body.descendantsOfType("variable_declarator")) {
      if (d.parent.type !== "local_variable_declaration") continue;
      const nm = d.childForFieldName("name").text;
      const uses = body.descendantsOfType("identifier").filter((i) => i.text === nm && i.id !== d.childForFieldName("name").id);
      if (!uses.length) report(d.childForFieldName("name"), `Variable ${nm} is never used`, "warning");
    }
  }
  for (const imp of imports) {
    if (imp.wildcard || imp.isStatic) continue;
    const used = usedSimpleNames.has(imp.simple) || root.descendantsOfType("identifier").some((i) => i.text === imp.simple && i.parent?.type !== "import_declaration" && i.parent?.type !== "scoped_identifier");
    if (!used) report(imp.node, `Unused import ${imp.simple}`, "warning");
  }

  // stable order, no exact duplicates
  const seenKey = new Set();
  return out.filter((d) => { const k = `${d.startLine}:${d.startCol}:${d.message}`; if (seenKey.has(k)) return false; seenKey.add(k); return true; }).sort((a, b) => a.startLine - b.startLine || a.startCol - b.startCol).slice(0, 40);
}
