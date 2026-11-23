// Build-time generator: downloads the WPILib / Phoenix 6 / REVLib C++ header packages and extracts
// the public API (namespaces, classes, members, signatures, Doxygen comments) into JSON for the
// C++ editor.
//
//   node scripts/gen-api-cpp.mjs        -> writes src/api/cpp-*.json
//
// Output is committed so the site build needs no network access. Headers are parsed with
// tree-sitter-cpp and never compiled.
import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "api");
const WPI = "https://frcmaven.wpi.edu/artifactory/release/edu/wpi/first";
const V = "2026.2.2";
const hz = (g, a) => `${WPI}/${g}/${a}-cpp/${V}/${a}-cpp-${V}-headers.zip`;

// One output file per library so the editor can lazy-load only what is enabled.
export const LIBS = {
  "cpp-wpilib": {
    label: "WPILib",
    zips: [
      { url: hz("wpilibc", "wpilibc"), only: /^frc\// },
      { url: hz("wpimath", "wpimath"), only: /^frc\// },
      { url: hz("wpilibNewCommands", "wpilibNewCommands"), only: /^frc2\// },
      { url: hz("ntcore", "ntcore"), only: /^networktables\// },
    ],
  },
  "cpp-ctre": { label: "CTRE Phoenix 6", zips: [{ url: "https://maven.ctr-electronics.com/release/com/ctre/phoenix6/wpiapi-cpp/26.3.0/wpiapi-cpp-26.3.0-headers.zip", only: /^ctre\/phoenix6\// }] },
  "cpp-rev": { label: "REVLib", zips: [{ url: "https://maven.revrobotics.com/com/revrobotics/frc/REVLib-cpp/2026.0.4/REVLib-cpp-2026.0.4-headers.zip", only: /^rev\// }] },
};

// ---- doc comments ---------------------------------------------------------------------
function cleanDoc(raw) {
  if (!raw) return "";
  let s = raw
    .replace(/^\/\*\*+/, "").replace(/\*+\/$/, "")
    .split("\n").map((l) => l.replace(/^\s*(?:\*|\/\/\/)\s?/, "")).join("\n");
  s = s
    .replace(/[\\@]param(?:\[[^\]]*\])?\s+(\w+)\s*/g, "\n**@param** `$1` ")
    .replace(/[\\@]returns?\s+/g, "\n**@return** ")
    .replace(/[\\@]throws?\s+([\w:]+)\s*/g, "\n**@throws** `$1` ")
    .replace(/[\\@](?:brief|details|note|warning|see|sa)\s*/g, "")
    .replace(/[\\@](?:p|c|a)\s+(\w+)/g, "`$1`")
    .replace(/<\/?[a-z]+[^>]*>/gi, "")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

// ---- tree-sitter walk -----------------------------------------------------------------
const squash = (t) => t.replace(/\s+/g, " ").trim();
const NOISE = /\b(constexpr|consteval|inline|virtual|static|explicit|friend|extern|WPILIB_DLLEXPORT)\b|\[\[[^\]]*\]\]/g;
const cleanType = (t) => squash(t.replace(NOISE, ""));

function declaratorInfo(decl) {
  // unwrap pointer/reference declarators: returns { fn, prefix }
  let prefix = "";
  let d = decl;
  while (d && (d.type === "pointer_declarator" || d.type === "reference_declarator" || d.type === "init_declarator" || d.type === "array_declarator")) {
    if (d.type === "init_declarator" || d.type === "array_declarator") { d = d.childForFieldName("declarator"); continue; }
    prefix += d.type === "pointer_declarator" ? "*" : "&";
    d = d.childForFieldName("declarator") || d.namedChildren[d.namedChildren.length - 1];
  }
  return { d, prefix };
}

function paramsOf(fn) {
  const list = fn.childForFieldName("parameters");
  const out = [];
  for (const p of list?.namedChildren || []) {
    if (p.type !== "parameter_declaration" && p.type !== "optional_parameter_declaration" && p.type !== "variadic_parameter_declaration") continue;
    const text = squash(p.text);
    const decl = p.childForFieldName("declarator");
    const type = cleanType(p.childForFieldName("type")?.text || "");
    const nameNode = decl ? declaratorInfo(decl).d : null;
    const name = nameNode?.type === "identifier" || nameNode?.type === "field_identifier" ? nameNode.text : "";
    const def = p.childForFieldName("default_value")?.text || "";
    out.push({ n: name, t: squash(`${type}${decl && /^[*&]/.test(decl.text) ? " " + decl.text.match(/^[*&]+/)[0] : ""}`), d: def, text });
  }
  return out;
}

function memberFromDecl(node, cls, docText, access) {
  // returns an array of member records for a field_declaration / declaration / function_definition
  const typeNode = node.childForFieldName("type");
  const isStatic = node.namedChildren.some((c) => c.type === "storage_class_specifier" && c.text === "static");
  const recs = [];
  const decls = node.type === "function_definition" ? [node.childForFieldName("declarator")] : node.namedChildren.filter((c) => /declarator$|^field_identifier$|^identifier$/.test(c.type));
  for (const dRaw of decls) {
    if (!dRaw) continue;
    const { d, prefix } = declaratorInfo(dRaw);
    if (!d) continue;
    if (d.type === "function_declarator") {
      const nameNode = d.childForFieldName("declarator");
      const name = nameNode?.text || "";
      if (!name || /^operator|^~/.test(name) || name.includes("<")) continue;
      const params = paramsOf(d);
      const isCtor = !!cls && (name === cls.n) && !typeNode;
      const ret = isCtor ? "" : cleanType(typeNode?.text || "") + (prefix ? " " + prefix : "");
      const sig = `${ret ? ret + " " : ""}${name}(${params.map((p) => p.text.replace(NOISE, "").trim()).join(", ")})`;
      recs.push({ n: name, k: isCtor ? "ctor" : "method", s: squash(sig), r: ret.replace(/\s+([*&])/g, "$1"), p: params.map((p) => ({ n: p.n, t: p.t, d: p.d })), ...(isStatic ? { st: 1 } : {}), ...(docText ? { d: docText } : {}), ...(access ? {} : {}) });
    } else if (cls) {
      const names = d.type === "identifier" || d.type === "field_identifier" ? [d] : [];
      for (const n of names) {
        const t = cleanType(typeNode?.text || "") + (prefix ? prefix : "");
        recs.push({ n: n.text, k: "field", s: squash(`${t} ${n.text}`), r: t, p: [], ...(isStatic ? { st: 1 } : {}), ...(docText ? { d: docText } : {}) });
      }
    }
  }
  return recs;
}

function extractFile(parser, text, hdr, into) {
  // export macros between `class` and the name confuse the grammar
  const cleaned = text
    .replace(/\b[A-Z][A-Z0-9]*_(?:DLLEXPORT|DLLIMPORT|EXPORT|API)\b/g, "")
    // bare macro lines (WPI_IGNORE_DEPRECATED, WPI_DEPRECATED("...")) glue onto the next declaration
    .replace(/^[ \t]*[A-Z][A-Z0-9_]{4,}(?:\([^)\n]*\))?[ \t]*$/gm, "");
  const tree = parser.parse(cleaned);

  const walk = (body, ns, cls, access0) => {
    let doc = "";
    let access = access0;
    for (const node of body.namedChildren) {
      const t = node.type;
      if (t === "comment") { doc = /^\/\*\*|^\/\/\//.test(node.text) ? cleanDoc(node.text) : ""; continue; }
      const d = doc; doc = "";
      if (t === "access_specifier") { access = node.text.replace(":", "").trim(); doc = ""; continue; }
      if (t === "namespace_definition") {
        const nm = node.childForFieldName("name")?.text;
        const inner = node.childForFieldName("body");
        if (inner) walk(inner, nm ? [...ns, ...nm.split("::")] : ns, null, "public");
      } else if (t === "linkage_specification") {
        const inner = node.childForFieldName("body");
        if (inner) walk(inner, ns, cls, access);
      } else if (t === "template_declaration") {
        const inner = node.namedChildren.find((c) => /^(class_specifier|struct_specifier|declaration|function_definition|field_declaration|alias_declaration)$/.test(c.type));
        if (inner) handle(inner, ns, cls, access, d, true);
      } else if (t === "preproc_ifdef" || t === "preproc_if" || t === "preproc_else" || t === "preproc_elif") {
        walk(node, ns, cls, access);
      } else handle(node, ns, cls, access, d, false);
    }
  };

  const handle = (node, ns, cls, access, docText, isTemplate) => {
    const t = node.type;
    const nsName = ns.join("::");
    if ((t === "class_specifier" || t === "struct_specifier") && node.childForFieldName("body")) {
      const nameNode = node.childForFieldName("name");
      const name = nameNode?.text?.split("::").pop();
      if (!name || /\s/.test(name) || name.includes("<")) return;
      const bases = [];
      const bc = node.namedChildren.find((c) => c.type === "base_class_clause");
      for (const b of bc?.namedChildren || []) if (b.type !== "access_specifier" && b.type !== "virtual") bases.push(squash(b.text));
      const rec = { n: name, ns: nsName, k: t === "struct_specifier" ? "struct" : "class", b: bases, m: [], hdr, ...(docText ? { d: docText } : {}), ...(isTemplate ? { tpl: 1 } : {}) };
      walk(node.childForFieldName("body"), ns, rec, t === "struct_specifier" ? "public" : "private");
      into.classes.push(rec);
      return;
    }
    if (t === "enum_specifier" && node.childForFieldName("body")) {
      const name = node.childForFieldName("name")?.text;
      const rec = { n: name || "", ns: nsName, k: "enum", b: [], m: [], hdr, ...(docText ? { d: docText } : {}) };
      let d = "";
      for (const c of node.childForFieldName("body").namedChildren) {
        if (c.type === "comment") { d = /^\/\*\*|^\/\/\//.test(c.text) ? cleanDoc(c.text) : ""; continue; }
        if (c.type === "enumerator") rec.m.push({ n: c.childForFieldName("name").text, k: "enumerator", s: c.text, r: "", p: [], ...(d ? { d } : {}) });
        d = "";
      }
      if (cls) { rec.n = rec.n; rec.ns = nsName ? `${nsName}::${cls.n}` : cls.n; }
      if (rec.n) into.classes.push(rec);
      return;
    }
    if (t === "alias_declaration" || t === "type_definition") {
      const name = (t === "alias_declaration" ? node.childForFieldName("name") : node.childForFieldName("declarator"))?.text;
      const target = (t === "alias_declaration" ? node.childForFieldName("type") : node.childForFieldName("type"))?.text;
      if (name && target && !name.includes("<")) {
        const rec = { n: name, ns: cls ? (nsName ? `${nsName}::${cls.n}` : cls.n) : nsName, k: "alias", t: squash(target), b: [], m: [], hdr };
        into.classes.push(rec);
      }
      return;
    }
    if (t === "field_declaration" || t === "declaration" || t === "function_definition") {
      if (cls && access !== "public") return;
      for (const rec of memberFromDecl(node, cls, docText, access)) {
        if (cls) cls.m.push(rec);
        else if (rec.k === "method") into.funcs.push({ ...rec, ns: nsName, hdr });
      }
    }
  };

  walk(tree.rootNode, [], null, "public");
  tree.delete?.();
}

async function main() {
  const Parser = require("web-tree-sitter");
  await Parser.init();
  const Cpp = await Parser.Language.load(path.join(ROOT, "node_modules", "tree-sitter-wasms", "out", "tree-sitter-cpp.wasm"));
  const parser = new Parser();
  parser.setLanguage(Cpp);
  fs.mkdirSync(OUT, { recursive: true });

  for (const [id, lib] of Object.entries(LIBS)) {
    const into = { classes: [], funcs: [] };
    let files = 0;
    for (const z of lib.zips) {
      const buf = Buffer.from(await (await fetch(z.url)).arrayBuffer());
      const zip = new AdmZip(buf);
      for (const e of zip.getEntries()) {
        if (e.isDirectory || !/\.(h|hpp|inc)$/.test(e.entryName) || !z.only.test(e.entryName)) continue;
        if (/\/(detail|internal|impl)\//i.test(e.entryName)) continue;
        files++;
        try { extractFile(parser, e.getData().toString("utf8"), e.entryName, into); } catch (err) { console.warn(`  parse ${e.entryName}: ${err.message}`); }
      }
    }
    // merge duplicate classes (forward declarations, repeated headers)
    const merged = new Map();
    for (const c of into.classes) {
      const key = `${c.ns}::${c.n}`;
      const prior = merged.get(key);
      if (!prior) merged.set(key, c);
      else if (c.m.length > prior.m.length || (c.m.length === prior.m.length && c.k !== "alias")) merged.set(key, { ...c, d: c.d || prior.d });
    }
    const classes = [...merged.values()].filter((c) => c.m.length || c.b.length || c.k === "alias" || c.k === "enum" || c.d);
    const json = { label: lib.label, version: id === "cpp-ctre" ? "26.3.0" : id === "cpp-rev" ? "2026.0.4" : V, classes, funcs: into.funcs };
    const file = path.join(OUT, `${id}.json`);
    fs.writeFileSync(file, JSON.stringify(json));
    console.log(`${id}: ${files} headers, ${classes.length} types, ${into.funcs.length} functions, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
