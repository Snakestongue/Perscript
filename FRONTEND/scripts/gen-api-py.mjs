// Build-time generator: downloads the RobotPy / Phoenix 6 / REV Python wheels and extracts the
// public API (classes, members, signatures, docstrings) into JSON for the Python editor.
//
//   node scripts/gen-api-py.mjs         -> writes src/api/py-*.json
//
// Output is committed so the site build needs no network access. Wheels are parsed with
// tree-sitter-python (the same grammar the editor uses) and never executed.
import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "api");

// One output file per library so the editor can lazy-load only what is enabled.
export const LIBS = {
  "py-wpilib": { label: "WPILib (RobotPy)", packages: ["wpilib", "robotpy-wpimath", "robotpy-commands-v2", "pyntcore", "robotpy-wpiutil"], top: /^(wpilib|wpimath|commands2|ntcore|wpiutil|wpinet|hal|wpiunits)\b/ },
  "py-ctre": { label: "CTRE Phoenix 6", packages: ["phoenix6"], top: /^phoenix6\b/ },
  "py-rev": { label: "REVLib", packages: ["robotpy-rev"], top: /^rev\b/ },
};

async function pickWheel(pkg) {
  const j = await (await fetch(`https://pypi.org/pypi/${pkg}/json`)).json();
  const wheels = j.urls.filter((u) => u.packagetype === "bdist_wheel");
  // Any platform works: we only read .py/.pyi files. Prefer pure wheels, then Windows.
  const f = wheels.find((u) => /py3-none-any/.test(u.filename)) || wheels.find((u) => /win_amd64/.test(u.filename)) || wheels[0];
  if (!f) throw new Error(`no wheel for ${pkg}`);
  return { url: f.url, filename: f.filename, version: j.info.version };
}

