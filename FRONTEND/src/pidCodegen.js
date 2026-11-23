// Turns tuned gains into starter code for each language / library.
import { MECHANISMS } from "./pidSim.js";

export const LANGUAGES = [
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
];

export const LIBRARIES = [
  { value: "wpimath", label: "WPILib (wpimath)" },
  { value: "ctre", label: "CTRE Phoenix 6 (TalonFX)" },
  { value: "rev", label: "REV (SparkMax)" },
];

const n = (v) => +Number(v).toFixed(4);

function wpimath(lang, mechId, g, target) {
  const m = MECHANISMS[mechId];
  const isVel = m.kind === "velocity";
  const ffClass = mechId === "elevator" ? "ElevatorFeedforward" : mechId === "pivot" ? "ArmFeedforward" : "SimpleMotorFeedforward";
  const hasG = mechId === "elevator" || mechId === "pivot";
  const ffArgs = hasG ? `${n(g.kS)}, ${n(g.kG)}, ${n(g.kV)}, ${n(g.kA)}` : `${n(g.kS)}, ${n(g.kV)}, ${n(g.kA)}`;
  const calcArg = mechId === "pivot" ? "angleRad, velocity" : "velocity";
  if (lang === "java") {
    return isVel
      ? `PIDController pid = new PIDController(${n(g.kP)}, ${n(g.kI)}, ${n(g.kD)});
SimpleMotorFeedforward ff = new SimpleMotorFeedforward(${ffArgs});

// call every loop (setpoint ${target} ${m.unit})
double volts = pid.calculate(encoder.getVelocity(), ${target})
             + ff.calculate(${target});
motor.setVoltage(volts);`
      : `ProfiledPIDController pid = new ProfiledPIDController(
    ${n(g.kP)}, ${n(g.kI)}, ${n(g.kD)},
    new TrapezoidProfile.Constraints(${m.maxVel}, ${m.maxAccel}));
${ffClass} ff = new ${ffClass}(${ffArgs});

// call every loop (goal ${target} ${m.unit})
double volts = pid.calculate(encoder.getPosition(), ${target});
double velocity = pid.getSetpoint().velocity;${mechId === "pivot" ? "\ndouble angleRad = encoder.getPosition();" : ""}
volts += ff.calculate(${calcArg});
motor.setVoltage(volts);`;
  }
  if (lang === "cpp") {
    return isVel
      ? `frc::PIDController pid{${n(g.kP)}, ${n(g.kI)}, ${n(g.kD)}};
frc::SimpleMotorFeedforward<units::radians> ff{
    units::volt_t{${n(g.kS)}}, units::volt_t{${n(g.kV)}} / 1_rad_per_s,
    units::volt_t{${n(g.kA)}} / 1_rad_per_s_sq};

// call every loop (setpoint ${target} rad/s)
double volts = pid.Calculate(encoder.GetVelocity(), ${target})
             + ff.Calculate(units::radians_per_second_t{${target}}).value();
motor.SetVoltage(units::volt_t{volts});`
      : `// Unit types simplified: wrap values in your mechanism's units (meters / radians).
frc::ProfiledPIDController<units::${mechId === "pivot" ? "radians" : "meters"}> pid{
    ${n(g.kP)}, ${n(g.kI)}, ${n(g.kD)},
    {${m.maxVel}_${mechId === "pivot" ? "rad_per_s" : "mps"}, ${m.maxAccel}_${mechId === "pivot" ? "rad_per_s_sq" : "mps_sq"}}};
// Feedforward gains: ${hasG ? "kS, kG, kV, kA" : "kS, kV, kA"} = ${ffArgs}
// (use frc::${ffClass} with your unit types)

// call every loop (goal ${target} ${m.unit})
double volts = pid.Calculate(units::${mechId === "pivot" ? "radian" : "meter"}_t{encoder.GetPosition()},
                             units::${mechId === "pivot" ? "radian" : "meter"}_t{${target}}).value();
// volts += ff.Calculate(...) using pid.GetSetpoint().velocity
motor.SetVoltage(units::volt_t{volts});`;
  }
  // python
  return isVel
    ? `from wpimath.controller import PIDController, SimpleMotorFeedforwardMeters

pid = PIDController(${n(g.kP)}, ${n(g.kI)}, ${n(g.kD)})
ff = SimpleMotorFeedforwardMeters(${ffArgs})

# call every loop (setpoint ${target} ${m.unit})
volts = pid.calculate(encoder.getVelocity(), ${target}) + ff.calculate(${target})
motor.setVoltage(volts)`
    : `from wpimath.controller import ProfiledPIDController, ${ffClass}
from wpimath.trajectory import TrapezoidProfile

pid = ProfiledPIDController(
    ${n(g.kP)}, ${n(g.kI)}, ${n(g.kD)},
    TrapezoidProfile.Constraints(${m.maxVel}, ${m.maxAccel}),
)
ff = ${ffClass}(${ffArgs})

# call every loop (goal ${target} ${m.unit})
volts = pid.calculate(encoder.getPosition(), ${target})
velocity = pid.getSetpoint().velocity
volts += ff.calculate(${mechId === "pivot" ? "encoder.getPosition(), velocity" : "velocity"})
motor.setVoltage(volts)`;
}

