// Python language engine for the editor: import + scope + type resolution over a symbol index.
// Pure logic (no Monaco, no DOM) so it runs in a Web Worker and in Node tests.
//
// Python is dynamically typed, so types are inferred from what students actually write:
//   x = Class(...)            x = module.Class(...)       x: Class = ...
//   self.x = Class(...)       def f(self, x: Class): ...   method return annotations in chains
// The analysis is text-based on purpose: it keeps working while the code is half-typed.

const KIND = { class: "Class", ctor: "Constructor", method: "Method", static: "Method", classmethod: "Method", prop: "Field", attr: "Field", const: "EnumMember", func: "Function", module: "Module", local: "Variable" };
const BUILTIN_TYPES = new Set(["int", "float", "str", "bool", "bytes", "list", "dict", "tuple", "set", "None", "Any", "object", "Callable", "Self"]);
const BUILTINS = ["print", "len", "range", "int", "float", "str", "bool", "list", "dict", "tuple", "set", "abs", "min", "max", "sum", "round", "enumerate", "zip", "map", "filter", "sorted", "reversed", "isinstance", "super", "property", "staticmethod", "classmethod", "open", "type", "any", "all"];

const lastSeg = (s) => s.split(".").pop();
const camel = (s) => s.replace(/[^A-Z]/g, "").toLowerCase();

