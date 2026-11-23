// Parameter catalogue for the hardware-client mock (SPARK MAX).
// Names, groups, units and descriptions follow the real client's parameter table.
export const GROUPS = ["Basic", "Closed Loop Control", "Closed Loop Control Slot 0", "Limits"];

const f = (name, group, def, description, unit = "") => ({ name, group, def, type: "float", description, unit });
const b = (name, group, def, description) => ({ name, group, def, type: "bool", description });
const e = (name, group, def, options, description) => ({ name, group, def, type: "enum", options, description });

export const PARAMS = [
  e("Motor Type", "Basic", "Brushless", ["Brushed", "Brushless"], "The motor type of the motor connected to the Spark."),
  e("Idle Mode", "Basic", "Brake", ["Coast", "Brake"], "Spark's disabled behavior type."),
  b("Inverted", "Basic", false, "Sets whether the direction the motor is driven is inverted."),
  f("Open Loop Ramp Rate", "Basic", 0, "Ramp rate for the duty cycle applied to the motor with open-loop control (change in duty cycle per second).", "setpoint/s"),

  e("Closed Loop Control Sensor", "Closed Loop Control", "Primary Encoder", ["Primary Encoder", "Analog", "Alternate Encoder", "Absolute Encoder"], "The reference/feedback sensor type used for closed loop motor control."),
  f("Closed Loop Ramp Rate", "Closed Loop Control", 0, "Ramp rate for the duty cycle applied to the motor with closed-loop control.", "setpoint/s"),
  e("Voltage Compensation Mode", "Closed Loop Control", "Disabled", ["Disabled", "Nominal"], "Sets the type of voltage compensation."),
  f("Compensated Nominal Voltage", "Closed Loop Control", 12, "Nominal voltage the device tries to operate at when voltage compensation is on.", "V"),
  b("Position PID Wrap Enable", "Closed Loop Control", false, "Whether the position value used in PID wraps between the min and max input."),

  f("P 0", "Closed Loop Control Slot 0", 0, "PID slot 0 error proportion factor for PID control."),
  f("I 0", "Closed Loop Control Slot 0", 0, "PID slot 0 error integral factor for PID control.", "1/s"),
  f("D 0", "Closed Loop Control Slot 0", 0, "PID slot 0 error derivative factor for PID control.", "s"),
  f("V 0", "Closed Loop Control Slot 0", 0, "PID slot 0 velocity feed forward factor."),
  f("S 0", "Closed Loop Control Slot 0", 0, "PID slot 0: feed forward static gain, applied while in motion."),
  f("A 0", "Closed Loop Control Slot 0", 0, "PID slot 0: feed forward acceleration gain, applied while accelerating."),
  f("G 0", "Closed Loop Control Slot 0", 0, "PID slot 0: feed forward linear gravity gain (constant gravity load, e.g. an elevator)."),
  f("Cos 0", "Closed Loop Control Slot 0", 0, "PID slot 0: feed forward cosine gravity gain (non-linear gravity load, e.g. an arm)."),
  f("IZone 0", "Closed Loop Control Slot 0", 0, "Upper limit of error for which the integral term is allowed to accumulate. 0 disables the limit."),
  f("Output Min 0", "Closed Loop Control Slot 0", -1, "PID slot 0 output minimum limit."),
  f("Output Max 0", "Closed Loop Control Slot 0", 1, "PID slot 0 output maximum limit."),

  b("Soft Limit Fwd En", "Limits", false, "Sets whether the soft forward limit is enabled."),
  b("Soft Limit Rev En", "Limits", false, "Sets whether the soft reverse limit is enabled."),
  f("Soft Limit Forward", "Limits", 0, "Software forward limit. Stops the motor from moving forward after crossing the set value.", "rotations"),
  f("Soft Limit Reverse", "Limits", 0, "Software reverse limit. Stops the motor from moving in reverse after crossing the set value.", "rotations"),
  e("Hard Limit Fwd En", "Limits", "Disabled", ["Disabled", "Enabled"], "The forward limit switch mode."),
  e("Hard Limit Rev En", "Limits", "Disabled", ["Disabled", "Enabled"], "The reverse limit switch mode."),
];

export const defaultValues = () => Object.fromEntries(PARAMS.map((p) => [p.name, p.def]));

// Three controllers fresh out of the box: every one is still on CAN ID 0.
// `id` and `values` are what is stored on the device; `pending` holds edits not yet persisted.
export const INITIAL_DEVICES = [
  { key: "a", serial: "0x31A2F7C4", fw: "25.0.2", id: 0, values: defaultValues(), pending: {} },
  { key: "b", serial: "0x31A2F81E", fw: "25.0.2", id: 0, values: defaultValues(), pending: {} },
  { key: "c", serial: "0x31A2F9B0", fw: "25.0.2", id: 0, values: defaultValues(), pending: {} },
];

export const MIN_ID = 1;
export const MAX_ID = 62;
