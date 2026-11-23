// Self-contained training mock of a CAN-device tuner for Talon FX motor controllers.
// Structure is modelled on the real app: collapsible left flyout, Devices page with card and grid
// views, per-device action icons, and a device view with Info / Config / Control panels.
// All code here is original. Decoupled from the rest of the app: no imports outside this folder.
// Props: goal = { id, name, gains } the learner should reach (optional), onProgress(tasks) (optional).
import "./fonts.css";
import { useEffect, useMemo, useState } from "react";
import { INITIAL_DEVICES, CONFIG_GROUPS, MIN_ID, MAX_ID, defaultConfig } from "./data.js";

const DEFAULT_GOAL = { id: 5, name: "Elevator", gains: { kP: 4, kD: 0.05, kS: 0.25, kV: 2.5, kA: 0.15, kG: 0.6 } };
const NAV = [
  ["Devices", "▤"], ["CANivores", "◫"], ["Tuner History", "◷"], ["Mechanisms", "⚙"], ["Signal & Control", "∿"],
  ["Tools", "✎"], ["Profile", "☺"], ["Documentation", "?"], ["Settings", "✱"],
];
// The host site styles bare inputs; keep checkboxes small and unstyled.
const CHECK = { width: 16, height: 16, padding: 0, flex: "none" };
const PANEL_TABS = ["Info", "Config", "Control"];

const IconBtn = ({ title, onClick, disabled, children, active }) => (
  <button type="button" title={title} aria-label={title} disabled={disabled} onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className={`grid h-7 w-7 place-items-center rounded-full text-sm hover:bg-[#323137] disabled:opacity-40 ${active ? "text-[#FFD166]" : "text-[#D5D5D5]"}`}>{children}</button>
);
const BTN = "rounded-full border border-[#535353] px-3 py-1 text-xs hover:bg-[#2B2B2B] disabled:opacity-40";
const PRIMARY = "rounded-full bg-[#7AADFF] px-4 py-1 text-xs font-semibold text-black disabled:opacity-40";

