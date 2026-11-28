import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Footer from "../components/Footer.js";
import SyntaxCode from "../components/SyntaxCode.js";

type ReferenceSection = "foundations" | "oop" | "frc" | "motors" | "sensors" | "control" | "structure" | "autonomous" | "hardware";

type CodeExample = { language: string; label?: string; code: string; };
type TopicSection = { title: string; description?: string; bullets?: string[]; examples?: CodeExample[]; };
type ReferenceTopic = { id: string; section: ReferenceSection; title: string; summary: string; sections: TopicSection[]; };

const referenceSections = {
  foundations: { eyebrow: "Reference · Java foundations", title: "Learn the Java tools used throughout robot code.", description: "Start with variables, types, operators, decisions, loops, and collections.", topics: [["javaStart", "Language basics"], ["controlFlow", "Loops & Conditionals"]] },
  oop: { eyebrow: "Reference · Object-oriented programming", title: "Understand how Java programs are organized.", description: "Learn classes, objects, constructors, fields, methods, and how subsystems use them.", topics: [["javaAdvance", "Classes & objects"], ["oopDeepDive", "OOP in robot code"]] },
  frc: { eyebrow: "Reference · FRC fundamentals", title: "Connect Java to the robot.", description: "Understand the roboRIO, command scheduler, subsystems, timing, and coordinate systems before diving into specific tools.", topics: [["frcConceptsCard", "FRC Concepts"]] },
  motors: { eyebrow: "Reference · Motor controllers", title: "Control the motors that move your robot.", description: "Each controller has one consolidated reference, from common methods to advanced control and configuration.", topics: [["sparkMaxCard", "SPARK MAX"], ["talonFXCard", "TalonFX"]] },
  hardware: { eyebrow: "Reference · Hardware (legacy route)", title: "Hardware reference", description: "Combined motor-controller, sensor, and pneumatics reference.", topics: [["sparkMaxCard", "SPARK MAX"], ["talonFXCard", "TalonFX"], ["sensorsCard", "Sensors & inputs"], ["pneumaticsCard", "Pneumatics & solenoids"]] },
  sensors: { eyebrow: "Reference · Sensors & pneumatics", title: "Measure the robot and control its actuators.", description: "Learn how to read physical state, detect game pieces, measure motion, and operate pneumatic devices.", topics: [["sensorsCard", "Sensors & inputs"], ["pneumaticsCard", "Pneumatics & solenoids"]] },
  control: { eyebrow: "Reference · Control systems", title: "Understand feedback and feedforward control.", description: "Learn what each PID and feedforward gain does, how they work together, and when to use motion profiles.", topics: [["pidFeedforwardCard", "PID & feedforward"]] },
  structure: { eyebrow: "Reference · Robot architecture", title: "Build a clean command-based robot project.", description: "Organize constants, subsystems, commands, triggers, and telemetry.", topics: [["constantsCard", "Constants"], ["robotContainerCard", "RobotContainer"], ["commandBasedCard", "Commands"], ["triggersCard", "Triggers & bindings"], ["dashboardCard", "Dashboard & telemetry"]] },
  autonomous: { eyebrow: "Reference · Autonomous & vision", title: "Build, localize, and debug autonomous routines.", description: "Connect dashboards, trajectory tools, named commands, PhotonVision, and Driver Station testing.", topics: [["autonomousToolsCard", "Autos"], ["visionCard", "PhotonVision"], ["driverStationCard", "Driver Station & testing"]] }
} as const;

const categoryLinks = [
  ["foundations", "/tut", "Java basics", "Syntax and control flow"],
  ["oop", "/tut?section=oop", "OOP", "Classes and objects"],
  ["frc", "/tut?section=frc", "FRC concepts", "How robot code works"],
  ["motors", "/tut?section=motors", "Motor controllers", "SPARK MAX and TalonFX"],
  ["sensors", "/tut?section=sensors", "Sensors", "Inputs and pneumatics"],
  ["control", "/tut?section=control", "Control systems", "PID and feedforward"],
  ["structure", "/tut?section=structure", "Robot structure", "Commands and organization"],
  ["autonomous", "/tut?section=autonomous", "Autonomous", "PathPlanner and vision"]
] as const;