function ctre(lang, mechId, g, target) {
  const m = MECHANISMS[mechId];
  const isVel = m.kind === "velocity";
  const gravity = mechId === "elevator" ? "Elevator_Static" : mechId === "pivot" ? "Arm_Cosine" : null;
  const note = `Phoenix 6 gains are in volts per mechanism rotation (or rotation/s).
Convert ${m.unit} to rotations with your sensor-to-mechanism ratio.`;
  if (lang === "java") {
    return `// ${note.replace("\n", "\n// ")}
TalonFX motor = new TalonFX(1);
Slot0Configs slot0 = new Slot0Configs()
    .withKP(${n(g.kP)}).withKI(${n(g.kI)}).withKD(${n(g.kD)})
    .withKS(${n(g.kS)}).withKV(${n(g.kV)}).withKA(${n(g.kA)})${gravity ? `
    .withKG(${n(g.kG)}).withGravityType(GravityTypeValue.${gravity})` : ""};
${isVel ? "" : `MotionMagicConfigs mm = new MotionMagicConfigs()
    .withMotionMagicCruiseVelocity(${m.maxVel})
    .withMotionMagicAcceleration(${m.maxAccel});
motor.getConfigurator().apply(mm);
`}motor.getConfigurator().apply(slot0);

// ${isVel ? "VelocityVoltage" : "MotionMagicVoltage"} runs the PID + feedforward on the motor controller
motor.setControl(new ${isVel ? "VelocityVoltage" : "MotionMagicVoltage"}(${target}));`;
  }
  if (lang === "cpp") {
    return `// ${note.replace("\n", "\n// ")}
ctre::phoenix6::hardware::TalonFX motor{1};
ctre::phoenix6::configs::Slot0Configs slot0{};
slot0.kP = ${n(g.kP)}; slot0.kI = ${n(g.kI)}; slot0.kD = ${n(g.kD)};
slot0.kS = ${n(g.kS)}; slot0.kV = ${n(g.kV)}; slot0.kA = ${n(g.kA)};${gravity ? `
slot0.kG = ${n(g.kG)};
slot0.GravityType = ctre::phoenix6::signals::GravityTypeValue::${gravity.replace("_", "_")};` : ""}
${isVel ? "" : `ctre::phoenix6::configs::MotionMagicConfigs mm{};
mm.MotionMagicCruiseVelocity = ${m.maxVel}_tps;
mm.MotionMagicAcceleration = ${m.maxAccel}_tr_per_s_sq;
motor.GetConfigurator().Apply(mm);
`}motor.GetConfigurator().Apply(slot0);

motor.SetControl(ctre::phoenix6::controls::${isVel ? "VelocityVoltage" : "MotionMagicVoltage"}{${isVel ? `units::turns_per_second_t{${target}}` : `units::turn_t{${target}}`}});`;
  }
  return `# ${note.replace("\n", "\n# ")}
from phoenix6 import hardware, configs, controls${gravity ? ", signals" : ""}

motor = hardware.TalonFX(1)
slot0 = (
    configs.Slot0Configs()
    .with_k_p(${n(g.kP)}).with_k_i(${n(g.kI)}).with_k_d(${n(g.kD)})
    .with_k_s(${n(g.kS)}).with_k_v(${n(g.kV)}).with_k_a(${n(g.kA)})${gravity ? `
    .with_k_g(${n(g.kG)}).with_gravity_type(signals.GravityTypeValue.${gravity.toUpperCase()})` : ""}
)
${isVel ? "" : `mm = (
    configs.MotionMagicConfigs()
    .with_motion_magic_cruise_velocity(${m.maxVel})
    .with_motion_magic_acceleration(${m.maxAccel})
)
motor.configurator.apply(mm)
`}motor.configurator.apply(slot0)

motor.set_control(controls.${isVel ? "VelocityVoltage" : "MotionMagicVoltage"}(${target}))`;
}

