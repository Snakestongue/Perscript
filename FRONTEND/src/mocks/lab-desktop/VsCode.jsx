// A mini Visual Studio Code: file explorer, tabs, the site's Monaco editor (with the Java
// autocomplete, hover docs and syntax checks) and a read-only output panel. Like the real WPILib
// extension, build and deploy start from an icon at the top right of the editor, not by typing.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { registerJavaIntelliSense, attachJavaHelpers } from "../../lang/javaProvider.js";
import { attachLint } from "../../codeLint.js";
import { planCommand } from "./gradle.js";

const KIND_CLASS = { out: "text-[#cccccc]", dim: "text-[#8b8b8b]", err: "text-[#f14c4c]", ok: "text-[#23d18b]", cmd: "text-[#e5e5e5]" };
const COMMANDS = { build: "./gradlew build", deploy: "./gradlew deploy" };

const langOf = (path) => (path.endsWith(".java") ? "java" : path.endsWith(".json") || path.endsWith(".path") || path.endsWith(".auto") ? "json" : path.endsWith(".md") ? "markdown" : path.endsWith(".gradle") ? "java" : "plaintext");

function buildTree(paths) {
  const root = { name: "", path: "", children: [] };
  for (const p of paths.slice().sort()) {
    const parts = p.split("/");
    let node = root;
    parts.forEach((part, i) => {
      const path = parts.slice(0, i + 1).join("/");
      let child = node.children.find((c) => c.name === part);
      if (!child) { child = { name: part, path, children: i < parts.length - 1 ? [] : null }; node.children.push(child); }
      node = child;
    });
  }
  const order = (n) => { if (n.children) { n.children.sort((a, b) => (!!b.children - !!a.children) || a.name.localeCompare(b.name)); n.children.forEach(order); } };
  order(root);
  return root.children;
}

// A stand-in for the WPILib extension icon (not the real logo).
function WpiIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5 21.2 6.8v10.4L12 22.5 2.8 17.2V6.8z" fill="#c8102e" />
      <path d="m7 8 1.7 8 3.3-5.2 3.3 5.2L17 8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tree({ nodes, depth, open, toggle, active, onOpen, editable, lessonFile }) {
  return nodes.map((n) => (
    <div key={n.path}>
      <button
        type="button"
        onClick={() => (n.children ? toggle(n.path) : onOpen(n.path))}
        className={`flex w-full items-center gap-1 truncate py-[2px] text-left text-[13px] hover:bg-[#2a2d2e] ${active === n.path ? "bg-[#37373d] text-white" : "text-[#cccccc]"}`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <span className="w-3 text-[10px] text-[#8b8b8b]">{n.children ? (open.has(n.path) ? "▾" : "▸") : ""}</span>
        <span className="truncate">{n.name}</span>
        {!n.children && n.path === lessonFile && <span className="ml-auto mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#23d18b]" title="This lesson's file" />}
        {!n.children && !editable(n.path) && <span className="ml-auto mr-2 shrink-0 text-[10px] text-[#6b6b6b]" title="Read-only in this lesson">🔒</span>}
      </button>
      {n.children && open.has(n.path) && <Tree nodes={n.children} depth={depth + 1} open={open} toggle={toggle} active={active} onOpen={onOpen} editable={editable} lessonFile={lessonFile} />}
    </div>
  ));
}

function OutputPanel({ lines, busy }) {
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [lines]);
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1e1e1e] font-mono text-[12px]">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#2b2b2b] px-3 py-1 text-[11px] uppercase tracking-wide text-[#8b8b8b]">
        <span className="border-b border-[#e5e5e5] pb-[2px] text-[#e5e5e5]">Terminal</span>
        {busy && <span className="normal-case text-[#cca700]">● Running…</span>}
      </div>
      <div className="min-h-0 flex-1 select-text overflow-auto px-3 py-1" aria-label="Terminal output" role="log">
        {lines.map((l, i) => <div key={i} className={`whitespace-pre-wrap ${KIND_CLASS[l.kind] || KIND_CLASS.out}`}>{l.text || " "}</div>)}
        <div ref={bottom} />
      </div>
    </div>
  );
}

