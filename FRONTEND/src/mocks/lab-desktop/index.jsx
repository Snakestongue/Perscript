// A mini desktop for the practice site: windows that stay inside the screen, snap to the edges and
// can be tiled, a UI scale control, a taskbar, a pretend Visual Studio Code (with the site's Monaco
// and a fake ./gradlew deploy) and the Elastic dashboard.
//
// Lesson mode (default) keeps students on task: only the lesson's file is editable, apps unlock as
// steps are finished, and windows cannot be closed. "Free play" removes those limits.
// Deploying "sends" the code to a simulated robot: what the code publishes to SmartDashboard is
// handed to the dashboard through sessionStorage + a BroadcastChannel ("lab-robot").
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import VsCode from "./VsCode.jsx";
import { AUTO_FILE, LESSON_FILE, LESSONS, TOPIC, currentStep, lessonState } from "./lesson.js";
import { findAutoRefs, findRegisteredCommands, planAuto, describeProject } from "./autoPlan.js";
import DriverStation from "./DriverStation.jsx";

const BASE = import.meta.env.BASE_URL;
const raw = import.meta.glob("./project/**/*", { query: "?raw", import: "default", eager: true });
const INITIAL_FILES = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.replace("./project/", ""), v]));
const FILES_KEY = "labDesktopFiles";
const DEPLOY_KEY = "labRobotDeploy";
const SCALE_KEY = "labDesktopScale";

const TASKBAR = 40;
const SNAP_EDGE = 14;
const MIN = { code: { w: 420, h: 300 }, elastic: { w: 340, h: 260 }, pathplanner: { w: 380, h: 280 }, ds: { w: 260, h: 200 } };
const SCALES = [0.8, 0.9, 1, 1.1, 1.25, 1.4];

const APPS = [
  { id: "code", title: "Visual Studio Code", icon: "🧩", color: "#007acc" },
  { id: "elastic", title: "Elastic", icon: "📊", color: "#2f6fed", src: `${BASE}elastic/index.html?lab=1` },
  { id: "pathplanner", title: "PathPlanner", icon: "🛣️", color: "#e8a33d", src: `${BASE}pathplanner/index.html` },
  { id: "ds", title: "Driver Station", icon: "🎮", color: "#3fb950" },
];

const load = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } };

function loadFiles() {
  const saved = load(FILES_KEY, {});
  return { ...INITIAL_FILES, ...Object.fromEntries(Object.entries(saved).filter(([k]) => k in INITIAL_FILES)) };
}

// Keep a window fully inside the usable area and within its size limits.
function clampWin(id, win, W, H) {
  const usableH = Math.max(160, H - TASKBAR);
  const w = Math.min(Math.max(win.w, MIN[id].w), Math.max(W, 200));
  const h = Math.min(Math.max(win.h, MIN[id].h), usableH);
  return { ...win, w, h, x: Math.min(Math.max(win.x, 0), Math.max(0, W - w)), y: Math.min(Math.max(win.y, 0), Math.max(0, usableH - h)) };
}

const ELEVATOR = "src/main/java/frc/robot/subsystems/Elevator.java";

// Window layout a lesson starts with (the desktop tiles it once it knows its size).
function freshWins(id) {
  const open = (apps) => Object.fromEntries(["code", "elastic", "pathplanner", "ds"].map((a, i) => [a, { open: apps.includes(a), min: false, max: false, x: 8 + i * 24, y: 8 + i * 24, w: 560, h: 380, z: 11 - i }]));
  return open(id === "l2" ? ["code", "elastic", "pathplanner", "ds"] : ["code"]);
}

// Project files a lesson starts with. Lesson 2 begins with lesson 1's elevator line already written.
function startFiles(id) {
  const f = { ...INITIAL_FILES };
  if (id === "l2" && f[ELEVATOR]) f[ELEVATOR] = f[ELEVATOR].replace(/ *\/\/ TODO: publish the height.*/, '    SmartDashboard.putNumber("Elevator Height", getHeightMeters());');
  return f;
}

