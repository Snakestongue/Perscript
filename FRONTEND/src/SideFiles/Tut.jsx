import {Link} from "react-router-dom"
function Tut(){
    return (
        <div id="TutMain">
        <header>
            <p id="headerFPP"><span>FRC</span> Programming Practice</p>
            <ul id="headerList">
                <li><Link to="/" className="headerLinks">Programming Practice</Link></li>
                <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
                <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
            </ul>
        </header>
      
      <nav>
        <ul id="newHeaderList">
          <li><Link to="/" className="headerLinks">Programming Practice</Link></li>
          <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
          <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
        </ul>
      </nav>
            <div id="ATC">
                <div id="javaStart" className="tutCard">
                    <h3><strong>Basics of Java</strong></h3>
                    <h4>Variables</h4>
                    <ul>
                        <li><strong>Integer:</strong> A whole number: 1, 2, 3</li>
                        <li><strong>Double:</strong> A decimal Value: 3.1415, 1.2345, 5.4</li>
                        <li><strong>Boolean:</strong> True of False: true, false</li>
                        <li><strong>String:</strong> A piece of text: "abc"</li>
                        <li><strong>Char:</strong> A single character: 'a'</li>
                    </ul>
                    <h4>Declare and Initalize a Variable</h4>
                    <ul>
                        <li><strong>Integer:</strong> int x = 5;</li>
                        <li><strong>Double:</strong> double y = 5.5;</li>
                        <li><strong>Boolean:</strong> boolean z = true;</li>
                        <li><strong>String:</strong> String a = "abc";</li>
                        <li><strong>Char:</strong> char b = 'a';</li>
                    </ul>
                    <h4>Maths</h4>
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
                    <h4>Comparison Operators</h4>
                    <ul>
                        <li><strong>Equal to:</strong> Use ==</li>
                        <li><strong>Not Equal to:</strong> Use !=</li>
                        <li><strong>Greater than:</strong> Use &gt;</li>
                        <li><strong>Less than:</strong> Use &lt;</li>
                        <li><strong>Greater than or Equal to:</strong> Use &gt;=</li>
                        <li><strong>Less than or Equal to:</strong> Use &lt;=</li>
                    </ul>
                    <h4>Comparison Operators</h4>
                    <ul>
                        <li><strong>And:</strong> Use &&</li>
                        <li><strong>Or:</strong> Use ||</li>
                        <li><strong>Not:</strong> Use !</li>
                    </ul>
                    <h4>If Statements</h4>
                    <ul>
                        <li><strong>If</strong></li>
                                <pre>
                                    <code>
{`if (x > y) {
    return 1;
}`}
                                    </code>
                                </pre>
                        <li><strong>If-Else</strong></li>
                                <pre>
                                    <code>
{`if (x > y) {
    return 1;
} else {
    return 2;
}`}
                                    </code>
                                </pre>
                        <li><strong>If-Else If-Else</strong></li>
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
                </div>
                <div id="javaAdvance" className="tutCard">
                    <h3><strong>Advanced Java</strong></h3>
                    <h4>Classes</h4>
                    <ul>
                        <li>A class is a blueprint for creating objects.</li>
                        <li>A class's name must match the file name.</li>
                        <li>Classes have their own variables.</li>
                        <li>Acess Modifiers</li>
                        <ul>
                            <li>Public: Accessible from anywhere.</li>
                            <li>Private: Accessible from only that class.</li>
                        </ul>
                    </ul>
                    <h4>Objects</h4>
                    <ul>
                        <li>An object is an instance of a class</li>
                        <li>Formula</li>
                                <pre>
                                    <code>
{`Class objectName = new Class()`}
                                    </code>
                                </pre>
                    </ul>
                    <h4>Dot Operator</h4>
                    <ul>
                        <li>Used to access data inside an object.</li>
                        <li>Formula (using object above) </li>
                                <pre>
                                    <code>
{`objectName.width = 100;`}
                                    </code>
                                </pre>
                    </ul>
                    <h4>Attributes</h4>
                    <ul>
                        <li>Any variables declared within a class, but outside a method or constructor.</li>
                        <li>Also called fields or instance variables.</li>
                        <li>Can be accessed by an object & dot operator</li>
                    </ul>
                    <h4>Methods</h4>
                    <ul>
                        <li>Methods are blocks of code performing a specific task.</li>
                        <li>Parts of a method</li>
                        <ul>
                            <li><strong>Access Modifier:</strong> Public or Private</li>
                            <li><strong>Return Type:</strong> String, Int, Void, etc</li>
                            <ul>
                                <li><i>Void means nothing is returned.</i></li>
                            </ul>
                            <li><strong>Method Name:</strong> Name of Method</li>
                            <li><strong>Parameters:</strong> Input values a method can take in (optional)</li>
                            <li>Formula</li>
                                    <pre>
                                        <code>
{`public int add (int a, int b) {
    return a + b;
} `}
                                        </code>
                                    </pre>
                        </ul>
                        <li>Static Methods</li>
                        <ul>
                            <li>Static methods can be called without an object.</li>
                            <li>Formula</li>
                                    <pre>
                                        <code>
{`public static void myStaticMethod() {
    System.out.println("This is a static method!");
} `}
                                        </code>
                                    </pre>
                            <li><i>Most FRC methods are <b>NOT</b> static.</i></li>
                        </ul>
                    </ul>
                    <h4>Constructor</h4>
                    <ul>
                        <li>A special method with the same name as the class</li>
                        <li>It is used to initialize objects.</li>
                        <li>They don't have any return type</li>
                        <li>Formula</li>
                                <pre>
                                    <code>
{`
public class Intake {
    private TalonFX intakeMotor;
    
    public Intake (){
        intakeMotor = new TalonFX(3);
    }
}`}
                                    </code>
                                </pre>
                            <li>
                                This code creates a class and an object using a constructor.
                            </li>
                    </ul>
                    
                </div>
                {/* <div id="canSpark" className="tutCard">
                    <h3><strong>Using SparkMax</strong></h3>
                    <ul></ul>
                </div>
                <div id="talonFX" className="tutCard">
                    <h3><strong>Using TalonFX</strong></h3>
                    <ul></ul>
                </div> */}
            </div>
            <footer>
                <div id="newFooterDiv">
                    <Link id="PPLINK" to="/PP" className="footerLinks" >Privacy Policy</Link>
                    <Link id="Sug" to="/Sug" className="footerLinks" >Add a suggestion</Link>
                    <a id="git" className="footerLinks" href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
                </div>
                <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
            </footer>
        </div>
    )
}
export default Tut;