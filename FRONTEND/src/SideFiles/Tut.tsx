import {Link} from "react-router-dom"
import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";
function Tut(){
    return (
        <div id="TutMain">
        <Header />
      <Nav />
      <div id="internalNav">
        <ul id="internalNavList">
            <li><a href="#javaStart" className="internalNavLink">Basics</a></li>
            <li><a href="#javaAdvance" className="internalNavLink">Advanced</a></li>
            <li><a href="#generalFRC" className="internalNavLink">General FRC Terms</a></li>
            <li><a href="#canSpark" className="internalNavLink">SparkMax</a></li>
            <li><a href="#talonFX" className="internalNavLink">TalonFX</a></li>
            <li><a href="#robotContainerCard" className="internalNavLink">Robot Container</a></li>
            <li><a href="#commandBasedCard" className="internalNavLink">Commands</a></li>
            <li><a href="#constantsCard" className="internalNavLink">Constants</a></li>
            <li><a href="#dashboardCard" className="internalNavLink">Dashboard</a></li>
            <li><a href="#sensorsCard" className="internalNavLink">Sensors</a></li>
        </ul>
    </div>
            <div id="ATC">
                <div id="javaStart" className="tutCard">
                    <h2 className="tutHead">Basics</h2>
                    <h4 className="tutHeader">Variables</h4>
                    <ul>
                        <li><strong>Integer:</strong> A whole number: 1, 2, 3</li>
                        <li><strong>Double:</strong> A decimal Value: 3.1415, 1.2345, 5.4</li>
                        <li><strong>Boolean:</strong> True or False: true, false</li>
                        <li><strong>String:</strong> A piece of text: "abc"</li>
                        <li><strong>Char:</strong> A single character: 'a'</li>
                    </ul>
                    <h4 className="tutHeader">Declare and Initalize a Variable</h4>
                    <ul>
                        <li className="tutLang">Java</li>
                        <ul>
                            <li><strong>Integer:</strong> int x = 5;</li>
                            <li><strong>Double:</strong> double y = 5.5;</li>
                            <li><strong>Boolean:</strong> boolean z = true;</li>
                            <li><strong>String:</strong> String a = "abc";</li>
                            <li><strong>Char:</strong> char b = 'a';</li>
                        </ul>
                        <li className="tutLang">C++</li>
                        <ul>
                            <li><strong>Integer:</strong> int x = 5;</li>
                            <li><strong>Double:</strong> double y = 5.5;</li>
                            <li><strong>Boolean:</strong> bool z = true;</li>
                            <li><strong>String:</strong> std::string a = "abc";</li>
                            <li><strong>Char:</strong> char b = 'a';</li>
                        </ul>
                        <li className="tutLang">Python</li>
                        <ul>
                            <li><strong>Integer:</strong> x = 5</li>
                            <li><strong>Double:</strong> y = 5.5</li>
                            <li><strong>Boolean:</strong> z = true</li>
                            <li><strong>String:</strong> a = "abc"</li>
                            <li><strong>Char:</strong> b = 'a'</li>
                        </ul>
                    </ul>
                    <h4 className="tutHeader">Math</h4>
                    <ul>
                        <li><strong>Addition:</strong> Use +</li>
                        <li><strong>Subtraction:</strong> Use -</li>
                        <li><strong>Multiplication:</strong> Use *</li>
                        <li><strong>Division:</strong> Use /</li>
                        <li><strong>Modulus:</strong> Use %</li>
                        <li><strong>Increment:</strong> Use ++</li>
                        <li><strong>Decrement:</strong> Use --</li>
                        <li><strong>Add/Equal:</strong> Use +=</li>
                        <li><strong>Subtract/Equal:</strong> Use -=</li>
                        <li><strong>Multiplication/Equal:</strong> Use *=</li>
                        <li><strong>Division/Equal:</strong> Use /=</li>
                    </ul>
                    <h4 className="tutHeader">Comparison Operators</h4>
                    <ul>
                        <ul>
                            <li><strong>Equal to:</strong> Use ==</li>
                            <li><strong>Not Equal to:</strong> Use !=</li>
                            <li><strong>Greater than:</strong> Use &gt;</li>
                            <li><strong>Less than:</strong> Use &lt;</li>
                            <li><strong>Greater than or Equal to:</strong> Use &gt;=</li>
                            <li><strong>Less than or Equal to:</strong> Use &lt;=</li>
                        </ul>
                    </ul>
                    <h4 className="tutHeader">Logical Operators</h4>
                    <ul>
                        <li className="tutLang">Java/C++</li>
                        <ul>
                            <li><strong>And:</strong> Use &&</li>
                            <li><strong>Or:</strong> Use ||</li>
                            <li><strong>Not:</strong> Use !</li>
                        </ul>
                        <li className="tutLang">Python</li>
                        <ul>
                            <li><strong>And:</strong> Use and</li>
                            <li><strong>Or:</strong> Use or</li>
                            <li><strong>Not:</strong> Use not</li>
                        </ul>
                    </ul>

                    <h4  className="tutLang">Java and C++</h4>
                    <ul>
                        <li className="tutTitle">If</li>
                                <pre>
                                    <code>
{`if (x > y) {
    return 1;
}`}
                                    </code>
                                </pre>
                        <li className="tutTitle">If-Else</li>
                                <pre>
                                    <code>
{`if (x > y) {
    return 1;
} else {
    return 2;
}`}
                                    </code>
                                </pre>
                        <li className="tutTitle">If Else-If Else</li>
                                <pre>
                                    <code>
{`if (x > y) {
    return 1;
} else if (x == y) {
    return 2;
} else {
    return 3;
}`}
                                    </code>
                                </pre>
                    </ul>



                    <h4 className="tutLang">Python</h4>
                    <p className="fs"><i>Parenthesis are <b>OPTIONAL</b> in Python.</i></p>
                    <p className="fs"><i>Tab is (indentation) <b>REQUIRED</b> in Python.</i></p>
                    <ul>
                        <li className="tutTitle">If</li>
                                <pre>
                                    <code>
{`if (x > y):
    return 1`}
                                    </code>
                                </pre>
                        <li className="tutTitle">If-Else</li>
                                <pre>
                                    <code>
{`if (x > y):
    return 1
else:
    return 2
`}
                                    </code>
                                </pre>
                        <li className="tutTitle">If-Else If-Else</li>
                                <pre>
                                    <code>
{`if (x > y):
    return 1
elif (x == y):
    return 2
else:
    return 3
}`}
                                    </code>
                                </pre>
                    </ul>
                </div>
                <div id="javaAdvance" className="tutCard">
                    <h2 className="tutHead">Advanced</h2>
                    <h4 className="tutHeader">Classes</h4>
                    <ul>
                        <li>A class is a blueprint for creating objects.</li>
                        <li>A class's name must match the file name. (Java Only)</li>
                        <li>Classes have their own variables.</li>
                        <li>Access Modifiers (Java/C++ Only)</li>
                        <ul>
                            <li>Public: Accessible from anywhere.</li>
                            <li>Private: Accessible from only that class.</li>
                        </ul>
                        <li>Naming Convention (Python Only)</li>
                        <ul>
                            <li>Public: Use variable name</li>
                            <li>Private: Add _ or __ before variable name</li>
                        </ul>
                    </ul>
                    <hr></hr>
                    <h4 className="tutHeader">Objects</h4>
                    <ul>
                        <li>An object is an instance of a class</li>
                        <li className="tutLang">Java</li>
                                <pre>
                                    <code>
{`Class objectName = new Class()`}
                                    </code>
                                </pre>
                        <li className="tutLang">C++</li>
                                <pre>
                                    <code>
{`Class objectName;`}
                                    </code>
                                </pre>
                        <li className="tutLang">Python</li>
                                <pre>
                                    <code>
{`objectName = Class()`}
                                    </code>
                                </pre>
                    </ul>
                    <hr></hr>
                    <h4 className="tutHeader">Dot Operator</h4>
                    <ul>
                        <li>Used to access data inside an object.</li>
                        <li className="tutLang">Java/C++</li>
                                <pre>
                                    <code>
{`objectName.width = 100;`}
                                    </code>
                                </pre>
                        <li className="tutLang">Python</li>
                                <pre>
                                    <code>
{`objectName.width = 100`}
                                    </code>
                                </pre>
                    </ul>
                    <hr></hr>
                    <h4 className="tutHeader">Attributes</h4>
                    <ul>
                        <li>Any variables declared within a class, but outside a method or constructor.</li>
                        <li>Also called fields or instance variables.</li>
                        <li>Can be accessed by an object & dot operator</li>
                    </ul>
                    <hr></hr>
                    <h4 className="tutHeader">Methods</h4>
                    <ul>
                        <li>Methods are blocks of code performing a specific task.</li>
                        <li>Parts of a method</li>
                        <ul>
                            <li><strong>Access Modifier:</strong> Public or Private</li>
                            <li><strong>Return Type:</strong> String (std::string in C++), Int, Void, etc</li>
                            <ul>
                                <li><i>Void means nothing is returned.</i></li>
                            </ul>
                            <li><strong>Method Name:</strong> Name of Method</li>
                            <li><strong>Parameters:</strong> Input values a method can take in (optional)</li>
                            <li className="tutLang">Java</li>
                                    <pre>
                                        <code>
{`public int add (int a, int b) {
    return a + b;
}`}
                                        </code>
                                    </pre>
                            <li className="tutLang">C++</li>
                                    <pre>
                                        <code>
{`public:
    int add(int a, int b) {
        return a + b;
    }`}
                                        </code>
                                    </pre>
                            <li className="tutLang">Python</li>
                                    <pre>
                                        <code>
{`def add(self, a, b):
    return a + b`}
                                        </code>
                                    </pre>
                        </ul>
                        <hr></hr>
                        <li className="tutHeader">Static Methods</li>
                        <ul>
                            <li>Static methods can be called without an object.</li>
                            <li className="tutLang">Java</li>
                                    <pre>
                                        <code>
{`public static void myStaticMethod() {
    System.out.println("This is a static method!");
}`}
                                        </code>
                                    </pre>
                                <li className="tutLang">C++</li>
                                    <pre>
                                        <code>
{`public:
    static void myStaticMethod() {
        std::cout << "This is a static method!" << std::endl;
    }`}
                                        </code>
                                    </pre>
                                <li className="tutLang">Python</li>
                                    <pre>
                                        <code>
{`@staticmethod
    def static_method():
        print("This is a static method!")`}
                                        </code>
                                    </pre>
                            <li><i>Most FRC methods are <b>NOT</b> static.</i></li>
                        </ul>
                    </ul>
                    <hr></hr>
                    <h4 className="tutHeader">Constructor</h4>
                    <ul>
                        <li>A special method with the same name as the class</li>
                        <li>It is used to initialize objects.</li>
                        <li>They don't have any return type</li>
                        <li className="tutLang">Java</li>
                                <pre>
                                    <code>
{`public class Intake {
    private TalonFX intakeMotor;
    public Intake (){
        intakeMotor = new TalonFX(3);
    }
}`}
                                    </code>
                                </pre>
                        <li className="tutLang">C++</li>
                                <pre>
                                    <code>
{`class Intake {
private:
    ctre::phoenix6::hardware::TalonFX intakeMotor;
public:
    Intake() : intakeMotor(3) {
    }
};`}
                                    </code>
                                </pre>
                        <li className="tutLang">Python</li>
                                <pre>
                                    <code>
{`class Intake:
    def __init__(self):
        self.intakeMotor = TalonFX(3)`}
                                    </code>
                                </pre>
                            <li>
                                This code creates a class and an object using a constructor.
                            </li>
                    </ul>
                    
                </div>
                <div id="generalFRC" className="tutCard">
                    <h2 className="tutHead">General FRC terms</h2>
                    <h4 className="tutHeader">PID</h4>
                    <ul>
                        <li>A control loop used to get to a certain state.</li>
                        <li>Used for elevator heights, arm angles</li>
                        <ul>
                            <li>P:Proportional</li>
                            <li>I:Integral</li>
                            <li>D:Derivative</li>
                        </ul>
                    </ul>
                    <h4 className="tutHeader">Feedforward</h4>
                    <ul>
                        <li>Predicts how much power needed before error</li>
                        <li>Used for wheels, arms</li>
                        <ul>
                            <li>Static Friction Compensation: Minimum voltage needed to overcome friction to start mechanism.</li>
                            <li>Velocity Gain: Minimum voltage to maintain a certain speed.</li>
                            <li>Gravity Compensation: Minimum voltage needed to overcome gravity to prevent holding position.</li>
                            <li>Acceleration Gain: How much voltage is needed to accelerate.</li>
                        </ul>
                    </ul>
                    <h4 className="tutHeader">Encoders</h4>
                    <ul>
                        <li>Measures positions, rotations or speed.</li>
                        <li>Relative encoders</li>
                        <ul>
                            <li>Usually counts ticks and is like a stopwatch</li>
                        </ul>
                         <li>Absolute encoders</li>
                        <ul>
                            <li>Measures exact angles or speeds</li>
                        </ul>
                    </ul>
                    <h4 className="tutHeader">Limit Switches</h4>
                    <ul>
                        <li>A physical switch detecting endpoints</li>
                        <li>Used if elevator is on the bottom or arm at end point.</li>
                        <li><b><i>Very important!</i></b></li>
                    </ul>
                    <h4 className="tutHeader">Drive Trains</h4>
                    <ul>
                        <li>Swerve</li>
                        <ul>
                            <li>Every tire can rotate and drive at any point allowing for diagonal driving.</li>
                            <li>TalonFX has an automatic Swerve Generator.</li>
                        </ul>
                        <li>Tank</li>
                        <ul>
                            <li>Left and Rights wheels move together making maneuverablity difficult.</li>
                            <li>Cheaper but less used in FRC today.</li>
                        </ul>
                    </ul>
                </div>
                {/* <div id="canSpark" className="tutCard">
                    <h2 class="tutHead">SparkMax</h2>
                    <h4 class="tutHeader">Important Methods</h4>
                    <ul>
                        <li class="tutTitle">Set throttle</li>
                        <ul>
                        <li class="tutLang">Java</li>
                                <pre>
                                    <code>
{`motor.setThrottle(0.5);`}
                                    </code>
                                </pre>
                        </ul>
                        <li class="tutTitle">Set voltage</li>
                        <ul>
                        <li class="tutLang">Java</li>
                                <pre>
                                    <code>
{`motor.setVoltage(5);`}
                                    </code>
                                </pre>
                        </ul>
                        <li class="tutTitle">Stop motor</li>
                        <ul>
                        <li class="tutLang">Java</li>
                                <pre>
                                    <code>
{`motor.stopMotor();`}
                                    </code>
                                </pre>
                        </ul>
                        <li class="tutTitle">Stop motor</li>
                        <ul>
                        <li class="tutLang">Java</li>
                                <pre>
                                    <code>
{`motor.stopMotor();`}
                                    </code>
                                </pre>
                        </ul>
                        <li class="tutTitle">Encoder</li>
                        <ul>
                        <li class="tutLang">Java</li>
                                <pre>
                                    <code>
{`RelativeEncoder encoder = motor.getEncoder();`}
                                    </code>
                                </pre>
                        </ul>
                        <li class="tutTitle">Configuration</li>
                        <li>Configuration is used to set up PID, encoder, inversion, break/coast, etc</li>
                        <ul>
                        <li class="tutLang">Java</li>
                                <pre>
                                    <code>
{`motor.configure(...)`}
                                    </code>
                                </pre>
                        </ul>
                    </ul>
                </div>
                <div id="talonFX" className="tutCard">
                    <h3><strong>Using TalonFX</strong></h3>
                    <ul></ul>
                </div> */}
                <div id="canSpark" className="tutCard">
                    <h2 className="tutHead">SparkMax</h2>
                    <h4 className="tutHeader">Important Methods</h4>
                    <ul>
                        <li className="tutTitle">Initialize Motor</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`SparkMax motor = new SparkMax(1, SparkMax.MotorType.kBrushless);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`rev::spark::SparkMax motor(1, rev::spark::SparkMax::MotorType::kBrushless);`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`motor = SparkMax(1, SparkMax.MotorType.kBrushless)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Set Speed / Throttle</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`motor.set(0.5);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`motor.Set(0.5);`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`motor.set(0.5)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Set Voltage</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`motor.setVoltage(5.0);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`motor.SetVoltage(units::volt_t(5.0));`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`motor.setVoltage(5.0)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Stop Motor</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`motor.stopMotor();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`motor.StopMotor();`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`motor.stopMotor()`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Encoder</li>
                        <ul>
                            <li>The built-in encoder retrieves current position and velocity values.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`RelativeEncoder encoder = motor.getEncoder();
double position = encoder.getPosition();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`rev::spark::SparkRelativeEncoder encoder = motor.GetEncoder();
double position = encoder.GetPosition();`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`encoder = motor.getEncoder()
position = encoder.getPosition()`}
                                </code>
                            </pre>
                        </ul>
                    </ul>
                </div>

                <div id="talonFX" className="tutCard">
                    <h2 className="tutHead">TALONFX</h2>
                    <h4 className="tutHeader">Important Methods</h4>
                    <ul>
                        <li className="tutTitle">Initialize Motor</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`TalonFX talonMotor = new TalonFX(1);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`ctre::phoenix6::hardware::TalonFX talonMotor{1};`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`talonMotor = TalonFX(1)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Control via Output or Control Requests</li>
                        <ul>
                            <li>Phoenix 6 uses control request objects for advanced outputs, while direct percentage setting works like standard controllers.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`talonMotor.set(0.5);
talonMotor.setControl(new VoltageOut(6.0));`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`talonMotor.Set(0.5);
talonMotor.SetControl(ctre::phoenix6::controls::VoltageOut{6.0});`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`talonMotor.set(0.5)
talonMotor.setControl(VoltageOut(6.0))`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Stop Motor</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`talonMotor.stopMotor();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`talonMotor.StopMotor();`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`talonMotor.stopMotor()`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Encoder & Position</li>
                        <ul>
                            <li>Phoenix 6 properties use status signals, requiring a call to getValueAsDouble() to parse raw measurements.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double rot = talonMotor.getPosition().getValueAsDouble();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`double rot = talonMotor.GetPosition().GetValue().value();`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`rot = talonMotor.getPosition().value_as_double()`}
                                </code>
                            </pre>
                        </ul>
                    </ul>
                </div>
                <div id="robotContainerCard" className="tutCard">
                    <h2 className="tutHead">Robot Container & Button Binding</h2>
                    <h4 className="tutHeader">Command Based Bindings</h4>
                    <ul>
                        <li>The RobotContainer class coordinates joysticks, subsystems, and command bindings.</li>
                        <li className="tutTitle">Controllers and Joysticks</li>
                        <ul>
                            <li>Xbox controllers or joysticks trigger specific commands when buttons are pressed.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`CommandXboxController driverController = new CommandXboxController(0);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`frc2::CommandXboxController driverController{0};`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`driverController = commands2.button.CommandXboxController(0)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Button Bindings</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`driverController.a().whileTrue(new RunCommand(() -> intake.spin(), intake));`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`driverController.A().WhileTrue(IntakeSpinCommand(&intake).ToPtr());`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`driverController.a().whileTrue(IntakeSpinCommand(intake))`}
                                </code>
                            </pre>
                        </ul>
                    </ul>
                </div>

                <div id="commandBasedCard" className="tutCard">
                    <h2 className="tutHead">Command-Based Programming</h2>
                    <h4 className="tutHeader">Writing Custom Commands</h4>
                    <ul>
                        <li>Commands dictate actions using periodic execution, initialize, and end lifecycle methods.</li>
                        <li className="tutLang">Java</li>
                        <pre>
                            <code>
{`public class ExampleCommand extends Command {
    private final Subsystem s;
    public ExampleCommand(Subsystem s) {
        this.s = s;
        addRequirements(s);
    }
    @Override
    public void execute() {
        s.run();
    }
    @Override
    public void end(boolean interrupted) {
        s.stop();
    }
}`}
                            </code>
                        </pre>
                        <li className="tutLang">C++</li>
                        <pre>
                            <code>
{`class ExampleCommand : public frc2::CommandHelper<frc2::CommandBase> {
    Subsystem* s;
public:
    ExampleCommand(Subsystem* subsystem) : s(subsystem) {
        AddRequirements({s});
    }
    void Execute() override {
        s->Run();
    }
    void End(bool interrupted) override {
        s->Stop();
    }
};`}
                            </code>
                        </pre>
                    </ul>
                </div>

                <div id="constantsCard" className="tutCard">
                    <h2 className="tutHead">Constants</h2>
                    <h4 className="tutHeader">Declaring and Using Global Constants</h4>
                    <ul>
                        <li>Constants store permanent values like port numbers, gear ratios, and PID gains to keep code organized.</li>
                        <li className="tutLang">Java</li>
                        <pre>
                            <code>
{`public final class Constants {
    public static final int kIntakeMotorCanId = 3;
    public static final double kWheelDiameterMeters = 0.15;
}`}
                            </code>
                        </pre>
                        <li className="tutLang">C++</li>
                        <pre>
                            <code>
{`namespace Constants {
    inline constexpr int kIntakeMotorCanId = 3;
    inline constexpr double kWheelDiameterMeters = 0.15;
}`}
                            </code>
                        </pre>
                        <li className="tutLang">Python</li>
                        <pre>
                            <code>
{`class Constants:
    k_intake_motor_can_id = 3
    k_wheel_diameter_meters = 0.15`}
                            </code>
                        </pre>
                    </ul>
                </div>

                <div id="dashboardCard" className="tutCard">
                    <h2 className="tutHead">SmartDashboard & Shuffleboard</h2>
                    <h4 className="tutHeader">Telemetry and Driver Interaction</h4>
                    <ul>
                        <li>Dashboard systems allow you to send sensor data to the driver station and retrieve tuning variables or auto modes.</li>
                        <li className="tutTitle">How to View Data</li>
                        <ul>
                            <li>Open the Shuffleboard or SmartDashboard application installed via WPILib on your driver station laptop.</li>
                            <li>Connect your laptop to the robot via USB tether, radio, or practice field network.</li>
                            <li>Widgets will automatically populate when you call `putNumber`, `putBoolean`, or `putString` in your code. You can drag and drop them to customize your layout.</li>
                        </ul>
                        <li className="tutTitle">Putting Data</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`SmartDashboard.putNumber("Elevator Height", 45.2);
SmartDashboard.putBoolean("Is Aligned", true);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`frc::SmartDashboard::PutNumber("Elevator Height", 45.2);
frc::SmartDashboard::PutBoolean("Is Aligned", true);`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`wpi.SmartDashboard.putNumber("Elevator Height", 45.2)
wpi.SmartDashboard.putBoolean("Is Aligned", True)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Getting Data</li>
                        <ul>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double speed = SmartDashboard.getNumber("Target Speed", 0.0);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`double speed = frc::SmartDashboard::GetNumber("Target Speed", 0.0);`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`speed = wpi.SmartDashboard.getNumber("Target Speed", 0.0)`}
                                </code>
                            </pre>
                        </ul>
                        <li className="tutTitle">Shuffleboard Specifics</li>
                        <ul>
                            <li>Shuffleboard allows more advanced tab layouts and custom widgets compared to SmartDashboard.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`Shuffleboard.getTab("Autonomous")
    .add("My Auto Selector", chooser);`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`frc::Shuffleboard::GetTab("Autonomous")
    .Add("My Auto Selector", chooser);`}
                                </code>
                            </pre>
                        </ul>
                    </ul>
                </div>

                <div id="sensorsCard" className="tutCard">
                    <h2 className="tutHead">Sensors & Physical Input Devices</h2>
                    <h4 className="tutHeader">Gyroscopes, Encoders, Switches, and More</h4>
                    <ul>
                        <li>Sensors give your robot spatial awareness, allowing it to measure position, orientation, and surroundings.</li>
                        
                        <li className="tutTitle">Gyroscopes</li>
                        <ul>
                            <li>Measures rotational velocity and heading angles, vital for field-oriented drive and autonomous navigation.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double yawAngle = gyro.getYaw().getValueAsDouble();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`double yawAngle = gyro.GetYaw().GetValue().value();`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`yaw_angle = gyro.getYaw().value_as_double()`}
                                </code>
                            </pre>
                        </ul>

                        <li className="tutTitle">Relative Encoders</li>
                        <ul>
                            <li>Counts ticks relative to where the motor started spinning (like a stopwatch). Resets on robot boot.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double position = motor.getEncoder().getPosition();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`double position = motor.GetEncoder().GetPosition();`}
                                </code>
                            </pre>
                            <li className="tutLang">Python</li>
                            <pre>
                                <code>
{`position = motor.getEncoder().getPosition()`}
                                </code>
                            </pre>
                        </ul>

                        <li className="tutTitle">Absolute Encoders</li>
                        <ul>
                            <li>Measures the exact physical angle of a mechanism regardless of power cycles (commonly used on swerve steering modules).</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double angle = absoluteEncoder.getPosition();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`double angle = absoluteEncoder.GetPosition();`}
                                </code>
                            </pre>
                        </ul>

                        <li className="tutTitle">Limit Switches</li>
                        <ul>
                            <li>A physical mechanical switch that triggers when a mechanism reaches its safe physical boundary (like the top of an elevator).</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`boolean isAtBottom = limitSwitch.get();`}
                                </code>
                            </pre>
                            <li className="tutLang">C++</li>
                            <pre>
                                <code>
{`bool isAtBottom = limitSwitch.Get();`}
                                </code>
                            </pre>
                        </ul>

                        <li className="tutTitle">Beam Breakers (Photoelectric Sensors)</li>
                        <ul>
                            <li>Uses an infrared light beam to detect if an object (like a game piece) has broken the path between the emitter and receiver.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`boolean hasNote = !beamBreak.get();`}
                                </code>
                            </pre>
                        </ul>

                        <li className="tutTitle">Accelerometers</li>
                        <ul>
                            <li>Measures linear acceleration and G-forces along the X, Y, and Z axes. Often built into the RoboRIO or external IMUs.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double accelX = BuiltInAccelerometer.getX();`}
                                </code>
                            </pre>
                        </ul>

                        <li className="tutTitle">Ultrasonic / Distance Sensors</li>
                        <ul>
                            <li>Emits sound waves to measure distance from walls or game elements.</li>
                            <li className="tutLang">Java</li>
                            <pre>
                                <code>
{`double distance = ultrasonic.getRangeInches();`}
                                </code>
                            </pre>
                        </ul>
                    </ul>
                </div>
            </div>
            <footer>
                <div id="newFooterDiv">
                <Link id="PPLINK" to="/PP" className="footerLinks" >Privacy Policy</Link>
                <Link id="Sug" to="/Sug" className="footerLinks" >Add a suggestion</Link>
                <a id="git" className="footerLinks" target="_blank" rel="noopener noreferrer"href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
                </div>
                <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
            </footer>
        </div>
    )
}
export default Tut;