// The apps keep their own state (Elastic's layout lives in this origin's storage), so a reset clears it.
function wipeAppStorage() {
  try { sessionStorage.removeItem(DEPLOY_KEY); sessionStorage.removeItem("labFs"); } catch { /* ignore */ }
  try { Object.keys(localStorage).filter((k) => k.startsWith("flutter.")).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
}

// Elastic keeps its layout and settings in this origin's storage as `flutter.*` keys.
function readElasticStorage() {
  const out = {};
  try { Object.keys(localStorage).filter((k) => k.startsWith("flutter.")).forEach((k) => { out[k] = localStorage.getItem(k); }); } catch { /* ignore */ }
  return out;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(t); }, []);
  return <span>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>;
}

function Guide({ lessons, lessonId, setLessonId, unlocked, steps, state, current, freePlay, toggleFreePlay, placed, picked, onFullscreen, onResetLesson, onResetLab }) {
  const [hintFor, setHintFor] = useState(null); // the step whose hint is showing
  const showHint = hintFor === current;
  const step = steps[current];
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-zinc-700 bg-zinc-900/70 p-3 text-sm max-md:w-56" aria-label="Lesson guide">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">Robot Lab</p>
        <div className="mt-1 flex flex-col gap-1" role="tablist" aria-label="Lessons">
          {lessons.map((l, i) => {
            const open = i === 0 || unlocked;
            return (
              <button key={l.id} type="button" role="tab" aria-selected={l.id === lessonId} disabled={!open} title={open ? l.title : "Finish lesson 1 first"} onClick={() => setLessonId(l.id)} className={`rounded px-2 py-1 text-left text-xs ${l.id === lessonId ? "bg-[#7AADFF]/20 text-white" : "text-slate-400 hover:bg-zinc-800"} disabled:opacity-40`}>{open ? "" : "🔒 "}{l.title}</button>
            );
          })}
        </div>
      </div>
      <ol className="flex flex-col gap-1 text-xs">
        {steps.map((s, i) => {
          const done = s.done(state);
          return (
            <li key={s.id} className={`flex items-center gap-2 rounded border px-2 py-1 ${done ? "border-green-700 bg-green-900/30 text-green-300" : i === current ? "border-[#7AADFF] bg-[#7AADFF]/15 text-white" : "border-zinc-700 text-zinc-500"}`} aria-current={i === current ? "step" : undefined}>
              <span aria-hidden="true" className="w-3 text-center">{done ? "✓" : i + 1}</span>{s.title}
            </li>
          );
        })}
      </ol>
      {freePlay ? (
        <p className="text-slate-300">Free play: everything is unlocked. Edit any file, open every app, and experiment.</p>
      ) : step ? (
        <div>
          <p className="text-slate-100"><span className="font-semibold text-[#7AADFF]">Step {current + 1}:</span> {step.body}</p>
          <button type="button" className="mt-1 text-xs text-slate-400 underline hover:text-slate-200" onClick={() => setHintFor(showHint ? null : current)}>{showHint ? "Hide hint" : "Need a hint?"}</button>
          {step.id === "dashboard" && <p className="mt-1 text-xs text-slate-400">Waiting for Elastic to report the tile…</p>}
          {showHint && <p className="mt-1 whitespace-pre-wrap rounded bg-black/40 px-2 py-1 font-mono text-xs text-slate-200">{step.hint}</p>}
          {picked && <p className="mt-1 text-xs text-slate-400">Elastic reports the Auto Chooser is set to “{picked}”.</p>}
        </div>
      ) : (
        <p className="font-semibold text-green-300">{lessonId === "l1" ? `Lesson complete. Elastic reported “${placed?.title || "Elevator Height"}” placed on the ${placed?.tab || "dashboard"} tab as a ${placed?.type || "widget"}. Lesson 2 is next.` : "Lesson complete. Your auto drove the path and the robot ran runIntake when the auto reached it. Try Free play to keep experimenting."}</p>
      )}
      <div className="mt-auto flex flex-col gap-1">
        <button type="button" onClick={toggleFreePlay} className="rounded border border-zinc-600 px-2 py-1 text-xs text-slate-300 hover:bg-zinc-800">{freePlay ? "Back to the lesson" : "Free play"}</button>
        <button type="button" onClick={onResetLesson} className="rounded border border-zinc-600 px-2 py-1 text-xs text-slate-300 hover:bg-zinc-800">Reset lesson</button>
        <button type="button" onClick={onResetLab} className="rounded border border-zinc-600 px-2 py-1 text-xs text-slate-300 hover:bg-zinc-800">Reset lab</button>
        <Link to="/program/desktop" className="rounded border border-zinc-600 px-2 py-1 text-center text-xs text-slate-300 hover:bg-zinc-800">Exit Robot Lab</Link>
        <button type="button" onClick={onFullscreen} className="rounded border border-zinc-600 px-2 py-1 text-xs text-slate-300 hover:bg-zinc-800">Full screen</button>
      </div>
    </aside>
  );
}

