import{a as e,l as t,m as n,n as r,o as i,r as a,t as o}from"./index-BkkoG1p6.js";var s=n(t(),1),c=a(),l={foundations:{eyebrow:`Reference · Foundations`,title:`Start with the language, then learn the robot concepts.`,description:`A guide to syntax, classes, and the terms you will see throughout FRC.`,topics:[[`javaStart`,`Language basics`],[`javaAdvance`,`Classes & objects`],[`generalFRC`,`FRC concepts`]]},hardware:{eyebrow:`Reference · Hardware`,title:`Connect code to the hardware on your robot.`,description:`Look up common motor operations, encoder readings, and physical sensor patterns while you build.`,topics:[[`canSpark`,`SparkMax`],[`talonFX`,`TalonFX`],[`sensorsCard`,`Sensors`]]},structure:{eyebrow:`Reference · Robot structure`,title:`Keep robot behavior organized and predictable.`,description:`Review RobotContainer wiring, command lifecycles, shared constants, and driver-station telemetry patterns.`,topics:[[`robotContainerCard`,`RobotContainer`],[`commandBasedCard`,`Commands`],[`constantsCard`,`Constants`],[`dashboardCard`,`Dashboard`]]}},u=[[`foundations`,`/tut`,`Foundations`,`Language and FRC concepts`],[`hardware`,`/tut/hardware`,`Hardware`,`Motors and sensors`],[`structure`,`/tut/robot-structure`,`Robot structure`,`Commands and project organization`]],d=[{id:`javaStart`,section:`foundations`,title:`Language basics`,summary:`The small set of language tools you will use in nearly every robot project.`,sections:[{title:`Common value types`,description:`Choose a type based on the kind of value the robot needs to store.`,bullets:[`Integer: a whole number, such as a CAN ID or controller port.`,`Double: a decimal value, such as motor output, distance, or angle.`,`Boolean: a true-or-false state, such as whether a limit switch is pressed.`,`String: text used for labels, dashboard keys, or messages.`],examples:[{language:`Java`,code:`int motorId = 3;
double targetSpeed = 0.65;
boolean enabled = true;
String mechanism = "Intake";`},{language:`C++`,code:`int motorId = 3;
double targetSpeed = 0.65;
bool enabled = true;
std::string mechanism = "Intake";`},{language:`Python`,code:`motor_id = 3
target_speed = 0.65
enabled = True
mechanism = "Intake"`}]},{title:`Operators and conditions`,description:`Use arithmetic to calculate values, comparisons to test them, and logical operators to combine conditions.`,bullets:[`Arithmetic: +, -, *, /, and remainder (%).`,`Comparison: ==, !=, >, <, >=, and <=.`,`Java and C++ logic: &&, ||, and !. Python uses and, or, and not.`],examples:[{language:`Java / C++`,label:`Conditional`,code:`if (enabled && targetSpeed > 0.0) {
    motor.set(targetSpeed);
} else {
    motor.stopMotor();
}`},{language:`Python`,label:`Conditional`,code:`if enabled and target_speed > 0.0:
    motor.set(target_speed)
else:
    motor.stopMotor()`}]}]},{id:`javaAdvance`,section:`foundations`,title:`Classes and objects`,summary:`Classes group state and behavior; objects are the working instances used by your robot code.`,sections:[{title:`Classes, fields, and constructors`,bullets:[`A class is a blueprint for one responsibility, such as an intake subsystem.`,`Fields hold the state or hardware owned by that class.`,`A constructor creates a usable object and initializes its dependencies.`,`Keep implementation details private unless another class genuinely needs them.`],examples:[{language:`Java`,code:`public class Intake {
    private final TalonFX motor;

    public Intake(int motorId) {
        motor = new TalonFX(motorId);
    }
}`},{language:`C++`,code:`class Intake {
 public:
    explicit Intake(int motorId) : motor{motorId} {}

 private:
    ctre::phoenix6::hardware::TalonFX motor;
};`},{language:`Python`,code:`class Intake:
    def __init__(self, motor_id):
        self.motor = TalonFX(motor_id)`}]},{title:`Methods`,description:`Methods expose the actions an object can perform while keeping its internal details contained.`,examples:[{language:`Java`,code:`public void run(double speed) {
    motor.set(speed);
}

public void stop() {
    motor.stopMotor();
}`}]}]},{id:`generalFRC`,section:`foundations`,title:`FRC concepts`,summary:`A practical vocabulary for mechanisms, closed-loop control, and drivetrain feedback.`,sections:[{title:`PID control`,description:`PID continuously adjusts an output to move a mechanism toward a target.`,bullets:[`Proportional responds to the current error.`,`Integral responds to error accumulated over time.`,`Derivative responds to how quickly the error is changing.`,`Tune one mechanism at a time and begin with conservative outputs.`]},{title:`Feedforward`,description:`Feedforward predicts the output a mechanism needs before closed-loop correction is applied.`,bullets:[`Static gain overcomes friction.`,`Velocity gain maintains a requested speed.`,`Acceleration gain changes speed at a requested rate.`,`Gravity gain helps arms and elevators hold position.`]},{title:`Position feedback`,bullets:[`Relative encoders track movement from a known starting point and commonly reset on boot.`,`Absolute encoders report a physical angle across power cycles.`,`Limit switches provide a direct signal at a mechanism boundary.`]}]},{id:`canSpark`,section:`hardware`,title:`SparkMax`,summary:`Common REV motor-controller operations for creating, driving, stopping, and reading a mechanism.`,sections:[{title:`Create and drive a motor`,bullets:[`Use the correct CAN ID and motor type for the controller connected to the robot.`,`Motor output is typically normalized from −1.0 to 1.0.`,`Stop the motor explicitly when a command ends.`],examples:[{language:`Java`,code:`SparkMax motor = new SparkMax(3, MotorType.kBrushless);
motor.set(0.5);
motor.stopMotor();`},{language:`C++`,code:`using namespace rev::spark;

SparkMax motor{3, SparkMax::MotorType::kBrushless};
motor.Set(0.5);
motor.StopMotor();`},{language:`Python`,code:`motor = rev.SparkMax(3, rev.SparkLowLevel.MotorType.kBrushless)
motor.set(0.5)
motor.stopMotor()`}]},{title:`Read the encoder`,description:`The integrated relative encoder can report position and velocity for feedback or telemetry.`,examples:[{language:`Java`,code:`RelativeEncoder encoder = motor.getEncoder();
double position = encoder.getPosition();
double velocity = encoder.getVelocity();`}]}]},{id:`talonFX`,section:`hardware`,title:`TalonFX`,summary:`Core Phoenix 6 patterns for controlling a TalonFX and reading its status signals.`,sections:[{title:`Create and control`,bullets:[`Use duty-cycle output for a normalized command and voltage output when voltage is the useful unit.`,`Keep one controller instance and reuse request objects instead of recreating hardware repeatedly.`],examples:[{language:`Java`,code:`TalonFX motor = new TalonFX(3);
motor.set(0.5);
motor.stopMotor();`},{language:`C++`,code:`ctre::phoenix6::hardware::TalonFX motor{3};
motor.Set(0.5);
motor.StopMotor();`},{language:`Python`,code:`motor = TalonFX(3)
motor.set(0.5)
motor.stopMotor()`}]},{title:`Read position`,description:`Phoenix 6 measurements are status signals; read their current value before using them in calculations.`,examples:[{language:`Java`,code:`double rotations = motor.getPosition().getValueAsDouble();`},{language:`C++`,code:`double rotations = motor.GetPosition().GetValue().value();`},{language:`Python`,code:`rotations = motor.get_position().value`}]}]},{id:`sensorsCard`,section:`hardware`,title:`Sensors`,summary:`Choose a sensor based on the physical state your robot needs to measure.`,sections:[{title:`Position and orientation`,bullets:[`Gyroscopes measure heading and rotation for field-oriented control and autonomous movement.`,`Relative encoders measure motion from a starting point.`,`Absolute encoders report a mechanism's physical angle.`],examples:[{language:`Java`,label:`Gyroscope`,code:`double heading = gyro.getYaw().getValueAsDouble();`},{language:`Java`,label:`Relative encoder`,code:`double position = motor.getEncoder().getPosition();`}]},{title:`Presence and boundaries`,bullets:[`Limit switches detect a mechanism reaching a physical endpoint.`,`Beam-break sensors detect a game piece crossing an optical path.`,`Distance sensors estimate separation from a wall, object, or game element.`],examples:[{language:`Java`,label:`Limit switch`,code:`boolean atLimit = limitSwitch.get();`},{language:`Java`,label:`Beam break`,code:`boolean hasGamePiece = !beamBreak.get();`}]}]},{id:`robotContainerCard`,section:`structure`,title:`RobotContainer`,summary:`The composition root that creates subsystems, controllers, commands, and button bindings.`,sections:[{title:`What belongs here`,bullets:[`Create one shared instance of each subsystem.`,`Create driver and operator controllers.`,`Connect controller inputs to commands.`,`Choose the command returned for autonomous mode.`],examples:[{language:`Java`,code:`public class RobotContainer {
    private final Intake intake = new Intake(3);
    private final CommandXboxController driver =
        new CommandXboxController(0);

    public RobotContainer() {
        driver.a().whileTrue(intake.runCommand());
    }
}`}]},{title:`Binding behavior`,bullets:[`Use onTrue for an action that starts once when a button is pressed.`,`Use whileTrue for a command that should remain scheduled while held.`,`Commands should declare the subsystems they require.`]}]},{id:`commandBasedCard`,section:`structure`,title:`Commands`,summary:`Commands describe temporary robot actions and coordinate access to subsystems.`,sections:[{title:`Command lifecycle`,bullets:[`initialize runs once when the command starts.`,`execute runs repeatedly while the command is scheduled.`,`isFinished decides when the command completes.`,`end runs during both normal completion and interruption.`],examples:[{language:`Java`,code:`public class RunIntake extends Command {
    private final Intake intake;

    public RunIntake(Intake intake) {
        this.intake = intake;
        addRequirements(intake);
    }

    @Override
    public void execute() {
        intake.run(0.7);
    }

    @Override
    public void end(boolean interrupted) {
        intake.stop();
    }
}`}]},{title:`Requirements`,description:`A subsystem requirement prevents two commands from controlling the same mechanism at the same time.`}]},{id:`constantsCard`,section:`structure`,title:`Constants`,summary:`Keep hardware IDs, dimensions, gains, and fixed configuration values in one predictable place.`,sections:[{title:`What to store`,bullets:[`CAN IDs, controller ports, and digital input channels.`,`Gear ratios and mechanism dimensions.`,`PID and feedforward gains.`,`Named limits used across multiple classes.`],examples:[{language:`Java`,code:`public final class Constants {
    public static final int INTAKE_MOTOR_ID = 3;
    public static final double WHEEL_DIAMETER_METERS = 0.15;

    private Constants() {}
}`},{language:`C++`,code:`namespace Constants {
    inline constexpr int kIntakeMotorId = 3;
    inline constexpr double kWheelDiameterMeters = 0.15;
}`},{language:`Python`,code:`class Constants:
    INTAKE_MOTOR_ID = 3
    WHEEL_DIAMETER_METERS = 0.15`}]}]},{id:`dashboardCard`,section:`structure`,title:`Dashboard and telemetry`,summary:`Publish the small set of values drivers and programmers need to understand robot state.`,sections:[{title:`Useful telemetry`,bullets:[`Mechanism position, velocity, and target values.`,`Limit-switch and game-piece state.`,`Selected autonomous routine.`,`Faults that require action before a match.`],examples:[{language:`Java`,code:`SmartDashboard.putNumber("Intake/Velocity", velocity);
SmartDashboard.putBoolean("Intake/Has piece", hasGamePiece);`},{language:`C++`,code:`frc::SmartDashboard::PutNumber("Intake/Velocity", velocity);
frc::SmartDashboard::PutBoolean("Intake/Has piece", hasGamePiece);`},{language:`Python`,code:`SmartDashboard.putNumber("Intake/Velocity", velocity)
SmartDashboard.putBoolean("Intake/Has piece", has_game_piece)`}]},{title:`Keep it readable`,bullets:[`Group related keys with a consistent prefix.`,`Publish values people will act on; avoid flooding the network with every local variable.`,`Use clear units in the key when the value could be ambiguous.`]}]}];function f({example:e}){return(0,c.jsxs)(`figure`,{className:`reference-example`,children:[(0,c.jsxs)(`figcaption`,{children:[(0,c.jsx)(`span`,{children:e.language}),e.label?(0,c.jsx)(`span`,{children:e.label}):null]}),(0,c.jsx)(`pre`,{children:(0,c.jsx)(o,{code:e.code})})]})}function p({topic:e}){return(0,c.jsxs)(`article`,{id:e.id,className:`tutCard`,"data-reference-section":e.section,children:[(0,c.jsxs)(`header`,{className:`reference-topic-heading`,children:[(0,c.jsx)(`h2`,{className:`tutHead`,children:e.title}),(0,c.jsx)(`p`,{children:e.summary})]}),(0,c.jsx)(`div`,{className:`reference-sections`,children:e.sections.map(e=>(0,c.jsxs)(`section`,{className:`reference-section`,children:[(0,c.jsx)(`h3`,{className:`tutHeader`,children:e.title}),e.description?(0,c.jsx)(`p`,{children:e.description}):null,e.bullets?(0,c.jsx)(`ul`,{children:e.bullets.map(e=>(0,c.jsx)(`li`,{children:e},e))}):null,e.examples?(0,c.jsx)(`div`,{className:`reference-examples`,children:e.examples.map(e=>(0,c.jsx)(f,{example:e},`${e.language}-${e.label??e.code}`))}):null]},e.title))})]})}function m({section:t=`foundations`}){let n=i(),a=l[t],o=a.topics[0]?.[0]??``,[f,m]=(0,s.useState)(o),h=u.find(([e])=>e===t)?.[2]??`Reference`;(0,s.useEffect)(()=>{document.title=`Perscript | ${h} Reference`},[h]),(0,s.useEffect)(()=>{if(!n.hash){window.scrollTo({top:0,behavior:`auto`}),m(o);return}let e=document.getElementById(n.hash.slice(1));e&&(m(e.id),requestAnimationFrame(()=>e.scrollIntoView({block:`start`})))},[o,n.hash,n.pathname]),(0,s.useEffect)(()=>{let e=0,t=a.topics.map(([e])=>e);function n(){cancelAnimationFrame(e),e=requestAnimationFrame(()=>{let e=window.innerHeight*.3,n=t[0]??``;for(let r of t){let t=document.getElementById(r);t&&t.getBoundingClientRect().top<=e&&(n=r)}m(n)})}return n(),window.addEventListener(`scroll`,n,{passive:!0}),window.addEventListener(`resize`,n),()=>{cancelAnimationFrame(e),window.removeEventListener(`scroll`,n),window.removeEventListener(`resize`,n)}},[a.topics]);let g=d.filter(e=>e.section===t),_=Math.max(0,a.topics.findIndex(([e])=>e===f));return(0,c.jsxs)(`div`,{id:`TutMain`,className:`site-page`,children:[(0,c.jsxs)(`main`,{id:`main-content`,className:`tutorial-page`,"data-reference-section":t,children:[(0,c.jsxs)(`header`,{className:`page-intro tutorial-intro`,children:[(0,c.jsx)(`p`,{className:`eyebrow`,children:a.eyebrow}),(0,c.jsx)(`h1`,{children:a.title}),(0,c.jsx)(`p`,{children:a.description})]}),(0,c.jsx)(`nav`,{className:`reference-category-nav`,"aria-label":`Reference categories`,children:u.map(([t,n,r,i])=>(0,c.jsxs)(e,{to:n,end:t===`foundations`,children:[(0,c.jsxs)(`span`,{children:[(0,c.jsx)(`strong`,{children:r}),(0,c.jsx)(`small`,{children:i})]}),(0,c.jsx)(`span`,{"aria-hidden":`true`,children:`→`})]},t))}),(0,c.jsxs)(`nav`,{id:`internalNav`,"aria-label":`${h} topics`,children:[(0,c.jsxs)(`div`,{className:`toc-heading`,children:[(0,c.jsx)(`span`,{children:`Contents`}),(0,c.jsx)(`strong`,{children:h})]}),(0,c.jsx)(`ul`,{id:`internalNavList`,children:a.topics.map(([e,t],n)=>(0,c.jsxs)(`li`,{children:[(0,c.jsxs)(`a`,{href:`#${e}`,className:`internalNavLink`,"aria-current":f===e?`location`:void 0,children:[(0,c.jsx)(`span`,{className:`toc-marker`,"aria-hidden":`true`}),(0,c.jsx)(`span`,{children:t}),(0,c.jsx)(`span`,{className:`toc-arrow`,"aria-hidden":`true`,children:`→`})]}),n<a.topics.length-1?(0,c.jsx)(`span`,{className:`toc-connector`,"aria-hidden":`true`}):null]},e))}),(0,c.jsxs)(`p`,{className:`toc-status`,"aria-live":`polite`,children:[_+1,` of `,a.topics.length]})]}),(0,c.jsx)(`div`,{id:`ATC`,children:g.map(e=>(0,c.jsx)(p,{topic:e},e.id))})]}),(0,c.jsx)(r,{})]})}export{m as default};