const topics: ReferenceTopic[] = [
{
    id: "javaStart",
    section: "foundations",
    title: "Language basics",
    summary: "The small set of language tools you will use in nearly every robot project.",
    sections: [
      {
        title: "Common value types",
        description: "Choose a type based on the kind of value the robot needs to store.",
        bullets: [
          "Integer: a whole number, such as a CAN ID or controller port.",
          "Double: a decimal value, such as motor output, distance, or angle.",
          "Boolean: a true-or-false state, such as whether a limit switch is pressed.",
          "String: text used for labels, dashboard keys, or messages.",
        ],
        examples: [{ language: "Java", code: `int motorId = 3;\ndouble targetSpeed = 0.65;\nboolean enabled = true;\nString mechanism = "Intake";` }],
      },
      {
        title: "Operators and conditions",
        description: "Use arithmetic to calculate values, comparisons to test them, and logical operators to combine conditions.",
        bullets: [
          "Arithmetic: +, -, *, /, and remainder (%).",
          "Comparison: ==, !=, >, <, >=, and <=.",
          "Java logical operators: && means AND, || means OR, and ! means NOT.",
        ],
        examples: [{ language: "Java", label: "Conditional motor behavior", code: `if (enabled && targetSpeed > 0.0) {
    motor.set(targetSpeed);
} else {
    motor.stopMotor();
}` }],
      },
    ],
  },
{
    id: "controlFlow",
    section: "foundations",
    title: "Loops & Conditionals",
    summary: "Use control flow to make decisions, repeat work, and manage groups of values in robot code.",
    sections: [
      {
        title: "Conditionals",
        description: "A conditional chooses which block of code runs. Robot code uses these constantly to react to sensors, modes, and mechanism states.",
        bullets: [
          "if runs a block only when its condition is true.",
          "else if checks another condition when the earlier conditions were false.",
          "else provides a fallback when none of the earlier conditions match.",
          "Use == to compare primitive values; in Java, use .equals() for String contents.",
          "Combine conditions with && (both true), || (either true), and ! (not)."
        ],
        examples: [{ language: "Java", label: "Sensor-based decision", code: `if (beamBreak.get()) {
    intake.run(0.5);
} else if (operatorWantsEject) {
    intake.run(-0.4);
} else {
    intake.stop();
}` }]
      },
      {
        title: "for and while loops",
        description: "A for loop is useful when the number of repetitions is known. A while loop repeats while a condition remains true. Avoid long-running loops inside command methods: the command scheduler already provides a repeating robot loop.",
        bullets: [
          "A for loop can iterate through an array or list of motors, modules, or values.",
          "A while loop is appropriate for ordinary bounded program logic, but a blocking while loop in robot code can prevent the scheduler from updating.",
          "Put repeated robot behavior in execute() or subsystem periodic(), not in a loop that never yields.",
          "The main command scheduler normally runs every 20 ms, so one execute() call is one scheduler cycle."
        ],
        examples: [
          { language: "Java", label: "for loop", code: `for (int i = 0; i < 4; i++) {
    System.out.println("Module " + i);
}` },
          { language: "Java", label: "Iterating through values", code: `double[] targets = {10.0, 25.0, 40.0};

for (double target : targets) {
    System.out.println(target);
}` }
        ]
      }
    ]
  },
{
    id: "javaAdvance",
    section: "oop",
    title: "Classes and objects",
    summary: "Classes group state and behavior; objects are the working instances used by your robot code.",
    sections: [
      {
        title: "Classes, fields, and constructors",
        bullets: [
          "A class is a blueprint for one responsibility, such as an intake subsystem.",
          "Fields hold the state or hardware owned by that class.",
          "A constructor creates a usable object and initializes its dependencies.",
          "Keep implementation details private unless another class genuinely needs them.",
        ],
        examples: [{ language: "Java", code: `public class Intake {\n    private final TalonFX motor;\n\n    public Intake(int motorId) {\n        motor = new TalonFX(motorId);\n    }\n}` }],
      },
      {
        title: "Methods",
        description: "Methods expose the actions an object can perform while keeping its internal details contained.",
        examples: [
          { language: "Java", code: `public void run(double speed) {\n    motor.set(speed);\n}\n\npublic void stop() {\n    motor.stopMotor();\n}` },
        ],
      },
    ],
  },
{
    id: "oopDeepDive",
    section: "oop",
    title: "OOP in robot code",
    summary: "Understand how classes, objects, constructors, fields, and methods fit together in a command-based robot project.",
    sections: [
      {
        title: "Class vs. object",
        description: "A class defines what a type of thing knows and can do. An object is one actual instance of that class created while the program runs.",
        bullets: [
          "Intake is a class: it describes the fields and methods an intake mechanism should have.",
          "new Intake() creates an object: one actual intake subsystem instance.",
          "A robot can create one Intake object and pass that same object to commands that need it.",
          "Creating multiple motor-controller objects for the same physical CAN device is usually a mistake; create the hardware object once and reuse it."
        ],
        examples: [
          { language: "Java", label: "Create and use an object", code: `Intake intake = new Intake();

intake.run(0.5);
intake.stop();` }
        ]
      },
      {
        title: "Constructors and fields",
        description: "A constructor runs when an object is created. Use it to create hardware objects, store dependencies, and establish a safe initial configuration.",
        bullets: [
          "A constructor has the same name as its class and has no return type.",
          "Fields belong to an object and retain their values between method calls.",
          "Use this.field when a constructor parameter has the same name as a field.",
          "private prevents unrelated classes from directly changing internal state; public methods provide controlled access.",
          "final means a field reference cannot be reassigned after initialization. It does not make the referenced motor physically immutable."
        ],
        examples: [
          { language: "Java", code: `public class Intake extends SubsystemBase {
    private final TalonFX motor;

    public Intake(int canId) {
        motor = new TalonFX(canId);
    }

    public void run(double output) {
        motor.set(output);
    }
}` }
        ]
      },
      {
        title: "Methods, parameters, and return values",
        description: "A method is a named block of behavior. Parameters provide input; a return value sends information back to the code that called the method.",
        bullets: [
          "void means the method does not return a value.",
          "A method such as getPosition() can return a double.",
          "A parameter such as run(double speed) lets the caller choose the requested speed.",
          "Keep hardware-specific operations inside the subsystem that owns that hardware."
        ],
        examples: [
          { language: "Java", code: `public double getPositionRotations() {
    return motor.getPosition().getValueAsDouble();
}

public boolean isAtTarget(double target, double tolerance) {
    return Math.abs(getPositionRotations() - target) <= tolerance;
}` }
        ]
      },
      {
        title: "How the pieces connect",
        description: "A typical command-based project separates responsibilities: Robot starts the framework, RobotContainer wires objects together, subsystems own hardware, and commands request subsystem actions.",
        bullets: [
          "RobotContainer constructs the Intake subsystem once.",
          "A command receives the Intake object through its constructor.",
          "The command calls public methods such as intake.run() instead of directly reaching into the motor field.",
          "This makes the code easier to test, reuse, and debug."
        ],
        examples: [
          { language: "Java", code: `public class RunIntake extends Command {
    private final Intake intake;

    public RunIntake(Intake intake) {
        this.intake = intake;
        addRequirements(intake);
    }

    @Override
    public void execute() {
        intake.run(0.5);
    }
}` }
        ]
      }
    ]
  },
{
    id: "frcConceptsCard",
    section: "frc",
    title: "How an FRC robot project fits together",
    summary: "Connect the Java concepts you learned to the hardware, subsystems, command scheduler, and periodic robot loop.",
    sections: [
      {
        title: "The roboRIO and robot program",
        description: "The roboRIO runs the robot code and communicates with motor controllers, sensors, and the Driver Station.",
        bullets: [
          "The roboRIO is the main computer running the WPILib robot program.",
          "CAN connects devices such as TalonFX controllers, SPARK MAX controllers, and other CAN devices.",
          "PWM, DIO, analog input, and USB connections serve other hardware depending on the device.",
          "The Driver Station enables the robot and provides mode, joystick, match, and diagnostic information.",
          "A motor controller receives commands and drives a motor; a sensor reports information about the mechanism or field."
        ]
      },
      {
        title: "Subsystems and the command scheduler",
        description: "Command-based programming separates what a mechanism is from what the robot should do with it.",
        bullets: [
          "A subsystem represents a robot mechanism or coordinated hardware group, such as drivetrain, intake, elevator, or shooter.",
          "Subsystem classes own their motor controllers, sensors, and mechanism-level methods.",
          "Commands describe actions, such as intake a piece, move an elevator to a height, or drive a path.",
          "The command scheduler checks button triggers, schedules commands, calls subsystem periodic methods, and runs active commands.",
          "A subsystem should expose useful methods such as run(), stop(), getPosition(), and hasPiece() instead of exposing its motor object everywhere."
        ],
        examples: [
          { language: "Java", label: "A subsystem API", code: "public class Intake extends SubsystemBase {\n    private final TalonFX motor = new TalonFX(3);\n\n    public void run(double output) {\n        motor.set(output);\n    }\n\n    public void stop() {\n        motor.stopMotor();\n    }\n}" }
        ]
      },
      {
        title: "The robot loop and timing",
        bullets: [
          "The scheduler normally runs on a 20 ms loop, or 50 times per second.",
          "Do not use Thread.sleep() or an endless while loop in a command; blocking prevents other robot code from running on time.",
          "Put repeated command behavior in execute() and sensor sampling or telemetry in subsystem periodic().",
          "Use timers, command waits, and finish conditions instead of blocking the main robot thread.",
          "Keep each loop iteration short and predictable."
        ]
      },
      {
        title: "Robot-relative and field-relative movement",
        bullets: [
          "Robot-relative commands are expressed from the robot's own forward, sideways, and rotational axes.",
          "Field-relative commands are expressed using the field coordinate system, so forward remains field-forward as the robot rotates.",
          "A gyro supplies heading; odometry combines heading and wheel/module measurements to estimate robot pose.",
          "Pose means position plus orientation, commonly represented as x, y, and heading."
        ]
      }
    ]
  },
{
    id: "sparkMaxCard",
    section: "motors",
    title: "SPARK MAX",
    summary: "A single reference for common REV SPARK MAX methods, encoder feedback, configuration, and onboard closed-loop control.",
    sections: [{
        title: "Common motor methods",
        bullets: [
          "set(double output) commands a normalized duty-cycle output, usually from -1.0 to 1.0. For example, 0.25 requests roughly 25% output; it is not a measured speed.",
          "setVoltage(double volts) requests a specific motor voltage. It is useful when applying a feedforward calculation because the requested value is expressed in volts.",
          "stopMotor() requests zero output. Call it when a command ends so a mechanism does not keep running after its command is no longer scheduled.",
          "getAppliedOutput() returns the controller's applied output as a normalized value. It helps confirm what output the controller is applying, but it is not a speed measurement.",
          "getOutputCurrent() returns motor output current in amps. It is useful for telemetry and diagnosing a stalled or heavily loaded mechanism."
        ],
        examples: [
          { language: "Java", label: "Basic control and telemetry", code: `motor.set(0.35);
motor.setVoltage(6.0);

double appliedOutput = motor.getAppliedOutput();
double currentAmps = motor.getOutputCurrent();

motor.stopMotor();` }
        ]
      },
      {
        title: "Configuration objects",
        description: "Modern REVLib uses configuration objects to group settings before applying them to the controller. Exact fields and overloads can differ by REVLib release, so match the example to the vendordep installed in your project.",
        bullets: [
          "A SparkMaxConfig can hold inversion, idle mode, current limits, voltage compensation, encoder settings, and closed-loop gains.",
          "Configure a motor during subsystem construction or a dedicated setup method, not repeatedly inside execute().",
          "ResetMode controls whether existing controller settings are reset before applying the configuration.",
          "PersistMode controls whether settings are written to the controller's nonvolatile memory. Avoid unnecessary flash writes."
        ],
        examples: [
          { language: "Java", label: "REVLib configuration pattern", code: `SparkMax motor = new SparkMax(3, MotorType.kBrushless);

SparkMaxConfig config = new SparkMaxConfig();
config.inverted(false);
config.idleMode(IdleMode.kBrake);
config.smartCurrentLimit(40);

motor.configure(
    config,
    ResetMode.kResetSafeParameters,
    PersistMode.kPersistParameters
);` }
        ]
      },
      {
        title: "Encoder measurements",
        bullets: [
          "getPosition() returns the relative encoder position, normally in rotations unless conversion factors are configured.",
          "getVelocity() returns velocity, normally in RPM unless conversion factors are configured.",
          "setPosition() can establish a software zero for a relative encoder after the mechanism is physically placed at a known reference.",
          "Position and velocity conversion factors let code work in units such as meters and meters per second instead of raw motor rotations and RPM.",
          "Always verify the gear ratio, conversion factor, encoder direction, and units before using a measurement in a control loop."
        ],
        examples: [
          { language: "Java", code: `RelativeEncoder encoder = motor.getEncoder();

double rotations = encoder.getPosition();
double rpm = encoder.getVelocity();

encoder.setPosition(0.0); // Only when the mechanism is at its known zero` }
        ]
      },
      {
        title: "Onboard closed-loop control",
        description: "The SPARK controller can run a PID loop locally. The roboRIO sends a target; the controller reads its configured feedback sensor and adjusts motor output.",
        bullets: [
          "Configure the closed-loop gains before requesting a position or velocity target.",
          "ControlType.kVelocity expects a velocity setpoint; ControlType.kPosition expects a position setpoint.",
          "The setpoint units depend on the feedback sensor and configured conversion factors.",
          "Use conservative output limits and test with the mechanism safely supported because an incorrect target or unit can cause unexpected motion.",
          "Do not run two independent controllers that both write to the same motor at the same time."
        ],
        examples: [
          { language: "Java", code: `SparkClosedLoopController controller =
    motor.getClosedLoopController();

controller.setSetpoint(1200, ControlType.kVelocity); // RPM if using default units
controller.setSetpoint(5.0, ControlType.kPosition);  // rotations if using default units` }
        ]
      }]
  },
{
    id: "talonFXCard",
    section: "motors",
    title: "TalonFX and Phoenix 6",
    summary: "A single reference for common TalonFX methods, Phoenix 6 control requests, status signals, and configuration.",
    sections: [{
        title: "Duty cycle, voltage, and stopping",
        bullets: [
          "set(0.4) is a simple duty-cycle request and is useful for basic open-loop control.",
          "setVoltage(6.0) requests a voltage rather than a percentage of available bus voltage.",
          "stopMotor() stops the motor output.",
          "get() reports the last commanded output value; it is not a direct measurement of mechanism speed.",
          "Use voltage control when applying a WPILib feedforward voltage."
        ],
        examples: [
          { language: "Java", code: `TalonFX motor = new TalonFX(3);

motor.set(0.4);
motor.setVoltage(6.0);
motor.stopMotor();` }
        ]
      },
      {
        title: "Phoenix 6 control requests",
        description: "Phoenix 6 uses request objects for many advanced control modes. Keep request objects as fields and update their values rather than constructing new requests every scheduler cycle.",
        bullets: [
          "DutyCycleOut requests a duty-cycle output.",
          "VoltageOut requests a voltage output.",
          "VelocityVoltage requests closed-loop velocity control with a voltage-based output.",
          "PositionVoltage requests closed-loop position control with a voltage-based output.",
          "Motion Magic requests a profiled movement toward a target using configured cruise velocity and acceleration constraints.",
          "The motor's configured feedback source and units must match the setpoint units."
        ],
        examples: [
          { language: "Java", label: "Reusable request objects", code: `private final TalonFX motor = new TalonFX(3);

private final DutyCycleOut dutyRequest = new DutyCycleOut(0);
private final VoltageOut voltageRequest = new VoltageOut(0);
private final VelocityVoltage velocityRequest = new VelocityVoltage(0);
private final PositionVoltage positionRequest = new PositionVoltage(0);

public void runOpenLoop(double output) {
    motor.setControl(dutyRequest.withOutput(output));
}

public void runAtVelocity(double rotationsPerSecond) {
    motor.setControl(velocityRequest.withVelocity(rotationsPerSecond));
}

public void moveToPosition(double rotations) {
    motor.setControl(positionRequest.withPosition(rotations));
}` }
        ]
      },
      {
        title: "Read status signals",
        description: "Phoenix 6 measurements are StatusSignal values. Read their numeric values and check signal health when diagnosing CAN or sensor problems.",
        bullets: [
          "getPosition() provides the integrated rotor position signal.",
          "getVelocity() provides rotor velocity.",
          "getStatorCurrent() and getSupplyCurrent() help diagnose load and current draw.",
          "getMotorVoltage() reports applied motor voltage.",
          "getDeviceTemp() reports controller temperature.",
          "getValueAsDouble() converts a status signal's current value to a Java double.",
          "For groups of signals, use the Phoenix 6 signal refresh/wait utilities supported by your installed version rather than assuming every read is a new network update."
        ],
        examples: [
          { language: "Java", code: `double positionRotations =
    motor.getPosition().getValueAsDouble();

double velocityRotationsPerSecond =
    motor.getVelocity().getValueAsDouble();

double statorCurrentAmps =
    motor.getStatorCurrent().getValueAsDouble();

double motorVoltage =
    motor.getMotorVoltage().getValueAsDouble();` }
        ]
      },
      {
        title: "Configuration and motor behavior",
        bullets: [
          "TalonFXConfiguration groups motor output, current limits, feedback, and closed-loop settings.",
          "MotorOutputConfigs controls inversion and neutral mode.",
          "NeutralModeValue.Brake resists motion when output is neutral; Coast allows the mechanism to move more freely.",
          "Current limits help protect the motor, controller, wiring, and mechanism. They are not a substitute for mechanical safeguards.",
          "Apply configuration deliberately and check the returned status so configuration failures are not silently ignored.",
          "A follower motor can mirror a leader's output; verify inversion and mechanical orientation before enabling both."
        ],
        examples: [
          { language: "Java", label: "Configuration pattern", code: `TalonFXConfiguration config = new TalonFXConfiguration();

config.MotorOutput.NeutralMode = NeutralModeValue.Brake;
config.CurrentLimits.StatorCurrentLimit = 40.0;
config.CurrentLimits.StatorCurrentLimitEnable = true;

motor.getConfigurator().apply(config);` }
        ]
      }]
  },
{
    id: "sensorsCard",
    section: "sensors",
    title: "Sensors and digital inputs",
    summary: "A consolidated guide to encoders, gyros, limit switches, beam breaks, distance sensors, analog inputs, and interpreting sensor data.",
    sections: [{
        title: "Digital inputs and limit switches",
        description: "A DigitalInput reads a high/low electrical signal. A limit switch is a physical switch that changes state when a mechanism reaches a boundary.",
        bullets: [
          "The roboRIO DIO port number is the channel passed to DigitalInput.",
          "get() reads the electrical state; whether true means pressed depends on wiring and normally-open/normally-closed switch choice.",
          "Test the switch while watching its value in telemetry before using it as a safety boundary.",
          "Use a limit switch to stop or restrict motion, but also enforce software travel limits and safe command behavior.",
          "A normally-closed wiring arrangement can make a broken wire easier to detect, but the logic must match the wiring."
        ],
        examples: [
          { language: "Java", code: `private final DigitalInput bottomLimit = new DigitalInput(1);

public boolean isAtBottom() {
    // Verify this polarity on the actual robot.
    return !bottomLimit.get();
}` }
        ]
      },
      {
        title: "Beam breaks and proximity sensors",
        bullets: [
          "A beam-break sensor detects whether an object interrupts an optical path.",
          "Some beam breaks output true when blocked; others output false. Confirm the sensor's electrical behavior.",
          "A proximity or time-of-flight sensor estimates distance to a nearby object without physical contact.",
          "Use filtering or debouncing when readings flicker near a detection threshold.",
          "A sensor reading is evidence about the mechanism, not proof that a game piece is securely held."
        ],
        examples: [
          { language: "Java", code: `private final DigitalInput beamBreak = new DigitalInput(2);

public boolean hasPiece() {
    return !beamBreak.get(); // Example polarity only; verify your sensor.
}` }
        ]
      },
      {
        title: "Analog sensors",
        bullets: [
          "AnalogInput reads a voltage on a roboRIO analog input channel.",
          "An analog sensor may represent distance, pressure, angle, or another physical quantity.",
          "Convert voltage into engineering units using the sensor's datasheet or calibration measurements.",
          "Check the valid voltage range and avoid assuming the relationship is linear unless the sensor documentation says so."
        ],
        examples: [
          { language: "Java", code: `private final AnalogInput distanceSensor = new AnalogInput(0);

double voltage = distanceSensor.getVoltage();
double rawAverage = distanceSensor.getAverageVoltage();` }
        ]
      },
      {
        title: "Encoders and gyroscopes",
        bullets: [
          "A quadrature encoder measures relative rotation using pulses from two channels.",
          "A duty-cycle absolute encoder reports an angle over a configured range and can retain its reference across restarts.",
          "A gyro measures angular rate and/or heading; a yaw value is commonly used for robot orientation.",
          "An IMU may combine accelerometers and gyroscopes to estimate orientation and motion.",
          "Check units, sign convention, zeroing procedure, mounting orientation, and update rate."
        ],
        examples: [
          { language: "Java", label: "Quadrature encoder", code: `Encoder encoder = new Encoder(0, 1);

int counts = encoder.get();
double distance = encoder.getDistance();

encoder.reset();` },
          { language: "Java", label: "Gyro concept", code: `// Example assumes a gyro object with a getYaw() method.
double headingDegrees = gyro.getYaw().getValueAsDouble();` }
        ]
      },
      {
        title: "Sensor selection and debugging",
        bullets: [
          "Use a limit switch for a known physical endpoint, not for measuring the full travel distance.",
          "Use an encoder when you need position or velocity over time.",
          "Use a beam break when you need to know whether an object crossed or occupies a particular location.",
          "Use a distance sensor when the distance itself matters.",
          "Publish raw sensor values to the dashboard first; add derived logic only after the raw readings are understood.",
          "If a sensor is noisy, check mounting, wiring, power, grounding, update rate, and filtering before changing thresholds."
        ]
      }]
  },
{
    id: "pneumaticsCard",
    section: "sensors",
    title: "Pneumatics and solenoids",
    summary: "Control pneumatic actuators and understand the difference between single-acting and double-acting solenoids.",
    sections: [
      {
        title: "Pneumatic system vocabulary",
        bullets: [
          "A compressor supplies pressurized air to the pneumatic system.",
          "A pressure switch or pressure sensor reports system pressure.",
          "A solenoid valve directs air to an actuator.",
          "A single solenoid valve commonly controls a single-acting cylinder with a spring return.",
          "A double solenoid valve can command a double-acting cylinder in either direction.",
          "A Pneumatic Hub manages compressor and solenoid outputs on supported systems."
        ]
      },
      {
        title: "Double solenoid example",
        description: "The example shows the software pattern only. Confirm the module type, channel numbers, pressure state, and mechanical clearances on the actual robot before testing.",
        examples: [
          { language: "Java", code: `private final DoubleSolenoid clamp =
    new DoubleSolenoid(
        PneumaticsModuleType.REVPH,
        0,
        1
    );

public void extend() {
    clamp.set(DoubleSolenoid.Value.kForward);
}

public void retract() {
    clamp.set(DoubleSolenoid.Value.kReverse);
}

public void stopActuation() {
    clamp.set(DoubleSolenoid.Value.kOff);
}` }
        ]
      }
    ]
  },
{
    id: "pidFeedforwardCard",
    section: "control",
    title: "PID and feedforward control",
    summary: "Use sensor feedback and a model of mechanism behavior to move an arm, elevator, flywheel, or drivetrain predictably.",
    sections: [
      {
        title: "PID: the feedback loop",
        description: "A controller compares the measured value with a target and calculates a correction. Error is target minus measurement.",
        bullets: [
          "P (proportional) multiplies the current error by kP. A larger kP produces a stronger correction for the same error; too much can cause oscillation, while too little can make the mechanism sluggish.",
          "I (integral) multiplies accumulated error by kI. It can correct a persistent offset that P alone cannot remove, but too much integral can build up while the motor is saturated and cause overshoot (integral windup).",
          "D (derivative) responds to how quickly the error is changing, scaled by kD. It can damp motion and reduce overshoot, but it is sensitive to noisy measurements and is often kept small or unused for noisy mechanisms.",
          "The controller error is setpoint minus measurement. For example, a target of 40 rotations and a measured position of 35 rotations gives an error of +5 rotations.",
          "The controller must be calculated at a consistent period. WPILib's default PIDController period is 20 ms.",
          "Set a tolerance and use atSetpoint() to determine whether the measurement is close enough to the target.",
          "Reset the controller when beginning a new movement if old accumulated state should not carry over."
        ],
        examples: [
          { language: "Java", code: `private final PIDController pid =
    new PIDController(0.04, 0.0, 0.001);

public void moveTo(double targetRotations) {
    double measurement =
        motor.getPosition().getValueAsDouble();

    double output = pid.calculate(
        measurement,
        targetRotations
    );

    motor.set(MathUtil.clamp(output, -0.35, 0.35));
}

public boolean atTarget() {
    return pid.atSetpoint();
}` }
        ]
      },
      {
        title: "Feedforward: predict the required effort",
        description: "Feedforward calculates a useful motor output from the desired motion. PID then corrects the remaining difference between the target and the measured result.",
        bullets: [
          "kS (static gain) is the voltage needed to overcome static friction and start moving. In a simple model it contributes kS × sign(velocity), so its direction changes with the direction of travel.",
          "kV (velocity gain) is the additional voltage needed per unit of desired velocity. Its contribution is kV × velocity; it represents the voltage needed to keep a mechanism moving at that speed.",
          "kA (acceleration gain) is the additional voltage needed per unit of desired acceleration. Its contribution is kA × acceleration; it accounts for the effort needed to speed up or slow down the mechanism.",
          "kG (gravity gain) compensates for gravity. An elevator commonly uses an approximately constant kG term, while an arm's gravity contribution changes with angle and is modeled using the arm angle (commonly a cosine term).",
          "For a basic motor model, feedforward voltage is approximately kS × sign(v) + kV × v + kA × a. An elevator adds kG; an arm uses an angle-dependent gravity term.",
          "A flywheel commonly uses kS, kV, and sometimes kA.",
          "An elevator commonly uses kS, kG, kV, and sometimes kA.",
          "An arm commonly uses an ArmFeedforward model that accounts for arm angle and gravity.",
          "Keep units consistent: gains, position, velocity, acceleration, angle, and output voltage must use compatible units. Changing encoder conversion factors changes the units expected by the gains."
        ],
        examples: [
          { language: "Java", label: "Flywheel feedforward", code: `private final SimpleMotorFeedforward feedforward =
    new SimpleMotorFeedforward(kS, kV, kA);

public void setTargetVelocity(double rotationsPerSecond) {
    double volts = feedforward.calculate(rotationsPerSecond);
    motor.setVoltage(volts);
}` },
          { language: "Java", label: "Elevator feedforward", code: `private final ElevatorFeedforward feedforward =
    new ElevatorFeedforward(kS, kG, kV, kA);

double volts = feedforward.calculate(targetVelocityMetersPerSecond);
motor.setVoltage(volts);` }
        ]
      },
      {
        title: "Combine PID and feedforward",
        description: "A common pattern adds the feedforward prediction to the PID correction. The feedforward supplies most of the expected effort; PID corrects modeling error and disturbances.",
        examples: [
          { language: "Java", code: `double pidVolts = pid.calculate(
    measuredVelocity,
    targetVelocity
);

double ffVolts = feedforward.calculate(targetVelocity);

motor.setVoltage(pidVolts + ffVolts);` }
        ],
        bullets: [
          "Start by confirming sensor direction and units before tuning gains.",
          "Characterize the mechanism to estimate feedforward gains instead of guessing them.",
          "Tune one mechanism at a time and log target, measurement, error, and applied voltage.",
          "Clamp output to safe limits and use physical travel limits where appropriate.",
          "Do not assume one set of gains works for every mechanism or robot."
        ]
      },
      {
        title: "Motion profiling",
        description: "A motion profile limits how quickly a target velocity and acceleration can change. This helps mechanisms reach a position smoothly instead of jumping directly to a large target.",
        bullets: [
          "Trapezoidal motion profiles specify maximum velocity and acceleration.",
          "A ProfiledPIDController combines a profile with PID feedback.",
          "TalonFX Motion Magic and SPARK MAX motion-profile modes provide controller-side alternatives.",
          "Choose limits based on mechanism capability, load, gearing, and safe operating range."
        ],
        examples: [
          { language: "Java", code: `TrapezoidProfile.Constraints constraints =
    new TrapezoidProfile.Constraints(
        maxVelocity,
        maxAcceleration
    );

ProfiledPIDController controller =
    new ProfiledPIDController(
        kP, kI, kD, constraints
    );` }
        ]
      }
    ]
  },
{
    id: "constantsCard",
    section: "structure",
    title: "Constants",
    summary: "Keep hardware IDs, dimensions, gains, and fixed configuration values in one predictable place.",
    sections: [
      {
        title: "What to store",
        bullets: [
          "CAN IDs, controller ports, and digital input channels.",
          "Gear ratios, wheel diameters, encoder conversion factors, and mechanism dimensions.",
          "PID and feedforward gains, motion-profile constraints, and current limits.",
          "Named position targets, tolerances, and software travel limits.",
          "Camera names, camera-to-robot transforms, field layouts, and autonomous configuration.",
          "Use nested groups such as Constants.Drive, Constants.Intake, Constants.Elevator, and Constants.Vision to keep related values together.",
          "Give values unit-bearing names such as MAX_HEIGHT_METERS or MAX_VELOCITY_RPS.",
          "Avoid putting changing runtime state in Constants; constants should describe fixed configuration."
        ],
        examples: [{ language: "Java", code: `public final class Constants {\n    public static final int INTAKE_MOTOR_ID = 3;\n    public static final double WHEEL_DIAMETER_METERS = 0.15;\n\n    private Constants() {}\n}` }],
      },
    ],
  },
{
    id: "robotContainerCard",
    section: "structure",
    title: "RobotContainer",
    summary: "The composition root that creates subsystems, controllers, commands, and button bindings.",
    sections: [
      {
        title: "What belongs here",
        bullets: [
          "Create one shared instance of each subsystem.",
          "Create driver and operator controllers.",
          "Connect controller inputs to commands.",
          "Choose the command returned for autonomous mode.",
        ],
        examples: [
          { language: "Java", code: `public class RobotContainer {\n    private final Intake intake = new Intake(3);\n    private final CommandXboxController driver =\n        new CommandXboxController(0);\n\n    public RobotContainer() {\n        driver.a().whileTrue(intake.runCommand());\n    }\n}` },
        ],
      },
      {
        title: "Binding behavior",
        bullets: [
          "Use onTrue for an action that starts once when a button is pressed.",
          "Use whileTrue for a command that should remain scheduled while held.",
          "Commands should declare the subsystems they require.",
        ],
      },
    ],
  },
{
    id: "commandBasedCard",
    section: "structure",
    title: "Commands",
    summary: "Commands describe temporary robot actions and coordinate access to subsystems.",
    sections: [
      {
        title: "Command lifecycle",
        bullets: [
          "initialize runs once when the command starts.",
          "execute runs repeatedly while the command is scheduled.",
          "isFinished decides when the command completes.",
          "end runs during both normal completion and interruption.",
        ],
        examples: [
          { language: "Java", code: `public class RunIntake extends Command {\n    private final Intake intake;\n\n    public RunIntake(Intake intake) {\n        this.intake = intake;\n        addRequirements(intake);\n    }\n\n    @Override\n    public void execute() {\n        intake.run(0.7);\n    }\n\n    @Override\n    public void end(boolean interrupted) {\n        intake.stop();\n    }\n}` },
        ],
      },
      {
        title: "Commands v2 vs. Commands v3",
        description: "The lifecycle methods above describe the classic Commands v2 framework. Current WPILib documentation also describes Commands v3, which expresses command behavior differently. Do not mix examples from the two APIs in one project.",
        bullets: [
          "Commands v2 uses initialize(), execute(), isFinished(), and end(boolean interrupted).",
          "Commands v3 uses coroutine-backed command functions. Setup goes before the coroutine yields, repeated work goes in a loop, waiting uses coroutine wait methods, and cleanup runs before the function returns.",
          "In v3, Subsystem is replaced by the Mechanism interface; command factories such as run() and runRepeatedly() are used to create behavior.",
          "Requirements still prevent two commands from owning the same mechanism at once.",
          "The lifecycle example on this page is useful for understanding scheduling, but check the WPILib version installed in the project before copying code.",
          "Use the WPILib migration guide when converting an existing Commands v2 project to v3."
        ],
        examples: [
          { language: "Java", label: "Commands v2 lifecycle style", code: `public class MoveArm extends Command {
    @Override
    public void initialize() {
        arm.setVoltage(4.0);
    }

    @Override
    public void execute() {
        // Repeated work, if needed.
    }

    @Override
    public boolean isFinished() {
        return arm.atTarget();
    }

    @Override
    public void end(boolean interrupted) {
        arm.stop();
    }
}` },
          { language: "Java", label: "Commands v3 coroutine style", code: `public Command moveArm() {
    return run(coroutine -> {
        arm.setVoltage(4.0);
        coroutine.waitUntil(arm::atTarget);
        arm.stop();
    }).named("Move Arm");
}` }
        ]
      },
      {
        title: "Requirements",
        description: "A subsystem requirement prevents two commands from controlling the same mechanism at the same time.",
      },
    ],
  },
{
    id: "triggersCard",
    section: "structure",
    title: "Triggers and controller bindings",
    summary: "Connect driver and operator inputs to commands using WPILib's Trigger and CommandXboxController classes.",
    sections: [
      {
        title: "Create controller objects",
        bullets: [
          "Controller ports are configured in the Driver Station and passed to the controller constructor.",
          "Use one shared controller object so all bindings read the same device.",
          "CommandXboxController provides named button methods and trigger accessors.",
          "Keep button-to-command wiring in RobotContainer so input behavior is easy to find."
        ],
        examples: [
          { language: "Java", code: `private final CommandXboxController driver =
    new CommandXboxController(0);

private final CommandXboxController operator =
    new CommandXboxController(1);` }
        ]
      },
      {
        title: "Trigger binding methods",
        description: "A Trigger represents a boolean condition, often a button press or sensor state. Its binding method determines when a command is scheduled. The examples here use the familiar Commands v2 binding style; check the Commands v3 trigger documentation if your project uses the 2027 framework.",
        bullets: [
          "onTrue schedules a command when the condition changes from false to true.",
          "onFalse schedules a command when the condition changes from true to false.",
          "whileTrue schedules a command while the condition is true; if the command ends while the trigger is still true, it is not automatically restarted until the trigger becomes false and true again.",
          "whileFalse schedules while the condition is false.",
          "toggleOnTrue toggles a command's scheduled state on each rising edge.",
          "and(), or(), and negate() combine conditions; debounce() can filter brief signal changes."
        ],
        examples: [
          { language: "Java", code: `driver.a().onTrue(intake.runOnceCommand());
driver.b().whileTrue(intake.intakeCommand());
driver.x().onTrue(intake.stopCommand());

driver.leftBumper()
    .and(driver.rightBumper())
    .onTrue(claw.openCommand());` }
        ]
      },
      {
        title: "Sensor triggers",
        description: "Triggers do not have to come from controller buttons. A subsystem can expose a condition such as hasPiece(), and RobotContainer can bind that condition to a command.",
        examples: [
          { language: "Java", code: `new Trigger(intake::hasPiece)
    .onTrue(indexer.stopCommand());

new Trigger(elevator::isAtTop)
    .onTrue(elevator.holdCommand());` }
        ],
        bullets: [
          "Use method references such as intake::hasPiece when the method returns a boolean.",
          "Avoid creating duplicate triggers for the same condition in many places.",
          "Debounce a sensor trigger when its electrical signal briefly flickers.",
          "Be careful with commands that continuously require a subsystem while a sensor condition remains true."
        ]
      },
      {
        title: "Default commands",
        description: "A default command runs whenever its subsystem is not required by another scheduled command. It is commonly used for drivetrain control.",
        examples: [
          { language: "Java", code: `drive.setDefaultCommand(
    drive.teleopDriveCommand(
        driver::getLeftY,
        driver::getRightX
    )
);` }
        ],
        bullets: [
          "A default command should normally require the subsystem it controls.",
          "A default drive command stops being scheduled when another command takes the drivetrain requirement.",
          "When the other command ends, the default command can resume.",
          "Do not make two commands write to the same subsystem without declaring requirements."
        ]
      }
    ]
  },
{
    id: "dashboardCard",
    section: "structure",
    title: "Dashboard and telemetry",
    summary: "Publish the small set of values drivers and programmers need to understand robot state.",
    sections: [
      {
        title: "Useful telemetry",
        bullets: [
          "Mechanism position, velocity, and target values.",
          "Limit-switch and game-piece state.",
          "Selected autonomous routine.",
          "Faults that require action before a match.",
        ],
        examples: [{ language: "Java", code: `SmartDashboard.putNumber("Intake/Velocity", velocity);\nSmartDashboard.putBoolean("Intake/Has piece", hasGamePiece);` }],
      },
      {
        title: "Keep it readable",
        bullets: [
          "Group related keys with a consistent prefix.",
          "Publish values people will act on; avoid flooding the network with every local variable.",
          "Use clear units in the key when the value could be ambiguous.",
        ],
      },
    ],
  },
{
    id: "autonomousToolsCard",
    section: "autonomous",
    title: "Elastic, PathPlanner, Choreo, and autonomous",
    summary: "Understand the tools used to visualize robot data, design paths, build autonomous routines, and test field movement.",
    sections: [
      {
        title: "Elastic dashboard",
        description: "Elastic is a NetworkTables dashboard used to display robot telemetry and driver-focused information. Widgets can show numbers, booleans, choosers, graphs, and camera streams.",
        bullets: [
          "Publish values from robot code with SmartDashboard or NetworkTables.",
          "Use consistent keys such as Intake/HasPiece and Elevator/PositionMeters.",
          "Add widgets in Elastic that subscribe to those exact topic names.",
          "Use a SendableChooser to let the drive team select an autonomous routine.",
          "Keep the competition layout focused on information drivers can act on quickly.",
          "A dashboard is a display and control surface, not a replacement for correct subsystem logic."
        ],
        examples: [
          { language: "Java", code: `SmartDashboard.putNumber(
    "Elevator/PositionRotations",
    elevator.getPosition()
);

SmartDashboard.putBoolean(
    "Intake/HasPiece",
    intake.hasPiece()
);

SmartDashboard.putNumber(
    "Drive/HeadingDegrees",
    drive.getHeadingDegrees()
);` }
        ]
      },
      {
        title: "PathPlanner",
        description: "PathPlanner provides a graphical editor for paths and autonomous routines. PathPlannerLib follows those paths using feedback from the drivetrain.",
        bullets: [
          "Create the robot configuration in PathPlanner using the drivetrain type, mass, dimensions, motor model, gearing, and module information.",
          "Configure AutoBuilder in the drivetrain subsystem with pose, reset-pose, measured robot-relative speeds, and a robot-relative drive output.",
          "The pose supplier must report the robot's field-relative position and heading.",
          "The speed supplier must return robot-relative chassis speeds when using the holonomic configuration.",
          "PathPlanner can load named autos and expose an auto chooser.",
          "Alliance flipping must match the field-coordinate convention used by the project.",
          "Test paths at low speed first and verify odometry before trusting an autonomous routine."
        ],
        examples: [
          { language: "Java", label: "Auto chooser pattern after AutoBuilder setup", code: `private final SendableChooser<Command> autoChooser =
    AutoBuilder.buildAutoChooser();

public RobotContainer() {
    SmartDashboard.putData("Auto Chooser", autoChooser);
}

public Command getAutonomousCommand() {
    return autoChooser.getSelected();
}` }
        ]
      },
      {
        title: "Choreo",
        description: "Choreo is another trajectory-authoring tool. It lets teams design robot motion and export trajectory data for use with a compatible ChoreoLib vendordep.",
        bullets: [
          "Create a robot model and trajectory in the Choreo application.",
          "Use the matching ChoreoLib version for the WPILib release used by the robot project.",
          "A trajectory contains time-based target motion; the robot code follows those targets using drivetrain feedback.",
          "The drivetrain still needs accurate odometry, correctly configured units, and a drive output method.",
          "Use the generated or vendordep-version-specific examples rather than copying an API from a different season.",
          "Compare the path on the field with measured robot motion and tune the controller only after odometry and coordinate conventions are correct."
        ]
      },
      {
        title: "PathPlanner vs. Choreo",
        bullets: [
          "Both tools help teams create autonomous trajectories; their editors, file formats, APIs, and workflows differ.",
          "Pick the tool your programming team can maintain and debug confidently.",
          "Do not mix trajectory files or code examples between libraries.",
          "Whichever tool you use, autonomous quality depends on localization, consistent units, feedforward, feedback tuning, and repeatable starting conditions."
        ]
      },
      {
        title: "Autonomous routine structure",
        description: "An autonomous routine is usually a command composition: drive to a location, operate a mechanism, wait for a condition, and continue to the next action.",
        examples: [
          { language: "Java", code: `public Command simpleAuto() {
    return driveToStart()
        .andThen(intake.intakeCommand())
        .andThen(shootCommand())
        .andThen(Commands.print("Auto complete"));
}` }
        ],
        bullets: [
          "Use sequential composition when actions must happen one after another.",
          "Use parallel composition when independent mechanisms can act at the same time.",
          "Use deadline or race groups when one command should determine when a group ends.",
          "Add timeouts to actions that might otherwise wait forever.",
          "Make sure commands declare all subsystem requirements."
        ]
      }
      ,{
        title: "PathPlanner NamedCommands",
        description: "Named commands let an autonomous path or PathPlanner auto trigger robot actions by name. Register each command before building or loading the auto chooser, and make sure the command has the correct subsystem requirements.",
        bullets: [
          "Register a command with NamedCommands.registerCommand(name, command). The name must exactly match the event marker or named-command entry in PathPlanner.",
          "Use named commands for mechanism actions such as intake, deploy, stow, or shoot; do not use them as a replacement for the drivetrain path-following command.",
          "Register commands during RobotContainer construction before the auto chooser is built or autos are loaded.",
          "A named command is still a normal WPILib command: it can have requirements, finish conditions, timeouts, and cleanup behavior.",
          "Avoid reusing a single command instance if the library or command composition rules require a fresh command for each schedule; use a command factory where appropriate.",
          "Test each marker action independently, then test the full auto while watching subsystem requirements and robot pose."
        ],
        examples: [
          { language: "Java", label: "Register named commands before building the chooser", code: `public RobotContainer() {
    NamedCommands.registerCommand(
        "Intake",
        intake.runCommand()
    );

    NamedCommands.registerCommand(
        "Shoot",
        shooter.shootCommand()
    );

    autoChooser = AutoBuilder.buildAutoChooser();
    SmartDashboard.putData("Auto Chooser", autoChooser);
}` },
          { language: "Java", label: "Use the selected autonomous command", code: `@Override
public Command getAutonomousCommand() {
    return autoChooser.getSelected();
}` }
        ]
      }
    ]
  },
{
    id: "visionCard",
    section: "autonomous",
    title: "Vision with PhotonVision",
    summary: "Use camera pipelines and AprilTags to detect field targets and improve the robot's estimate of its position.",
    sections: [
      {
        title: "PhotonVision workflow",
        bullets: [
          "PhotonVision runs on a coprocessor or supported camera-processing device and publishes results over NetworkTables.",
          "PhotonLib provides Java classes that let robot code retrieve those results.",
          "Give each camera a unique name in the PhotonVision interface; the name in code must match.",
          "Set camera resolution, exposure, pipeline, and target model deliberately.",
          "A camera's physical location and orientation relative to the robot must be measured and represented in code."
        ],
        examples: [
          { language: "Java", code: `private final PhotonCamera camera =
    new PhotonCamera("front-camera");

public void readCamera() {
    PhotonPipelineResult result = camera.getLatestResult();

    if (result.hasTargets()) {
        PhotonTrackedTarget target = result.getBestTarget();

        double yawDegrees = target.getYaw();
        double pitchDegrees = target.getPitch();
        int fiducialId = target.getFiducialId();
    }
}` }
        ]
      },
      {
        title: "Target data",
        bullets: [
          "hasTargets() indicates whether the latest result contains a target.",
          "getBestTarget() returns the best target in that result.",
          "getYaw() and getPitch() provide angular offsets from the camera view.",
          "getArea() reports the target's image area and can be useful for rough alignment logic.",
          "getFiducialId() identifies an AprilTag target.",
          "A target's yaw is camera-relative; it is not automatically the robot's field heading.",
          "Use the timestamp associated with a vision measurement when fusing it with odometry."
        ]
      },
      {
        title: "AprilTags and robot pose",
        description: "PhotonPoseEstimator combines detected AprilTag information, the field's tag layout, and the camera's transform on the robot to estimate a field-relative robot pose.",
        bullets: [
          "Load the correct AprilTagFieldLayout for the current field.",
          "Measure the Transform3d from the robot origin to the camera, including translation and rotation.",
          "Use the estimated pose and its timestamp to add a vision measurement to the drivetrain's pose estimator.",
          "The estimator can return no result when tags are missing or the pose solution cannot be calculated; always check the Optional.",
          "Multi-tag measurements are generally more reliable than a single distant or ambiguous tag.",
          "Reject measurements that are clearly impossible for the robot's location or motion."
        ],
        examples: [
          { language: "Java", label: "Pose-estimation concept", code: `var estimate = photonPoseEstimator.update();

estimate.ifPresent(estimatedRobotPose -> {
    drivetrain.addVisionMeasurement(
        estimatedRobotPose.estimatedPose.toPose2d(),
        estimatedRobotPose.timestampSeconds
    );
});` }
        ]
      },
      {
        title: "Vision debugging",
        bullets: [
          "First confirm the camera stream is visible in the PhotonVision interface.",
          "Confirm the pipeline detects the correct target and that the tag ID is correct.",
          "Verify camera name, network connection, camera transform, and field layout.",
          "Log target count, tag IDs, latency, estimated pose, and pose-estimator output.",
          "Do not feed every camera result blindly into odometry; measurement quality and timestamps matter.",
          "Use vision to correct odometry drift, not to replace wheel and gyro measurements."
        ]
      }
    ]
  },
{
    id: "driverStationCard",
    section: "autonomous",
    title: "Driver Station, robot modes, and testing",
    summary: "Know how the Driver Station controls robot modes and how to use mode information safely in robot code.",
    sections: [
      {
        title: "Robot modes",
        bullets: [
          "Disabled: outputs are disabled and the robot should not perform normal mechanism actions.",
          "Autonomous: the selected autonomous command runs without driver joystick control.",
          "Teleop: driver and operator controls run the robot.",
          "Test: a mode intended for controlled testing and diagnostics.",
          "The Driver Station and Field Management System determine when the robot is enabled and which mode is active."
        ],
        examples: [
          { language: "Java", code: `if (DriverStation.isEnabled()) {
    // Robot is enabled.
}

if (DriverStation.isAutonomous()) {
    // Autonomous period.
}

if (DriverStation.isTeleop()) {
    // Teleoperated period.
}

if (DriverStation.isTest()) {
    // Test mode.
}` }
        ]
      },
      {
        title: "Useful DriverStation methods",
        bullets: [
          "isEnabled() reports whether the robot is enabled.",
          "isDisabled() reports whether the robot is disabled.",
          "isAutonomous(), isTeleop(), and isTest() identify the active mode.",
          "getAlliance() returns an Optional alliance value; handle the case where the alliance is not available.",
          "getMatchTime() reports the match time value supplied by the Driver Station; do not assume it is always valid in every testing context.",
          "reportWarning() and reportError() can publish useful diagnostic messages."
        ],
        examples: [
          { language: "Java", code: `var alliance = DriverStation.getAlliance();

if (alliance.isPresent()) {
    boolean isRed =
        alliance.get() == DriverStation.Alliance.Red;
}

DriverStation.reportWarning(
    "Elevator sensor has not been zeroed",
    false
);` }
        ]
      },
      {
        title: "Testing checklist",
        bullets: [
          "Check robot code status, roboRIO communication, joystick recognition, and battery state in the Driver Station.",
          "Use the correct team number and robot network connection.",
          "Verify motor CAN IDs and sensor channels before enabling outputs.",
          "Test each subsystem individually before testing commands that combine several mechanisms.",
          "Publish sensor values and command state to Elastic or SmartDashboard.",
          "Use logs to diagnose errors instead of relying only on what the mechanism appears to do.",
          "Follow the team's inspection and safety procedures when testing moving mechanisms."
        ]
      }
    ]
  }
];

