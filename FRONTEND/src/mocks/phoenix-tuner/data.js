// Config catalogue for the Phoenix tuner mock (Talon FX). Field names match Phoenix 6 config classes.
export const MIN_ID = 1;
export const MAX_ID = 62;

export const CONFIG_GROUPS = [
  {
    name: "Slot 0 Gains",
    fields: [
      { key: "kP", def: 0, help: "Proportional gain: output volts per unit of error." },
      { key: "kI", def: 0, help: "Integral gain: output volts per unit of accumulated error." },
      { key: "kD", def: 0, help: "Derivative gain: output volts per unit of error rate." },
      { key: "kS", def: 0, help: "Static feedforward: volts to overcome friction, applied in the direction of motion." },
      { key: "kV", def: 0, help: "Velocity feedforward: volts per unit of target velocity." },
      { key: "kA", def: 0, help: "Acceleration feedforward: volts per unit of target acceleration." },
      { key: "kG", def: 0, help: "Gravity feedforward: volts to hold the mechanism against gravity." },
      { key: "GravityType", def: "Elevator_Static", options: ["Elevator_Static", "Arm_Cosine"], help: "How kG is applied: constant (elevator) or scaled by cosine of the angle (arm)." },
    ],
  },
  {
    name: "Motor Output",
    fields: [
      { key: "Inverted", def: "CounterClockwise_Positive", options: ["CounterClockwise_Positive", "Clockwise_Positive"], help: "Which rotation direction counts as positive output." },
      { key: "NeutralMode", def: "Coast", options: ["Coast", "Brake"], help: "Behaviour when output is neutral." },
      { key: "DutyCycleNeutralDeadband", def: 0, help: "Output below this magnitude is treated as neutral." },
    ],
  },
  {
    name: "Current Limits",
    fields: [
      { key: "StatorCurrentLimit", def: 120, help: "Maximum motor (stator) current, in amps." },
      { key: "StatorCurrentLimitEnable", def: "false", options: ["false", "true"], help: "Whether the stator current limit is enforced." },
      { key: "SupplyCurrentLimit", def: 70, help: "Maximum supply current drawn from the battery, in amps." },
      { key: "SupplyCurrentLimitEnable", def: "false", options: ["false", "true"], help: "Whether the supply current limit is enforced." },
    ],
  },
  {
    name: "Motion Magic",
    fields: [
      { key: "MotionMagicCruiseVelocity", def: 0, help: "Peak velocity of the motion profile (rotations per second)." },
      { key: "MotionMagicAcceleration", def: 0, help: "Acceleration of the motion profile (rotations per second squared)." },
      { key: "MotionMagicJerk", def: 0, help: "Jerk limit of the motion profile; 0 disables smoothing (S-curve)." },
    ],
  },
];

export const defaultConfig = () => Object.fromEntries(CONFIG_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.def])));

// Three controllers straight from the box: all on ID 0, no names.
export const INITIAL_DEVICES = [
  { key: "t1", id: 0, name: "", serial: "0x0D4A1C20", fw: "26.1.0", config: defaultConfig() },
  { key: "t2", id: 0, name: "", serial: "0x0D4A1C77", fw: "26.1.0", config: defaultConfig() },
  { key: "t3", id: 0, name: "", serial: "0x0D4A1D05", fw: "26.1.0", config: defaultConfig() },
];