export default function VsCode({ files, setFile, resetProject, onDeploy, onResult, onOpenFile, onCursor, editable = () => true, lessonFile = null, deployEnabled = true, deployBlockedReason = "", scale = 1 }) {
  const paths = useMemo(() => Object.keys(files), [files]);
  const tree = useMemo(() => buildTree(paths), [paths]);
  const first = lessonFile ?? paths[0];
  const [open, setOpen] = useState(() => new Set(["src", "src/main", "src/main/java", "src/main/java/frc", "src/main/java/frc/robot", "src/main/java/frc/robot/subsystems"]));
  const [tabs, setTabs] = useState([first]);
  const [active, setActive] = useState(first);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [menu, setMenu] = useState(false);
  const [lines, setLines] = useState([{ text: "Click the WPILib icon (top right of the editor) to build or deploy your robot code.", kind: "dim" }]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const timers = useRef([]);
  const noticeTimer = useRef(null);
  const rootRef = useRef(null);
  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);

  const say = useCallback((msg) => { setNotice(msg); clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(""), 3500); }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(noticeTimer.current); }, []);
  useEffect(() => { onOpenFile?.(active); }, [active, onOpenFile]);
  useEffect(() => { onCursor?.(active, cursor.line); }, [active, cursor.line, onCursor]);

  const toggle = (p) => setOpen((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const openFile = (p) => { setTabs((t) => (t.includes(p) ? t : [...t, p])); setActive(p); };
  const closeTab = (p) => {
    if (p === lessonFile) { say("Keep this file open: it is the one for this lesson."); return; }
    setTabs((t) => {
      const next = t.filter((x) => x !== p);
      if (active === p) setActive(next[next.length - 1] ?? lessonFile ?? null);
      return next;
    });
  };

  const run = useCallback((kind) => {
    if (busy) return;
    if (kind === "deploy" && !deployEnabled) { say(deployBlockedReason || "Finish the earlier steps before deploying."); return; }
    const command = COMMANDS[kind];
    const plan = planCommand(command, filesRef.current);
    setBusy(true);
    setLines([{ text: ` *  Executing task: ${command}`, kind: "cmd" }, { text: "", kind: "out" }]);
    let t = 0;
    plan.steps.forEach((s) => {
      t += s.ms;
      timers.current.push(setTimeout(() => setLines((l) => [...l, { text: s.text, kind: s.kind }]), t));
    });
    timers.current.push(setTimeout(() => {
      setBusy(false);
      if (plan.result) onResult?.(plan.result);
      if (plan.result?.type === "deploy" && plan.result.ok) onDeploy(plan.result);
    }, t + 50));
  }, [busy, deployEnabled, deployBlockedReason, onDeploy, onResult, say]);

  const onKeyDown = (e) => {
    if (e.shiftKey && e.key === "F5") { e.preventDefault(); run("deploy"); }
    if (e.key === "Escape") setMenu(false);
  };

  const canEdit = active ? editable(active) : false;
  const z = { zoom: scale };

  return (
    <div ref={rootRef} className="relative flex h-full min-h-0 flex-col bg-[#1e1e1e] text-[#cccccc]" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }} onKeyDown={onKeyDown} tabIndex={-1}>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-48 shrink-0 flex-col border-r border-[#2b2b2b] bg-[#252526]" style={z}>
          <div className="flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wide text-[#bbbbbb]">
            <span>Explorer</span>
            <button type="button" className="rounded px-1 text-[10px] normal-case text-[#8b8b8b] hover:bg-[#37373d] hover:text-white" onClick={resetProject} title="Restore the starting files">Reset</button>
          </div>
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase text-[#bbbbbb]">robot</div>
          <div className="min-h-0 flex-1 overflow-auto pb-2"><Tree nodes={tree} depth={0} open={open} toggle={toggle} active={active} onOpen={openFile} editable={editable} lessonFile={lessonFile} /></div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-stretch bg-[#252526]" style={z}>
            <div className="flex min-w-0 flex-1 overflow-x-auto" role="tablist">
              {tabs.map((p) => (
                <div key={p} role="tab" aria-selected={p === active} className={`group flex shrink-0 items-center gap-2 border-r border-[#2b2b2b] px-3 py-1.5 text-[12px] ${p === active ? "bg-[#1e1e1e] text-white" : "bg-[#2d2d2d] text-[#9d9d9d]"}`}>
                  <button type="button" onClick={() => setActive(p)}>{p.split("/").pop()}{!editable(p) ? " 🔒" : ""}</button>
                  <button type="button" aria-label={`Close ${p.split("/").pop()}`} className="rounded px-1 text-[#8b8b8b] hover:bg-[#444] hover:text-white" onClick={() => closeTab(p)}>×</button>
                </div>
              ))}
            </div>
            <div className="relative flex shrink-0 items-center px-2">
              <button type="button" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="WPILib commands" title="WPILib commands (Shift+F5 deploys)" className={`grid h-7 w-7 place-items-center rounded hover:bg-[#37373d] ${menu ? "bg-[#37373d]" : ""}`}><WpiIcon /></button>
              {menu && (
                <div role="menu" className="absolute right-1 top-full z-20 mt-1 w-64 overflow-hidden rounded border border-[#454545] bg-[#252526] py-1 text-[12px] shadow-xl">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-[#8b8b8b]">WPILib</div>
                  <button role="menuitem" type="button" disabled={busy} className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#04395e] disabled:opacity-50" onClick={() => { setMenu(false); run("build"); }}><span>Build Robot Code</span></button>
                  <button role="menuitem" type="button" disabled={busy} className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#04395e] disabled:opacity-50 ${deployEnabled ? "" : "text-[#6b6b6b]"}`} onClick={() => { setMenu(false); run("deploy"); }}><span>Deploy Robot Code</span><span className="text-[10px] text-[#8b8b8b]">⇧F5</span></button>
                  <button role="menuitem" type="button" disabled className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[#6b6b6b]"><span>Simulate Robot Code</span><span className="text-[10px]">not here</span></button>
                </div>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1">
            {active ? (
              <Editor
                height="100%"
                theme="vs-dark"
                path={active}
                language={langOf(active)}
                value={files[active]}
                onChange={(v) => { if (canEdit) setFile(active, v ?? ""); }}
                onMount={(editor, monaco) => {
                  registerJavaIntelliSense(monaco);
                  attachJavaHelpers(editor);
                  attachLint(monaco, editor);
                  editor.onDidChangeCursorPosition((e) => setCursor({ line: e.position.lineNumber, col: e.position.column }));
                  editor.onDidAttemptReadOnlyEdit(() => say("This file is read-only in this lesson. Work in the file marked with the green dot."));
                }}
                options={{ readOnly: !canEdit, readOnlyMessage: { value: "Read-only in this lesson." }, minimap: { enabled: false }, fontSize: Math.round(13 * scale), automaticLayout: true, fixedOverflowWidgets: true, scrollBeyondLastLine: false, parameterHints: { enabled: true, cycle: true }, hover: { enabled: true, delay: 250, sticky: true }, suggest: { showStatusBar: true } }}
              />
            ) : (
              <div className="grid h-full place-content-center text-sm text-[#8b8b8b]">Open a file from the explorer</div>
            )}
          </div>
          <div className="h-[34%] min-h-[7rem] shrink-0 border-t border-[#2b2b2b]" style={z}><OutputPanel lines={lines} busy={busy} /></div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between bg-[#007acc] px-3 py-0.5 text-[11px] text-white" style={z}>
        <span>⎇ main</span>
        <span>{active ? `${canEdit ? "" : "Read-only   "}Ln ${cursor.line}, Col ${cursor.col}   ${langOf(active) === "java" ? "Java" : langOf(active)}` : ""}</span>
      </div>
      {notice && <div role="status" className="pointer-events-none absolute bottom-12 left-1/2 z-30 max-w-[85%] -translate-x-1/2 rounded bg-[#3c3c3c] px-3 py-1.5 text-center text-[12px] text-white shadow-lg">{notice}</div>}
    </div>
  );
}
