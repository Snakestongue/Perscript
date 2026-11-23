// Web Worker: runs the language engines (Java via tree-sitter, Python via text analysis) off the
// main thread. One shared worker serves every language; messages carry a `lang`.
import Parser from "web-tree-sitter";
import runtimeWasm from "web-tree-sitter/tree-sitter.wasm?url";
import javaWasm from "tree-sitter-wasms/out/tree-sitter-java.wasm?url";
import { createEngine } from "./javaEngine.js";
import { createPythonEngine } from "./pythonEngine.js";
import { createCppEngine } from "./cppEngine.js";

const INDEXES = {
  java: {
    wpilib: () => import("../api/wpilib.json"),
    ctre: () => import("../api/ctre.json"),
  },
  python: {
    "py-wpilib": () => import("../api/py-wpilib.json"),
    "py-ctre": () => import("../api/py-ctre.json"),
    "py-rev": () => import("../api/py-rev.json"),
  },
  cpp: {
    "cpp-wpilib": () => import("../api/cpp-wpilib.json"),
    "cpp-ctre": () => import("../api/cpp-ctre.json"),
    "cpp-rev": () => import("../api/cpp-rev.json"),
  },
};
const DEFAULT_LIBS = { java: ["wpilib", "ctre"], python: ["py-wpilib", "py-ctre", "py-rev"], cpp: ["cpp-wpilib", "cpp-ctre", "cpp-rev"] };
const WARM = { java: "class W extends SubsystemBase { void f() { PIDC", python: "import wpilib\nwpilib.PWM", cpp: "#include <frc/controller/PIDController.h>\nfrc::PIDC" };

const engines = {};
const loaded = { java: new Set(), python: new Set(), cpp: new Set() };

async function boot(lang) {
  if (engines[lang]) return engines[lang];
  if (lang === "python") return (engines.python = createPythonEngine());
  if (lang === "cpp") return (engines.cpp = createCppEngine());
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
  return (engines.java = createEngine(parser));
}

async function ensureLibs(lang, libs) {
  const e = await boot(lang);
  for (const name of libs) {
    if (loaded[lang].has(name) || !INDEXES[lang][name]) continue;
    loaded[lang].add(name);
    const mod = await INDEXES[lang][name]();
    e.loadIndex(mod.default || mod, name);
  }
  return e;
}

self.onmessage = async ({ data }) => {
  const { id, type, src, offset, lang = "java" } = data;
  const libs = data.libs && lang === "java" ? data.libs : DEFAULT_LIBS[lang];
  try {
    if (type === "ping") { self.postMessage({ id, result: "pong" }); return; }
    if (!INDEXES[lang]) { self.postMessage({ id, result: null }); return; }
    const e = await ensureLibs(lang, libs);
    let result = null;
    if (type === "warm") {
      // Run one tiny completion so parser and index code paths are hot before the user types.
      e.complete(WARM[lang], WARM[lang].length);
      result = "ready";
    } else if (type === "complete") result = e.complete(src, offset);
    else if (type === "signature") result = e.signatureHelp(src, offset);
    else if (type === "hover") result = e.hover(src, offset);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: String(error && error.message ? error.message : error) });
  }
};