export default function PhoenixTunerMock({ goal = DEFAULT_GOAL, onProgress }) {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [open, setOpen] = useState(null); // key of the device whose view is open
  const [checked, setChecked] = useState({});
  const [nav, setNav] = useState("Devices");
  const [flyoutOpen, setFlyoutOpen] = useState(true);
  const [grid, setGrid] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [tab, setTab] = useState("Info");
  const [group, setGroup] = useState(CONFIG_GROUPS[0].name);
  const [draftId, setDraftId] = useState({});
  const [draftName, setDraftName] = useState({});
  const [draftCfg, setDraftCfg] = useState({});
  const [blink, setBlink] = useState({});
  const [code, setCode] = useState("");
  const [toast, setToast] = useState("");

  const shown = [...devices].sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id));
  const dev = devices.find((d) => d.key === open);
  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const update = (key, fn) => setDevices((ds) => ds.map((d) => (d.key === key ? fn(d) : d)));
  const doBlink = (key) => { setBlink((b) => ({ ...b, [key]: true })); setTimeout(() => setBlink((b) => ({ ...b, [key]: false })), 3000); };

  const idVal = dev ? draftId[dev.key] ?? dev.id : 0;
  const nameVal = dev ? draftName[dev.key] ?? dev.name : "";
  const edits = dev ? draftCfg[dev.key] || {} : {};
  const cfg = dev ? { ...dev.config, ...edits } : {};
  const cfgDirty = Object.keys(edits).length > 0;
  const idProblem = !dev ? "" : idVal < MIN_ID || idVal > MAX_ID ? `Valid IDs are ${MIN_ID}–${MAX_ID}` : devices.some((d) => d.key !== dev.key && d.id === Number(idVal)) ? "Another Talon FX already uses this ID" : "";

  const tasks = useMemo(() => {
    const target = devices.find((d) => d.id === goal.id);
    return [
      { text: "Give every Talon FX its own ID (1–62) and press Set", done: devices.every((d) => d.id >= MIN_ID) && new Set(devices.map((d) => d.id)).size === devices.length },
      { text: `Name the device on ID ${goal.id} “${goal.name}”`, done: !!target && target.name === goal.name },
      { text: `Apply Slot 0 on ${goal.name}: ${Object.entries(goal.gains).map(([k, v]) => `${k}=${v}`).join(", ")}`, done: !!target && Object.entries(goal.gains).every(([k, v]) => Number(target.config[k]) === v) },
    ];
  }, [devices, goal]);
  useEffect(() => { onProgress?.(tasks); }, [tasks, onProgress]);

  const details = (d) => `Talon FX · ID ${d.id} · serial ${d.serial} · firmware ${d.fw}`;
  const copy = (text, label) => { try { navigator.clipboard?.writeText(text); } catch { /* clipboard unavailable */ } say(`${label} copied`); };
  const generate = () => {
    const s0 = CONFIG_GROUPS[0].fields.filter((f) => !f.options && Number(cfg[f.key]) !== 0);
    setCode(`TalonFXConfiguration cfg = new TalonFXConfiguration();\nSlot0Configs slot0 = cfg.Slot0;\n${s0.map((f) => `slot0.${f.key} = ${cfg[f.key]};`).join("\n")}\nmotor.getConfigurator().apply(cfg);`);
  };

  const field = (f) => (
    <li key={f.key} className="grid gap-1 py-1.5 sm:grid-cols-[10rem_9rem_1fr] sm:items-center">
      <span className={edits[f.key] !== undefined ? "text-[#7AADFF]" : ""}>{f.key}</span>
      {f.options ? (
        <select value={cfg[f.key]} onChange={(ev) => setDraftCfg({ ...draftCfg, [dev.key]: { ...edits, [f.key]: ev.target.value } })} className="rounded-lg border border-[#535353] bg-[#2B2B2B] px-2 py-1" aria-label={f.key}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
      ) : (
        <input type="number" step="any" value={cfg[f.key]} onChange={(ev) => setDraftCfg({ ...draftCfg, [dev.key]: { ...edits, [f.key]: ev.target.value === "" ? "" : Number(ev.target.value) } })} className="rounded-lg border border-[#535353] bg-[#2B2B2B] px-2 py-1" aria-label={f.key} />
      )}
      <span className="text-xs text-[#D5D5D5]/60">{f.help}</span>
    </li>
  );

  const deviceView = dev && (
    <section aria-label="Device view">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#323137] p-3">
        <button className={BTN} onClick={() => setOpen(null)}>← Devices</button>
        <h3 className="text-base font-semibold">{dev.name || "Talon FX"}</h3>
        <span className="rounded-full bg-[#2B2B2B] px-2 py-0.5 text-xs">ID {dev.id}</span>
        <span className="text-xs text-green-400">● Running</span>
        <span className="ml-auto flex items-center gap-1">
          <IconBtn title="Blink device" active={blink[dev.key]} onClick={() => doBlink(dev.key)}>💡</IconBtn>
          <IconBtn title="Copy details to clipboard" onClick={() => copy(details(dev), "Details")}>⧉</IconBtn>
        </span>
      </div>
      <div className="flex gap-1 border-b border-[#323137] bg-[#1C1B1F] px-2 pt-1">
        {PANEL_TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`-mb-px rounded-t-lg border border-b-0 px-4 py-1.5 text-xs ${t === tab ? "border-[#535353] bg-[#131313]" : "border-transparent text-[#D5D5D5]/70 hover:text-[#F0F0F0]"}`}>{t}</button>)}
      </div>
      <div className="p-3">
        {tab === "Info" && (
          <section aria-label="Device details">
            <dl className="mb-3 grid grid-cols-[7rem_1fr] gap-y-1 text-xs text-[#D5D5D5]/70">
              <dt>Model</dt><dd className="text-[#F0F0F0]">Talon FX</dd>
              <dt>Serial</dt><dd className="text-[#F0F0F0]">{dev.serial}</dd>
              <dt>Firmware</dt><dd className="text-[#F0F0F0]">{dev.fw}</dd>
              <dt>CAN Bus</dt><dd className="text-[#F0F0F0]">rio</dd>
            </dl>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs text-[#D5D5D5]/70">Device ID
                <input type="number" value={idVal} onChange={(ev) => setDraftId({ ...draftId, [dev.key]: Number(ev.target.value) })} className={`mt-0.5 block w-24 rounded-lg border bg-[#2B2B2B] px-2 py-1 text-sm text-[#F0F0F0] ${idProblem ? "border-amber-500" : "border-[#535353]"}`} aria-label="Device ID" />
              </label>
              <label className="text-xs text-[#D5D5D5]/70">Name
                <input value={nameVal} onChange={(ev) => setDraftName({ ...draftName, [dev.key]: ev.target.value })} className="mt-0.5 block w-44 rounded-lg border border-[#535353] bg-[#2B2B2B] px-2 py-1 text-sm text-[#F0F0F0]" aria-label="Device name" />
              </label>
              <button disabled={!!idProblem} className={PRIMARY} onClick={() => { update(dev.key, (d) => ({ ...d, id: Number(idVal), name: nameVal })); setDraftId({ ...draftId, [dev.key]: undefined }); setDraftName({ ...draftName, [dev.key]: undefined }); say(`Device set to ID ${idVal}`); }}>Set</button>
            </div>
            {idProblem && <p className="mt-2 text-xs text-amber-400" role="alert">{idProblem}</p>}
            <p className="mt-3 text-xs text-[#D5D5D5]/60">Tip: use the lightbulb to blink a device and find which physical controller it is, then label it with its ID. Factory devices all start at ID 0.</p>
          </section>
        )}
        {tab === "Config" && (
          <section aria-label="Configs">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <button className={BTN} onClick={() => { update(dev.key, (d) => ({ ...d, config: defaultConfig() })); setDraftCfg({ ...draftCfg, [dev.key]: {} }); say("Factory defaults restored"); }}>Factory default</button>
              <button className={BTN} onClick={generate}>Generate Code</button>
              <button className={BTN} disabled>Save to file</button>
              <button className={BTN} disabled>Load from file</button>
              <button className={BTN} disabled>Share</button>
              <button className={BTN} disabled>Open Setters</button>
              <IconBtn title="Copy config to clipboard" onClick={() => copy(JSON.stringify(cfg), "Config")}>⧉</IconBtn>
              <span className="ml-auto flex gap-1.5">
                <button disabled={!cfgDirty} className={BTN} onClick={() => setDraftCfg({ ...draftCfg, [dev.key]: {} })}>Cancel</button>
                <button disabled={!cfgDirty} className={PRIMARY} onClick={() => { update(dev.key, (d) => ({ ...d, config: { ...d.config, ...edits } })); setDraftCfg({ ...draftCfg, [dev.key]: {} }); say("Configs applied to device"); }}>Apply</button>
              </span>
            </div>
            <div className="mb-2 flex flex-wrap gap-1 border-b border-[#323137]">
              {CONFIG_GROUPS.map((g) => <button key={g.name} onClick={() => setGroup(g.name)} className={`-mb-px rounded-t-lg border border-b-0 px-3 py-1 text-xs ${g.name === group ? "border-[#535353] bg-[#131313]" : "border-transparent text-[#D5D5D5]/70 hover:text-[#F0F0F0]"}`}>{g.name}</button>)}
            </div>
            <ul className="divide-y divide-[#323137]">{CONFIG_GROUPS.find((g) => g.name === group).fields.map(field)}</ul>
            {code && <pre className="mt-2 overflow-x-auto rounded-lg bg-[#2B2B2B] p-2 text-xs" style={{ fontFamily: "ui-monospace, Consolas, monospace" }}>{code}</pre>}
          </section>
        )}
        {tab === "Control" && <p className="text-[#D5D5D5]/60">Control is not part of this exercise. Use Info and Config.</p>}
      </div>
    </section>
  );

  const devicesPage = (
    <>
      <div className="flex flex-wrap items-center gap-1 border-b border-[#323137] p-2" role="toolbar" aria-label="Devices toolbar">
        <h3 className="mr-2 px-1 text-sm font-semibold">Devices ({devices.length})</h3>
        <IconBtn title="Update selected devices" disabled>⇪</IconBtn>
        <IconBtn title="Select all like devices" onClick={() => setChecked(Object.fromEntries(devices.map((d) => [d.key, true])))}>☑</IconBtn>
        <IconBtn title="Deselect all devices" onClick={() => setChecked({})}>☐</IconBtn>
        <IconBtn title="Sort devices" onClick={() => setSortAsc(!sortAsc)}>{sortAsc ? "↑" : "↓"}</IconBtn>
        <IconBtn title="Clear current devices" onClick={() => say("Devices refreshed")}>⟳</IconBtn>
        <IconBtn title="Generate QR Codes" disabled>▣</IconBtn>
        <span className="ml-auto" />
        <IconBtn title={grid ? "Switch to Card View" : "Switch to Grid View"} onClick={() => setGrid(!grid)}>{grid ? "▦" : "☰"}</IconBtn>
      </div>
      {grid ? (
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1C1B1F] text-[#D5D5D5]/70"><tr><th className="w-8 px-3 py-1.5" /><th className="font-semibold">Name</th><th className="font-semibold">ID</th><th className="font-semibold">CAN Bus</th><th className="font-semibold">Firmware</th><th className="font-semibold">Status</th><th className="font-semibold">Vendor</th></tr></thead>
          <tbody>
            {shown.map((d) => (
              <tr key={d.key} onClick={() => { setOpen(d.key); setTab("Info"); }} className="cursor-pointer border-t border-[#323137] hover:bg-[#2B2B2B]">
                <td className="px-3"><input type="checkbox" checked={!!checked[d.key]} onClick={(e) => e.stopPropagation()} onChange={(e) => setChecked({ ...checked, [d.key]: e.target.checked })} aria-label={`Select ${d.name || "Talon FX"}`} style={CHECK} /></td>
                <td className="py-2">{d.name || "Talon FX"}<span className="block text-[#D5D5D5]/50">Talon FX</span></td>
                <td>{d.id}</td><td>rio</td><td>{d.fw}</td><td className="text-green-400">Running</td><td>CTR Electronics</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid gap-3 p-3 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]">
          {shown.map((d) => (
            <article key={d.key} onClick={() => { setOpen(d.key); setTab("Info"); }} aria-label={`Talon FX ${d.id}`} className="cursor-pointer rounded-2xl bg-[#1C1B1F] p-3 shadow ring-1 ring-[#323137] hover:ring-[#7AADFF]">
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={!!checked[d.key]} onClick={(e) => e.stopPropagation()} onChange={(e) => setChecked({ ...checked, [d.key]: e.target.checked })} aria-label={`Select ${d.name || "Talon FX"}`} className="mt-1" style={CHECK} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.name || "Talon FX"}</p>
                  <p className="text-xs text-[#D5D5D5]/60">Talon FX · fw {d.fw}</p>
                  <p className="text-xs text-[#D5D5D5]/60">CAN Bus: rio</p>
                </div>
                <span className="rounded-full bg-[#2B2B2B] px-2 py-0.5 text-xs">ID {d.id}</span>
              </div>
              <div className="mt-2 flex items-center">
                <span className="mr-auto text-xs text-green-400">● Running</span>
                <IconBtn title="Blink device" active={blink[d.key]} onClick={() => doBlink(d.key)}>💡</IconBtn>
                <IconBtn title="Copy details to clipboard" onClick={() => copy(details(d), "Details")}>⧉</IconBtn>
              </div>
              <p className="mt-1 text-xs text-[#7AADFF]">View more details...</p>
            </article>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#323137] bg-[#131313] text-sm text-[#F0F0F0]" style={{ fontFamily: '"Open Sans", system-ui, sans-serif' }} aria-label="Tuner mock">
      <div className="flex items-center justify-between border-b border-[#323137] bg-[#1C1B1F] px-3 py-1.5 text-xs text-[#D5D5D5]/70">
        <span>Device Tuner (training mock)</span>
        <span>Not the real application — behaviour approximated</span>
      </div>

      <div className="flex min-h-[26rem]">
        <nav className={`shrink-0 border-r border-[#323137] bg-[#1C1B1F] p-2 ${flyoutOpen ? "w-52" : "w-12"}`} aria-label="Flyout">
          <button className="mb-2 grid h-8 w-8 place-items-center rounded-full hover:bg-[#323137]" onClick={() => setFlyoutOpen(!flyoutOpen)} aria-label="Toggle navigation" aria-expanded={flyoutOpen}>☰</button>
          {flyoutOpen && (
            <label className="mb-2 block px-1 text-xs text-[#D5D5D5]/70">Enter a Team # or IP:
              <input readOnly value="10.0.0.2" className="mt-1 block w-full rounded-lg border border-[#535353] bg-[#2B2B2B] px-2 py-1 text-[#F0F0F0]" aria-label="Team number or IP" />
            </label>
          )}
          {NAV.map(([n, icon]) => (
            <button key={n} onClick={() => { setNav(n); setOpen(null); }} title={n} className={`mb-0.5 flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-left ${n === nav ? "bg-[#7AADFF]/20 font-semibold" : "text-[#D5D5D5]/80 hover:bg-[#2B2B2B]"}`}>
              <span aria-hidden="true" className="w-4 text-center">{icon}</span>
              {flyoutOpen && <span>{n === "Devices" ? `Devices (${devices.length})` : n === "CANivores" ? "CANivores (0)" : n}</span>}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          {nav !== "Devices" ? <p className="p-4 text-[#D5D5D5]/60">The {nav} page is not part of this exercise. Use Devices.</p> : dev ? deviceView : devicesPage}
          {toast && <p className="m-3 rounded-lg bg-green-900/40 px-2 py-1 text-xs text-green-300" role="status">{toast}</p>}
        </main>
      </div>

      <div className="flex items-center justify-between border-t border-[#323137] bg-[#1C1B1F] px-3 py-1 text-xs text-[#D5D5D5]/70">
        <span>CAN Bus: rio · {devices.length} devices</span><span>Connected</span>
      </div>
      <section className="border-t border-[#323137] p-3">
        <h3 className="mb-1 text-xs uppercase tracking-wide text-[#D5D5D5]/60">Your tasks</h3>
        <ul className="space-y-1">{tasks.map((t) => <li key={t.text} className={t.done ? "text-green-400" : "text-[#D5D5D5]"}>{t.done ? "✓" : "○"} {t.text}</li>)}</ul>
      </section>
    </div>
  );
}
