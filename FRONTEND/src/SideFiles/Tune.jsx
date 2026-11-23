import { useEffect, useMemo, useState } from "react";
import MechanismView from "../components/MechanismView.jsx";
import { LANGUAGES, LIBRARIES, generateCode } from "../pidCodegen.js";
import { CHALLENGES, CONDITIONS, DURATION, MECHANISMS, evaluate, randomChallenge, simulate } from "../pidSim.js";

const ZERO = { kP: 0, kI: 0, kD: 0, kS: 0, kG: 0, kV: 0, kA: 0 };
const SLIDERS = [
  { key: "kP", max: 20, step: 0.05 },
  { key: "kI", max: 10, step: 0.05 },
  { key: "kD", max: 2, step: 0.005 },
  { key: "kS", max: 1, step: 0.01 },
  { key: "kG", max: 2, step: 0.01 },
  { key: "kV", max: 5, step: 0.005 },
  { key: "kA", max: 0.5, step: 0.005 },
];

function Chart({ data, target, unit, playT }) {
  const W = 640, H = 170, pad = 30;
  const ys = data.flatMap((d) => [d.y, d.ref]).concat([target, 0]);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (max - min < 1e-6) max = min + 1;
  const m = (max - min) * 0.1;
  min -= m; max += m;
  const x = (t) => pad + (t / DURATION) * (W - pad * 1.5);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 1.5);
  const path = (k) => data.map((d, i) => `${i ? "L" : "M"}${x(d.t).toFixed(1)},${y(d[k]).toFixed(1)}`).join("");
  const band = Math.abs(target) * 0.02;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Mechanism response chart">
      <rect x={pad} y={y(target + band)} width={W - pad * 1.5} height={Math.max(1, y(target - band) - y(target + band))} fill="#7AADFF" opacity="0.15" />
      <line x1={pad} x2={W - pad / 2} y1={y(target)} y2={y(target)} stroke="#555" strokeDasharray="4 4" />
      <line x1={pad} x2={pad} y1={pad / 2} y2={H - pad} stroke="#555" />
      <line x1={pad} x2={W - pad / 2} y1={H - pad} y2={H - pad} stroke="#555" />
      <path d={path("ref")} fill="none" stroke="#77777F" strokeWidth="1.5" strokeDasharray="5 3" />
      <path d={path("y")} fill="none" stroke="#7AADFF" strokeWidth="2.5" />
      <line x1={x(playT)} x2={x(playT)} y1={pad / 2} y2={H - pad} stroke="#e4e4e7" strokeWidth="1" opacity="0.6" />
      <text x={pad} y={H - 8} fill="#999" fontSize="11">0 s</text>
      <text x={W - pad} y={H - 8} fill="#999" fontSize="11">{DURATION} s</text>
      <text x={4} y={y(target) + 4} fill="#999" fontSize="11">{+target.toFixed(2)}</text>
      <text x={W - 120} y={16} fill="#7AADFF" fontSize="11">response ({unit})</text>
      <text x={W - 120} y={30} fill="#999" fontSize="11">profile / setpoint</text>
    </svg>
  );
}

function Shell({ embedded, children }) {
  return embedded
    ? <div className="w-full text-slate-100">{children}</div>
    : <main className="mx-auto w-full max-w-[1200px] px-5 py-10 text-slate-100">{children}</main>;
}

