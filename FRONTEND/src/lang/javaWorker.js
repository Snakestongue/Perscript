// Web Worker: runs tree-sitter + the Java engine off the main thread.
import Parser from "web-tree-sitter";
import runtimeWasm from "../../node_modules/web-tree-sitter/tree-sitter.wasm?url";
import javaWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-java.wasm?url";
import pythonWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-python.wasm?url";
import cppWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-cpp.wasm?url";
import { createEngine } from "./javaEngine.js";
import { diagnosePython } from "./pyCheck.js";
import { diagnoseCpp } from "./cppCheck.js";

const INDEXES = {
  wpilib: () => import("../api/wpilib.json"),
  ctre: () => import("../api/ctre.json"),
};

let engine = null;
const loaded = new Set();

async function boot() {
  if (engine) return engine;
  let parser = null;
  try {
    await Parser.init({ locateFile: () => runtimeWasm });
    const Java = await Parser.Language.load(javaWasm);
    parser = new Parser();
    parser.setLanguage(Java);
  } catch (err) {
    // Without a parser the engine still works through its text-based fallbacks.
    console.warn("tree-sitter unavailable, using text fallback", err);
  }
  engine = createEngine(parser);
  return engine;
}

// Python and C++ checkers use their own tree-sitter grammar, loaded the first time that language is checked.
const otherParsers = {};
async function parserFor(lang, wasm) {
  if (!otherParsers[lang]) {
    otherParsers[lang] = (async () => {
      await Parser.init({ locateFile: () => runtimeWasm });
      const L = await Parser.Language.load(wasm);
      const p = new Parser();
      p.setLanguage(L);
      return (s) => p.parse(s);
    })();
  }
  return otherParsers[lang];
}

async function ensureLibs(libs) {
  const e = await boot();
  for (const name of libs) {
    if (loaded.has(name) || !INDEXES[name]) continue;
    loaded.add(name);
    const mod = await INDEXES[name]();
    e.loadIndex(mod.default || mod, name);
  }
  return e;
}

self.onmessage = async ({ data }) => {
  const { id, type, src, offset, libs = ["wpilib", "ctre"] } = data;
  try {
    if (type === "ping") { self.postMessage({ id, result: "pong" }); return; }
    if (type === "diagnose" && data.lang === "python") { self.postMessage({ id, result: diagnosePython(await parserFor("python", pythonWasm), src) }); return; }
    if (type === "diagnose" && data.lang === "cpp") { self.postMessage({ id, result: diagnoseCpp(await parserFor("cpp", cppWasm), src) }); return; }
    const e = await ensureLibs(libs);
    let result = null;
    if (type === "warm") {
      // Run one tiny completion so parser and index code paths are hot before the user types.
      const warm = "class W extends SubsystemBase { void f() { PIDC";
      e.complete(warm, warm.length);
      result = "ready";
    } else if (type === "complete") result = e.complete(src, offset);
    else if (type === "signature") result = e.signatureHelp(src, offset);
    else if (type === "hover") result = e.hover(src, offset);
    else if (type === "diagnose") result = e.diagnose(src, { extraTypes: new Set(data.extraTypes || []) });
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: String(error && error.message ? error.message : error) });
  }
};
