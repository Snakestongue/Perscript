// Simple physics for the PID tuning activity.
// The "true" plant uses the same terms students tune:
//   volts = kS*sign(v) + kG(*cos) + kV*v + kA*a   ->   a = (V - kS*sign(v) - kG - kV*v) / kA

export const DT = 0.005;
export const DURATION = 4;

export const MECHANISMS = {
  elevator: {
    label: "Elevator",
    unit: "m",
    kind: "position",
    start: 0,
    plant: { kS: 0.25, kG: 0.6, kV: 2.5, kA: 0.15 },
    gravity: "constant",
    maxVel: 1.5,
    maxAccel: 4,
    blurb: "Gravity always pulls down, so you need a constant kG.",
  },
  pivot: {
    label: "Arm / Pivot",
    unit: "rad",
    kind: "position",
    start: 0,
    plant: { kS: 0.2, kG: 0.8, kV: 1.2, kA: 0.1 },
    gravity: "cosine",
    maxVel: 4,
    maxAccel: 12,
    blurb: "Gravity changes with angle, so kG is multiplied by cos(angle).",
  },
  slide: {
    label: "Horizontal Slide",
    unit: "m",
    kind: "position",
    start: 0,
    plant: { kS: 0.3, kG: 0, kV: 3.0, kA: 0.2 },
    gravity: "none",
    maxVel: 1.2,
    maxAccel: 3,
    blurb: "No gravity, just friction and inertia. kG stays at 0.",
  },
  flywheel: {
    label: "Flywheel",
    unit: "rad/s",
    kind: "velocity",
    start: 0,
    plant: { kS: 0.15, kG: 0, kV: 0.02, kA: 0.01 },
    gravity: "none",
    maxVel: 0,
    maxAccel: 600,
    blurb: "Velocity control. kV does most of the work.",
  },
};

export const CONDITIONS = {
  nominal: { label: "Nominal", mass: 1, friction: 1, battery: 12 },
  heavy: { label: "Heavy load", mass: 2, friction: 1, battery: 12 },
  sticky: { label: "High friction", mass: 1, friction: 2.5, battery: 12 },
  lowBattery: { label: "Low battery (9 V)", mass: 1, friction: 1, battery: 9 },
};

// Challenges: setpoint plus pass criteria.
export const CHALLENGES = [
  { id: "slide-1", mech: "slide", cond: "nominal", target: 1, title: "Slide to 1 m", goal: { settle: 2.0, overshoot: 10, sse: 0.02 }, hint: "Start with kV and kS, then add a little kP." },
  { id: "elev-1", mech: "elevator", cond: "nominal", target: 1, title: "Raise the elevator", goal: { settle: 2.0, overshoot: 5, sse: 0.02 }, hint: "Without kG the elevator sags. Try kG near 0.6." },
  { id: "elev-2", mech: "elevator", cond: "heavy", target: 1.2, title: "Elevator carrying a game piece", goal: { settle: 2.5, overshoot: 5, sse: 0.02 }, hint: "Mass raises kG and kA. Retune them." },
  { id: "pivot-1", mech: "pivot", cond: "nominal", target: 1.2, title: "Arm to 70°", goal: { settle: 1.5, overshoot: 8, sse: 0.03 }, hint: "kG * cos(angle) fights gravity, so the hold needs it." },
  { id: "pivot-2", mech: "pivot", cond: "lowBattery", target: 1.5, title: "Arm on a weak battery", goal: { settle: 2.0, overshoot: 8, sse: 0.03 }, hint: "Voltage is capped at 9 V, so don't ask for too much." },
  { id: "fly-1", mech: "flywheel", cond: "nominal", target: 300, title: "Spin up to 300 rad/s", goal: { settle: 1.5, overshoot: 5, sse: 6 }, hint: "kV ≈ 12 / max speed gets you close." },
  { id: "fly-2", mech: "flywheel", cond: "sticky", target: 300, title: "Flywheel with high friction", goal: { settle: 2.0, overshoot: 5, sse: 6 }, hint: "Friction needs kS, and a bit of I removes the leftover error." },
];

// Trapezoid profile for position mechanisms; ramp for velocity mechanisms.
function makeProfile(mech, from, to) {
  const d = to - from;
  const dir = Math.sign(d) || 1;
  const dist = Math.abs(d);
  if (mech.kind === "velocity") {
    const a = mech.maxAccel;
    const tRamp = dist / a;
    return (t) => {
      if (t >= tRamp) return { p: to, v: 0, a: 0 };
      return { p: from + dir * a * t, v: dir * a * t, a: dir * a };
    };
  }
  let vmax = mech.maxVel;
  const amax = mech.maxAccel;
  if (vmax * vmax / amax > dist) vmax = Math.sqrt(dist * amax);
  const tAcc = vmax / amax;
  const dAcc = 0.5 * amax * tAcc * tAcc;
  const tCruise = (dist - 2 * dAcc) / vmax;
  const tTotal = 2 * tAcc + tCruise;
  return (t) => {
    if (t >= tTotal) return { p: to, v: 0, a: 0 };
    let s, v, a;
    if (t < tAcc) { a = amax; v = amax * t; s = 0.5 * amax * t * t; }
    else if (t < tAcc + tCruise) { a = 0; v = vmax; s = dAcc + vmax * (t - tAcc); }
    else { const td = t - tAcc - tCruise; a = -amax; v = vmax - amax * td; s = dAcc + vmax * tCruise + vmax * td - 0.5 * amax * td * td; }
    return { p: from + dir * s, v: dir * v, a: dir * a };
  };
}