function Example({ example }: { example: CodeExample }) {
  return (
    <figure className="reference-example">
      <figcaption>
        <span>{example.language}</span>
        {example.label ? <span>{example.label}</span> : null}
      </figcaption>
      <pre><SyntaxCode code={example.code} /></pre>
    </figure>
  );
}

function TopicArticle({ topic }: { topic: ReferenceTopic }) {
  return (
    <article id={topic.id} className="tutCard" data-reference-section={topic.section}>
      <header className="reference-topic-heading">
        <h2 className="tutHead">{topic.title}</h2>
        <p>{topic.summary}</p>
      </header>
      <div className="reference-sections">
        {topic.sections.map((topicSection) => (
          <section key={topicSection.title} className="reference-section">
            <h3 className="tutHeader">{topicSection.title}</h3>
            {topicSection.description ? <p>{topicSection.description}</p> : null}
            {topicSection.bullets ? (
              <ul>
                {topicSection.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
            {topicSection.examples ? (
              <div className="reference-examples">
                {topicSection.examples.map((example) => (
                  <Example key={`${example.language}-${example.label ?? example.code}`} example={example} />
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}

function Tut({ section = "foundations" }: { section?: ReferenceSection }) {
  const location = useLocation();
  const requestedSection = new URLSearchParams(location.search).get("section");
  const activeSection: ReferenceSection = requestedSection && requestedSection in referenceSections
    ? requestedSection as ReferenceSection
    : section;
  const currentSection = referenceSections[activeSection];
  const firstTopicId = currentSection.topics[0]?.[0] ?? "";
  const [activeTopic, setActiveTopic] = useState<string>(firstTopicId);
  const sectionLabel = categoryLinks.find(([key]) => key === activeSection)?.[2] ?? "Reference";

  useEffect(() => {
    document.title = `Perscript | ${sectionLabel} Reference`;
  }, [sectionLabel]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      setActiveTopic(firstTopicId);
      return;
    }

    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      setActiveTopic(target.id);
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
  }, [firstTopicId, location.hash, location.pathname]);

  useEffect(() => {
    let frame = 0;
    const topicIds = currentSection.topics.map(([id]) => id);

    function updateActiveTopic() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const readingLine = window.innerHeight * 0.3;
        let nextTopic = topicIds[0] ?? "";

        for (const id of topicIds) {
          const topic = document.getElementById(id);
          if (topic && topic.getBoundingClientRect().top <= readingLine) nextTopic = id;
        }

        setActiveTopic(nextTopic);
      });
    }

    updateActiveTopic();
    window.addEventListener("scroll", updateActiveTopic, { passive: true });
    window.addEventListener("resize", updateActiveTopic);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveTopic);
      window.removeEventListener("resize", updateActiveTopic);
    };
  }, [currentSection.topics]);

  const visibleTopics = topics.filter((topic) => activeSection === "hardware" ? ["motors", "sensors"].includes(topic.section) : topic.section === activeSection);
  const activePosition = Math.max(0, currentSection.topics.findIndex(([id]) => id === activeTopic));

  return (
    <div id="TutMain" className="site-page">
      <main id="main-content" className="tutorial-page" data-reference-section={activeSection}>
        <header className="page-intro tutorial-intro">
          <p className="eyebrow">{currentSection.eyebrow}</p>
          <h1>{currentSection.title}</h1>
          <p>{currentSection.description}</p>
        </header>

        <nav className="reference-category-nav" aria-label="Reference categories">
          {categoryLinks.map(([key, to, label, description]) => (
            <NavLink key={key} to={to} end={key === "foundations"}>
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <span aria-hidden="true">→</span>
            </NavLink>
          ))}
        </nav>

        <nav id="internalNav" aria-label={`${sectionLabel} topics`}>
          <div className="toc-heading">
            <span>Contents</span>
            <strong>{sectionLabel}</strong>
          </div>
          <ul id="internalNavList">
            {currentSection.topics.map(([id, label], index) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="internalNavLink"
                  aria-current={activeTopic === id ? "location" : undefined}
                >
                  <span className="toc-marker" aria-hidden="true" />
                  <span>{label}</span>
                  <span className="toc-arrow" aria-hidden="true">→</span>
                </a>
                {index < currentSection.topics.length - 1 ? <span className="toc-connector" aria-hidden="true" /> : null}
              </li>
            ))}
          </ul>
          <p className="toc-status" aria-live="polite">{activePosition + 1} of {currentSection.topics.length}</p>
        </nav>

        <div id="ATC">
          {visibleTopics.map((topic) => <TopicArticle key={topic.id} topic={topic} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Tut;
