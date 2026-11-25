// A tiny Driver Station: pick Autonomous or Teleop, then Enable. The simulated robot in the
// dashboard window reacts to it (an enabled Autonomous mode runs the deployed auto).
export default function DriverStation({ state, setState, log, deployed }) {
  const { mode, enabled } = state;
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto bg-[#1b1f27] p-3 text-sm text-slate-200">
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Robot mode">
        {[["teleop", "Teleoperated"], ["auto", "Autonomous"]].map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={mode === id} disabled={enabled} onClick={() => setState({ mode: id, enabled: false })}
            className={`rounded border px-2 py-1 text-xs ${mode === id ? "border-[#7AADFF] bg-[#7AADFF]/20 text-white" : "border-zinc-600 text-slate-300 hover:bg-zinc-800"} disabled:opacity-60`}>{label}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={!deployed || enabled} onClick={() => setState({ mode, enabled: true })} className="rounded bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-40">Enable</button>
        <button type="button" disabled={!enabled} onClick={() => setState({ mode, enabled: false })} className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-40">Disable</button>
        <span className="text-xs" aria-live="polite">{enabled ? `Enabled: ${mode === "auto" ? "Autonomous" : "Teleop"}` : "Disabled"}</span>
      </div>
      {!deployed && <p className="text-xs text-amber-300">No robot code yet. Deploy first.</p>}
      <div className="min-h-0 flex-1 overflow-auto rounded bg-black/50 p-2 font-mono text-[11px] leading-relaxed text-slate-300" aria-label="Robot console" role="log">
        {log.length === 0 ? <span className="text-slate-500">Robot console</span> : log.map((l, i) => <div key={i} className={/^(ERROR|WARNING)/.test(l) ? "text-amber-300" : ""}>{l}</div>)}
      </div>
    </div>
  );
}
