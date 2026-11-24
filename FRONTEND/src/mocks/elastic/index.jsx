// Training lesson wrapper for Elastic (the FRC dashboard), shown in the lesson layout.
// The dashboard itself is the real Elastic web build (MIT licensed, see ./README.md) running
// against a simulated robot; this component only frames it and adds a self-check task list.
// Decoupled from the rest of the app: no imports outside this folder.
import { useEffect, useState } from "react";

const BUILD_URL = `${import.meta.env.BASE_URL}elastic/index.html`;
const STORAGE_KEY = "elasticLessonDone";

const TASKS = [
  { id: "connect", text: "Wait for the status bar to say it is connected to the robot (a simulated one)" },
  { id: "number", text: "Click Add Widget and drag /SmartDashboard/Elevator Height onto the grid. Elastic picks a number widget for you." },
  { id: "type", text: "Right-click the widget and use Show As to switch it to a Graph" },
  { id: "boolean", text: "Add /SmartDashboard/Intake Has Piece and watch the Boolean Box flip as the simulated robot picks up a piece" },
  { id: "tab", text: "Open the Autonomous tab and add the Auto Chooser to it" },
  { id: "chooser", text: "Choose “Two Piece” in the Auto Chooser and confirm it shows as active" },
  { id: "field", text: "Add the Field and watch the robot drive around it" },
];

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export default function ElasticLesson() {
  const [done, setDone] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); } catch { /* storage unavailable */ }
  }, [done]);
  const count = TASKS.filter((t) => done[t.id]).length;

  return (
    <div className="grid gap-3 @container" aria-label="Elastic lesson">
      <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-1.5 text-xs text-slate-400">
          <span>Elastic dashboard (simulated robot)</span>
          <a className="underline hover:text-slate-200" href="https://frc-elastic.gitbook.io/docs" target="_blank" rel="noreferrer">Elastic docs</a>
        </div>
        <iframe title="Elastic dashboard" src={BUILD_URL} className="block h-[34rem] w-full border-0" allow="clipboard-write" />
      </div>

      <section className="rounded-xl border border-zinc-700 p-3">
        <h3 className="mb-1 text-xs uppercase tracking-wide text-slate-400">Your tasks ({count}/{TASKS.length})</h3>
        <ul className="space-y-1.5">
          {TASKS.map((t) => (
            <li key={t.id}>
              <label className={`flex cursor-pointer items-start gap-2 ${done[t.id] ? "text-green-400" : "text-slate-200"}`}>
                <input type="checkbox" checked={!!done[t.id]} onChange={(e) => setDone({ ...done, [t.id]: e.target.checked })} style={{ width: 16, height: 16, padding: 0, flex: "none", marginTop: 3 }} />
                <span>{t.text}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-400">
          In your robot code, <code>SmartDashboard.putNumber("Elevator Height", height)</code> publishes the topic Elastic shows here. The
          dashboard is only the viewer.
        </p>
      </section>
    </div>
  );
}