export default function Tune({ embedded = false }) {
  const [challengeId, setChallengeId] = useState(CHALLENGES[0].id);
  const [gains, setGains] = useState(ZERO);
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pidDone") || "[]"); } catch { return []; }
  });
  const [lang, setLang] = useState("java");
  const [lib, setLib] = useState("wpimath");
  const [copied, setCopied] = useState(false);
  const [custom, setCustom] = useState(null);
  const [playT, setPlayT] = useState(DURATION);
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);
  const challenge = custom ?? CHALLENGES.find((c) => c.id === challengeId);
  const mech = MECHANISMS[challenge.mech];

  useEffect(() => { if (!embedded) document.title = "Perscript | PID Tuning"; }, [embedded]);

  const { data, metrics } = useMemo(
    () => simulate(challenge.mech, challenge.cond, challenge.target, gains, challenge.scale),
    [challenge, gains]
  );
  const result = evaluate(metrics, challenge.goal);
  const passed = result.settle && result.overshoot && result.sse;

  const completed = passed && !challenge.random && !done.includes(challenge.id) ? [...done, challenge.id] : done;

  // Playback: animate through the simulated run in real time.
  useEffect(() => {
    if (!playing) return undefined;
    let raf;
    const start = performance.now() - playT * 1000;
    const tick = (now) => {
      const t = Math.max(0, (now - start) / 1000);
      if (t >= DURATION) { setPlayT(DURATION); setPlaying(false); return; }
      setPlayT(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, runId]);

  const idx = Math.max(0, Math.min(data.length - 1, Math.round(playT / (data[1].t - data[0].t))));
  const phases = useMemo(() => {
    if (challenge.mech !== "flywheel") return null;
    const dt = data[1].t - data[0].t;
    let p = 0;
    return data.map((d) => (p += d.y * dt));
  }, [data, challenge.mech]);
  const replay = () => { setPlayT(0); setRunId((n) => n + 1); setPlaying(true); };
  const setGainsAndReplay = (g) => { setGains(g); replay(); };
  useEffect(() => {
    try { localStorage.setItem("pidDone", JSON.stringify(completed)); } catch { /* ignore */ }
  }, [completed]);

  const code = useMemo(() => generateCode(lang, lib, challenge.mech, gains, challenge.target), [lang, lib, challenge, gains]);
  const pick = (id) => { setDone(completed); setCustom(null); setChallengeId(id); setGains(ZERO); replay(); };
  const roll = () => { setDone(completed); setCustom(randomChallenge()); setGains(ZERO); replay(); };
  const fmt = (v, d = 2) => (v === null ? "never" : v.toFixed(d));

  const rows = [
    { label: "Settle within 2%", value: metrics.settle === null ? "never" : `${fmt(metrics.settle)} s`, goal: `≤ ${challenge.goal.settle} s`, ok: result.settle },
    { label: "Overshoot", value: `${fmt(metrics.overshoot, 1)} %`, goal: `≤ ${challenge.goal.overshoot} %`, ok: result.overshoot },
    { label: "Final error", value: `${fmt(metrics.sse, 3)} ${mech.unit}`, goal: `≤ ${challenge.goal.sse} ${mech.unit}`, ok: result.sse },
  ];

  return (
    <Shell embedded={embedded}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h1 className="text-2xl font-semibold">PID Tuning Lab</h1>
        <p className="text-sm text-slate-400">Tune P, I, D and feedforward (kS, kG, kV, kA). Meet every goal to clear the challenge.</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CHALLENGES.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c.id)}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${c.id === challengeId && !custom ? "border-[#7AADFF] bg-[#7AADFF]/20" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            {completed.includes(c.id) ? "✓ " : ""}{c.title}
          </button>
        ))}
        <button
          onClick={roll}
          className={`rounded-full border px-2.5 py-0.5 text-xs ${custom ? "border-[#7AADFF] bg-[#7AADFF]/20" : "border-zinc-700 hover:border-zinc-500"}`}
        >
          🎲 Random
        </button>
      </div>

      <div className="@container mt-3">
        <div className="grid gap-3 @xl:grid-cols-[minmax(0,1.5fr)_minmax(14rem,1fr)]">
          <section className="min-w-0 rounded-xl border border-zinc-800 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h2 className="text-base font-semibold">{challenge.title}</h2>
              <p className="text-xs text-slate-400">
                {mech.label} · {CONDITIONS[challenge.cond].label} · target {challenge.target} {mech.unit}
              </p>
            </div>
            <MechanismView
              mech={challenge.mech}
              value={data[idx].y}
              target={challenge.target}
              phase={phases ? phases[idx] : 0}
            />
            <div className="my-1.5 flex items-center gap-2 text-xs">
              <button className="text-[#7AADFF]" onClick={replay}>{playing ? "Restart" : "▶ Play"}</button>
              <input
                type="range" min="0" max={DURATION} step="0.01" value={playT}
                onChange={(e) => { setPlaying(false); setPlayT(parseFloat(e.target.value)); }}
                className="flex-1" aria-label="Playback time"
              />
              <span className="w-12 text-right tabular-nums text-slate-400">{playT.toFixed(2)} s</span>
            </div>
            <Chart data={data} target={challenge.target} unit={mech.unit} playT={playT} />
          </section>

          <section className="min-w-0 rounded-xl border border-zinc-800 p-3 @xl:sticky @xl:top-3 @xl:self-start">
            <div className="mb-1.5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Gains</h2>
              <button className="text-xs text-[#7AADFF]" onClick={() => setGainsAndReplay(ZERO)}>Reset</button>
            </div>
            {SLIDERS.map((s) => (
              <label key={s.key} className="grid grid-cols-[1.6rem_minmax(0,1fr)_3.4rem] items-center gap-2 py-0.5 text-xs">
                <span className="font-medium">{s.key}</span>
                <input
                  type="range" min="0" max={s.max} step={s.step}
                  value={gains[s.key]}
                  onChange={(e) => setGainsAndReplay({ ...gains, [s.key]: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-right tabular-nums text-slate-300">{gains[s.key].toFixed(3)}</span>
              </label>
            ))}
            <ul className="mt-2 space-y-0.5 border-t border-zinc-800 pt-2 text-xs">
              {rows.map((r) => (
                <li key={r.label} className={r.ok ? "text-green-400" : "text-red-400"}>
                  {r.ok ? "✓" : "✗"} {r.label}: {r.value} <span className="text-slate-500">(goal {r.goal})</span>
                </li>
              ))}
            </ul>
            {passed && <p className="mt-1.5 text-sm font-semibold text-green-400">Challenge complete!</p>}
            <p className="mt-1.5 text-xs text-slate-500">Hint: {challenge.hint}</p>
          </section>
        </div>
      </div>

      <section className="mt-3 rounded-xl border border-zinc-800 p-3">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-lg font-semibold">Equivalent code</h2>
          <select value={lib} onChange={(e) => setLib(e.target.value)} className="rounded border border-zinc-700 bg-black px-2 py-1 text-sm" aria-label="Library">
            {LIBRARIES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded border border-zinc-700 bg-black px-2 py-1 text-sm" aria-label="Language">
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <button
            className="text-sm text-[#7AADFF]"
            onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          >{copied ? "Copied!" : "Copy"}</button>
        </div>
        <pre className="overflow-x-auto rounded bg-zinc-950 p-3 text-xs leading-relaxed text-slate-200"><code>{code}</code></pre>
        <p className="mt-2 text-xs text-slate-500">Starter code for your current gains. Check units and class names against the library version you use.</p>
      </section>
    </Shell>
  );
}
