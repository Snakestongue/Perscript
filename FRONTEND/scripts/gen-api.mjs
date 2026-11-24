// Build-time generator: downloads library *-sources.jar files and extracts the
// public Java API (classes, members, signatures, Javadoc) into JSON for the editor.
//
//   node scripts/gen-api.mjs            -> writes src/api/*.json
//
// Output is committed so the site build needs no network access.
import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "api");
const WPI = "https://frcmaven.wpi.edu/artifactory/release/edu/wpi/first";
const WPI_VERSION = "2026.2.2";
const CTRE = "https://maven.ctr-electronics.com/release/com/ctre/phoenix6";
const CTRE_VERSION = "26.3.0";

// One output file per library so the editor can lazy-load only what is enabled.
export const LIBS = {
  wpilib: {
    label: "WPILib",
    jars: ["wpilibj", "wpimath", "wpiunits", "wpilibNewCommands", "wpiutil", "ntcore"].map(
      (a) => `${WPI}/${a}/${a}-java/${WPI_VERSION}/${a}-java-${WPI_VERSION}-sources.jar`
    ),
    only: /^edu\/wpi\//,
  },
  ctre: {
    label: "CTRE Phoenix 6",
    jars: [`${CTRE}/wpiapi-java/${CTRE_VERSION}/wpiapi-java-${CTRE_VERSION}-sources.jar`],
    only: /^com\/ctre\/phoenix6\//,
  },
};

const MODIFIERS = new Set(["public", "protected", "private", "static", "final", "abstract", "default", "synchronized", "native", "transient", "volatile", "strictfp", "sealed", "non-sealed"]);

