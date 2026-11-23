// Self-contained training mock of a SPARK MAX configuration client, built with Ant Design (MIT).
// Structure is modelled on the real client: top navigation, device cards, a device drawer with
// Summary / Configuration / Utilities tabs, a parameter list with group menu and search, and
// floating Persist / Reset / Undo buttons. All code here is original.
// Decoupled from the rest of the app: nothing imports outside this folder (except npm packages).
// Props: goal = { id, params } the learner should reach (optional), onProgress(tasks) (optional).
import "./fonts.css";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, ConfigProvider, Descriptions, Divider, Drawer, FloatButton, Input, InputNumber, Layout, Menu, Modal, Select, Space, Switch, Tabs, Tag, Tooltip, Typography, theme } from "antd";
import { AimOutlined, CheckOutlined, DeleteOutlined, LockOutlined, MoonOutlined, RollbackOutlined, SafetyCertificateOutlined, SunOutlined, UndoOutlined, WarningOutlined } from "@ant-design/icons";
import { GROUPS, PARAMS, INITIAL_DEVICES, MIN_ID, MAX_ID, defaultValues } from "./data.js";

const DEFAULT_GOAL = { id: 12, params: { "P 0": 0.1, "D 0": 0.01, "S 0": 0.2, "V 0": 0.12 } };
const MONO = '"Roboto Mono", ui-monospace, Menlo, Consolas, monospace';
const CAN = "CAN ID";

const tokensFor = (dark) => ({
  algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: dark
    ? { colorPrimary: "#F15523", colorBgBase: "#191c1e", colorBgContainer: "#27292b", colorBgLayout: "#191c1e", colorBgElevated: "#27292b", colorBorder: "#4f5356", colorBorderSecondary: "#37393b" }
    : { colorPrimary: "#F15523", colorBgLayout: "#f5f5f5", colorBgContainer: "#ffffff" },
});

const effectiveId = (d) => d.pending[CAN] ?? d.id;
const valueOf = (d, name) => (name in d.pending ? d.pending[name] : d.values[name]);

function idError(devices, d) {
  const id = effectiveId(d);
  if (!Number.isInteger(id) || id < MIN_ID || id > MAX_ID) return `CAN ID must be between ${MIN_ID} and ${MAX_ID}`;
  if (devices.some((o) => o.key !== d.key && effectiveId(o) === id)) return "CAN ID already in use for this device type";
  return "";
}

