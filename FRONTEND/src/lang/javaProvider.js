// Registers Java completion, hover and signature help on a Monaco instance.
// Heavy work happens in a Web Worker; stale results are dropped by request id.

const registeredOn = new WeakSet(); // Monaco instances that already have our providers
let worker = null;
let nextId = 1;
const pending = new Map();
let enabledLibs = ["wpilib", "ctre"];

export function setJavaLibraries(libs) { enabledLibs = libs; }

// --- worker lifecycle: one shared worker, started at site load and kept healthy ---------
const PING_EVERY = 30000, PING_TIMEOUT = 8000, MAX_RESTARTS = 5;
let restarts = 0, heartbeat = null, status = "idle"; // idle | loading | ready | failed
let readyPromise = null;

export function getJavaEngineStatus() { return status; }

function failAll(reason) {
  for (const p of pending.values()) p.reject(new Error(reason));
  pending.clear();
}

function spawn() {
  worker = new Worker(new URL("./javaWorker.js", import.meta.url), { type: "module" });
  worker.onmessage = ({ data }) => {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    data.error ? p.reject(new Error(data.error)) : p.resolve(data.result);
  };
  const crashed = (why) => { console.warn("Java language worker stopped:", why); restart(); };
  worker.onerror = (e) => crashed(e.message);
  worker.onmessageerror = () => crashed("message error");
  clearInterval(heartbeat);
  heartbeat = setInterval(() => {
    if (document.hidden) return;
    const timer = setTimeout(() => crashed("heartbeat timeout"), PING_TIMEOUT);
    call("ping", {}).then(() => clearTimeout(timer), () => clearTimeout(timer));
  }, PING_EVERY);
}

function restart() {
  clearInterval(heartbeat);
  if (worker) { worker.terminate(); worker = null; }
  failAll("Java language worker restarted");
  readyPromise = null;
  if (restarts >= MAX_RESTARTS) { status = "failed"; return; }
  restarts++;
  status = "loading";
  setTimeout(() => startJavaEngine(), Math.min(1000 * 2 ** restarts, 15000));
}

// Starts (once) the shared worker and loads the parser + indexes in the background.
export function startJavaEngine() {
  if (readyPromise) return readyPromise;
  status = "loading";
  if (!worker) spawn();
  readyPromise = call("warm", {}).then(
    () => { status = "ready"; restarts = 0; return true; },
    () => { readyPromise = null; return false; }
  );
  return readyPromise;
}

function call(type, payload) {
  if (!worker) spawn();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, type, libs: enabledLibs, ...payload });
  });
}

function importEdit(model, fqn) {
  const text = model.getValue();
  const importRe = /^\s*import\s[^;]+;[ \t]*$/gm;
  let line = 0, m;
  while ((m = importRe.exec(text))) line = text.slice(0, m.index + m[0].length).split("\n").length;
  if (!line) { const pkg = text.match(/^\s*package\s[^;]+;/m); if (pkg) line = text.slice(0, pkg.index + pkg[0].length).split("\n").length; }
  const prefix = line ? "" : "";
  return {
    range: { startLineNumber: line + 1, startColumn: 1, endLineNumber: line + 1, endColumn: 1 },
    text: `${prefix}import ${fqn};\n`,
  };
}

export function registerJavaIntelliSense(monaco) {
  if (!monaco || registeredOn.has(monaco)) return;
  registeredOn.add(monaco);
  startJavaEngine();
  if (typeof window !== "undefined") window.__javaProviderInstances = (window.__javaProviderInstances || 0) + 1;
  const K = monaco.languages.CompletionItemKind;
  const kinds = { Class: K.Class, Interface: K.Interface, Enum: K.Enum, Method: K.Method, Field: K.Field, EnumMember: K.EnumMember, Constructor: K.Constructor, Variable: K.Variable };

  monaco.languages.registerCompletionItemProvider("java", {
    triggerCharacters: ["."],
    async provideCompletionItems(model, position) {
      const src = model.getValue();
      const offset = model.getOffsetAt(position);
      let r;
      try { r = await call("complete", { src, offset }); } catch { return { suggestions: [] }; }
      if (!r || !r.items.length) return { suggestions: [] };
      const start = model.getPositionAt(r.start);
      const range = { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: position.lineNumber, endColumn: position.column };
      return {
        suggestions: r.items.map((it, i) => ({
          label: it.importFqn ? { label: it.label, description: it.detail } : { label: it.label, detail: "", description: it.detail },
          kind: kinds[it.kind] ?? K.Text,
          insertText: it.insert,
          insertTextRules: it.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          documentation: it.doc ? { value: it.doc } : undefined,
          detail: it.detail,
          range,
          sortText: String(i).padStart(4, "0"),
          filterText: it.label,
          additionalTextEdits: it.importFqn ? [importEdit(model, it.importFqn)] : undefined,
        })),
      };
    },
  });

  monaco.languages.registerSignatureHelpProvider("java", {
    signatureHelpTriggerCharacters: ["(", ","],
    async provideSignatureHelp(model, position) {
      let r;
      try { r = await call("signature", { src: model.getValue(), offset: model.getOffsetAt(position) }); } catch { return null; }
      if (!r) return null;
      return {
        value: {
          activeSignature: r.active,
          activeParameter: r.argIndex,
          signatures: r.signatures.map((s) => ({
            label: s.label,
            documentation: s.doc ? { value: s.doc } : undefined,
            parameters: s.params.map((p) => ({ label: `${p.type} ${p.name}`, documentation: s.paramDocs?.[p.name] ? { value: s.paramDocs[p.name] } : undefined })),
          })),
        },
        dispose() {},
      };
    },
  });

  monaco.languages.registerHoverProvider("java", {
    async provideHover(model, position) {
      let r;
      try { r = await call("hover", { src: model.getValue(), offset: model.getOffsetAt(position) }); } catch { return null; }
      if (!r) return null;
      const a = model.getPositionAt(r.start), b = model.getPositionAt(r.end);
      return {
        range: { startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column },
        contents: [{ value: r.title }, ...(r.doc ? [{ value: r.doc }] : []), ...(r.owner ? [{ value: `*${r.owner}*` }] : [])],
      };
    },
  });
}

// True when the cursor is inside the parentheses of a call (cheap text scan, main thread).
function insideCall(src, offset) {
  let depth = 0;
  for (let i = offset - 1; i >= 0; i--) {
    const ch = src[i];
    if (ch === ")" || ch === "]" || ch === "}") depth++;
    else if (ch === "(" || ch === "[" || ch === "{") { if (depth === 0) return ch === "(" && /[\w$>]\s*$/.test(src.slice(Math.max(0, i - 80), i)); depth--; }
    else if (ch === ";" && depth === 0) return false;
  }
  return false;
}

// Show the parameter tooltip whenever the cursor is inside a call, including when it is
// moved there with the arrow keys or the mouse (Monaco only auto-triggers on typing).
export function attachJavaHelpers(editor) {
  let timer;
  editor.onDidChangeCursorPosition((e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const model = editor.getModel();
      if (!model || model.getLanguageId() !== "java" || !editor.hasTextFocus()) return;
      if (e.reason === 0 /* NotSet: typing is handled by trigger characters */) return;
      if (insideCall(model.getValue(), model.getOffsetAt(editor.getPosition()))) editor.trigger("java-helpers", "editor.action.triggerParameterHints", {});
    }, 150);
  });
}
