// Animated SVG of the simulated mechanism (similar in spirit to reca.lc diagrams).
const W = 320, H = 240;
const ACCENT = "#7AADFF";
const GHOST = "#77777F";

export default function MechanismView({ mech, value, target, phase }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-zinc-950" role="img" aria-label={`${mech} animation`}>
      {mech === "elevator" && <Elevator y={value} target={target} />}
      {mech === "slide" && <Slide x={value} target={target} />}
      {mech === "pivot" && <Pivot angle={value} target={target} />}
      {mech === "flywheel" && <Flywheel speed={value} target={target} phase={phase} />}
    </svg>
  );
}

function Elevator({ y, target }) {
  const base = 210, top = 30, range = 1.5;
  const py = (v) => base - Math.max(0, Math.min(1.1, v / range)) * (base - top);
  return (
    <g>
      <rect x="110" y={top} width="8" height={base - top} fill="#3f3f46" />
      <rect x="202" y={top} width="8" height={base - top} fill="#3f3f46" />
      <rect x="90" y={base} width="140" height="10" fill="#52525b" />
      <line x1="95" x2="225" y1={py(target)} y2={py(target)} stroke={GHOST} strokeDasharray="5 4" />
      <text x="232" y={py(target) + 4} fill={GHOST} fontSize="11">target</text>
      <rect x="118" y={py(y) - 26} width="84" height="26" rx="3" fill={ACCENT} />
      <text x="160" y={py(y) - 8} fill="#000" fontSize="11" textAnchor="middle">{y.toFixed(2)} m</text>
    </g>
  );
}

function Slide({ x, target }) {
  const left = 40, right = 280, range = 1.5;
  const px = (v) => left + Math.max(0, Math.min(1.1, v / range)) * (right - left);
  return (
    <g>
      <rect x={left - 10} y="130" width={right - left + 40} height="8" fill="#3f3f46" />
      <rect x={left - 14} y="100" width="8" height="38" fill="#52525b" />
      <line x1={px(target)} x2={px(target)} y1="80" y2="130" stroke={GHOST} strokeDasharray="5 4" />
      <text x={px(target)} y="74" fill={GHOST} fontSize="11" textAnchor="middle">target</text>
      <rect x={px(x) - 22} y="98" width="44" height="32" rx="3" fill={ACCENT} />
      <text x={px(x)} y="118" fill="#000" fontSize="11" textAnchor="middle">{x.toFixed(2)} m</text>
    </g>
  );
}

function Pivot({ angle, target }) {
  const cx = 110, cy = 150, L = 120;
  const end = (a) => [cx + L * Math.cos(a), cy - L * Math.sin(a)];
  const [tx, ty] = end(target);
  const [ex, ey] = end(angle);
  return (
    <g>
      <rect x={cx - 6} y={cy} width="12" height="60" fill="#52525b" />
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={GHOST} strokeWidth="6" strokeDasharray="6 5" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={ACCENT} strokeWidth="10" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="9" fill="#e4e4e7" />
      <text x="250" y="40" fill="#999" fontSize="12" textAnchor="end">{(angle * 180 / Math.PI).toFixed(0)}°</text>
    </g>
  );
}

function Flywheel({ speed, target, phase }) {
  const cx = 160, cy = 120, r = 70;
  const spokes = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = phase + (i * Math.PI) / 3;
    return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke={ACCENT} strokeWidth="5" strokeLinecap="round" />;
  });
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#3f3f46" strokeWidth="6" />
      {spokes}
      <circle cx={cx} cy={cy} r="8" fill="#e4e4e7" />
      <text x={cx} y="215" fill="#999" fontSize="12" textAnchor="middle">
        {speed.toFixed(0)} / {target} rad/s
      </text>
    </g>
  );
}