export function cleanDoc(raw) {
  if (!raw) return "";
  let s = raw
    .replace(/^\/\*\*/, "").replace(/\*\/$/, "")
    .split("\n").map((l) => l.replace(/^\s*\* ?/, "")).join("\n");
  s = s
    .replace(/\{@(?:link|linkplain|code|literal|value)\s+([^}]*)\}/g, (_, x) => "`" + x.replace(/^#/, "").trim() + "`")
    .replace(/<\/?p>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "- ").replace(/<\/?(ul|ol|li|b|i|em|strong|code|pre|tt|blockquote)>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/^@param\s+(\w+)/gm, "**@param** `$1`").replace(/^@return\b/gm, "**@return**")
    .replace(/^@(throws|exception)\s+(\w+)/gm, "**@throws** `$2`")
    .replace(/^@(see|since|author|version|deprecated)\b.*$/gm, (m) => (m.startsWith("@deprecated") ? "**Deprecated**" + m.slice(11) : ""))
    .replace(/\n{3,}/g, "\n\n").trim();
  return s.length > 1200 ? s.slice(0, 1200).trimEnd() + "…" : s;
}

// Remove annotations (with balanced parens) from a header.
function stripAnnotations(h) {
  let out = "", i = 0;
  while (i < h.length) {
    if (h[i] === "@" && /[A-Za-z]/.test(h[i + 1] || "") && !h.startsWith("@interface", i)) {
      i++;
      while (i < h.length && /[\w.]/.test(h[i])) i++;
      while (i < h.length && /\s/.test(h[i])) i++;
      if (h[i] === "(") {
        let d = 0;
        for (; i < h.length; i++) { if (h[i] === "(") d++; else if (h[i] === ")") { d--; if (d === 0) { i++; break; } } }
      }
      continue;
    }
    out += h[i++];
  }
  return out;
}

// Tokenize a source file into "statements" at the member level, tracking nesting.
export function parseJava(src, pkg) {
  const types = [];
  const stack = []; // open type bodies: { t: typeRecord, depth }
  let depth = 0, i = 0, header = "", doc = "", lastDoc = "";
  const n = src.length;

  const skipBlock = () => { // at '{': skip to matching '}' (comments/strings aware)
    let d = 0;
    for (; i < n; i++) {
      const c = src[i];
      if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i + 2) + 1; continue; }
      if (c === '"' || c === "'") { const q = c; i++; while (i < n && src[i] !== q) { if (src[i] === "\\") i++; i++; } continue; }
      if (c === "{") d++;
      else if (c === "}") { d--; if (d === 0) { i++; return; } }
    }
  };

  const handle = (term) => {
    const h = stripAnnotations(header).replace(/\s+/g, " ").trim();
    const d = cleanDoc(doc);
    header = ""; doc = "";
    if (!h) return false;
    const owner = stack[stack.length - 1];
    const tm = h.match(/\b(class|interface|enum|record|@interface)\s+(\w+)/);
    const beforeParen = h.split("(")[0];
    const isType = tm && !beforeParen.includes("=") && (term === "{");
    if (isType) {
      const mods = h.slice(0, tm.index).split(/\s+/).filter(Boolean);
      const isPublic = mods.includes("public") || (owner && owner.t.k === "interface") || (owner && owner.t.k === "@interface");
      const rec = { n: tm[2], p: pkg, k: tm[1] === "@interface" ? "annotation" : tm[1], d, ext: "", m: [], pub: isPublic && (!owner || owner.t.pub), outer: owner ? owner.t.n : "" };
      const ext = h.slice(tm.index + tm[0].length).match(/\bextends\s+([^{]+?)(?:\bimplements\b|\bpermits\b|$)/);
      if (ext) rec.ext = ext[1].trim().replace(/\s+/g, " ");
      const impl = h.match(/\bimplements\s+(.+?)(?:\bpermits\b|$)/);
      if (impl) rec.impl = impl[1].trim();
      if (rec.outer) rec.n = `${owner.t.n}.${rec.n}`;
      types.push(rec);
      stack.push({ t: rec, depth: depth + 1 });
      return "type";
    }
    if (!owner) return false;
    const t = owner.t;
    if (!t.pub) return false;
    const words = h.split(/\s+/);
    const isIface = t.k === "interface";
    const isPublicish = words.includes("public") || words.includes("protected") || isIface;
    if (t.k === "enum" && !owner.constsDone) {
      // enum constants section: up to first top-level ';'
      owner.constsDone = true;
      const body = h.replace(/;$/, "");
      if (!/[(){]/.test(body.split(",")[0]) || body.includes(",") || /^[A-Z_0-9]+$/.test(body.trim())) {
        for (const c of body.split(",")) { const nm = c.trim().match(/^([A-Z_][A-Z_0-9]*)/); if (nm) t.m.push({ n: nm[1], k: "const", s: nm[1], d: "" }); }
        if (term === ";" || body.includes(",") || /^[A-Z_0-9]+$/.test(body.trim())) return "member";
      }
    }
    if (!isPublicish) return false;
    const stat = words.includes("static") || (isIface && /\b=\b/.test(h));
    const isMethod = beforeParen.length < h.length && !beforeParen.includes("=") && h.includes("(");
    const sig = words.filter((w) => !["public", "protected", "abstract", "final", "synchronized", "native", "default", "transient", "volatile"].includes(w) || false).join(" ");
    const clean = h.replace(/\s*(throws\s+[\w.,\s<>]+)?$/, "").replace(/\s*=.*$/, "").trim();
    if (isMethod) {
      const nm = beforeParen.trim().split(/\s+/).pop().replace(/^.*>/, "");
      const isCtor = nm === t.n.split(".").pop() && beforeParen.trim().split(/\s+/).filter((w) => !MODIFIERS.has(w)).length === 1;
      t.m.push({ n: isCtor ? "<init>" : nm, k: isCtor ? "ctor" : "method", s: clean.replace(/\b(public|protected|abstract|final|synchronized|native|default)\s+/g, ""), st: !!stat, d });
    } else if (!tm) {
      const lhs = h.split("=")[0].replace(/;$/, "").trim();
      const nm = lhs.split(/\s+/).pop();
      if (/^\w+$/.test(nm)) t.m.push({ n: nm, k: "field", s: lhs.replace(/\b(public|protected|final)\s+/g, ""), st: !!stat, d });
    }
    void sig;
    return "member";
  };

  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const text = src.slice(i, end + 2);
      if (text.startsWith("/**")) lastDoc = text;
      i = end + 2; continue;
    }
    if (c === '"' || c === "'") {
      const q = c; header += c; i++;
      while (i < n && src[i] !== q) { if (src[i] === "\\") { header += src[i++]; } header += src[i++]; }
      header += q; i++; continue;
    }
    const owner = stack[stack.length - 1];
    const atMemberLevel = depth === 0 || (owner && depth === owner.depth);
    if (c === "{") {
      if (!header.trim() && lastDoc === "") { skipBlock(); continue; }
      if (atMemberLevel) {
        if (!doc && lastDoc) { doc = lastDoc; }
        lastDoc = "";
        const r = handle("{");
        if (r === "type") { depth++; i++; continue; }
        skipBlock(); continue;
      }
      depth++; i++; continue;
    }
    if (c === "}") {
      depth--; i++;
      if (stack.length && depth < stack[stack.length - 1].depth) stack.pop();
      header = ""; lastDoc = ""; continue;
    }
    if (c === ";" || (c === "," && owner && owner.t.k === "enum" && !owner.constsDone)) {
      if (c === ";" && atMemberLevel) {
        if (!doc && lastDoc) doc = lastDoc;
        lastDoc = "";
        if (/^\s*(package|import)\b/.test(header)) { header = ""; doc = ""; i++; continue; }
        handle(";");
      } else if (c === ",") { header += ","; }
      header = c === "," ? header : ""; i++; continue;
    }
    if (header === "" && lastDoc && /\S/.test(c)) { doc = lastDoc; }
    header += c; i++;
  }
  return types.filter((t) => t.pub);
}

function pkgOf(src) {
  const m = src.match(/^\s*package\s+([\w.]+)\s*;/m);
  return m ? m[1] : "";
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function buildLib(name, lib) {
  const classes = new Map();
  for (const url of lib.jars) {
    process.stdout.write(`  ${path.basename(url)} ... `);
    let buf;
    try { buf = await download(url); } catch (e) { console.log("skipped (" + e.message + ")"); continue; }
    const zip = new AdmZip(buf);
    let count = 0;
    for (const e of zip.getEntries()) {
      if (e.isDirectory || !e.entryName.endsWith(".java") || !lib.only.test(e.entryName)) continue;
      const src = e.getData().toString("utf8");
      for (const t of parseJava(src, pkgOf(src))) {
        const key = `${t.p}.${t.n}`;
        if (!classes.has(key)) { delete t.pub; classes.set(key, t); count++; }
      }
    }
    console.log(`${count} types`);
  }
  const list = [...classes.values()].sort((a, b) => (a.p + a.n).localeCompare(b.p + b.n));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ label: lib.label, classes: list }));
  const kb = (fs.statSync(path.join(OUT, `${name}.json`)).size / 1024).toFixed(0);
  console.log(`${name}: ${list.length} types, ${kb} KB`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const only = process.argv[2];
  for (const [name, lib] of Object.entries(LIBS)) {
    if (only && only !== name) continue;
    console.log(name);
    await buildLib(name, lib);
  }
}
