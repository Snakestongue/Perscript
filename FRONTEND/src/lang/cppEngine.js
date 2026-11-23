// C++ language engine for the editor: namespace + include + scope + type resolution over a symbol index.
// Pure logic (no Monaco, no DOM) so it runs in a Web Worker and in Node tests.
//
// C++ source is often incomplete while a student types, so the analysis is text-based:
//   - a light brace scanner finds the enclosing namespace / class / function and its parameters
//   - declaration patterns give variable types:  frc::PWMSparkMax m{0};   auto x = Foo(1);   Type* p;
//   - `.`  `->`  and `::` chains are resolved through member return types and nested names.

const KIND = { class: "Class", struct: "Class", enum: "Enum", alias: "Class", ctor: "Constructor", method: "Method", field: "Field", enumerator: "EnumMember", func: "Function", namespace: "Module", local: "Variable" };
const SKIP_WORDS = /^(return|delete|else|goto|new|case|throw|using|typedef|namespace|class|struct|enum|template|public|private|protected|if|while|for|switch|do|break|continue|co_return)$/;
const PRIMS = new Set(["int", "long", "short", "char", "bool", "float", "double", "void", "unsigned", "signed", "size_t", "auto", "string", "uint8_t", "uint16_t", "uint32_t", "int8_t", "int16_t", "int32_t", "int64_t", "uint64_t"]);
const SMART = /^(?:std::)?(?:unique_ptr|shared_ptr|optional|weak_ptr|reference_wrapper)\s*<\s*(.+)\s*>$/s;

const camel = (s) => s.replace(/[^A-Z]/g, "").toLowerCase();
const squash = (t) => t.replace(/\s+/g, " ").trim();

// "const frc::PWMSparkMax&" -> "frc::PWMSparkMax"; unwraps smart pointers, drops template args.
function normType(t) {
  if (!t) return "";
  let s = squash(t).replace(/\b(const|volatile|typename|struct|class|mutable|static|constexpr|final)\b/g, "").replace(/[*&]+/g, " ").trim();
  for (let i = 0; i < 3; i++) { const m = s.match(SMART); if (!m) break; s = squash(m[1]).replace(/[*&]+/g, " ").trim(); }
  s = s.replace(/<.*$/s, "").trim().replace(/^::/, "");
  return /^[A-Za-z_][\w:]*$/.test(s) ? s : "";
}