function ParamRow({ p, dev, onChange, onUndo }) {
  const v = valueOf(dev, p.name);
  const changed = p.name in dev.pending;
  const input = p.type === "bool" ? <Switch checked={!!v} onChange={(c) => onChange(p.name, c)} aria-label={p.name} />
    : p.type === "enum" ? <Select value={v} onChange={(x) => onChange(p.name, x)} options={p.options.map((o) => ({ value: o, label: o }))} style={{ width: 190 }} aria-label={p.name} />
    : <InputNumber value={v} step={0.01} onChange={(x) => onChange(p.name, x ?? 0)} style={{ width: 190, fontFamily: MONO }} aria-label={p.name} />;
  return (
    <Card size="small" styles={{ body: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" } }} style={changed ? { borderColor: "#F15523" } : undefined}>
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <Typography.Text strong>{p.name}{p.unit && <Typography.Text type="secondary"> ({p.unit})</Typography.Text>}</Typography.Text>
        <div><Typography.Text type="secondary" style={{ fontSize: 12 }}>{p.description}</Typography.Text></div>
      </div>
      <Space>
        {input}
        <Tooltip title="Undo change"><Button type="text" size="small" disabled={!changed} icon={<RollbackOutlined />} onClick={() => onUndo(p.name)} aria-label={`Undo ${p.name}`} /></Tooltip>
      </Space>
    </Card>
  );
}

export default function RevHardwareClientMock({ goal = DEFAULT_GOAL, onProgress }) {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [sel, setSel] = useState(null);
  const [page, setPage] = useState("hardware");
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("cfg");
  const [group, setGroup] = useState(GROUPS[0]);
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(null); // "undo" | "safe" | "factory"
  const [log, setLog] = useState([]);
  const [blink, setBlink] = useState({});
  const [run, setRun] = useState({ type: "Duty Cycle", setpoint: 0, on: false });
  const dev = devices.find((d) => d.key === sel);

  const patch = (key, fn) => setDevices((ds) => ds.map((d) => (d.key === key ? fn(d) : d)));
  const note = (m) => setLog((l) => [m, ...l].slice(0, 6));
  const setPending = (name, value) => patch(dev.key, (d) => ({ ...d, pending: { ...d.pending, [name]: value } }));
  const undoOne = (name) => patch(dev.key, (d) => { const { [name]: _drop, ...rest } = d.pending; return { ...d, pending: rest }; });

  const tasks = useMemo(() => {
    const ids = devices.map((d) => d.id);
    const g = devices.find((d) => d.id === goal.id);
    return [
      { text: `Give every controller a unique CAN ID (${MIN_ID}–${MAX_ID}) and persist it`, done: ids.every((i) => i >= MIN_ID && i <= MAX_ID) && new Set(ids).size === ids.length },
      { text: `On the controller with ID ${goal.id}, set ${Object.entries(goal.params).map(([k, v]) => `${k} = ${v}`).join(", ")}`, done: !!g && Object.entries(goal.params).every(([k, v]) => Number(valueOf(g, k)) === v) },
      { text: "Persist the changes so they survive a power cycle", done: !!g && Object.keys(g.pending).length === 0 && Object.entries(goal.params).every(([k, v]) => Number(g.values[k]) === v) },
    ];
  }, [devices, goal]);
  useEffect(() => { onProgress?.(tasks); }, [tasks, onProgress]);

  const nChanges = dev ? Object.keys(dev.pending).length : 0;
  const err = dev ? idError(devices, dev) : "";
  const q = query.trim().toLowerCase();
  const searchHits = q ? GROUPS.map((g) => ({ g, rows: PARAMS.filter((p) => p.group === g && `${g} ${p.name}`.toLowerCase().includes(q)) })).filter((x) => x.rows.length) : null;
  const groupChanged = (g) => PARAMS.some((p) => p.group === g && dev && p.name in dev.pending);

  const persist = () => {
    patch(dev.key, (d) => ({ ...d, id: d.pending[CAN] ?? d.id, values: { ...d.values, ...Object.fromEntries(Object.entries(d.pending).filter(([k]) => k !== CAN)) }, pending: {} }));
    note(`Persisted ${nChanges} change(s) on SPARK MAX ${dev.serial}`);
  };
  const doConfirm = () => {
    if (confirm === "undo") { patch(dev.key, (d) => ({ ...d, pending: {} })); note("Undid unsaved changes"); }
    else if (confirm === "safe") { patch(dev.key, (d) => ({ ...d, values: defaultValues(), pending: {} })); note("Safe parameters reset (CAN ID kept)"); }
    else if (confirm === "factory") { patch(dev.key, (d) => ({ ...d, id: 0, values: defaultValues(), pending: {} })); note("Factory reset: CAN ID back to 0"); }
    setConfirm(null);
  };

  const configuration = dev && (
    <div style={{ display: "flex", height: 460, position: "relative", border: "1px solid var(--ant-color-border-secondary, #d9d9d9)", borderRadius: 6, overflow: "hidden" }}>
      {!q && (
        <div style={{ width: 220, overflow: "auto", borderRight: "1px solid var(--ant-color-border-secondary, #d9d9d9)" }} className="max-md:hidden">
          <Menu mode="inline" selectedKeys={[group]} onClick={(e) => setGroup(e.key)} style={{ background: "transparent", borderInlineEnd: 0 }}
            items={GROUPS.map((g) => ({ key: g, label: <span style={{ fontWeight: groupChanged(g) ? 700 : 400 }}>{g}{groupChanged(g) ? " *" : ""}</span> }))} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 8, borderBottom: "1px solid var(--ant-color-border-secondary, #d9d9d9)" }}>
          <Input.Search allowClear placeholder="Search parameters..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search parameters" />
          {!q && <Select className="md:hidden" value={group} onChange={setGroup} options={GROUPS.map((g) => ({ value: g, label: g }))} style={{ width: "100%", marginTop: 8 }} />}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 12, paddingBottom: 90 }}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {searchHits
              ? searchHits.length
                ? searchHits.map(({ g, rows }, i) => (<div key={g}>{i > 0 && <Divider style={{ margin: "4px 0" }} />}<Typography.Text type="secondary" style={{ fontSize: 12 }}>{g}</Typography.Text>{rows.map((p) => <div key={p.name} style={{ marginTop: 8 }}><ParamRow p={p} dev={dev} onChange={setPending} onUndo={undoOne} /></div>)}</div>))
                : <Typography.Text type="secondary">No parameters found.</Typography.Text>
              : PARAMS.filter((p) => p.group === group).map((p) => <ParamRow key={p.name} p={p} dev={dev} onChange={setPending} onUndo={undoOne} />)}
          </Space>
        </div>
      </div>
      <FloatButton.Group trigger="hover" icon={<SafetyCertificateOutlined />} style={{ position: "absolute", insetInlineEnd: 84, bottom: 20 }}>
        <FloatButton icon={<DeleteOutlined style={{ color: "red" }} />} tooltip={{ title: "Complete factory reset", placement: "left" }} onClick={() => setConfirm("factory")} />
        <FloatButton icon={<UndoOutlined />} tooltip={{ title: "Reset safe parameters", placement: "left" }} onClick={() => setConfirm("safe")} />
        <FloatButton icon={<RollbackOutlined />} tooltip={{ title: `Undo ${nChanges} change(s)`, placement: "left" }} onClick={() => nChanges && setConfirm("undo")} />
      </FloatButton.Group>
      <FloatButton type="primary" icon={<CheckOutlined />} badge={{ count: nChanges }} tooltip={`Persist ${nChanges} change(s)`} aria-label="Persist changes" style={{ position: "absolute", insetInlineEnd: 24, bottom: 20, opacity: !nChanges || err ? 0.5 : 1 }} onClick={() => nChanges && !err && persist()} />
    </div>
  );

  const summary = dev && (
    <Descriptions column={1} size="small" bordered items={[
      { key: "m", label: "Device", children: "SPARK MAX" }, { key: "s", label: "Serial", children: dev.serial },
      { key: "f", label: "Firmware Version", children: dev.fw }, { key: "i", label: "CAN ID", children: dev.id },
      { key: "st", label: "Status", children: <Tag color="success">Enabled</Tag> }]} />
  );

  const utilities = (
    <Space direction="vertical" size="middle">
      <Space align="end" wrap>
        <label><Typography.Text type="secondary" style={{ fontSize: 12 }}>Control Type</Typography.Text><br />
          <Select value={run.type} onChange={(t) => setRun({ ...run, type: t })} options={["Duty Cycle", "Velocity", "Position"].map((v) => ({ value: v, label: v }))} style={{ width: 160 }} /></label>
        <label><Typography.Text type="secondary" style={{ fontSize: 12 }}>Setpoint</Typography.Text><br />
          <InputNumber value={run.setpoint} onChange={(x) => setRun({ ...run, setpoint: x ?? 0 })} style={{ width: 120 }} /></label>
        <Button type="primary" danger={run.on} onClick={() => setRun({ ...run, on: !run.on })}>{run.on ? "Stop Motor" : "Run Motor"}</Button>
      </Space>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>{run.on ? `Running ${run.type} at ${run.setpoint}. On a real robot the motor would move now; tune P 0 and friends on the Configuration tab.` : "Stopped."}</Typography.Text>
    </Space>
  );

  return (
    <ConfigProvider theme={tokensFor(dark)}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 12, border: "1px solid #46484a" }} aria-label="Hardware client mock">
        <Layout>
          <Layout.Header style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 48, lineHeight: "46px", background: dark ? "#27292b" : "#fff", borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)" }}>
            <Menu mode="horizontal" selectedKeys={[page]} onClick={(e) => setPage(e.key)} style={{ flex: 1, minWidth: 0, background: "transparent", borderBottom: 0 }}
              items={[{ key: "hardware", label: "Hardware" }, { key: "telemetry", label: "Telemetry" }, { key: "utilities", label: "Utilities", children: [{ key: "u1", label: "Firmware Utilities" }, { key: "u2", label: "DFU Drivers" }] }, { key: "downloads", label: "Downloads" }, { key: "about", label: "About" }]} />
            <Button type="text" size="small" icon={<LockOutlined />}>Read-only</Button>
            <Button type="text" size="small" icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={() => setDark(!dark)}>{dark ? "Light Mode" : "Dark Mode"}</Button>
          </Layout.Header>

          <Layout.Content style={{ minHeight: 420, padding: 16 }}>
            {page !== "hardware" ? <Typography.Text type="secondary">The {page} page is not part of this exercise. Use Hardware.</Typography.Text> : (
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Typography.Title level={5} style={{ margin: 0 }}>Connected Devices ({devices.length})</Typography.Title>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {devices.map((d) => {
                    const e = idError(devices, d);
                    return (
                      <Card key={d.key} hoverable size="small" onClick={() => setSel(d.key)} aria-label={`SPARK MAX ${effectiveId(d)}`} style={d.key === sel ? { borderColor: "#F15523" } : undefined}>
                        <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                          <div>
                            <Typography.Text strong>SPARK MAX</Typography.Text>{Object.keys(d.pending).length > 0 && <Typography.Text type="secondary"> •</Typography.Text>}
                            <div><Typography.Text type="secondary" style={{ fontSize: 12 }}>CAN ID {effectiveId(d)} · {d.serial}</Typography.Text></div>
                            <div style={{ marginTop: 4 }}>{d.id === 0 && <Tag color="warning" icon={<WarningOutlined />}>Unconfigured CAN ID</Tag>}{e && <Tag color="error">ID conflict</Tag>}</div>
                          </div>
                          <Tooltip title="Identify device"><Button type="text" size="small" aria-label="Identify" icon={<AimOutlined style={blink[d.key] ? { color: "#ff00ff" } : undefined} />}
                            onClick={(ev) => { ev.stopPropagation(); setBlink((b) => ({ ...b, [d.key]: true })); setTimeout(() => setBlink((b) => ({ ...b, [d.key]: false })), 3000); }} /></Tooltip>
                        </Space>
                      </Card>
                    );
                  })}
                </div>
              </Space>
            )}
          </Layout.Content>

          <Layout.Footer style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px", fontSize: 12, color: "#8c8d8e" }}>
            <span>Training mock — not the real application</span><span>Report an issue</span>
          </Layout.Footer>
        </Layout>

        <Drawer open={!!dev} onClose={() => setSel(null)} mask={false} getContainer={false} rootStyle={{ position: "absolute" }} size={760} destroyOnHidden
          title={dev && (
            <Space wrap>
              <span>SPARK MAX</span>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>CAN ID</Typography.Text>
              <InputNumber size="small" value={effectiveId(dev)} status={err ? "error" : undefined} onChange={(x) => (x === dev.id ? undoOne(CAN) : setPending(CAN, x ?? 0))} style={{ width: 90 }} aria-label="CAN ID" />
              {CAN in dev.pending && <Tag color="orange">changed</Tag>}
              {err && <Typography.Text type="danger" role="alert" style={{ fontSize: 12 }}>{err}</Typography.Text>}
            </Space>
          )}>
          {dev && (
            <>
              {dev.id === 0 && <Alert banner type="warning" showIcon message="Unconfigured CAN ID" description="Some functionalities may not work properly until a valid CAN ID is set for this device." style={{ marginBottom: 12 }} />}
              <Tabs activeKey={tab} onChange={setTab} items={[
                { key: "sum", label: "Summary", children: summary },
                { key: "cfg", label: <Typography.Text strong={nChanges > 0}>{`Configuration${nChanges ? " *" : ""}`}</Typography.Text>, children: configuration },
                { key: "util", label: "Utilities", children: utilities },
                { key: "upd", label: "Update", children: <Typography.Text type="secondary">Firmware updates are not part of this exercise.</Typography.Text> },
              ]} />
            </>
          )}
        </Drawer>

        <Modal open={!!confirm} onCancel={() => setConfirm(null)} onOk={doConfirm} okText="Confirm" cancelText="Not now" destroyOnHidden
          title={confirm === "undo" ? "Confirm Undo All Changes" : confirm === "safe" ? "Confirm Safe Reset" : "Confirm Factory Reset"}>
          {confirm === "undo" && "Unsaved edits on this device will be discarded."}
          {confirm === "safe" && "Parameters return to their defaults. The CAN ID is kept."}
          {confirm === "factory" && "All parameters return to factory defaults. This also resets the CAN ID."}
        </Modal>

        <div style={{ borderTop: "1px solid #46484a", padding: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", background: dark ? "#191c1e" : "#fafafa" }}>
          <section>
            <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>Your tasks</Typography.Text>
            <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>{tasks.map((t) => <li key={t.text} style={{ color: t.done ? "#52c41a" : undefined }}>{t.done ? "✓" : "○"} {t.text}</li>)}</ul>
          </section>
          <section>
            <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>Activity</Typography.Text>
            <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none", fontSize: 12 }}>{log.length ? log.map((l, i) => <li key={i}>{l}</li>) : <li>No activity yet.</li>}</ul>
          </section>
        </div>
      </div>
    </ConfigProvider>
  );
}
