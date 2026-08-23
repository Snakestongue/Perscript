import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Footer from "../components/Footer.js";
import SyntaxCode from "../components/SyntaxCode.js";

type ReferenceSection = "foundations" | "hardware" | "structure";

type CodeExample = {
  language: string;
  label?: string;
  code: string;
};

type TopicSection = {
  title: string;
  description?: string;
  bullets?: string[];
  examples?: CodeExample[];
};

type ReferenceTopic = {
  id: string;
  section: ReferenceSection;
  title: string;
  summary: string;
  sections: TopicSection[];
};

const referenceSections = {
  foundations: {
    eyebrow: "Reference · Foundations",
    title: "Start with the language, then learn the robot concepts.",
    description: "A guide to syntax, classes, and the terms you will see throughout FRC.",
    topics: [
      ["javaStart", "Language basics"],
      ["javaAdvance", "Classes & objects"],
      ["generalFRC", "FRC concepts"],
    ],
  },
  hardware: {
    eyebrow: "Reference · Hardware",
    title: "Connect code to the hardware on your robot.",
    description: "Look up common motor operations, encoder readings, and physical sensor patterns while you build.",
    topics: [
      ["canSpark", "SparkMax"],
      ["talonFX", "TalonFX"],
      ["sensorsCard", "Sensors"],
    ],
  },
  structure: {
    eyebrow: "Reference · Robot structure",
    title: "Keep robot behavior organized and predictable.",
    description: "Review RobotContainer wiring, command lifecycles, shared constants, and driver-station telemetry patterns.",
    topics: [
      ["robotContainerCard", "RobotContainer"],
      ["commandBasedCard", "Commands"],
      ["constantsCard", "Constants"],
      ["dashboardCard", "Dashboard"],
    ],
  },
} as const;