export function createCppEngine() {
  const types = new Map(); // "frc::PIDController" -> rec
  const byName = new Map(); // "PIDController" -> [rec]
  const nsChildren = new Map(); // "frc" -> Set("controller", ...)   "" -> roots
  const nsTypes = new Map(); // "frc" -> [rec]  (types whose ns === "frc")
  const nsFuncs = new Map(); // "frc" -> Map(name -> [rec])
  const headers = new Map(); // "frc/PIDController.h" -> lib
  const memo = new Map();

  const full = (r) => (r.ns ? `${r.ns}::${r.n}` : r.n);
  function addNs(ns) {
    const parts = ns ? ns.split("::") : [];
    for (let i = 0; i < parts.length; i++) {
      const parent = parts.slice(0, i).join("::");
      if (!nsChildren.has(parent)) nsChildren.set(parent, new Set());
      nsChildren.get(parent).add(parts[i]);
    }
  }

  function loadIndex(json, lib) {
    for (const c of json.classes) {
      c.lib = lib || json.label;
      const key = full(c);
      if (!types.has(key) || types.get(key).m.length < c.m.length) types.set(key, c);
      if (!byName.has(c.n)) byName.set(c.n, []);
      byName.get(c.n).push(c);
      if (!nsTypes.has(c.ns)) nsTypes.set(c.ns, []);
      nsTypes.get(c.ns).push(c);
      addNs(c.ns);
      if (c.hdr) headers.set(c.hdr, c.lib);
    }
    for (const f of json.funcs) {
      if (!nsFuncs.has(f.ns)) nsFuncs.set(f.ns, new Map());
      const m = nsFuncs.get(f.ns);
      if (!m.has(f.n)) m.set(f.n, []);
      m.get(f.n).push(f);
      addNs(f.ns);
      if (f.hdr) headers.set(f.hdr, lib || json.label);
    }
    memo.clear();
  }

  // ---- name lookup ------------------------------------------------------------------
  function resolveName(name, ownerNs, ctx, depth = 0) {
    if (!name || depth > 4) return null;
    let found = null;
    const tryFull = (k) => types.get(k) || null;
    if (name.includes("::")) {
      const [head, ...rest] = name.split("::");
      const al = ctx?.nsAlias?.get(head);
      const q = al ? [al, ...rest].join("::") : name;
      found = tryFull(q);
      if (!found && ownerNs) { const parts = ownerNs.split("::"); for (let i = parts.length; i >= 0 && !found; i--) found = tryFull([...parts.slice(0, i), q].filter(Boolean).join("::")); }
      if (!found && ctx) for (const u of ctx.usingNs) { found = tryFull(`${u}::${q}`); if (found) break; }
    } else {
      if (ctx?.usingTypes.has(name)) found = tryFull(ctx.usingTypes.get(name));
      if (!found && ownerNs) { const parts = ownerNs.split("::"); for (let i = parts.length; i >= 0 && !found; i--) found = tryFull([...parts.slice(0, i), name].filter(Boolean).join("::")); }
      if (!found && ctx) for (const u of ctx.usingNs) { found = tryFull(`${u}::${name}`); if (found) break; }
      if (!found) { const list = byName.get(name); if (list) found = list.find((c) => c.k !== "alias") || list[0]; }
    }
    if (found?.k === "alias" && found.t) return resolveName(normType(found.t), found.ns, ctx, depth + 1) || found;
    return found;
  }

  function supersOf(c, ctx) {
    const out = [];
    for (const b of c.b || []) { const r = resolveName(normType(b), c.ns, ctx); if (r && r !== c) out.push(r); }
    return out;
  }

  function membersOf(c, ctx, seen = new Set()) {
    const key = full(c);
    if (memo.has(key)) return memo.get(key);
    if (seen.has(key)) return [];
    seen.add(key);
    const own = c.m.filter((m) => m.k !== "ctor" && m.n !== "None" && !/^[~]/.test(m.n));
    const names = new Set(own.map((m) => m.s));
    const all = own.map((m) => ({ m, owner: c }));
    for (const s of supersOf(c, ctx)) for (const x of membersOf(s, ctx, seen)) if (!names.has(x.m.s)) { names.add(x.m.s); all.push(x); }
    memo.set(key, all);
    return all;
  }

  const isCopyCtor = (m, c) => m.p.length === 1 && normType(m.p[0].t) === c.n && /[&]/.test(m.p[0].t);
  function ctorsOf(c, ctx, seen = new Set()) {
    const own = c.m.filter((m) => m.k === "ctor" && !isCopyCtor(m, c));
    if (own.length) return own;
    if (seen.has(full(c))) return [];
    seen.add(full(c));
    for (const s of supersOf(c, ctx)) { const x = ctorsOf(s, ctx, seen); if (x.length) return x; }
    return [];
  }

  // ---- source analysis ------------------------------------------------------------------
  function readFileContext(src) {
    const includes = new Set();
    for (const m of src.matchAll(/^[ \t]*#[ \t]*include[ \t]*[<"]([^>"\n]+)[>"]/gm)) includes.add(m[1]);
    const usingNs = [], usingTypes = new Map(), nsAlias = new Map(), typeAlias = new Map();
    for (const m of src.matchAll(/^[ \t]*using[ \t]+namespace[ \t]+([\w:]+)[ \t]*;/gm)) usingNs.push(m[1].replace(/^::/, ""));
    for (const m of src.matchAll(/^[ \t]*using[ \t]+(\w+)[ \t]*=[ \t]*([^;]+);/gm)) typeAlias.set(m[1], squash(m[2]));
    for (const m of src.matchAll(/^[ \t]*using[ \t]+([\w:]+::(\w+))[ \t]*;/gm)) usingTypes.set(m[2], m[1].replace(/^::/, ""));
    for (const m of src.matchAll(/^[ \t]*namespace[ \t]+(\w+)[ \t]*=[ \t]*([\w:]+)[ \t]*;/gm)) nsAlias.set(m[1], m[2]);
    return { includes, usingNs, usingTypes, nsAlias, typeAlias };
  }

  // Light brace scanner: scopes with kind/name/bases/params and their text ranges.
  function scanScopes(src) {
    const scopes = [], stack = [];
    let i = 0, lineComment = false, blockComment = false, str = null;
    for (; i < src.length; i++) {
      const ch = src[i], nx = src[i + 1];
      if (lineComment) { if (ch === "\n") lineComment = false; continue; }
      if (blockComment) { if (ch === "*" && nx === "/") { blockComment = false; i++; } continue; }
      if (str) { if (ch === "\\") i++; else if (ch === str) str = null; continue; }
      if (ch === "/" && nx === "/") { lineComment = true; continue; }
      if (ch === "/" && nx === "*") { blockComment = true; i++; continue; }
      if (ch === '"' || ch === "'") { str = ch; continue; }
      if (ch === "{") {
        const before = src.slice(Math.max(0, src.lastIndexOf(";", i - 1) + 1, src.lastIndexOf("}", i - 1) + 1, src.lastIndexOf("{", i - 1) + 1), i);
        const head = before.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "").trim();
        let sc = { kind: "block", start: i, end: Infinity, parent: stack[stack.length - 1] || null };
        let m;
        if ((m = head.match(/\b(?:class|struct)\s+(?:[A-Z_]+\s+)?(\w+)\s*(?:final\s*)?(?::\s*([^{]*))?$/))) sc = { ...sc, kind: "class", name: m[1], bases: (m[2] || "").split(",").map((b) => normType(b.replace(/\b(public|protected|private|virtual)\b/g, ""))).filter(Boolean), defaultAccess: head.includes("struct") ? "public" : "private" };
        else if ((m = head.match(/\bnamespace\s+([\w:]*)\s*$/))) sc = { ...sc, kind: "namespace", name: m[1] || "" };
        else if ((m = head.match(/(?:^|[\s:*&>])((?:[A-Za-z_]\w*::)*[~A-Za-z_]\w*)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*(?:const\s*)?(?:noexcept\s*)?(?:override\s*)?(?:final\s*)?(?::[^{]*)?$/)) && !/^(if|for|while|switch|catch|else)$/.test(m[1])) sc = { ...sc, kind: "func", name: m[1], params: m[2] };
        scopes.push(sc); stack.push(sc);
      } else if (ch === "}") { const sc = stack.pop(); if (sc) sc.end = i; }
    }
    return scopes;
  }

  const within = (sc, off) => sc.start < off && off <= sc.end;
  const chain = (scopes, off) => scopes.filter((s) => within(s, off)).sort((a, b) => a.start - b.start);

  function parseParams(text) {
    const out = [];
    let depth = 0, cur = "";
    for (const ch of text) {
      if ("(<[{".includes(ch)) depth++;
      if (")>]}".includes(ch)) depth--;
      if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map((p) => {
      const m = squash(p.replace(/=.*$/s, "")).match(/^(.*?[\s*&>])\s*([A-Za-z_]\w*)$/);
      return m ? { name: m[2], type: m[1].trim() } : null;
    }).filter(Boolean);
  }

  // Declarations: Map(name -> { name, typeText, kind, scopeStart })
  const DECL = /^[ \t]*((?:(?:const|static|constexpr|mutable|volatile|inline|extern|thread_local)\s+)*)((?:[A-Za-z_]\w*::)*[A-Za-z_]\w*(?:\s*<[^;(){}=]*>)?(?:::\w+)*)\s*((?:[*&]|\bconst\b)*)\s*([A-Za-z_]\w*)\s*(?:\(([^;{}]*)\)|\{([^;]*)\}|=\s*([^;]+)|\[[^\]]*\])?\s*;/gm;
  function declsAt(src, offset, scopes) {
    const out = new Map();
    const here = chain(scopes, offset);
    const set = (name, typeText, kind, initText) => { if (!out.has(name)) out.set(name, { name, typeText, kind, initText }); };
    // parameters of enclosing functions
    for (const sc of here) if (sc.kind === "func" && sc.params) for (const p of parseParams(sc.params)) set(p.name, p.type, "param");
    const lambdaParams = src.slice(0, offset).match(/\[[^\]]*\]\s*\(([^()]*)\)[^{;]*\{[^}]*$/);
    if (lambdaParams) for (const p of parseParams(lambdaParams[1])) set(p.name, p.type, "param");
    DECL.lastIndex = 0;
    for (const m of src.matchAll(DECL)) {
      const [whole, , type, ptr, name, ctorArgs, braceArgs, assign] = m;
      const declStart = m.index;
      if (SKIP_WORDS.test(type) || SKIP_WORDS.test(name)) continue;
      const declScopes = chain(scopes, declStart + 1);
      const owner = declScopes[declScopes.length - 1] || null;
      const isField = owner?.kind === "class";
      const visible = isField ? here.includes(owner) || here.some((s) => s.kind === "func" && s.name?.startsWith(owner.name + "::")) : declStart < offset && (!owner || here.includes(owner));
      if (!visible) continue;
      let t = type;
      if (type === "auto") t = assign ? inferInit(assign) : braceArgs !== undefined || ctorArgs !== undefined ? "" : "";
      set(name, `${t}${ptr}`, isField ? "field" : "local", assign || (braceArgs !== undefined ? `${type}{${braceArgs}}` : ""));
      void whole;
    }
    return out;
  }

  // Type text from an initializer: Foo(1) / Foo{1} / new Foo(1) / std::make_unique<Foo>(...) / ns::Foo::Create()
  function inferInit(expr) {
    const e = expr.trim();
    let m = e.match(/^(?:new\s+)?((?:[A-Za-z_]\w*::)*[A-Za-z_]\w*)\s*(?:<[^>]*>)?\s*[({]/);
    const mk = e.match(/^std::make_(?:unique|shared)\s*<\s*([^>]+?)\s*>\s*\(/);
    if (mk) return mk[1];
    return m ? m[1] : "";
  }

  function buildCtx(src, offset) {
    const f = readFileContext(src);
    const scopes = scanScopes(src);
    const here = chain(scopes, offset);
    const nsStack = here.filter((s) => s.kind === "namespace").map((s) => s.name).filter(Boolean).join("::");
    const cls = [...here].reverse().find((s) => s.kind === "class") || (() => {
      const fn = [...here].reverse().find((s) => s.kind === "func" && s.name?.includes("::"));
      return fn ? { kind: "class", name: fn.name.split("::").slice(-2, -1)[0], bases: scopes.find((s) => s.kind === "class" && s.name === fn.name.split("::").slice(-2, -1)[0])?.bases || [] } : null;
    })();
    const ctx = { ...f, usingNs: [...f.usingNs], scopes, here, nsStack, cls, depth: 0 };
    ctx.usingNs.push(...here.filter((s) => s.kind === "namespace" && s.name).map((s) => s.name));
    ctx.decls = declsAt(src, offset, scopes);
    return ctx;
  }

  // ---- type resolution -----------------------------------------------------------------
  // Chain: segments with separators. Returns { ns } | { type, inst } | { user } | null
  function splitChain(expr) {
    const segs = []; let depth = 0, cur = "", sep = "";
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if ("([{<".includes(ch) && !(ch === "<" && depth === 0 && !/[\w]/.test(expr[i - 1] || ""))) depth++;
      else if (")]}>".includes(ch) && !(ch === ">" && depth === 0)) { if (!(ch === ">" && expr[i - 1] === "-")) depth--; }
      if (depth === 0 && expr.startsWith("::", i)) { segs.push({ raw: cur, sep }); cur = ""; sep = "::"; i++; continue; }
      if (depth === 0 && expr.startsWith("->", i)) { segs.push({ raw: cur, sep }); cur = ""; sep = "->"; i++; continue; }
      if (depth === 0 && ch === ".") { segs.push({ raw: cur, sep }); cur = ""; sep = "."; continue; }
      cur += ch;
    }
    segs.push({ raw: cur, sep });
    return segs.map((s) => { const m = s.raw.trim().match(/^([A-Za-z_]\w*)\s*(?:<[^()]*>)?\s*(\([\s\S]*\)|\{[\s\S]*\})?\s*(?:\[[^\]]*\])?$/); return m ? { name: m[1], call: !!m[2], sep: s.sep } : null; });
  }

  const asType = (typeText, ownerNs, ctx) => {
    const n = normType(typeText);
    if (!n || PRIMS.has(n)) return null;
    const alias = ctx.typeAlias.get(n);
    const r = resolveName(alias ? normType(alias) : n, ownerNs, ctx);
    return r && r.k !== "namespace" ? { type: r, inst: true } : null;
  };

  function typeOfExpr(expr, ctx) {
    if (ctx.depth > 6) return null;
    const segs = splitChain(squash(expr));
    if (!segs.length || segs.includes(null)) return null;
    ctx = { ...ctx, depth: ctx.depth + 1 };
    const first = segs[0];
    let cur = null;
    if (first.name === "this") cur = ctx.cls ? { user: ctx.cls } : null;
    else if (ctx.decls.has(first.name) && !first.call) {
      const d = ctx.decls.get(first.name);
      cur = d.typeText ? asType(d.typeText, ctx.nsStack, ctx) : d.initText ? typeOfExpr(d.initText.replace(/^[A-Za-z_][\w:<>]*\s*(?=[{(])/, (x) => x), ctx) || asType(inferInit(d.initText), ctx.nsStack, ctx) : null;
    } else {
      const al = ctx.nsAlias.get(first.name);
      const nsGuess = al || first.name;
      const t = resolveName(first.name, ctx.nsStack, ctx);
      if (t && !(segs[1]?.sep === "::" && nsChildren.has(nsGuess))) cur = { type: t, inst: first.call && segs.length === 1 ? true : first.call };
      else if (nsChildren.has(nsGuess) || nsTypes.has(nsGuess) || nsFuncs.has(nsGuess)) cur = { ns: nsGuess };
      else if (t) cur = { type: t, inst: first.call };
      else if (ctx.cls) { // bare member of the enclosing class
        const ct = userClassMembers(ctx).find((x) => x.m.n === first.name);
        if (ct) cur = first.call ? asType(ct.m.r, ct.owner.ns, ctx) : asType(ct.m.r, ct.owner.ns, ctx);
      }
    }
    for (let i = 1; i < segs.length && cur; i++) cur = step(cur, segs[i], ctx);
    return cur;
  }

  function userClassMembers(ctx) {
    const out = [];
    for (const b of ctx.cls?.bases || []) { const r = resolveName(b, ctx.nsStack, ctx); if (r) out.push(...membersOf(r, ctx)); }
    return out;
  }

  function step(cur, seg, ctx) {
    if (cur.ns !== undefined) {
      const child = cur.ns ? `${cur.ns}::${seg.name}` : seg.name;
      const direct = types.get(child);
      if (direct) return direct.k === "alias" ? asType(direct.t, direct.ns, ctx) && { type: asType(direct.t, direct.ns, ctx).type, inst: seg.call } : { type: direct, inst: seg.call };
      if (nsChildren.get(cur.ns)?.has(seg.name)) return { ns: child };
      const fn = nsFuncs.get(cur.ns)?.get(seg.name);
      if (fn && seg.call) return asType(fn[0].r, cur.ns, ctx);
      return null;
    }
    if (cur.user) {
      const hit = userClassMembers(ctx).find((x) => x.m.n === seg.name);
      return hit ? asType(hit.m.r, hit.owner.ns, ctx) : null;
    }
    if (cur.type) {
      const c = cur.type;
      if (seg.sep === "::" && !cur.inst) {
        const nested = types.get(`${full(c)}::${seg.name}`);
        if (nested) return { type: nested, inst: false };
      }
      const hit = membersOf(c, ctx).find((x) => x.m.n === seg.name && (seg.call ? x.m.k === "method" : true));
      if (!hit) return null;
      if (hit.m.k === "enumerator") return { type: c, inst: true };
      return asType(hit.m.r, hit.owner.ns, ctx);
    }
    return null;
  }

  // ---- features -------------------------------------------------------------------------
  const sigLabel = (m) => m.s;
  function memberItem({ m, owner }, cls) {
    const callable = m.k === "method" || m.k === "ctor";
    return {
      label: m.n, kind: KIND[m.k] || "Method", detail: sigLabel(m), doc: m.d || "", sort: (owner === cls ? "0" : "1") + m.n,
      insert: callable ? m.n + (m.p.length ? "($0)" : "()") : m.n, snippet: callable && m.p.length > 0, owner: owner.n,
    };
  }
  const typeItem = (c, sortPrefix, extra = {}) => ({ label: c.n, kind: KIND[c.k] || "Class", detail: `${c.ns ? c.ns + " · " : ""}${c.lib}`, doc: c.d || "", sort: sortPrefix + c.n, insert: c.n, ...extra });

  function filterRank(items, prefix) {
    const p = prefix.toLowerCase();
    const scored = [];
    for (const it of items) {
      const l = it.label.toLowerCase();
      let score;
      if (!p) score = 1;
      else if (l.startsWith(p)) score = 0;
      else if (camel(it.label).startsWith(p) && p.length > 1) score = 1;
      else if (l.includes(p)) score = 2;
      else continue;
      scored.push([score, it]);
    }
    scored.sort((a, b) => a[0] - b[0] || a[1].sort.localeCompare(b[1].sort));
    const seen = new Set();
    return scored.map((s) => s[1]).filter((it) => { const k = it.label + it.detail; if (seen.has(k)) return false; seen.add(k); return true; });
  }

  // Receiver text before a '.', '->' or '::' that ends at `endIdx` (exclusive of the operator).
  function receiverBefore(src, endIdx) {
    let i = endIdx - 1, depth = 0;
    for (; i >= 0; i--) {
      const ch = src[i];
      if (")]}".includes(ch)) depth++;
      else if ("([{".includes(ch)) { if (depth === 0) break; depth--; }
      else if (ch === ">" && src[i - 1] === "-") { i--; continue; }
      else if (depth === 0 && !/[\w:.<>]/.test(ch)) break;
      else if (depth === 0 && ch === "<" ) { /* template args are part of the receiver */ }
    }
    return src.slice(i + 1, endIdx).trim();
  }

  const scopeItems = (ns, prefix) => {
    const out = [];
    for (const c of nsTypes.get(ns) || []) out.push(typeItem(c, "0"));
    for (const [n, fs] of nsFuncs.get(ns) || []) out.push({ label: n, kind: "Function", detail: fs[0].s, doc: fs[0].d || "", sort: "1" + n, insert: n + (fs[0].p.length ? "($0)" : "()"), snippet: fs[0].p.length > 0 });
    for (const ch of nsChildren.get(ns) || []) if (!types.has(`${ns ? ns + "::" : ""}${ch}`)) out.push({ label: ch, kind: "Module", detail: `namespace · ${ns ? ns + "::" : ""}${ch}`, doc: "", sort: "2" + ch, insert: ch });
    return filterRank(out, prefix);
  };

  function complete(src, offset) {
    const before = src.slice(0, offset);
    const wm = before.match(/([A-Za-z_]\w*)?$/);
    const prefix = wm ? wm[0] : "";
    const start = offset - prefix.length;
    const lineBefore = before.slice(before.lastIndexOf("\n") + 1);

    // #include <frc/...
    const inc = lineBefore.match(/^\s*#\s*include\s*[<"]([\w/.-]*)$/);
    if (inc) {
      const typed = inc[1];
      const items = [...headers.keys()].filter((h) => h.toLowerCase().includes(typed.toLowerCase())).sort().slice(0, 120).map((h) => ({ label: h, kind: "File", detail: headers.get(h), doc: "", sort: h, insert: h }));
      return { start: offset - typed.length, items };
    }

    const ctx = buildCtx(src, offset);
    const opEnd = start;
    const isArrow = src.slice(opEnd - 2, opEnd) === "->";
    const isScope = src.slice(opEnd - 2, opEnd) === "::";
    const isDot = src[opEnd - 1] === ".";

    if (isScope) {
      const recv = receiverBefore(src, opEnd - 2);
      if (!recv) return { start, items: scopeItems("", prefix) }; // ::name
      const t = typeOfExpr(recv, ctx);
      if (!t) return { start, items: [] };
      if (t.ns !== undefined) return { start, items: scopeItems(t.ns, prefix) };
      if (t.type) {
        const c = t.type;
        const items = membersOf(c, ctx).map((x) => memberItem(x, c));
        for (const n of nsTypes.get(full(c)) || []) items.push(typeItem(n, "0"));
        return { start, items: filterRank(items, prefix) };
      }
      return { start, items: [] };
    }
    if (isArrow || isDot) {
      const recv = receiverBefore(src, isArrow ? opEnd - 2 : opEnd - 1);
      if (!recv) return { start, items: [] };
      const t = typeOfExpr(recv, ctx);
      if (!t) return { start, items: [] };
      if (t.user) return { start, items: filterRank(userClassMembers(ctx).map((x) => memberItem(x, null)), prefix) };
      if (t.type) return { start, items: filterRank(membersOf(t.type, ctx).map((x) => memberItem(x, t.type)), prefix) };
      return { start, items: [] };
    }

    if (prefix.length === 0) return { start, items: [] };
    const out = [];
    for (const d of ctx.decls.values()) out.push({ label: d.name, kind: KIND.local, detail: `${squash(d.typeText || "")} (${d.kind})`, doc: "", sort: "0" + d.name, insert: d.name });
    if (ctx.cls) for (const x of userClassMembers(ctx)) out.push({ ...memberItem(x, null), sort: "1" + x.m.n });
    // namespaces / types brought into scope, plus everything else with a ready-made #include
    for (const root of nsChildren.get("") || []) out.push({ label: root, kind: "Module", detail: "namespace", doc: "", sort: "3" + root, insert: root });
    const seen = new Set(out.map((o) => o.label));
    const using = new Set(ctx.usingNs);
    for (const c of types.values()) {
      if (c.k === "alias" && !c.hdr) continue;
      if (c.ns.split("::").length > 4) continue;
      const l = c.n.toLowerCase();
      if (!l.startsWith(prefix.toLowerCase()) && !(prefix.length > 1 && camel(c.n).startsWith(prefix.toLowerCase()))) continue;
      const visible = using.has(c.ns) || ctx.usingTypes.get(c.n) === full(c) || !c.ns;
      const included = c.hdr && ctx.includes.has(c.hdr);
      const key = c.n + "|" + c.ns;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        label: c.n, kind: KIND[c.k] || "Class", detail: `${c.ns} · ${c.lib}`, doc: c.d || "", sort: (visible ? "2" : "4") + c.n,
        insert: visible ? c.n : full(c), ...(c.hdr && !included ? { importText: `#include <${c.hdr}>` } : {}),
      });
    }
    return { start, items: filterRank(out, prefix).slice(0, 80) };
  }

  // Enclosing call at the cursor: { open, close:"(" | "{", argIndex }
  function enclosingCall(src, offset) {
    let depth = 0, commas = 0;
    for (let i = offset - 1; i >= 0; i--) {
      const ch = src[i];
      if (ch === ")" || ch === "]" || ch === "}") depth++;
      else if (ch === "(" || ch === "[" || ch === "{") { if (depth === 0) return ch === "[" ? null : { open: i, kind: ch, argIndex: commas }; depth--; }
      else if (ch === "," && depth === 0) commas++;
      else if (ch === ";" && depth === 0) return null;
    }
    return null;
  }

  function calleeSigs(src, openIdx, ctx) {
    const head = src.slice(0, openIdx).trimEnd();
    // `Type name(` / `Type name{` declarations: constructor call
    const decl = head.match(/((?:[A-Za-z_]\w*::)*[A-Za-z_]\w*(?:\s*<[^;(){}]*>)?)\s*[*&]*\s+([A-Za-z_]\w*)$/);
    if (decl && !SKIP_WORDS.test(decl[1]) && !PRIMS.has(decl[1])) {
      const r = resolveName(normType(decl[1]), ctx.nsStack, ctx);
      if (r) return { sigs: ctorsOf(r, ctx).map((m) => ({ m, owner: r })), name: r.n };
    }
    const em = head.match(/((?:[A-Za-z_]\w*(?:\s*<[^()]*>)?\s*(?:::|\.|->)\s*)*[A-Za-z_]\w*(?:\s*<[^()]*>)?)$/);
    if (!em) return { sigs: [] };
    const expr = em[1].replace(/\s+/g, "");
    const segs = splitChain(expr);
    if (!segs.length || segs.includes(null)) return { sigs: [] };
    const last = segs[segs.length - 1].name;
    if (segs.length === 1) {
      const r = resolveName(last, ctx.nsStack, ctx);
      if (r && r.k !== "alias") return { sigs: ctorsOf(r, ctx).map((m) => ({ m, owner: r })), name: r.n };
      if (ctx.cls) { const hits = userClassMembers(ctx).filter((x) => x.m.n === last && x.m.k === "method"); if (hits.length) return { sigs: hits, name: last }; }
      for (const u of ctx.usingNs) { const f = nsFuncs.get(u)?.get(last); if (f) return { sigs: f.map((m) => ({ m, owner: null })), name: last }; }
      return { sigs: [] };
    }
    const sepIdx = expr.length - last.length;
    const recvExpr = expr.slice(0, expr.endsWith("->" + last) ? sepIdx - 2 : sepIdx - (expr.slice(sepIdx - 2, sepIdx) === "::" ? 2 : 1));
    const t = typeOfExpr(recvExpr, ctx);
    if (!t) return { sigs: [] };
    if (t.ns !== undefined) {
      const child = types.get(t.ns ? `${t.ns}::${last}` : last);
      if (child) return { sigs: ctorsOf(child, ctx).map((m) => ({ m, owner: child })), name: child.n };
      const f = nsFuncs.get(t.ns)?.get(last);
      return f ? { sigs: f.map((m) => ({ m, owner: null })), name: last } : { sigs: [] };
    }
    if (t.user) return { sigs: userClassMembers(ctx).filter((x) => x.m.n === last && x.m.k === "method"), name: last };
    if (t.type) return { sigs: membersOf(t.type, ctx).filter((x) => x.m.n === last && x.m.k === "method"), name: last };
    return { sigs: [] };
  }

  function signatureHelp(src, offset) {
    const call = enclosingCall(src, offset);
    if (!call) return null;
    const ctx = buildCtx(src, call.open);
    const { sigs } = calleeSigs(src, call.open, ctx);
    if (!sigs.length) return null;
    const infos = sigs.map(({ m }) => {
      const doc = m.d || "";
      const paramDocs = {};
      const lines = doc.split("\n");
      for (const line of lines) { const pm = line.match(/^\*\*@param\*\* `([^`]+)`\s*(.*)$/); if (pm) paramDocs[pm[1]] = pm[2]; }
      const summary = lines.filter((l) => !l.startsWith("**@")).join("\n").trim();
      return { name: m.n, label: m.s, params: m.p.map((p) => ({ name: p.n, type: p.t, label: squash(`${p.t} ${p.n}${p.d ? " = " + p.d : ""}`) })), doc: summary, paramDocs };
    });
    infos.sort((a, b) => a.params.length - b.params.length);
    const fit = infos.findIndex((s) => s.params.length > call.argIndex);
    return { signatures: infos, active: Math.max(0, fit), argIndex: call.argIndex };
  }

  function hover(src, offset) {
    let s = offset, e = offset;
    while (s > 0 && /\w/.test(src[s - 1])) s--;
    while (e < src.length && /\w/.test(src[e])) e++;
    const word = src.slice(s, e);
    if (!word) return null;
    const ctx = buildCtx(src, offset);
    const op3 = src.slice(s - 2, s);
    if (op3 === "::" || op3 === "->" || src[s - 1] === ".") {
      const recvEnd = src[s - 1] === "." ? s - 1 : s - 2;
      const t = typeOfExpr(receiverBefore(src, recvEnd), ctx);
      if (t?.type) {
        const hits = membersOf(t.type, ctx).filter((x) => x.m.n === word);
        if (hits.length) {
          const shown = hits.slice(0, 3).map((h) => "```cpp\n" + h.m.s + "\n```").join("\n");
          const more = hits.length > 3 ? `\n*+${hits.length - 3} more overloads*` : "";
          const withDoc = hits.find((h) => h.m.d) || hits[0];
          return { start: s, end: e, title: shown + more, doc: withDoc.m.d || "", owner: hits[0].owner.n };
        }
        const nested = types.get(`${full(t.type)}::${word}`);
        if (nested) return { start: s, end: e, title: "```cpp\n" + `${nested.k} ${full(nested)}` + "\n```", doc: nested.d || "", owner: nested.lib };
      }
      if (t?.ns !== undefined) {
        const c = types.get(t.ns ? `${t.ns}::${word}` : word);
        if (c) return { start: s, end: e, title: "```cpp\n" + `${c.k} ${full(c)}${c.b?.length ? " : " + c.b.join(", ") : ""}` + "\n```", doc: c.d || "", owner: c.lib };
        const f = nsFuncs.get(t.ns)?.get(word);
        if (f) return { start: s, end: e, title: "```cpp\n" + f[0].s + "\n```", doc: f[0].d || "", owner: "" };
      }
      return null;
    }
    if (ctx.decls.has(word)) { const d = ctx.decls.get(word); const t = d.typeText || (d.initText ? inferInit(d.initText) : ""); return { start: s, end: e, title: "```cpp\n" + `${squash(t)} ${word}`.trim() + "\n```", doc: "", owner: d.kind }; }
    const c = resolveName(word, ctx.nsStack, ctx);
    if (c) return { start: s, end: e, title: "```cpp\n" + `${c.k} ${full(c)}${c.b?.length ? " : " + c.b.join(", ") : ""}` + "\n```", doc: c.d || "", owner: c.lib };
    return null;
  }

  return { loadIndex, complete, signatureHelp, hover, _typeOfExpr: typeOfExpr, _buildCtx: buildCtx };
}
