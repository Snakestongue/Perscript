// Web Worker: runs tree-sitter + the Java engine off the main thread.
import Parser from "web-tree-sitter";
import runtimeWasm from "web-tree-sitter/tree-sitter.wasm?url";
import javaWasm from "tree-sitter-wasms/out/tree-sitter-java.wasm?url";
import { createEngine } from "./javaEngine.js";

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
    const e = await ensureLibs(libs);
    let result = null;
    if (type === "complete") result = e.complete(src, offset);
    else if (type === "signature") result = e.signatureHelp(src, offset);
    else if (type === "hover") result = e.hover(src, offset);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: String(error && error.message ? error.message : error) });
  }
};