// Strip annotation noise down to one class name: "X | None", "Optional[X]", "list[X]", quotes, dotted paths.
function typeName(t) {
  if (!t) return "";
  let s = t.trim().replace(/^["']|["']$/g, "");
  const opt = s.match(/^Optional\[(.+)\]$/);
  if (opt) s = opt[1];
  s = s.split("|").map((x) => x.trim()).find((x) => x && x !== "None") || "";
  s = s.replace(/\[.*$/, "");
  return lastSeg(s.trim());
}

export function createPythonEngine() {
  const mods = new Map(); // "wpimath.geometry" -> { classes: Map, funcs: Map, consts: Map, lib }
  const children = new Map(); // "wpimath" -> Set("geometry", ...); "" -> top-level modules
  const classIndex = new Map(); // "Pose2d" -> [{ cls, mod }]
  const memo = new Map();

  function loadIndex(json, lib) {
    for (const [name, b] of Object.entries(json.modules)) {
      const rec = { classes: new Map(), funcs: new Map(), consts: new Map(), lib: lib || json.label };
      for (const c of b.classes) {
        rec.classes.set(c.n, c);
        if (!classIndex.has(c.n)) classIndex.set(c.n, []);
        classIndex.get(c.n).push({ cls: c, mod: name });
      }
      for (const f of b.funcs) { if (!rec.funcs.has(f.n)) rec.funcs.set(f.n, []); rec.funcs.get(f.n).push(f); }
      for (const c of b.consts) rec.consts.set(c.n, c);
      mods.set(name, rec);
      const parts = name.split(".");
      for (let i = 0; i < parts.length; i++) {
        const parent = parts.slice(0, i).join(".");
        if (!children.has(parent)) children.set(parent, new Set());
        children.get(parent).add(parts[i]);
      }
    }
    memo.clear();
  }

  // ---- index lookups -------------------------------------------------------------------
  function findClass(name, hintMod, scope) {
    const list = classIndex.get(name);
    if (!list) return null;
    if (list.length === 1) return list[0];
    if (scope) for (const e of list) for (const b of scope.values()) if (b.cls === e.cls) return e;
    return (hintMod && list.find((e) => e.mod === hintMod)) || list.find((e) => hintMod && e.mod.startsWith(hintMod.split(".")[0])) || list[0];
  }

  function membersOf({ cls, mod }, seen = new Set()) {
    const key = mod + "." + cls.n;
    if (memo.has(key)) return memo.get(key);
    if (seen.has(key)) return [];
    seen.add(key);
    const own = cls.m.filter((m) => m.k !== "ctor");
    const names = new Set(own.map((m) => m.s));
    const all = own.map((m) => ({ m, owner: cls }));
    for (const b of cls.b || []) {
      const base = findClass(lastSeg(typeName(b)), mod);
      if (base) for (const x of membersOf(base, seen)) if (!names.has(x.m.s)) { names.add(x.m.s); all.push(x); }
    }
    memo.set(key, all);
    return all;
  }

  // constructors of a class, falling back to the nearest base that declares one
  function ctorsOf(entry, seen = new Set()) {
    const own = entry.cls.m.filter((m) => m.k === "ctor");
    if (own.length) return own;
    const key = entry.mod + "." + entry.cls.n;
    if (seen.has(key)) return [];
    seen.add(key);
    for (const b of entry.cls.b || []) {
      const base = findClass(lastSeg(typeName(b)), entry.mod);
      if (base) { const c = ctorsOf(base, seen); if (c.length) return c; }
    }
    return [];
  }

  // ---- source analysis -----------------------------------------------------------------
  // Scope: local name -> { mod } | { cls, mod }   (from import statements)
  function readImports(src) {
    const scope = new Map();
    for (const m of src.matchAll(/^[ \t]*import[ \t]+([^\n#]+)/gm)) {
      for (const part of m[1].split(",")) {
        const mm = part.trim().match(/^([\w.]+)(?:\s+as\s+(\w+))?$/);
        if (!mm) continue;
        if (mm[2]) scope.set(mm[2], { mod: mm[1] });
        else scope.set(mm[1].split(".")[0], { mod: mm[1].split(".")[0] });
      }
    }
    for (const m of src.matchAll(/^[ \t]*from[ \t]+([\w.]+)[ \t]+import[ \t]+(\([^)]*\)|[^\n#]*)/gm)) {
      const mod = m[1];
      const names = m[2].replace(/[()\n\\]/g, " ").split(",");
      for (const n of names) {
        const mm = n.trim().match(/^(\w+)(?:\s+as\s+(\w+))?$/);
        if (!mm) continue;
        const local = mm[2] || mm[1];
        const rec = mods.get(mod);
        if (rec?.classes.has(mm[1])) scope.set(local, { cls: rec.classes.get(mm[1]), mod });
        else if (mods.has(`${mod}.${mm[1]}`) || children.get(mod)?.has(mm[1])) scope.set(local, { mod: `${mod}.${mm[1]}` });
        else if (rec?.funcs.has(mm[1])) scope.set(local, { funcs: rec.funcs.get(mm[1]), mod });
        else if (rec?.consts.has(mm[1])) scope.set(local, { konst: rec.consts.get(mm[1]), mod });
      }
    }
    return scope;
  }

  const lineStart = (src, off) => src.lastIndexOf("\n", off - 1) + 1;
  const indentOf = (line) => line.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;

  // Enclosing class and def (nearest preceding lines with smaller indent).
  function enclosing(src, offset) {
    const lines = src.slice(0, offset).split("\n");
    let ind = indentOf(lines[lines.length - 1]);
    let cls = null, fn = null;
    for (let i = lines.length - 2; i >= 0 && ind > 0; i--) {
      const l = lines[i];
      if (!l.trim() || /^\s*#/.test(l)) continue;
      const li = indentOf(l);
      if (li >= ind) continue;
      const fm = l.match(/^\s*(?:async\s+)?def\s+(\w+)\s*\(/);
      const cm = l.match(/^\s*class\s+(\w+)\s*(?:\(([^)]*)\))?/);
      if (fm && !fn) { fn = { name: fm[1], line: i, text: lines.slice(i, i + 12).join("\n") }; }
      if (cm) { cls = { name: cm[1], bases: (cm[2] || "").split(",").map((s) => s.trim()).filter(Boolean), line: i }; break; }
      ind = li;
    }
    return { cls, fn };
  }

  // Declarations visible at `offset`: Map(name -> { type: "Pose2d" | null, expr, kind })
  function declsAt(src, offset, scope, enc) {
    const out = new Map();
    const before = src.slice(0, offset);
    // function parameters with annotations
    if (enc.fn) {
      const pm = enc.fn.text.match(/def\s+\w+\s*\(([\s\S]*?)\)\s*(?:->[^:]*)?:/);
      if (pm) {
        let depth = 0, cur = "";
        const params = [];
        for (const ch of pm[1]) {
          if ("([{".includes(ch)) depth++;
          if (")]}".includes(ch)) depth--;
          if (ch === "," && depth === 0) { params.push(cur); cur = ""; } else cur += ch;
        }
        params.push(cur);
        for (const p of params) {
          const m = p.trim().match(/^\*{0,2}(\w+)\s*(?::\s*([^=]+?))?\s*(?:=.*)?$/s);
          if (m && m[1] !== "self" && m[1] !== "cls") out.set(m[1], { name: m[1], type: m[2] ? typeName(m[2]) : null, expr: null, kind: "param" });
        }
      }
    }
    // assignments before the cursor: x = expr / x: T = expr / x: T
    for (const m of before.matchAll(/^[ \t]*([A-Za-z_]\w*)[ \t]*(?::[ \t]*([^=\n]+?))?[ \t]*(?:=[ \t]*([^\n]+))?$/gm)) {
      if (!m[2] && !m[3]) continue;
      if (/^(if|elif|else|for|while|return|import|from|class|def|with|try|except|finally|print|pass|break|continue|raise|yield|assert|del|lambda|global|nonlocal)$/.test(m[1])) continue;
      out.set(m[1], { name: m[1], type: m[2] ? typeName(m[2]) : null, expr: m[3] ? m[3].trim() : null, kind: "local" });
    }
    return out;
  }

  // Attributes assigned on self anywhere in the file: Map(name -> { type, expr })
  function selfAttrs(src) {
    const out = new Map();
    for (const m of src.matchAll(/\bself\.([A-Za-z_]\w*)[ \t]*(?::[ \t]*([^=\n]+?))?[ \t]*(?:=[ \t]*([^\n]+))?$/gm)) {
      if (!m[2] && !m[3]) continue;
      if (!out.has(m[1]) || m[3]) out.set(m[1], { type: m[2] ? typeName(m[2]) : null, expr: m[3] ? m[3].trim() : null });
    }
    return out;
  }

  function buildCtx(src, offset) {
    const scope = readImports(src);
    const enc = enclosing(src, offset);
    return { src, scope, enc, decls: declsAt(src, offset, scope, enc), selfAttrs: selfAttrs(src), depth: 0 };
  }

  // ---- type resolution -------------------------------------------------------------------
  // Result forms: { mod } | { entry: {cls,mod}, inst } | { user: {name,bases}, inst: true } | null
  function splitChain(expr) {
    const segs = []; let depth = 0, cur = "";
    for (const ch of expr) {
      if ("([{".includes(ch)) depth++;
      if (")]}".includes(ch)) depth--;
      if (ch === "." && depth === 0) { segs.push(cur); cur = ""; } else cur += ch;
    }
    segs.push(cur);
    return segs.map((s) => { const m = s.trim().match(/^([A-Za-z_]\w*)\s*(\([\s\S]*\))?$/); return m ? { name: m[1], call: !!m[2] } : null; });
  }

  function fromTypeText(t, ownerMod, ctx) {
    const n = typeName(t);
    if (!n || BUILTIN_TYPES.has(n)) return null;
    const e = findClass(n, ownerMod, ctx?.scope);
    return e ? { entry: e, inst: true } : null;
  }

  function typeOfExpr(expr, ctx) {
    if (ctx.depth > 6) return null;
    const segs = splitChain(expr.replace(/\s+/g, " ").trim());
    if (!segs.length || segs.includes(null)) return null;
    ctx = { ...ctx, depth: ctx.depth + 1 };
    let cur = null;
    const first = segs[0];
    if (first.name === "self" && !first.call) {
      cur = ctx.enc.cls ? { user: ctx.enc.cls, inst: true } : null;
    } else if (ctx.scope.has(first.name)) {
      const b = ctx.scope.get(first.name);
      if (b.cls) cur = { entry: { cls: b.cls, mod: b.mod }, inst: first.call };
      else if (b.mod && !b.funcs && !b.konst) cur = { mod: b.mod };
      else if (b.funcs && first.call) cur = fromTypeText(b.funcs[0].r, b.mod, ctx);
    } else if (ctx.decls.has(first.name) && !first.call) {
      const d = ctx.decls.get(first.name);
      cur = d.type ? fromTypeText(d.type, null, ctx) : d.expr && d.expr !== expr ? typeOfExpr(d.expr, ctx) : null;
    }
    for (let i = 1; i < segs.length && cur; i++) cur = step(cur, segs[i], ctx);
    return cur;
  }

  function step(cur, seg, ctx) {
    if (cur.mod) {
      const rec = mods.get(cur.mod);
      const child = `${cur.mod}.${seg.name}`;
      if (mods.has(child) || children.get(cur.mod)?.has(seg.name)) return { mod: child };
      if (rec?.classes.has(seg.name)) return { entry: { cls: rec.classes.get(seg.name), mod: cur.mod }, inst: seg.call };
      if (rec?.funcs.has(seg.name) && seg.call) return fromTypeText(rec.funcs.get(seg.name)[0].r, cur.mod, ctx);
      if (rec?.consts.has(seg.name)) return fromTypeText(rec.consts.get(seg.name).r, cur.mod, ctx);
      return null;
    }
    if (cur.user) {
      const a = ctx.selfAttrs.get(seg.name);
      if (a && !seg.call) return a.type ? fromTypeText(a.type, null, ctx) : a.expr ? typeOfExpr(a.expr, ctx) : null;
      for (const b of cur.user.bases) {
        const bt = typeOfExpr(b, ctx);
        const entry = bt?.entry || (bt?.mod ? null : null);
        if (entry) { const r = step({ entry, inst: true }, seg, ctx); if (r) return r; }
      }
      return null;
    }
    if (cur.entry) {
      const hits = membersOf(cur.entry).filter((x) => x.m.name === seg.name || x.m.n === seg.name);
      const pick = seg.call ? hits.find((x) => x.m.k !== "prop" && x.m.k !== "attr") : hits[0];
      if (!pick) return null;
      return fromTypeText(pick.m.r, cur.entry.mod, ctx);
    }
    return null;
  }

  // ---- features ----------------------------------------------------------------------
  const parseSig = (m) => ({ name: m.n === "__init__" ? "" : m.n, params: (m.p || []).map((p) => ({ name: p.n, type: p.t, def: p.d, label: p.n + (p.t ? `: ${p.t}` : "") + (p.d ? ` = ${p.d}` : "") })), label: m.s });

  function memberItem({ m, owner }, owningEntryClass) {
    const sig = parseSig(m);
    const isCallable = m.k === "method" || m.k === "static" || m.k === "classmethod";
    return {
      label: m.n, kind: KIND[m.k] || "Method", detail: m.s, doc: m.d || "", sort: (owner === owningEntryClass ? "0" : "1") + m.n,
      insert: isCallable ? m.n + (sig.params.length ? "($0)" : "()") : m.n, snippet: isCallable && sig.params.length > 0, owner: owner.n,
    };
  }

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

  // Receiver expression immediately before a '.' at dotIdx (stays inside brackets, stops at operators).
  function receiverBefore(src, dotIdx) {
    let i = dotIdx - 1, depth = 0;
    for (; i >= 0; i--) {
      const ch = src[i];
      if (")]}".includes(ch)) depth++;
      else if ("([{".includes(ch)) { if (depth === 0) break; depth--; }
      else if (depth === 0 && !/[\w.]/.test(ch)) break;
    }
    return src.slice(i + 1, dotIdx).trim();
  }

  function moduleItems(modName, prefix) {
    const out = [];
    const rec = mods.get(modName);
    if (rec) {
      for (const c of rec.classes.values()) out.push({ label: c.n, kind: "Class", detail: `class · ${modName}`, doc: c.d || "", sort: "0" + c.n, insert: c.n });
      for (const [n, fs] of rec.funcs) out.push({ label: n, kind: "Function", detail: fs[0].s, doc: fs[0].d || "", sort: "1" + n, insert: n + (fs[0].p.length ? "($0)" : "()"), snippet: fs[0].p.length > 0 });
      for (const c of rec.consts.values()) out.push({ label: c.n, kind: "EnumMember", detail: c.s, doc: "", sort: "2" + c.n, insert: c.n });
    }
    for (const ch of children.get(modName) || []) if (mods.has(`${modName}.${ch}`) || children.has(`${modName}.${ch}`)) out.push({ label: ch, kind: "Module", detail: `module · ${modName}.${ch}`, doc: "", sort: "3" + ch, insert: ch });
    return filterRank(out, prefix);
  }

  function complete(src, offset) {
    const before = src.slice(0, offset);
    const wm = before.match(/([A-Za-z_]\w*)?$/);
    const prefix = wm ? wm[0] : "";
    const start = offset - prefix.length;
    const lineBefore = before.slice(lineStart(src, offset));

    // `from X import a, b|`  /  `from X|`  /  `import X|`
    const fromImport = lineBefore.match(/^\s*from\s+([\w.]+)\s+import\s+(?:\([^)]*)?(?:[\w\s,]*,\s*)?\w*$/);
    if (fromImport) return { start, items: moduleItems(fromImport[1], prefix) };
    const importPath = lineBefore.match(/^\s*(?:from|import)\s+(?:[\w.]*\.)?\w*$/) && !/^\s*from\s+[\w.]+\s+\w*$/.test(lineBefore);
    if (importPath) {
      const dotted = (lineBefore.match(/^\s*(?:from|import)\s+([\w.]*)$/) || [])[1] || "";
      const parent = dotted.includes(".") ? dotted.slice(0, dotted.lastIndexOf(".")) : "";
      const names = [...(children.get(parent) || [])].map((c) => ({ label: c, kind: "Module", detail: `module · ${parent ? parent + "." : ""}${c}`, doc: "", sort: "0" + c, insert: c }));
      return { start, items: filterRank(names, prefix) };
    }

    const ctx = buildCtx(src, offset);
    if (src[start - 1] === ".") { // member access
      const recv = receiverBefore(src, start - 1);
      if (!recv) return { start, items: [] };
      const t = typeOfExpr(recv, ctx);
      if (!t) return { start, items: [] };
      if (t.mod) return { start, items: moduleItems(t.mod, prefix) };
      if (t.entry) return { start, items: filterRank(membersOf(t.entry).map((x) => memberItem(x, t.entry.cls)), prefix) };
      if (t.user) {
        const items = [];
        for (const [n, a] of ctx.selfAttrs) items.push({ label: n, kind: "Field", detail: a.type || (a.expr || "").slice(0, 40), doc: "", sort: "0" + n, insert: n });
        for (const b of t.user.bases) { const bt = typeOfExpr(b, ctx); if (bt?.entry) for (const x of membersOf(bt.entry)) items.push(memberItem(x, bt.entry.cls)); }
        return { start, items: filterRank(items, prefix) };
      }
      return { start, items: [] };
    }

    if (prefix.length === 0) return { start, items: [] };
    const out = [];
    for (const d of ctx.decls.values()) out.push({ label: d.name, kind: KIND.local, detail: d.type || d.kind, doc: "", sort: "0" + d.name, insert: d.name });
    for (const [n, b] of ctx.scope) out.push({ label: n, kind: b.cls ? "Class" : b.funcs ? "Function" : b.konst ? "EnumMember" : "Module", detail: b.cls ? `class · ${b.mod}` : b.funcs || b.konst ? "imported" : `module · ${b.mod}`, doc: b.cls?.d || "", sort: "1" + n, insert: n });
    for (const n of BUILTINS) out.push({ label: n, kind: "Function", detail: "builtin", doc: "", sort: "3" + n, insert: n });
    // unimported classes from the index, with a ready-made import line
    const seen = new Set(out.map((o) => o.label));
    for (const list of classIndex.values()) {
      const e = list[0];
      if (seen.has(e.cls.n)) continue;
      const l = e.cls.n.toLowerCase();
      if (!l.startsWith(prefix.toLowerCase()) && !(prefix.length > 1 && camel(e.cls.n).startsWith(prefix.toLowerCase()))) continue;
      seen.add(e.cls.n);
      out.push({ label: e.cls.n, kind: "Class", detail: `${e.mod} · ${mods.get(e.mod).lib}`, doc: e.cls.d || "", sort: "2" + e.cls.n, insert: e.cls.n, importText: `from ${e.mod} import ${e.cls.n}` });
    }
    return { start, items: filterRank(out, prefix).slice(0, 80) };
  }

  // Enclosing call at the cursor: { open, argIndex, keyword }
  function enclosingCall(src, offset) {
    let depth = 0, commas = 0;
    for (let i = offset - 1; i >= 0; i--) {
      const ch = src[i];
      if (")]}".includes(ch)) depth++;
      else if ("([{".includes(ch)) { if (depth === 0) return ch === "(" ? { open: i, argIndex: commas } : null; depth--; }
      else if (ch === "," && depth === 0) commas++;
      else if (ch === "\n" && depth === 0 && !/[,(\\]\s*$/.test(src.slice(Math.max(0, i - 40), i)) && !/^\s*[)\w"'.-]/.test(src.slice(i + 1, i + 40))) return null;
    }
    return null;
  }

  function calleeSigs(calleeExpr, ctx) {
    const segs = splitChain(calleeExpr);
    if (!segs.length || segs.includes(null)) return [];
    const last = segs[segs.length - 1].name;
    if (segs.length === 1) {
      const b = ctx.scope.get(last);
      if (b?.cls) return ctorsOf({ cls: b.cls, mod: b.mod }).map((m) => ({ m, owner: b.cls }));
      if (b?.funcs) return b.funcs.map((m) => ({ m, owner: null }));
      return [];
    }
    const recvExpr = calleeExpr.slice(0, calleeExpr.length - last.length).replace(/\.\s*$/, "");
    const t = typeOfExpr(recvExpr, ctx);
    if (!t) return [];
    if (t.mod) {
      const rec = mods.get(t.mod);
      if (rec?.classes.has(last)) return ctorsOf({ cls: rec.classes.get(last), mod: t.mod }).map((m) => ({ m, owner: rec.classes.get(last) }));
      if (rec?.funcs.has(last)) return rec.funcs.get(last).map((m) => ({ m, owner: null }));
      return [];
    }
    if (t.entry) return membersOf(t.entry).filter((x) => x.m.n === last && x.m.k !== "prop" && x.m.k !== "attr");
    if (t.user) for (const b of t.user.bases) { const bt = typeOfExpr(b, ctx); if (bt?.entry) { const r = membersOf(bt.entry).filter((x) => x.m.n === last); if (r.length) return r; } }
    return [];
  }

  function signatureHelp(src, offset) {
    const call = enclosingCall(src, offset);
    if (!call) return null;
    const ctx = buildCtx(src, call.open);
    const before = src.slice(0, call.open).trimEnd();
    const cm = before.match(/([A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*|\s*\([^()]*\))*)$/);
    if (!cm) return null;
    const entries = calleeSigs(cm[1].replace(/\s+/g, ""), ctx);
    if (!entries.length) return null;
    const infos = entries.map(({ m }) => {
      const doc = m.d || "";
      const paramDocs = {};
      const lines = doc.split("\n");
      for (const line of lines) { const pm = line.match(/^\*\*@param\*\* `([^`]+)`\s*(.*)$/); if (pm) paramDocs[pm[1]] = pm[2]; }
      const summary = lines.filter((l) => !l.startsWith("**@")).join("\n").trim();
      const s = parseSig(m);
      return { ...s, label: (m.k === "ctor" ? cm[1].split(".").pop() : m.n) + m.s.slice(m.n.length), doc: summary, paramDocs };
    });
    infos.sort((a, b) => a.params.length - b.params.length);
    // keyword arguments select by name
    const kw = src.slice(src.lastIndexOf(",", offset - 1) > call.open ? src.lastIndexOf(",", offset - 1) + 1 : call.open + 1, offset).match(/^\s*(\w+)\s*=/);
    let argIndex = call.argIndex;
    let fit = infos.findIndex((s) => s.params.length > argIndex);
    if (kw) { const j = infos.findIndex((s) => s.params.some((p) => p.name === kw[1])); if (j >= 0) { fit = j; argIndex = infos[j].params.findIndex((p) => p.name === kw[1]); } }
    return { signatures: infos, active: Math.max(0, fit), argIndex };
  }

  function hover(src, offset) {
    let s = offset, e = offset;
    while (s > 0 && /\w/.test(src[s - 1])) s--;
    while (e < src.length && /\w/.test(src[e])) e++;
    const word = src.slice(s, e);
    if (!word) return null;
    const ctx = buildCtx(src, offset);
    if (src[s - 1] === ".") {
      const t = typeOfExpr(receiverBefore(src, s - 1), ctx);
      if (t?.entry) {
        const hits = membersOf(t.entry).filter((x) => x.m.n === word);
        if (hits.length) {
          const shown = hits.slice(0, 3).map((h) => "```python\n" + h.m.s + "\n```").join("\n");
          const more = hits.length > 3 ? `\n*+${hits.length - 3} more overloads*` : "";
          const withDoc = hits.find((h) => h.m.d) || hits[0];
          return { start: s, end: e, title: shown + more, doc: withDoc.m.d || "", owner: hits[0].owner.n };
        }
      }
      if (t?.mod) {
        const rec = mods.get(t.mod);
        const c = rec?.classes.get(word);
        if (c) return { start: s, end: e, title: "```python\n" + `class ${t.mod}.${c.n}` + "\n```", doc: c.d || "", owner: rec.lib };
        const f = rec?.funcs.get(word);
        if (f) return { start: s, end: e, title: "```python\n" + f[0].s + "\n```", doc: f[0].d || "", owner: rec.lib };
      }
      return null;
    }
    const b = ctx.scope.get(word);
    if (b?.cls) return { start: s, end: e, title: "```python\n" + `class ${b.mod}.${b.cls.n}` + (b.cls.b?.length ? `(${b.cls.b.join(", ")})` : "") + "\n```", doc: b.cls.d || "", owner: mods.get(b.mod)?.lib };
    if (b?.mod && !b.funcs && !b.konst) return { start: s, end: e, title: "```python\n" + `module ${b.mod}` + "\n```", doc: "", owner: mods.get(b.mod)?.lib || "" };
    if (ctx.decls.has(word)) { const d = ctx.decls.get(word); const t = d.type || typeOfExpr(d.expr || "", ctx)?.entry?.cls.n || ""; return { start: s, end: e, title: "```python\n" + `${word}${t ? ": " + t : ""}` + "\n```", doc: "", owner: d.kind }; }
    return null;
  }

  return { loadIndex, complete, signatureHelp, hover, _typeOfExpr: typeOfExpr, _buildCtx: buildCtx };
}
