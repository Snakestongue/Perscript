// Turns the files PathPlanner holds (autos and paths, as JSON text) into a plan a simulated robot
// can run: a list of points to drive through and commands to fire along the way. Also reads the
// student's Java for the commands it registers and the autos it asks for.

const SAMPLES_PER_SEGMENT = 24;

function parse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

// Cubic bezier point for one path segment between waypoint a and b.
function bezier(a, b, t) {
  const p0 = a.anchor, p1 = a.nextControl || a.anchor, p2 = b.prevControl || b.anchor, p3 = b.anchor;
  const u = 1 - t;
  return [
    u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  ];
}

// Named commands inside any PathPlanner command tree (sequential / parallel / race / deadline / named).
export function commandsIn(node) {
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "named" && n.data?.name) out.push(n.data.name);
    for (const c of n.data?.commands || []) walk(c);
    if (n.command) walk(n.command);
  };
  walk(node);
  return out;
}

// Path names an auto drives, in order (nested sequences are flattened).
function pathsIn(node) {
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "path" && n.data?.pathName) out.push(n.data.pathName);
    for (const c of n.data?.commands || []) walk(c);
  };
  walk(node);
  return out;
}

// Timeline items: { kind: "point", x, y } and { kind: "command", name }.
export function planAuto(name, project) {
  const autoJson = parse(project.autos?.[name] ?? "");
  if (!autoJson) return null;
  const timeline = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "path" && n.data?.pathName) {
      const path = parse(project.paths?.[n.data.pathName] ?? "");
      if (!path?.waypoints?.length) return;
      const wps = path.waypoints;
      const markers = (path.eventMarkers || []).flatMap((m) => commandsIn(m.command).map((c) => ({ at: Number(m.waypointRelativePos) || 0, name: c })));
      const items = [];
      for (let i = 0; i < wps.length - 1; i++) {
        for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) items.push({ kind: "point", pos: i + s / SAMPLES_PER_SEGMENT, xy: bezier(wps[i], wps[i + 1], s / SAMPLES_PER_SEGMENT) });
      }
      items.push({ kind: "point", pos: wps.length - 1, xy: [wps[wps.length - 1].anchor.x, wps[wps.length - 1].anchor.y] });
      const merged = [];
      const pending = [...markers].sort((a, b) => a.at - b.at);
      for (const it of items) {
        while (pending.length && pending[0].at <= it.pos) merged.push({ kind: "command", name: pending.shift().name });
        merged.push({ kind: "point", x: it.xy[0], y: it.xy[1] });
      }
      for (const m of pending) merged.push({ kind: "command", name: m.name });
      timeline.push(...merged);
    } else if (n.type === "named" && n.data?.name) {
      timeline.push({ kind: "command", name: n.data.name });
    }
    for (const c of n.data?.commands || []) walk(c);
    if (n.command) walk(n.command);
  };
  walk(autoJson.command ?? autoJson);
  return timeline;
}

// What the project looks like to a lesson: which autos exist, which paths and commands they use.
export function describeProject(project) {
  const autos = {};
  for (const [name, text] of Object.entries(project.autos || {})) {
    const json = parse(text);
    if (!json) continue;
    autos[name] = { paths: pathsIn(json.command ?? json), commands: [...new Set([...commandsIn(json.command ?? json), ...pathsIn(json.command ?? json).flatMap((p) => (parse(project.paths?.[p] ?? "")?.eventMarkers || []).flatMap((m) => commandsIn(m.command)))])] };
  }
  return { autos, paths: Object.keys(project.paths || {}) };
}

// NamedCommands.registerCommand("runIntake", ...) in the Java sources.
export function findRegisteredCommands(files) {
  const found = new Set();
  for (const [path, code] of Object.entries(files)) {
    if (!path.endsWith(".java")) continue;
    const text = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    for (const m of text.matchAll(/NamedCommands\s*\.\s*registerCommand\s*\(\s*"([^"]+)"/g)) found.add(m[1]);
  }
  return [...found];
}

// new PathPlannerAuto("X") / AutoBuilder.buildAuto("X") in the Java sources.
export function findAutoRefs(files) {
  const found = new Set();
  for (const [path, code] of Object.entries(files)) {
    if (!path.endsWith(".java")) continue;
    const text = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    for (const m of text.matchAll(/new\s+PathPlannerAuto\s*\(\s*"([^"]+)"/g)) found.add(m[1]);
    for (const m of text.matchAll(/AutoBuilder\s*\.\s*buildAuto\s*\(\s*"([^"]+)"/g)) found.add(m[1]);
  }
  return [...found];
}

export function usesAutoChooser(files) {
  return Object.entries(files).some(([p, c]) => p.endsWith(".java") && /AutoBuilder\s*\.\s*buildAutoChooser\s*\(/.test(c.replace(/\/\/[^\n]*/g, "")));
}