// ---- docstrings -----------------------------------------------------------------------
function dedent(text) {
  const lines = text.replace(/\t/g, "    ").split("\n");
  const indents = lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return [lines[0].trim(), ...lines.slice(1).map((l) => l.slice(cut).replace(/\s+$/, ""))].join("\n").trim();
}
function stringValue(node) {
  const t = node.text;
  const m = t.match(/^[rRbBuUfF]*("""|'''|"|')([\s\S]*)\1$/);
  return m ? dedent(m[2]) : "";
}
function cleanDoc(raw) {
  if (!raw) return "";
  return raw
    .replace(/:param\s+(\w+):\s*/g, "\n**@param** `$1` ")
    .replace(/:returns?:\s*/g, "\n**@return** ")
    .replace(/:raises?\s+([\w.]+):\s*/g, "\n**@throws** `$1` ")
    .replace(/:(?:py:)?(?:class|meth|func|attr|mod|data|const|obj):`~?([^`]+)`/g, "`$1`")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
function docOf(bodyNode) {
  const first = bodyNode?.namedChildren?.[0];
  if (first?.type === "expression_statement" && first.namedChildren[0]?.type === "string") return cleanDoc(stringValue(first.namedChildren[0]));
  return "";
}

// ---- module path mapping ----------------------------------------------------------------
function moduleOf(entry) {
  const parts = entry.replace(/^[^/]+\.data\/purelib\//, "").split("/");
  const file = parts.pop().replace(/\.pyi?$/, "");
  const pub = parts.filter((p) => !p.startsWith("_"));
  // pybind stubs live in private dirs (wpimath/_controls/_controls/controller.pyi) and the
  // file name is the public submodule (wpimath.controller). Pure-Python packages are public by dir.
  if (parts.some((p) => p.startsWith("_")) && !file.startsWith("_") && file !== "__init__") pub.push(file);
  return pub.join(".");
}

// ---- extraction -------------------------------------------------------------------------
function paramInfo(paramsNode) {
  const out = [];
  for (const p of paramsNode?.namedChildren || []) {
    let name = "", type = "", def = "";
    if (p.type === "identifier") name = p.text;
    else if (p.type === "typed_parameter") { name = p.namedChildren.find((c) => c.type === "identifier" || c.type.endsWith("splat_pattern"))?.text || ""; type = p.childForFieldName("type")?.text || ""; }
    else if (p.type === "default_parameter") { name = p.childForFieldName("name")?.text || ""; def = p.childForFieldName("value")?.text || ""; }
    else if (p.type === "typed_default_parameter") { name = p.childForFieldName("name")?.text || ""; type = p.childForFieldName("type")?.text || ""; def = p.childForFieldName("value")?.text || ""; }
    else if (p.type === "list_splat_pattern" || p.type === "dictionary_splat_pattern") name = p.text;
    else continue;
    out.push({ n: name, t: type, d: def });
  }
  return out;
}

function simplifyType(t) {
  return t.replace(/typing\.SupportsInt \| typing\.SupportsIndex/g, "int").replace(/typing\.SupportsFloat \| typing\.SupportsIndex/g, "float").replace(/typing\.SupportsFloat/g, "float").replace(/typing\.SupportsInt/g, "int")
    .replace(/\btyping\./g, "").replace(/\bcollections\.abc\./g, "").replace(/\bwpilib\._wpilib\./g, "").replace(/\bwpimath\._controls\._controls\.\w+\./g, "");
}

function funcRecord(fn, decorators, isMethod) {
  const name = fn.childForFieldName("name").text;
  const params = paramInfo(fn.childForFieldName("parameters"));
  const ret = simplifyType(fn.childForFieldName("return_type")?.text || "");
  const decs = decorators.map((d) => d.text.replace(/^@/, ""));
  let k = "method";
  if (decs.some((d) => /^property$|\.getter$|^cached_property$/.test(d))) k = "prop";
  else if (decs.includes("staticmethod")) k = "static";
  else if (decs.includes("classmethod")) k = "classmethod";
  const shown = params.filter((p, i) => !(isMethod && i === 0 && (p.n === "self" || p.n === "cls") && k !== "static"));
  const sig = `${name}(${shown.map((p) => p.n + (p.t ? `: ${simplifyType(p.t)}` : "") + (p.d ? ` = ${p.d}` : "")).join(", ")})${ret ? ` -> ${ret}` : ""}`;
  const rec = { n: name === "__init__" ? "__init__" : name, k: name === "__init__" ? "ctor" : k, s: sig, p: shown.map((p) => ({ n: p.n, t: simplifyType(p.t), d: p.d })), r: ret };
  const d = docOf(fn.childForFieldName("body"));
  if (d) rec.d = d;
  return rec;
}

function extractFile(parser, text, into) {
  const tree = parser.parse(text);
  const visitBody = (body, owner) => {
    for (const node of body.namedChildren) {
      let decorators = [], def = node;
      if (node.type === "decorated_definition") { decorators = node.namedChildren.filter((c) => c.type === "decorator"); def = node.namedChildren.find((c) => c.type === "function_definition" || c.type === "class_definition"); }
      if (/^(if_statement|try_statement|with_statement|elif_clause|else_clause|except_clause|finally_clause)$/.test(node.type)) {
        // classes are often declared under `if TYPE_CHECKING:` / `try:` / platform checks
        const descend = (n) => { for (const c of n.namedChildren) { if (c.type === "block") visitBody(c, owner); else if (/_clause$/.test(c.type) || /_statement$/.test(c.type)) descend(c); } };
        descend(node);
        continue;
      }
      if (!def) {
        // annotated attribute: `x: int` or `x: int = 3` (class or module level)
        const a = node.type === "expression_statement" ? node.namedChildren[0] : null;
        if (a?.type === "assignment" || a?.type === "type") {
          const left = a.childForFieldName("left") || a.namedChildren[0];
          const ty = a.childForFieldName("type")?.text || "";
          const nm = left?.text;
          if (nm && /^[A-Za-z]\w*$/.test(nm) && !nm.startsWith("_")) {
            const rec = { n: nm, k: owner ? "attr" : "const", s: `${nm}${ty ? `: ${simplifyType(ty)}` : ""}`, r: simplifyType(ty), p: [] };
            if (owner) owner.m.push(rec); else into.consts.push(rec);
          }
        }
        continue;
      }
      if (def.type === "function_definition") {
        const rec = funcRecord(def, decorators, !!owner);
        if (rec.n.startsWith("_") && rec.n !== "__init__") continue;
        if (owner) owner.m.push(rec); else into.funcs.push(rec);
      } else if (def.type === "class_definition") {
        const name = def.childForFieldName("name").text;
        if (name.startsWith("_")) continue;
        const supers = (def.childForFieldName("superclasses")?.namedChildren || []).map((c) => simplifyType(c.text)).filter((t) => !/^(object|enum\.Enum|Enum|typing\.Protocol|Protocol|Generic|metaclass)/.test(t) && !t.includes("="));
        const cls = { n: name, k: "class", b: supers, m: [], d: docOf(def.childForFieldName("body")) };
        visitBody(def.childForFieldName("body"), cls);
        const prior = into.classes.find((x) => x.n === name);
        if (prior) mergeClass(prior, cls); else into.classes.push(cls);
      }
    }
  };
  visitBody(tree.rootNode, null);
  tree.delete?.();
}

function mergeClass(a, b) {
  const seen = new Set(a.m.map((m) => m.s));
  for (const m of b.m) if (!seen.has(m.s)) a.m.push(m);
  if (!a.d && b.d) a.d = b.d;
  if (!a.b.length && b.b.length) a.b = b.b;
}

async function main() {
  const Parser = require("web-tree-sitter");
  await Parser.init();
  const Python = await Parser.Language.load(path.join(ROOT, "node_modules", "tree-sitter-wasms", "out", "tree-sitter-python.wasm"));
  const parser = new Parser();
  parser.setLanguage(Python);
  fs.mkdirSync(OUT, { recursive: true });

  for (const [id, lib] of Object.entries(LIBS)) {
    const modules = {};
    const versions = [];
    for (const pkg of lib.packages) {
      let wheel;
      try { wheel = await pickWheel(pkg); } catch (e) { console.warn(`  skip ${pkg}: ${e.message}`); continue; }
      versions.push(`${pkg} ${wheel.version}`);
      const buf = Buffer.from(await (await fetch(wheel.url)).arrayBuffer());
      const zip = new AdmZip(buf);
      const entries = zip.getEntries().filter((e) => /\.pyi?$/.test(e.entryName) && !/\/(tests?|examples?|_impl)\//.test(e.entryName) && !/(^|\/)(__main__|conftest|setup|_version|version)\.pyi?$/.test(e.entryName));
      // .pyi (stubs, with docs) first so they win when merged with the .py shim
      entries.sort((x, y) => Number(y.entryName.endsWith(".pyi")) - Number(x.entryName.endsWith(".pyi")));
      for (const e of entries) {
        const mod = moduleOf(e.entryName);
        if (!mod || !lib.top.test(mod)) continue;
        const bucket = (modules[mod] ||= { classes: [], funcs: [], consts: [] });
        const tmp = { classes: [], funcs: [], consts: [] };
        try { extractFile(parser, e.getData().toString("utf8"), tmp); } catch (err) { console.warn(`  parse ${e.entryName}: ${err.message}`); continue; }
        for (const c of tmp.classes) { const ex = bucket.classes.find((x) => x.n === c.n); if (ex) mergeClass(ex, c); else bucket.classes.push(c); }
        for (const f of tmp.funcs) if (!bucket.funcs.some((x) => x.s === f.s)) bucket.funcs.push(f);
        for (const c of tmp.consts) if (!bucket.consts.some((x) => x.n === c.n)) bucket.consts.push(c);
      }
    }
    for (const [m, b] of Object.entries(modules)) if (!b.classes.length && !b.funcs.length && !b.consts.length) delete modules[m];
    const nClasses = Object.values(modules).reduce((n, m) => n + m.classes.length, 0);
    const json = { label: lib.label, versions, modules };
    const file = path.join(OUT, `${id}.json`);
    fs.writeFileSync(file, JSON.stringify(json));
    console.log(`${id}: ${Object.keys(modules).length} modules, ${nClasses} classes, ${(fs.statSync(file).size / 1024).toFixed(0)} KB  [${versions.join(", ")}]`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
