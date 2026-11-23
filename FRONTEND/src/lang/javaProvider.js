// Registers Java completion, hover and signature help on a Monaco instance.
// Heavy work happens in a Web Worker; stale results are dropped by request id.

let registered = false;
let worker = null;
let nextId = 1;
const pending = new Map();
let enabledLibs = ["wpilib", "ctre"];

export function setJavaLibraries(libs) { enabledLibs = libs; }

function call(type, payload) {
  if (!worker) {
    worker = new Worker(new URL("./javaWorker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }) => {
      const p = pending.get(data.id);
      if (!p) return;
      pending.delete(data.id);
      data.error ? p.reject(new Error(data.error)) : p.resolve(data.result);
    };
    worker.onerror = (e) => console.warn("Java language worker error", e.message);
  }
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
  if (registered) return;
  registered = true;
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
            parameters: s.params.map((p) => ({ label: `${p.type} ${p.name}` })),
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