const categoryLinks = [
  ["foundations", "/tut", "Foundations", "Language and FRC concepts"],
  ["hardware", "/tut/hardware", "Hardware", "Motors and sensors"],
  ["structure", "/tut/robot-structure", "Robot structure", "Commands and project organization"],
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
        examples: [
          { language: "Java", code: `int motorId = 3;\ndouble targetSpeed = 0.65;\nboolean enabled = true;\nString mechanism = "Intake";` },
          { language: "C++", code: `int motorId = 3;\ndouble targetSpeed = 0.65;\nbool enabled = true;\nstd::string mechanism = "Intake";` },
          { language: "Python", code: `motor_id = 3\ntarget_speed = 0.65\nenabled = True\nmechanism = "Intake"` },
        ],
      },
      {
        title: "Operators and conditions",
        description: "Use arithmetic to calculate values, comparisons to test them, and logical operators to combine conditions.",
        bullets: [
          "Arithmetic: +, -, *, /, and remainder (%).",
          "Comparison: ==, !=, >, <, >=, and <=.",
          "Java and C++ logic: &&, ||, and !. Python uses and, or, and not.",
        ],
        examples: [
          { language: "Java / C++", label: "Conditional", code: `if (enabled && targetSpeed > 0.0) {\n    motor.set(targetSpeed);\n} else {\n    motor.stopMotor();\n}` },
          { language: "Python", label: "Conditional", code: `if enabled and target_speed > 0.0:\n    motor.set(target_speed)\nelse:\n    motor.stopMotor()` },
        ],
      },
    ],
  },
  {
    id: "javaAdvance",
    section: "foundations",
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
        examples: [
          { language: "Java", code: `public class Intake {\n    private final TalonFX motor;\n\n    public Intake(int motorId) {\n        motor = new TalonFX(motorId);\n    }\n}` },
          { language: "C++", code: `class Intake {\n public:\n    explicit Intake(int motorId) : motor{motorId} {}\n\n private:\n    ctre::phoenix6::hardware::TalonFX motor;\n};` },
          { language: "Python", code: `class Intake:\n    def __init__(self, motor_id):\n        self.motor = TalonFX(motor_id)` },
        ],
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
    id: "generalFRC",
    section: "foundations",
    title: "FRC concepts",
    summary: "A practical vocabulary for mechanisms, closed-loop control, and drivetrain feedback.",
    sections: [
      {
        title: "PID control",
        description: "PID continuously adjusts an output to move a mechanism toward a target.",
        bullets: [
          "Proportional responds to the current error.",
          "Integral responds to error accumulated over time.",
          "Derivative responds to how quickly the error is changing.",
          "Tune one mechanism at a time and begin with conservative outputs.",
        ],
      },
      {
        title: "Feedforward",
        description: "Feedforward predicts the output a mechanism needs before closed-loop correction is applied.",
        bullets: [
          "Static gain overcomes friction.",
          "Velocity gain maintains a requested speed.",
          "Acceleration gain changes speed at a requested rate.",
          "Gravity gain helps arms and elevators hold position.",
        ],
      },
      {
        title: "Position feedback",
        bullets: [
          "Relative encoders track movement from a known starting point and commonly reset on boot.",
          "Absolute encoders report a physical angle across power cycles.",
          "Limit switches provide a direct signal at a mechanism boundary.",
        ],
      },
    ],
  },
  {
    id: "canSpark",
    section: "hardware",
    title: "SparkMax",
    summary: "Common REV motor-controller operations for creating, driving, stopping, and reading a mechanism.",
    sections: [
      {
        title: "Create and drive a motor",
        bullets: [
          "Use the correct CAN ID and motor type for the controller connected to the robot.",
          "Motor output is typically normalized from −1.0 to 1.0.",
          "Stop the motor explicitly when a command ends.",
        ],
        examples: [
          { language: "Java", code: `SparkMax motor = new SparkMax(3, MotorType.kBrushless);\nmotor.set(0.5);\nmotor.stopMotor();` },
          { language: "C++", code: `using namespace rev::spark;\n\nSparkMax motor{3, SparkMax::MotorType::kBrushless};\nmotor.Set(0.5);\nmotor.StopMotor();` },
          { language: "Python", code: `motor = rev.SparkMax(3, rev.SparkLowLevel.MotorType.kBrushless)\nmotor.set(0.5)\nmotor.stopMotor()` },
        ],
      },
      {
        title: "Read the encoder",
        description: "The integrated relative encoder can report position and velocity for feedback or telemetry.",
        examples: [
          { language: "Java", code: `RelativeEncoder encoder = motor.getEncoder();\ndouble position = encoder.getPosition();\ndouble velocity = encoder.getVelocity();` },
        ],
      },
    ],
  },
  {
    id: "talonFX",
    section: "hardware",
    title: "TalonFX",
    summary: "Core Phoenix 6 patterns for controlling a TalonFX and reading its status signals.",
    sections: [
      {
        title: "Create and control",
        bullets: [
          "Use duty-cycle output for a normalized command and voltage output when voltage is the useful unit.",
          "Keep one controller instance and reuse request objects instead of recreating hardware repeatedly.",
        ],
        examples: [
          { language: "Java", code: `TalonFX motor = new TalonFX(3);\nmotor.set(0.5);\nmotor.stopMotor();` },
          { language: "C++", code: `ctre::phoenix6::hardware::TalonFX motor{3};\nmotor.Set(0.5);\nmotor.StopMotor();` },
          { language: "Python", code: `motor = TalonFX(3)\nmotor.set(0.5)\nmotor.stopMotor()` },
        ],
      },
      {
        title: "Read position",
        description: "Phoenix 6 measurements are status signals; read their current value before using them in calculations.",
        examples: [
          { language: "Java", code: `double rotations = motor.getPosition().getValueAsDouble();` },
          { language: "C++", code: `double rotations = motor.GetPosition().GetValue().value();` },
          { language: "Python", code: `rotations = motor.get_position().value` },
        ],
      },
    ],
  },
  {
    id: "sensorsCard",
    section: "hardware",
    title: "Sensors",
    summary: "Choose a sensor based on the physical state your robot needs to measure.",
    sections: [
      {
        title: "Position and orientation",
        bullets: [
          "Gyroscopes measure heading and rotation for field-oriented control and autonomous movement.",
          "Relative encoders measure motion from a starting point.",
          "Absolute encoders report a mechanism's physical angle.",
        ],
        examples: [
          { language: "Java", label: "Gyroscope", code: `double heading = gyro.getYaw().getValueAsDouble();` },
          { language: "Java", label: "Relative encoder", code: `double position = motor.getEncoder().getPosition();` },
        ],
      },
      {
        title: "Presence and boundaries",
        bullets: [
          "Limit switches detect a mechanism reaching a physical endpoint.",
          "Beam-break sensors detect a game piece crossing an optical path.",
          "Distance sensors estimate separation from a wall, object, or game element.",
        ],
        examples: [
          { language: "Java", label: "Limit switch", code: `boolean atLimit = limitSwitch.get();` },
          { language: "Java", label: "Beam break", code: `boolean hasGamePiece = !beamBreak.get();` },
        ],
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
        title: "Requirements",
        description: "A subsystem requirement prevents two commands from controlling the same mechanism at the same time.",
      },
    ],
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
          "Gear ratios and mechanism dimensions.",
          "PID and feedforward gains.",
          "Named limits used across multiple classes.",
        ],
        examples: [
          { language: "Java", code: `public final class Constants {\n    public static final int INTAKE_MOTOR_ID = 3;\n    public static final double WHEEL_DIAMETER_METERS = 0.15;\n\n    private Constants() {}\n}` },
          { language: "C++", code: `namespace Constants {\n    inline constexpr int kIntakeMotorId = 3;\n    inline constexpr double kWheelDiameterMeters = 0.15;\n}` },
          { language: "Python", code: `class Constants:\n    INTAKE_MOTOR_ID = 3\n    WHEEL_DIAMETER_METERS = 0.15` },
        ],
      },
    ],
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
        examples: [
          { language: "Java", code: `SmartDashboard.putNumber("Intake/Velocity", velocity);\nSmartDashboard.putBoolean("Intake/Has piece", hasGamePiece);` },
          { language: "C++", code: `frc::SmartDashboard::PutNumber("Intake/Velocity", velocity);\nfrc::SmartDashboard::PutBoolean("Intake/Has piece", hasGamePiece);` },
          { language: "Python", code: `SmartDashboard.putNumber("Intake/Velocity", velocity)\nSmartDashboard.putBoolean("Intake/Has piece", has_game_piece)` },
        ],
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
  const currentSection = referenceSections[section];
  const firstTopicId = currentSection.topics[0]?.[0] ?? "";
  const [activeTopic, setActiveTopic] = useState<string>(firstTopicId);
  const sectionLabel = categoryLinks.find(([key]) => key === section)?.[2] ?? "Reference";

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

  const visibleTopics = topics.filter((topic) => topic.section === section);
  const activePosition = Math.max(0, currentSection.topics.findIndex(([id]) => id === activeTopic));

  return (
    <div id="TutMain" className="site-page">
      <main id="main-content" className="tutorial-page" data-reference-section={section}>
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
