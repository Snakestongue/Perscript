// Java language engine for the editor: scope + type resolution over a symbol index.
// Pure logic (no Monaco, no DOM) so it runs in a Web Worker and in Node tests.
// The tree-sitter `parser` is injected; code stays usable when the tree has errors.

const PRIMS = new Set(["int", "long", "short", "byte", "double", "float", "boolean", "char", "void"]);
const KIND = { class: "Class", interface: "Interface", enum: "Enum", record: "Class", annotation: "Interface", method: "Method", field: "Field", const: "EnumMember", ctor: "Constructor", local: "Variable" };

// ---- index adapter: the only code that knows the index record shape --------------
function baseType(t) {
  if (!t) return "";
  return t.replace(/<.*>/g, "").replace(/\[\]/g, "").replace(/\.\.\./g, "").replace(/\b(final|static)\b/g, "").trim().split(/\s+/).pop().split(".").slice(-1)[0];
}
function splitTop(s, sepRe) { // split on whitespace/commas at generic depth 0
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "<" || ch === "(") depth++;
    if (ch === ">" || ch === ")") depth--;
    if (depth === 0 && sepRe.test(ch)) { if (cur) out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
function parseMember(m) {
  // returns { name, returnType, params:[{type,name}], label }
  const s = m.s || m.n;
  const paren = s.indexOf("(");
  const head = (paren >= 0 ? s.slice(0, paren) : s).replace(/^\s*<[^>]*>\s*/, "").replace(/\b(static|final|abstract)\b/g, "").trim();
  const toks = splitTop(head, /\s/);
  const returnType = m.k === "ctor" ? "" : toks.length > 1 ? toks[toks.length - 2] : "";
  const params = [];
  if (paren >= 0) {
    const inner = s.slice(paren + 1, s.lastIndexOf(")"));
    for (const p of splitTop(inner, /,/)) {
      const parts = splitTop(p.trim(), /\s/).filter((x) => x !== "final");
      if (parts.length) params.push({ type: parts.slice(0, -1).join(" "), name: parts[parts.length - 1] });
    }
  }
  return { name: m.n, returnType, params, label: s.replace(/\s+/g, " ").trim() };
}

export function createEngine(parser) {
  const classes = []; // all class records
  const byKey = new Map(); // "Name" or "Outer.Name" -> [records]
  const memoMembers = new Map();

  function loadIndex(json, lib) {
    for (const c of json.classes) {
      c.lib = lib || json.label;
      classes.push(c);
      for (const key of new Set([c.n, c.n.split(".").pop()])) {
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(c);
      }
    }
    memoMembers.clear();
  }

  const findClass = (name, imports) => {
    const list = byKey.get(name);
    if (!list) return null;
    if (list.length === 1 || !imports) return list[0];
    return list.find((c) => imports.has(`${c.p}.${c.n}`) || imports.has(`${c.p}.*`)) || list[0];
  };

  function supers(c) {
    const out = [];
    const raw = [c.ext, c.impl].filter(Boolean).join(",");
    for (const part of splitTop(raw, /,/)) {
      const rec = findClass(baseType(part));
      if (rec) out.push(rec);
    }
    return out;
  }

  // Members of a class including inherited ones (superclass / interfaces).
  function membersOf(c, seen = new Set()) {
    if (memoMembers.has(c)) return memoMembers.get(c);
    if (seen.has(c)) return [];
    seen.add(c);
    const own = c.m.filter((m) => m.k !== "ctor");
    const names = new Set(own.map((m) => m.s));
    const all = [...own.map((m) => ({ m, owner: c }))];
    for (const s of supers(c)) for (const x of membersOf(s, seen)) if (!names.has(x.m.s)) { names.add(x.m.s); all.push(x); }
    memoMembers.set(c, all);
    return all;
  }

  // ---- source analysis ----------------------------------------------------------
  function parseSource(src) {
    try { return parser ? parser.parse(src) : null; } catch { return null; }
  }

  function readImports(src) {
    const imports = new Set();
    for (const m of src.matchAll(/^\s*import\s+(?:static\s+)?([\w.]+(?:\.\*)?)\s*;/gm)) imports.add(m[1]);
    return imports;
  }

  function typeOfInit(text) {
    const m = text.match(/^\s*new\s+([A-Z][\w.]*)/);
    return m ? m[1].split(".").slice(-1)[0] : "";
  }

  // Declarations visible at `offset`: [{name, type, kind}]
  function declsAt(src, offset, tree) {
    const out = new Map();
    const add = (name, type, kind) => { if (name && type && !out.has(name)) out.set(name, { name, type, kind }); };
    if (tree) {
      const visit = (node) => {
        if (node.startIndex > offset) return;
        const t = node.type;
        if (t === "local_variable_declaration" || t === "field_declaration") {
          const type = node.childForFieldName("type");
          const kind = t === "field_declaration" ? "field" : "local";
          // scope end: parent block / class body
          const scope = node.parent;
          if (scope && offset <= scope.endIndex + (scope.type === "ERROR" ? 1e9 : 0) && offset >= node.startIndex) {
            for (const d of node.namedChildren.filter((c) => c.type === "variable_declarator")) {
              const nm = d.childForFieldName("name")?.text;
              let ty = type?.text || "";
              if (ty === "var") ty = typeOfInit(d.childForFieldName("value")?.text || "");
              add(nm, baseType(ty), kind);
            }
          }
        } else if (t === "formal_parameter" || t === "catch_formal_parameter" || t === "spread_parameter") {
          const fn = ((n) => { while (n && !["method_declaration", "constructor_declaration", "lambda_expression"].includes(n.type)) n = n.parent; return n; })(node);
          if (fn && offset >= fn.startIndex && offset <= fn.endIndex) add(node.childForFieldName("name")?.text, baseType(node.childForFieldName("type")?.text || ""), "local");
        } else if (t === "enhanced_for_statement") {
          if (offset >= node.startIndex && offset <= node.endIndex) add(node.childForFieldName("name")?.text, baseType(node.childForFieldName("type")?.text || ""), "local");
        }
        for (const c of node.children) visit(c);
      };
      visit(tree.rootNode);
    }
    // Fallback for code the parser could not recover: textual declarations before the cursor.
    const before = src.slice(0, offset);
    for (const m of before.matchAll(/\b([A-Z]\w*(?:<[^;(){}]*?>)?(?:\[\])*)\s+([a-z_]\w*)\s*(?==|;|,|\)|:)/g)) add(m[2], baseType(m[1]), "local");
    for (const m of before.matchAll(/\bvar\s+(\w+)\s*=\s*(new\s+[A-Z][\w.]*)/g)) add(m[1], typeOfInit(m[2]), "local");
    return out;
  }

  function enclosingClassName(src, offset) {
    const before = src.slice(0, offset);
    let last = "";
    for (const m of before.matchAll(/\b(?:class|enum|record|interface)\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+([\w.<>, ]+?))?(?:\s+implements\s+[\w.<>, ]+?)?\s*\{/g)) last = { name: m[1], ext: m[2] };
    return last || null;
  }

  // ---- expression typing --------------------------------------------------------
  // Splits "a.b(c, d).e" into top-level segments.
  function chainSegments(expr) {
    const segs = []; let depth = 0, cur = "";
    for (const ch of expr) {
      if ("([<".includes(ch) && !(ch === "<" && depth === 0 && cur === "")) depth++;
      else if (")]>".includes(ch)) depth--;
      if (ch === "." && depth === 0) { segs.push(cur); cur = ""; } else cur += ch;
    }
    segs.push(cur);
    return segs.map((s) => s.trim());
  }

  function argCount(seg) {
    const open = seg.indexOf("(");
    if (open < 0) return -1;
    const inner = seg.slice(open + 1, seg.lastIndexOf(")") >= 0 ? seg.lastIndexOf(")") : undefined).trim();
    return inner ? splitTop(inner, /,/).length : 0;
  }

  // Resolve expression text to { cls, isStatic } or null.
  function typeOfExpr(expr, ctx) {
    expr = expr.trim();
    if (!expr) return null;
    const segs = chainSegments(expr);
    let cur = null; // { cls, isStatic }
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const name = seg.replace(/\(.*$/s, "").replace(/\[.*$/s, "").trim();
      const isCall = seg.includes("(");
      if (i === 0) {
        if (seg.startsWith("new ")) { const c = findClass(typeOfInit(seg), ctx.imports); cur = c ? { cls: c, isStatic: false } : null; }
        else if (seg.startsWith("(")) return null;
        else if (name === "this") { const c = ctx.self && findClass(ctx.self.name, ctx.imports); cur = c ? { cls: c, isStatic: false } : null; }
        else if (name === "super") { const c = ctx.self?.ext && findClass(baseType(ctx.self.ext), ctx.imports); cur = c ? { cls: c, isStatic: false } : null; }
        else if (!isCall && ctx.decls.has(name)) { const c = findClass(ctx.decls.get(name).type, ctx.imports); cur = c ? { cls: c, isStatic: false } : null; }
        else if (isCall && ctx.self) { // unqualified method call: look in current class chain
          const own = ctx.self && findClass(ctx.self.name, ctx.imports);
          const sup = ctx.self.ext ? findClass(baseType(ctx.self.ext), ctx.imports) : null;
          const hit = [own, sup].filter(Boolean).flatMap((c) => membersOf(c)).find((x) => x.m.n === name && x.m.k === "method");
          const rc = hit && findClass(baseType(parseMember(hit.m).returnType), ctx.imports);
          cur = rc ? { cls: rc, isStatic: false } : null;
        } else if (/^[A-Z]/.test(name)) { const c = findClass(name, ctx.imports); cur = c ? { cls: c, isStatic: true } : null; }
        else if (!isCall && ctx.self) { // inherited field
          const sup = ctx.self.ext ? findClass(baseType(ctx.self.ext), ctx.imports) : null;
          const hit = sup && membersOf(sup).find((x) => x.m.n === name && x.m.k === "field");
          const fc = hit && findClass(baseType(parseMember(hit.m).returnType || hit.m.s.split(/\s+/).slice(-2)[0]), ctx.imports);
          cur = fc ? { cls: fc, isStatic: false } : null;
        } else cur = null;
      } else if (cur) {
        // nested class (TrapezoidProfile.Constraints)
        if (cur.isStatic && /^[A-Z]/.test(name) && !isCall) {
          const nested = findClass(`${cur.cls.n}.${name}`, ctx.imports);
          if (nested) { cur = { cls: nested, isStatic: true }; continue; }
        }
        const members = membersOf(cur.cls).filter((x) => x.m.n === name);
        const want = isCall ? argCount(seg) : -1;
        const pick = isCall
          ? members.filter((x) => x.m.k === "method").sort((a, b) => Math.abs(parseMember(a.m).params.length - want) - Math.abs(parseMember(b.m).params.length - want))[0]
          : members.find((x) => x.m.k === "field" || x.m.k === "const");
        if (!pick) return null;
        let rt = isCall ? parseMember(pick.m).returnType : pick.m.s.replace(/\s*=.*$/, "").split(/\s+/).slice(-2)[0];
        if (pick.m.k === "const") rt = cur.cls.n;
        const rc = findClass(baseType(rt), ctx.imports);
        cur = rc && !PRIMS.has(baseType(rt)) ? { cls: rc, isStatic: false } : null;
      }
      if (!cur) return null;
    }
    return cur;
  }

  function buildCtx(src, offset) {
    const tree = parseSource(src);
    return { tree, imports: readImports(src), decls: declsAt(src, offset, tree), self: enclosingClassName(src, offset) };
  }

  // Text of the member-access receiver immediately before a '.' at `dotIdx`.
  function receiverBefore(src, dotIdx) {
    let i = dotIdx - 1, depth = 0;
    for (; i >= 0; i--) {
      const ch = src[i];
      if (")]>".includes(ch) && !(ch === ">" && depth === 0 && !/[\w)>\]]/.test(src[i - 1] || ""))) depth++;
      else if ("([<".includes(ch)) { if (depth === 0) break; depth--; }
      else if (depth === 0 && !/[\w.$\s"']/.test(ch)) break;
      else if (depth === 0 && /\s/.test(ch)) { // whitespace only continues a chain around '.' or after 'new'
        const prev = src.slice(0, i).trimEnd(), next = src.slice(i).trimStart();
        if (!(prev.endsWith(".") || next.startsWith(".") || /\bnew$/.test(prev))) break;
      }
    }
    return src.slice(i + 1, dotIdx).replace(/\s+/g, " ").trim();
  }

  // ---- features -----------------------------------------------------------------
  function memberItem({ m, owner }, cls) {
    const pm = parseMember(m);
    return {
      label: m.n, kind: KIND[m.k] || "Method", detail: pm.label, doc: m.d || "", sort: (owner === cls ? "0" : "1") + m.n,
      insert: m.k === "method" ? m.n + (pm.params.length ? "($0)" : "()") : m.n, snippet: m.k === "method" && pm.params.length > 0,
      owner: owner.n,
    };
  }

  function complete(src, offset) {
    const ctx = buildCtx(src, offset);
    const before = src.slice(0, offset);
    const wm = before.match(/([A-Za-z_$][\w$]*)?$/);
    const prefix = wm ? wm[0] : "";
    const start = offset - prefix.length;
    const out = [];

    if (src[start - 1] === ".") { // member access
      const recv = receiverBefore(src, start - 1);
      const t = typeOfExpr(recv, ctx);
      if (!t) return { start, items: [] };
      for (const x of membersOf(t.cls)) {
        const isStatic = !!x.m.st || x.m.k === "const";
        if (t.isStatic !== isStatic && !(t.isStatic && x.m.k === "const")) continue;
        out.push(memberItem(x, t.cls));
      }
      if (t.isStatic) for (const c of classes) if (c.outer === t.cls.n.split(".").pop() && c.p === t.cls.p) out.push({ label: c.n.split(".").pop(), kind: KIND[c.k], detail: `${c.p}.${c.n}`, doc: c.d || "", sort: "2" + c.n, insert: c.n.split(".").pop() });
      return { start, items: filterRank(out, prefix) };
    }

    if (prefix.length === 0) return { start, items: [] };
    // locals / fields in scope
    for (const d of ctx.decls.values()) out.push({ label: d.name, kind: KIND.local, detail: `${d.type} (${d.kind})`, doc: "", sort: "0" + d.name, insert: d.name });
    // members of the current class chain (inherited methods like periodic(), addRequirements())
    if (ctx.self) {
      const own = findClass(ctx.self.name, ctx.imports);
      const sup = ctx.self.ext ? findClass(baseType(ctx.self.ext), ctx.imports) : null;
      for (const c of [own, sup]) if (c) for (const x of membersOf(c)) if (!x.m.st && x.m.k !== "const") out.push({ ...memberItem(x, c), sort: "1" + x.m.n });
    }
    // class names with auto-import
    const seen = new Set();
    for (const c of classes) {
      if (c.outer) continue;
      if (seen.has(c.n)) continue;
      if (!c.n.toLowerCase().startsWith(prefix.toLowerCase()) && !camel(c.n).startsWith(prefix.toLowerCase())) continue;
      seen.add(c.n);
      const fqn = `${c.p}.${c.n}`;
      const imported = ctx.imports.has(fqn) || ctx.imports.has(`${c.p}.*`) || c.p === "java.lang";
      out.push({ label: c.n, kind: KIND[c.k] || "Class", detail: `${c.p} · ${c.lib}`, doc: c.d || "", sort: (imported ? "2" : "3") + c.n, insert: c.n, importFqn: imported ? null : fqn });
    }
    return { start, items: filterRank(out, prefix).slice(0, 80) };
  }

  function filterRank(items, prefix) {
    const p = prefix.toLowerCase();
    const scored = [];
    for (const it of items) {
      const l = it.label.toLowerCase();
      let score;
      if (!p) score = 1;
      else if (l.startsWith(p)) score = 0;
      else if (camel(it.label).startsWith(p)) score = 1;
      else if (l.includes(p)) score = 2;
      else continue;
      scored.push([score, it]);
    }
    scored.sort((a, b) => a[0] - b[0] || a[1].sort.localeCompare(b[1].sort));
    const seen = new Set();
    return scored.map((s) => s[1]).filter((it) => { const k = it.label + it.detail; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  const camel = (s) => s.replace(/[^A-Z]/g, "").toLowerCase();

  // Enclosing call at the cursor: { calleeText, argIndex }
  function enclosingCall(src, offset) {
    let depth = 0, commas = 0;
    for (let i = offset - 1; i >= 0; i--) {
      const ch = src[i];
      if (ch === ")" || ch === "]" || ch === "}") depth++;
      else if (ch === "(" || ch === "[" || ch === "{") {
        if (depth === 0) {
          if (ch !== "(") return null;
          return { open: i, argIndex: commas };
        }
        depth--;
      } else if (ch === "," && depth === 0) commas++;
      else if (ch === ";" && depth === 0) return null;
    }
    return null;
  }

  function signatureHelp(src, offset) {
    const call = enclosingCall(src, offset);
    if (!call) return null;
    const ctx = buildCtx(src, call.open);
    const before = src.slice(0, call.open).trimEnd();
    const nm = before.match(/(?:new\s+)?([\w$]+(?:\s*<[^>]*>)?)$/);
    if (!nm) return null;
    const isNew = /new\s+[\w$.]+(?:\s*<[^>]*>)?$/.test(before);
    let sigs = [];
    if (isNew) {
      const c = findClass(baseType(nm[1]), ctx.imports);
      if (c) sigs = c.m.filter((m) => m.k === "ctor");
    } else {
      const name = nm[1];
      const dot = before.length - name.length - 1;
      if (before[dot] === ".") {
        const t = typeOfExpr(receiverBefore(src, dot), ctx);
        if (t) sigs = membersOf(t.cls).filter((x) => x.m.n === name && x.m.k === "method").map((x) => x.m);
      } else if (ctx.self) {
        const own = findClass(ctx.self.name, ctx.imports);
        const sup = ctx.self.ext ? findClass(baseType(ctx.self.ext), ctx.imports) : null;
        sigs = [own, sup].filter(Boolean).flatMap((c) => membersOf(c)).filter((x) => x.m.n === name && x.m.k === "method").map((x) => x.m);
      }
    }
    if (!sigs.length) return null;
    const infos = sigs.map((m) => ({ ...parseMember(m), doc: m.d || "" }));
    infos.sort((a, b) => a.params.length - b.params.length);
    const fit = infos.findIndex((s) => s.params.length > call.argIndex);
    return { signatures: infos, active: Math.max(0, fit), argIndex: call.argIndex };
  }

  function hover(src, offset) {
    const re = /[\w$]/;
    let s = offset, e = offset;
    while (s > 0 && re.test(src[s - 1])) s--;
    while (e < src.length && re.test(src[e])) e++;
    const word = src.slice(s, e);
    if (!word) return null;
    const ctx = buildCtx(src, offset);
    if (src[s - 1] === ".") {
      const t = typeOfExpr(receiverBefore(src, s - 1), ctx);
      if (t) {
        const hits = membersOf(t.cls).filter((x) => x.m.n === word);
        if (hits.length) return { start: s, end: e, title: hits.map((h) => "```java\n" + parseMember(h.m).label + "\n```").join("\n"), doc: hits[0].m.d || "", owner: hits[0].owner.n };
        const nested = findClass(`${t.cls.n}.${word}`, ctx.imports);
        if (nested) return { start: s, end: e, title: "```java\n" + `${nested.k} ${nested.n}` + "\n```", doc: nested.d || "", owner: nested.p };
      }
      return null;
    }
    if (ctx.decls.has(word)) { const d = ctx.decls.get(word); return { start: s, end: e, title: "```java\n" + `${d.type} ${d.name}` + "\n```", doc: "", owner: d.kind }; }
    const c = /^[A-Z]/.test(word) ? findClass(word, ctx.imports) : null;
    if (c) return { start: s, end: e, title: "```java\n" + `${c.k} ${c.p}.${c.n}${c.ext ? " extends " + c.ext : ""}` + "\n```", doc: c.d || "", owner: c.lib };
    return null;
  }

  return { loadIndex, complete, signatureHelp, hover, _typeOfExpr: typeOfExpr, _buildCtx: buildCtx, _findClass: findClass };
}