export default function LabDesktop() {
  const stage = useRef(null);
  const zTop = useRef(10);
  const [size, setSize] = useState({ w: 900, h: 560 });
  const [files, setFiles] = useState(loadFiles);
  const [deploy, setDeploy] = useState(() => { try { return JSON.parse(sessionStorage.getItem(DEPLOY_KEY) || "null"); } catch { return null; } });
  const [scale, setScale] = useState(() => (SCALES.includes(load(SCALE_KEY, 1)) ? load(SCALE_KEY, 1) : 1));
  const [freePlay, setFreePlay] = useState(false);
  const [widgets, setWidgets] = useState([]); // tiles Elastic reports on its grid
  const [picked, setPicked] = useState(null); // the auto chosen in Elastic's chooser
  const [lessonId, setLessonId] = useState("l1");
  const [project, setProject] = useState({ autos: {}, paths: {} }); // what PathPlanner holds
  const [commandRuns, setCommandRuns] = useState([]);
  const [log, setLog] = useState([]); // robot console lines
  const [dsState, setDsState] = useState({ mode: "teleop", enabled: false });
  const [openedLessonFile, setOpened] = useState(false);
  const [todoVisited, setTodoVisited] = useState(false);
  const [drag, setDrag] = useState(false);
  const [snap, setSnap] = useState(null);
  const [toast, setToast] = useState("");
  const [wins, setWins] = useState(() => freshWins("l1"));
  const [epoch, setEpoch] = useState(0); // bumps to reload the app iframes
  const snapshots = useRef({}); // per-lesson progress kept while you look at another lesson
  const sizeRef = useRef(size);
  useEffect(() => { sizeRef.current = size; }, [size]);
  const filesRef = useRef(files);
  const projectRef = useRef(project);
  const lessonRef = useRef("l1");
  useEffect(() => { filesRef.current = files; projectRef.current = project; lessonRef.current = lessonId; }, [files, project, lessonId]);

  const lessonMode = !freePlay;
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const lessonFile = lessonId === "l1" ? LESSON_FILE : AUTO_FILE;
  const state = useMemo(() => lessonState({ files, deploy, openedLessonFile, todoVisited, widgets, project, commandRuns }), [files, deploy, openedLessonFile, todoVisited, widgets, project, commandRuns]);
  const current = currentStep(state, lesson.steps);
  const elasticUnlocked = freePlay || lessonId === "l2" || current >= 3;
  const deployEnabled = freePlay || current >= (lessonId === "l1" ? 2 : 4);
  const say = useCallback((m) => { setToast(m); setTimeout(() => setToast(""), 3200); }, []);

  // Elastic (in lab mode) reports its grid and chooser on the `lab-robot` channel as JSON text.
  useEffect(() => {
    let ch;
    try { ch = new BroadcastChannel("lab-robot"); } catch { return undefined; }
    ch.onmessage = (e) => {
      let d = e.data;
      if (typeof d === "string") { try { d = JSON.parse(d); } catch { return; } }
      if (d?.type === "layout" && Array.isArray(d.widgets)) setWidgets(d.widgets);
      else if (d?.type === "chooser") setPicked(d.selected ?? null);
      else if (d?.type === "pathplanner") setProject({ autos: d.autos || {}, paths: d.paths || {} });
      else if (d?.type === "command") {
        setLog((l) => [...l.slice(-7), d.executed ? `Command ${d.name} executed` : `WARNING: command ${d.name} is not registered`]);
        if (d.executed) setCommandRuns((r) => (r.includes(d.name) ? r : [...r, d.name]));
      } else if (d?.type === "auto-started") setLog((l) => [...l.slice(-7), `Autonomous started: ${d.name}`]);
      else if (d?.type === "auto-finished") setLog((l) => [...l.slice(-7), `Autonomous finished: ${d.name}`]);
      else if (d?.type === "auto-missing") setLog((l) => [...l.slice(-7), "ERROR: no autonomous command was returned"]);
    };
    return () => ch.close();
  }, []);

  const placed = widgets.find((w) => w.topic === TOPIC);
  const sendDs = (next) => {
    setDsState(next);
    try { const ch = new BroadcastChannel("lab-robot"); ch.postMessage({ type: "ds", ...next }); ch.close(); } catch { /* ignore */ }
  };

  // ---- layout -------------------------------------------------------------------------
  const tile = useCallback((W, H) => {
    const usableH = H - TASKBAR;
    const half = Math.round(W / 2);
    setWins((w) => {
      const others = ["elastic", "pathplanner", "ds"].filter((id) => w[id].open && !w[id].min);
      const next = { ...w, code: { ...w.code, max: false, min: false, x: 0, y: 0, w: others.length ? half : W, h: usableH } };
      if (others.length === 3) {
        // lesson 2: code on the left, PathPlanner on top right, Elastic and the Driver Station below it
        const left = Math.round(W * 0.38), rightW = W - left, topH = Math.round(usableH * 0.58), dsW = Math.round(rightW * 0.34);
        next.code = { ...next.code, w: left };
        next.pathplanner = { ...w.pathplanner, max: false, x: left, y: 0, w: rightW, h: topH };
        next.elastic = { ...w.elastic, max: false, x: left, y: topH, w: rightW - dsW, h: usableH - topH };
        next.ds = { ...w.ds, max: false, x: left + rightW - dsW, y: topH, w: dsW, h: usableH - topH };
        return next;
      }
      const rowH = others.length ? Math.floor(usableH / others.length) : usableH;
      others.forEach((id, i) => { next[id] = { ...w[id], max: false, x: half, y: i * rowH, w: W - half, h: i === others.length - 1 ? usableH - i * rowH : rowH }; });
      return next;
    });
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    let first = true;
    const measure = () => {
      const { width: W, height: H } = el.getBoundingClientRect();
      setSize({ w: W, h: H });
      if (first) { first = false; tile(W, H); return; }
      setWins((w) => Object.fromEntries(Object.entries(w).map(([id, win]) => [id, clampWin(id, win, W, H)])));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tile]);

  useEffect(() => { save(FILES_KEY, Object.fromEntries(Object.entries(files).filter(([k, v]) => v !== INITIAL_FILES[k]))); }, [files]);
  useEffect(() => { save(SCALE_KEY, scale); }, [scale]);

  const patch = (id, p) => setWins((w) => ({ ...w, [id]: { ...w[id], ...p } }));
  const focus = (id) => patch(id, { z: ++zTop.current, min: false });
  const launch = (id) => { patch(id, { open: true, min: false, z: ++zTop.current }); };

  // Entering the lesson hides the apps that are not part of it.
  const toggleFreePlay = () => {
    if (!freePlay) {
      if (!window.confirm("Free play unlocks every file and app. Your place in the lesson is kept. Continue?")) return;
      setFreePlay(true);
    } else {
      setFreePlay(false);
    }
  };

  const onDeploy = useCallback((base) => {
    // The robot program as the dashboard's simulated robot sees it: topics, registered commands, autonomous plan.
    const f = filesRef.current, proj = projectRef.current;
    const registered = findRegisteredCommands(f);
    const autoName = findAutoRefs(f)[0] ?? null;
    const timeline = autoName && proj.autos[autoName] ? planAuto(autoName, proj) : null;
    const result = { ...base, registered, autonomous: timeline ? { name: autoName, timeline } : null };
    setDeploy(result);
    try { sessionStorage.setItem(DEPLOY_KEY, JSON.stringify(result)); } catch { /* ignore */ }
    try { const ch = new BroadcastChannel("lab-robot"); ch.postMessage({ type: "deploy", ...result }); ch.close(); } catch { /* ignore */ }
    if (base.ok) {
      const lines = [];
      if (autoName && !timeline) lines.push(`ERROR: PathPlanner auto "${autoName}" was not found in deploy/pathplanner/autos`);
      const used = autoName && proj.autos[autoName] ? describeProject(proj).autos[autoName].commands : [];
      for (const c of used) if (!registered.includes(c)) lines.push(`WARNING: named command "${c}" is used by the auto but was never registered`);
      setLog((l) => [...l.slice(-5), `Deployed. Registered commands: ${registered.join(", ") || "none"}`, ...lines]);
      if (lines.length) say(lines[0]);
      if (lessonRef.current === "l2" || (base.topics || []).some((t) => t.name === TOPIC)) {
        setWins((w) => ({ ...w, elastic: { ...w.elastic, open: true, min: false, z: ++zTop.current } }));
        tile(sizeRef.current.w, sizeRef.current.h);
        if (lessonRef.current === "l1") say("Elastic is unlocked. The dashboard now shows what your code publishes.");
      }
    }
  }, [tile, say]);
  const onResult = useCallback((r) => { if (!r.ok) say("The build failed. Read the error in the terminal; it names the file and line."); }, [say]);
  const onOpenFile = useCallback((p) => { if (p === lessonFile) setOpened(true); }, [lessonFile]);
  const onCursor = useCallback((p, line) => {
    if (p !== lessonFile) return;
    const text = (files[lessonFile] || "").split("\n")[line - 1] || "";
    if (/TODO/.test(text)) setTodoVisited(true);
  }, [files, lessonFile]);

  // ---- dragging, snapping, resizing ----------------------------------------------------
  const startMove = (id, e) => {
    if (wins[id].max) return;
    e.preventDefault();
    focus(id);
    const rect = stage.current.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, ox = wins[id].x, oy = wins[id].y;
    let target = null;
    setDrag(true);
    const move = (ev) => {
      setWins((w) => ({ ...w, [id]: clampWin(id, { ...w[id], x: ox + ev.clientX - sx, y: oy + ev.clientY - sy }, rect.width, rect.height) }));
      const px = ev.clientX - rect.left, py = ev.clientY - rect.top;
      target = py < SNAP_EDGE ? "max" : px < SNAP_EDGE ? "left" : px > rect.width - SNAP_EDGE ? "right" : null;
      setSnap(target);
    };
    const up = () => {
      setDrag(false); setSnap(null);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      const W = rect.width, usableH = rect.height - TASKBAR, half = Math.round(W / 2);
      if (target === "max") patch(id, { max: true });
      else if (target === "left") patch(id, { x: 0, y: 0, w: half, h: usableH, max: false });
      else if (target === "right") patch(id, { x: half, y: 0, w: W - half, h: usableH, max: false });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const startResize = (id, e) => {
    e.preventDefault(); e.stopPropagation();
    focus(id);
    const rect = stage.current.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, ow = wins[id].w, oh = wins[id].h;
    setDrag(true);
    const move = (ev) => setWins((w) => ({ ...w, [id]: clampWin(id, { ...w[id], w: ow + ev.clientX - sx, h: oh + ev.clientY - sy }, rect.width, rect.height) }));
    const up = () => { setDrag(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const hasProgress = () => Object.entries(files).some(([k, v]) => v !== startFiles(lessonId)[k]) || !!deploy || commandRuns.length > 0 || Object.keys(project.autos).length > 0 || widgets.length > 0;
  const bundle = () => ({ elastic: readElasticStorage(), project, files, wins, deploy, openedLessonFile, todoVisited, commandRuns, log, dsState });

  // Put the desktop back to a lesson's starting point (or a saved snapshot of it) and reload the apps.
  const loadLesson = (id, snap) => {
    wipeAppStorage();
    const next = snap ?? { files: startFiles(id), wins: freshWins(id), deploy: null, openedLessonFile: false, todoVisited: false, commandRuns: [], log: [], dsState: { mode: "teleop", enabled: false } };
    setLessonId(id);
    setFiles(next.files);
    setWins(next.wins);
    if (next.deploy) { try { sessionStorage.setItem(DEPLOY_KEY, JSON.stringify(next.deploy)); } catch { /* ignore */ } }
    setDeploy(next.deploy);
    setOpened(next.openedLessonFile);
    setTodoVisited(next.todoVisited);
    setCommandRuns(next.commandRuns);
    setLog(next.log);
    setDsState(next.dsState);
    // Fake file system: hand PathPlanner the saved project so it opens with it.
    try { Object.entries(snap?.elastic ?? {}).forEach(([k, v]) => localStorage.setItem(k, v)); } catch { /* ignore */ }
    const saved = snap?.project;
    if (saved && (Object.keys(saved.autos).length || Object.keys(saved.paths).length)) {
      const fs = {};
      for (const [n, t] of Object.entries(saved.autos)) fs[`autos/${n}.auto`] = t;
      for (const [n, t] of Object.entries(saved.paths)) fs[`paths/${n}.path`] = t;
      try { sessionStorage.setItem("labFs", JSON.stringify(fs)); } catch { /* ignore */ }
    }
    setProject(saved ?? { autos: {}, paths: {} });
    setWidgets([]);
    setPicked(null);
    setEpoch((e) => e + 1);
    if (!snap) setTimeout(() => tile(sizeRef.current.w, sizeRef.current.h), 0);
  };

  const switchLesson = (id) => {
    if (id === lessonId) return;
    if (hasProgress()) snapshots.current[lessonId] = bundle();
    else delete snapshots.current[lessonId];
    loadLesson(id, snapshots.current[id]);
  };
  const resetLesson = () => {
    if (!window.confirm("Reset this lesson to its starting point? Your code and the apps go back to the start.")) return;
    delete snapshots.current[lessonId];
    loadLesson(lessonId, null);
  };
  const resetLab = () => {
    if (!window.confirm("Reset the whole lab? Both lessons, all code and every app go back to the start.")) return;
    snapshots.current = {};
    setFreePlay(false);
    loadLesson("l1", null);
  };

  const topId = useMemo(() => Object.entries(wins).filter(([, w]) => w.open && !w.min).sort((a, b) => b[1].z - a[1].z)[0]?.[0], [wins]);
  const toggleFullscreen = () => { const el = stage.current?.parentElement; if (!el) return; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.(); };
  const stepScale = (d) => setScale((s) => SCALES[Math.min(SCALES.length - 1, Math.max(0, SCALES.indexOf(s) + d))]);
  const editable = useCallback((p) => freePlay || p === lessonFile, [freePlay, lessonFile]);

  const visibleApps = APPS.filter((a) => freePlay || lesson.apps.includes(a.id));
  const locked = (app) => lessonMode && app.id === "elastic" && !elasticUnlocked;

  const body = (app) => {
    if (app.id === "code") {
      return (
        <VsCode
          files={files} setFile={(p, t) => setFiles((f) => ({ ...f, [p]: t }))} resetProject={() => { if (freePlay || window.confirm("Reset the project to its starting files?")) setFiles({ ...INITIAL_FILES }); }}
          onDeploy={onDeploy} onResult={onResult} onOpenFile={onOpenFile} onCursor={onCursor} editable={editable} lessonFile={lessonFile}
          deployEnabled={deployEnabled} deployBlockedReason={deployEnabled ? "" : lessonId === "l1" ? "Publish the elevator height first (step 2), then deploy." : "Finish the auto and the Java steps (1 to 4) first, then deploy."} scale={scale}
        />
      );
    }
    if (app.id === "ds") return <DriverStation state={dsState} setState={sendDs} log={log} deployed={!!deploy} />;
    return <iframe key={epoch} title={app.title} src={app.src} className="block h-full w-full border-0 bg-[#0f1115]" style={{ pointerEvents: drag ? "none" : "auto", zoom: scale }} />;
  };

  const snapBox = snap && (snap === "max" ? { left: 0, top: 0, width: size.w, height: size.h - TASKBAR } : snap === "left" ? { left: 0, top: 0, width: size.w / 2, height: size.h - TASKBAR } : { left: size.w / 2, top: 0, width: size.w / 2, height: size.h - TASKBAR });

  return (
    <div className="flex h-full min-h-[32rem] overflow-hidden bg-zinc-950" aria-label="Lab desktop">
      <Guide lessons={LESSONS} lessonId={lessonId} setLessonId={switchLesson} unlocked steps={lesson.steps} state={state} current={current} freePlay={freePlay} toggleFreePlay={toggleFreePlay} placed={placed} picked={picked} onFullscreen={toggleFullscreen} onResetLesson={resetLesson} onResetLab={resetLab} />
      <div ref={stage} className="relative min-w-0 flex-1 overflow-hidden" style={{ background: "radial-gradient(ellipse at 30% 20%, #26324a 0%, #151a26 55%, #0c0f16 100%)" }}>
        {visibleApps.map((app) => {
          const w = wins[app.id];
          if (!w.open) return null;
          const style = w.max ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR}px)`, zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z };
          return (
            <section key={app.id} aria-label={app.title} onPointerDown={() => focus(app.id)} className={`absolute flex flex-col overflow-hidden rounded-lg border bg-[#1e1e1e] shadow-2xl ${topId === app.id ? "border-zinc-500" : "border-zinc-700"}`} style={{ ...style, display: w.min ? "none" : "flex" }}>
              <header onPointerDown={(e) => startMove(app.id, e)} onDoubleClick={() => patch(app.id, { max: !w.max })} className="flex shrink-0 cursor-default select-none items-center justify-between bg-[#323233] px-2 py-1 text-xs text-slate-200">
                <span className="flex items-center gap-1.5"><span aria-hidden="true">{app.icon}</span>{app.title}</span>
                <span className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                  <button type="button" aria-label={`Minimize ${app.title}`} className="h-5 w-6 rounded hover:bg-zinc-600" onClick={() => patch(app.id, { min: true })}>–</button>
                  <button type="button" aria-label={`Maximize ${app.title}`} className="h-5 w-6 rounded hover:bg-zinc-600" onClick={() => patch(app.id, { max: !w.max })}>{w.max ? "❐" : "□"}</button>
                  <button type="button" aria-label={`Close ${app.title}`} disabled={lessonMode} title={lessonMode ? "Windows stay open during the lesson" : `Close ${app.title}`} className="h-5 w-6 rounded hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-transparent" onClick={() => patch(app.id, { open: false })}>×</button>
                </span>
              </header>
              <div className="relative min-h-0 flex-1">{body(app)}</div>
              {!w.max && <div onPointerDown={(e) => startResize(app.id, e)} className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize" aria-hidden="true" />}
            </section>
          );
        })}

        {snapBox && <div className="pointer-events-none absolute z-[90] rounded-lg border-2 border-[#7AADFF] bg-[#7AADFF]/20" style={snapBox} aria-hidden="true" />}

        <nav className="absolute inset-x-0 bottom-0 z-[100] flex items-center justify-between border-t border-white/10 bg-black/55 px-2 backdrop-blur" style={{ height: TASKBAR }} aria-label="Taskbar">
          <div className="flex items-center gap-1">
            {visibleApps.map((app) => {
              const w = wins[app.id];
              const running = w.open;
              const isLocked = locked(app);
              return (
                <button key={app.id} type="button" disabled={isLocked} title={isLocked ? "Unlocks after you deploy your code" : app.title} aria-label={isLocked ? `${app.title} (locked)` : `${running ? "Show" : "Open"} ${app.title}`}
                  onClick={() => (running && !w.min && topId === app.id ? patch(app.id, { min: true }) : running ? focus(app.id) : launch(app.id))}
                  className={`relative flex h-8 items-center gap-1.5 rounded px-2.5 text-xs text-slate-100 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent ${running && !w.min ? "bg-white/10" : ""}`}>
                  <span aria-hidden="true">{isLocked ? "🔒" : app.icon}</span><span className="max-sm:hidden">{app.title}</span>
                  {running && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded" style={{ background: app.color }} />}
                </button>
              );
            })}
            <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
            <button type="button" onClick={() => tile(size.w, size.h)} title="Arrange the open windows side by side" className="h-8 rounded px-2 text-xs text-slate-200 hover:bg-white/10">Tile</button>
          </div>
          <div className="flex items-center gap-3 pr-1 text-xs text-slate-200">
            <span className="flex items-center gap-1" title="Scale the app windows">
              <button type="button" aria-label="Smaller UI" disabled={scale === SCALES[0]} onClick={() => stepScale(-1)} className="h-6 w-6 rounded hover:bg-white/10 disabled:opacity-30">−</button>
              <span aria-live="polite" className="w-10 text-center">{Math.round(scale * 100)}%</span>
              <button type="button" aria-label="Larger UI" disabled={scale === SCALES[SCALES.length - 1]} onClick={() => stepScale(1)} className="h-6 w-6 rounded hover:bg-white/10 disabled:opacity-30">+</button>
            </span>
            <span title={deploy ? "Robot code is deployed" : "No code deployed yet"} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${deploy ? "bg-green-400" : "bg-zinc-500"}`} />Robot: {deploy ? "code running" : "no code"}
            </span>
            <Clock />
          </div>
        </nav>
        {toast && <div role="status" className="absolute bottom-12 left-1/2 z-[120] max-w-[85%] -translate-x-1/2 rounded bg-black/80 px-3 py-1.5 text-center text-xs text-white shadow-lg">{toast}</div>}
      </div>
    </div>
  );
}