function rev(lang, mechId, g, target) {
  const m = MECHANISMS[mechId];
  const isVel = m.kind === "velocity";
  const hasG = mechId === "elevator" || mechId === "pivot";
  const duty = (v) => n(v / 12);
  const note = `REV closed-loop output is duty cycle (-1..1), so volts-based gains are divided by 12 here.
Feedforward is sent as arbitrary volts with each setpoint. Check units against your encoder conversion factors.`;
  const ffExpr = hasG
    ? `${n(g.kS)} + ${n(g.kG)}${mechId === "pivot" ? " * Math.cos(angleRad)" : ""} + ${n(g.kV)} * velocitySetpoint`
    : `${n(g.kS)} + ${n(g.kV)} * velocitySetpoint`;
  if (lang === "java") {
    return `// ${note.replace(/\n/g, "\n// ")}
SparkMax motor = new SparkMax(1, MotorType.kBrushless);
SparkMaxConfig config = new SparkMaxConfig();
config.closedLoop
    .feedbackSensor(FeedbackSensor.kPrimaryEncoder)
    .pid(${duty(g.kP)}, ${duty(g.kI)}, ${duty(g.kD)})${isVel ? "" : `;
config.closedLoop.maxMotion
    .maxVelocity(${m.maxVel})
    .maxAcceleration(${m.maxAccel})`};
motor.configure(config, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters);

// call every loop (setpoint ${target} ${m.unit})
double arbFF = ${ffExpr.replace("velocitySetpoint", isVel ? String(target) : "velocitySetpoint")};
motor.getClosedLoopController().setReference(
    ${target}, ControlType.${isVel ? "kVelocity" : "kMAXMotionPositionControl"},
    ClosedLoopSlot.kSlot0, arbFF, ArbFFUnits.kVoltage);`;
  }
  if (lang === "cpp") {
    return `// ${note.replace(/\n/g, "\n// ")}
rev::spark::SparkMax motor{1, rev::spark::SparkLowLevel::MotorType::kBrushless};
rev::spark::SparkMaxConfig config;
config.closedLoop
    .SetFeedbackSensor(rev::spark::ClosedLoopConfig::FeedbackSensor::kPrimaryEncoder)
    .Pid(${duty(g.kP)}, ${duty(g.kI)}, ${duty(g.kD)});${isVel ? "" : `
config.closedLoop.maxMotion
    .MaxVelocity(${m.maxVel})
    .MaxAcceleration(${m.maxAccel});`}
motor.Configure(config, rev::spark::SparkBase::ResetMode::kResetSafeParameters,
                rev::spark::SparkBase::PersistMode::kPersistParameters);

// call every loop (setpoint ${target} ${m.unit})
double arbFF = ${ffExpr.replace("velocitySetpoint", isVel ? String(target) : "velocitySetpoint").replace("Math.cos", "std::cos")};
motor.GetClosedLoopController().SetReference(
    ${target}, rev::spark::SparkLowLevel::ControlType::${isVel ? "kVelocity" : "kMAXMotionPositionControl"},
    rev::spark::kSlot0, arbFF, rev::spark::SparkClosedLoopController::ArbFFUnits::kVoltage);`;
  }
  return `# ${note.replace(/\n/g, "\n# ")}
from rev import SparkMax, SparkMaxConfig, SparkBase, ClosedLoopConfig, ClosedLoopSlot, SparkLowLevel
${hasG && mechId === "pivot" ? "import math\n" : ""}
motor = SparkMax(1, SparkLowLevel.MotorType.kBrushless)
config = SparkMaxConfig()
config.closedLoop.setFeedbackSensor(ClosedLoopConfig.FeedbackSensor.kPrimaryEncoder).pid(
    ${duty(g.kP)}, ${duty(g.kI)}, ${duty(g.kD)}
)${isVel ? "" : `
config.closedLoop.maxMotion.maxVelocity(${m.maxVel}).maxAcceleration(${m.maxAccel})`}
motor.configure(config, SparkBase.ResetMode.kResetSafeParameters, SparkBase.PersistMode.kPersistParameters)

# call every loop (setpoint ${target} ${m.unit})
arb_ff = ${ffExpr.replace("velocitySetpoint", isVel ? String(target) : "velocity_setpoint").replace("Math.cos(angleRad)", "math.cos(angle_rad)")}
motor.getClosedLoopController().setReference(
    ${target},
    SparkLowLevel.ControlType.${isVel ? "kVelocity" : "kMAXMotionPositionControl"},
    ClosedLoopSlot.kSlot0,
    arb_ff,
    SparkClosedLoopController.ArbFFUnits.kVoltage,
)`;
}

export function generateCode(lang, lib, mechId, gains, target) {
  if (lib === "ctre") return ctre(lang, mechId, gains, target);
  if (lib === "rev") return rev(lang, mechId, gains, target);
  return wpimath(lang, mechId, gains, target);
}