export function simulate(mechId, condId, target, gains, scale = {}) {
  const mech = MECHANISMS[mechId];
  const cond = CONDITIONS[condId];
  const { kP, kI, kD, kS, kG, kV, kA } = gains;
  const plant = {
    kS: mech.plant.kS * cond.friction * (scale.kS ?? 1),
    kG: mech.plant.kG * cond.mass * (scale.kG ?? 1),
    kV: mech.plant.kV * (scale.kV ?? 1),
    kA: mech.plant.kA * cond.mass * (scale.kA ?? 1),
  };
  const profile = makeProfile(mech, mech.start, target);
  const isVel = mech.kind === "velocity";

  let pos = mech.start, vel = 0, integral = 0, prevErr = null;
  const data = [];

  for (let t = 0; t <= DURATION + 1e-9; t += DT) {
    const ref = profile(t);
    const measured = isVel ? vel : pos;
    const err = ref.p - measured;
    integral += err * DT;
    const iTerm = Math.max(-3, Math.min(3, kI * integral));
    const dErr = prevErr === null ? 0 : (err - prevErr) / DT;
    prevErr = err;

    const gFactor = mech.gravity === "cosine" ? Math.cos(pos) : mech.gravity === "constant" ? 1 : 0;
    const refDir = Math.sign(isVel ? ref.p : ref.v) || Math.sign(err);
    let volts = kP * err + iTerm + kD * dErr
      + kS * (Math.abs(err) > 1e-6 ? Math.sign(err) : 0)
      + kG * gFactor + kV * (isVel ? ref.p : ref.v) + kA * ref.a;
    void refDir;
    volts = Math.max(-cond.battery, Math.min(cond.battery, volts));

    // plant
    const gravVolts = plant.kG * gFactor;
    const fric = Math.abs(vel) > 1e-4 ? plant.kS * Math.sign(vel) : 0;
    let netVolts = volts - gravVolts - plant.kV * vel - fric;
    // stiction: not enough voltage to start moving
    if (Math.abs(vel) <= 1e-4 && Math.abs(volts - gravVolts) <= plant.kS) netVolts = 0;
    else if (Math.abs(vel) <= 1e-4) netVolts -= plant.kS * Math.sign(volts - gravVolts);
    const acc = netVolts / plant.kA;
    vel += acc * DT;
    pos += vel * DT;
    if (mech.kind === "position" && mech.gravity !== "cosine" && pos < 0) { pos = 0; if (vel < 0) vel = 0; }

    if (Math.round(t / DT) % 4 === 0) {
      data.push({ t: +t.toFixed(3), ref: ref.p, y: isVel ? vel : pos, volts });
    }
  }
  return { data, metrics: computeMetrics(data, mech.start, target) };
}

function computeMetrics(data, start, target) {
  const step = Math.abs(target - start) || 1;
  const dir = Math.sign(target - start) || 1;
  const band = 0.02 * step;
  let settle = DURATION;
  for (let i = data.length - 1; i >= 0; i--) {
    if (Math.abs(data[i].y - target) > band) { settle = i === data.length - 1 ? DURATION : data[i + 1].t; break; }
    if (i === 0) settle = 0;
  }
  const peak = Math.max(...data.map((d) => (d.y - target) * dir));
  const overshoot = Math.max(0, (peak / step) * 100);
  const sse = Math.abs(data[data.length - 1].y - target);
  const settled = Math.abs(data[data.length - 1].y - target) <= band;
  return { settle: settled ? settle : null, overshoot, sse };
}

export function evaluate(metrics, goal) {
  return {
    settle: metrics.settle !== null && metrics.settle <= goal.settle,
    overshoot: metrics.overshoot <= goal.overshoot,
    sse: metrics.sse <= goal.sse,
  };
}

// Random challenge: random mechanism, condition, target and slightly
// different plant constants, so feedforward values must be re-discovered.
const TARGET_RANGE = {
  elevator: [0.4, 1.4],
  slide: [0.4, 1.2],
  pivot: [0.4, 1.5],
  flywheel: [150, 300],
};
let randomCount = 0;
export function randomChallenge() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const jitter = () => +(0.8 + Math.random() * 0.4).toFixed(2);
  const mechId = pick(Object.keys(MECHANISMS));
  const condId = pick(Object.keys(CONDITIONS));
  const [lo, hi] = TARGET_RANGE[mechId];
  const raw = lo + Math.random() * (hi - lo);
  const target = mechId === "flywheel" ? Math.round(raw / 10) * 10 : +raw.toFixed(2);
  const m = MECHANISMS[mechId];
  randomCount += 1;
  return {
    id: `random-${randomCount}`,
    random: true,
    mech: mechId,
    cond: condId,
    target,
    scale: { kS: jitter(), kG: jitter(), kV: jitter(), kA: jitter() },
    title: `Random: ${m.label}, ${CONDITIONS[condId].label}, ${target} ${m.unit}`,
    goal: { settle: 2.0, overshoot: 8, sse: +(0.02 * target).toFixed(3) },
    hint: "This mechanism's constants are slightly different from the standard ones. Tune by feel.",
  };
}
