import {Link } from "react-router-dom"
import {useState, useEffect  }from 'react';
import Editor from '@monaco-editor/react';
import problems from './JSON/problems.json';
function App(){
  const [currentLang, newLang] = useState("java")

  const[selectedProblem, setSelectedProblem]=useState(problems[0]);
  const[userCode, setUserCode]= useState(selectedProblem.starterCode[currentLang]);
  const [feedback, setFeedback]= useState('');
  const [correctAnswer, setCorrectAnswer] = useState('')
  const generateSubmit=()=>{
    if(userCode.trim().toLowerCase()== selectedProblem.solutionCode[currentLang].trim().toLowerCase()){
      return ('Correct!');
    }else if(selectedProblem.id==problems[0].id && currentLang == "java"){
      if ((userCode.match(/public/gi) || []).length < 2){
        return ("Did you add public?")
      }else if (!userCode.trim().toLowerCase().includes("static")){
        return ("Did you add static?")
      }else if (!userCode.trim().toLowerCase().includes("double")){
          return ("Did you add double?")
      }else if (!userCode.trim().toLowerCase().includes("0.8")){
          return ("Did you add 0.8?")
      }else{
        return ("Try again. You're close!")
      }
    }else if(selectedProblem.id==problems[1].id && currentLang == "java"){
      if (!userCode.trim().toLowerCase().includes("private")){
        return ("Did you add private?")
      }else if (!userCode.trim().toLowerCase().includes("final")){
        return ("Did you add final?")
      }else if ((userCode.match(/talonfx/gi) || []).length < 2){
          return ("Did you add TalonFX twice?")
      }else if (!userCode.trim().toLowerCase().includes("intakemotor")){
          return ("Did you name it intakeMotor")
      }else if (!userCode.trim().toLowerCase().includes("(3)")){
          return ("Did you set the speed to (3)")
      }else{
        return ("Try again. You're close!")
      }
    }else if(selectedProblem.id==problems[2].id  && currentLang == "java"){
      if ((userCode.match(/public/gi) || []).length < 2){
        return ("Did you add public?")
      }else if (!userCode.trim().toLowerCase().includes("void")){
          return ("Did you add void?")
      }else if (!userCode.trim().toLowerCase().includes("stopmotor")){
          return ("Did you use stopmotor?")
      }else if (!userCode.trim().toLowerCase().includes("stopintakemotor")){
          return ("Did you name the method stopintakemotor?")
      }else{
        return ("Try again. You're close!")
      }
    } else if(selectedProblem.id==problems[0].id  && currentLang == "python"){
      if (!userCode.trim().toLowerCase().includes("max_drive_speed")){
        return ("Did you name your constant MAX_DRIVE_SPEED?")
      }else if (!userCode.trim().toLowerCase().includes("0.8")){
          return ("Did you add set the speed to 0.8?")
      }else{
        return ("Try again. You're close!")
      }
    } else if(selectedProblem.id==problems[1].id  && currentLang == "python"){
      if (!userCode.trim().toLowerCase().includes("intakemotor")){
        return ("Did you name your constant intakeMotor?")
      }else if (!userCode.trim().toLowerCase().includes("__")){
          return ("Did you add the Python version of private?")
      }else if (!userCode.trim().toLowerCase().includes("3")){
          return ("Is your TalonFX id 3??")
      }else{
        return ("Try again. You're close!")
      }
    } else if(selectedProblem.id==problems[2].id  && currentLang == "python"){
      if (!userCode.trim().toLowerCase().includes("def")){
        return ("Did you add use 'def'?")
      }else if (!userCode.trim().toLowerCase().includes("self")){
          return ("Did you add self?")
      }else if (!userCode.trim().toLowerCase().includes("stopmotor")){
          return ("Did you use stopMotor?")
      }else if (!userCode.trim().toLowerCase().includes("stopintakemotor")){
          return ("Did you name the method stopIntakeMotor?")
      }else{
        return ("Try again. You're close!")
      }
    } else if(selectedProblem.id==problems[0].id  && currentLang == "cpp"){
      if (!userCode.trim().toLowerCase().includes("public")){
        return ("Did you add public?")
      }else if (!userCode.trim().toLowerCase().includes("static")){
          return ("Did you add static?")
      }else if (!userCode.trim().toLowerCase().includes("constexpr")){
          return ("Did you add constexpr?")
      }else if (!userCode.trim().toLowerCase().includes("double")){
          return ("Did you use double?")
      }else if (!userCode.trim().toLowerCase().includes("0.8")){
          return ("Did you name set the speed 0.8;?")
      }else{
        return ("Try again. You're close!")
      }
    } else if(selectedProblem.id==problems[1].id  && currentLang == "cpp"){
      if (!userCode.trim().toLowerCase().includes("private")){
          return ("Did you add private?")
      }else if (!userCode.trim().toLowerCase().includes("const")){
          return ("Did you use const?")
      }else if (!userCode.trim().toLowerCase().includes("intakeMotor")){
          return ("Did you name the method intakeMotor?")
      }else if (!userCode.trim().toLowerCase().includes("3")){
          return ("Did you name the add {3}?")
      }else{
        return ("Try again. You're close!")
      }
    } else if(selectedProblem.id==problems[2].id  && currentLang == "cpp"){
      if (!userCode.trim().toLowerCase().includes("void")){
          return ("Did you add void?")
      }else if (!userCode.trim().toLowerCase().includes("stopmotor")){
          return ("Did you use StopMotor?")
      }else if (!userCode.trim().toLowerCase().includes("stopintakemotor")){
          return ("Did you name the method stopintakemotor?")
      }else{
        return ("Try again. You're close!")
      }
    } 
  }
  useEffect(() => {
  setUserCode(selectedProblem.starterCode[currentLang]);
  }, 
  [currentLang, selectedProblem]);

  useEffect(() => {
    setFeedback("Click submit to check your answer.");
  }, 
  [selectedProblem, currentLang]);

  useEffect(() => {
    setCorrectAnswer(selectedProblem.solutionCode[currentLang]);
  }, [selectedProblem, currentLang]);

  const handleProblemChange=(e)=>{
    const problem =problems.find(p =>p.id==parseInt(e.target.value));
    setSelectedProblem(problem);
    setUserCode(problem.starterCode[currentLang]);
    setFeedback('');
  }
  const handleSubmit = () => {
    setFeedback(generateSubmit());
  }
  return (
    <div id="appJSX" >
      <header>
            {/* <img src={frcImg} id="imgHead" /> */}
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
        <div id="contentApp">
        <p id="questionProgram"> {selectedProblem.description} </p>
        <div id="divEditor">
          <Editor
            height="100%"
            language={currentLang}
            theme="purpleTheme"
            value={userCode}
            onChange={(value)=>setUserCode(value)} 
            id="editor"
            onMount={(editor, monaco) => {
              monaco.editor.defineTheme("purpleTheme", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  { token: "keyword", foreground: "a855f7" },
                  { token: "number", foreground: "f59e0b" },
                  { token: "string", foreground: "facc15" },
                  { token: "comment", foreground: "6b7280" }
                ],
                colors: {
                  "editor.background": "#0f0f0f",
                  "editor.foreground": "#ffffff",
                  "editorCursor.foreground": "#a855f7",
                  "editor.lineHighlightBackground": "#161616",
                  "editor.selectionBackground": "#a855f733",
                  "editorLineNumber.foreground": "#4b5563"
                }
              });

              monaco.editor.setTheme("purpleTheme");
            }}
            />
        </div>
        </div>
        <div id="buttonDiv">
          <p class="titles">Language</p>
          <select
            value={currentLang}
            onChange={(e) => newLang(e.target.value)}
            id="selectLang"
            class="sidebars"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <p class="titles">Excercise</p>
            {problems.slice(0, 3).map((p)=>(
            <button class="sidebars"
              key={p.id}onClick={()=>handleProblemChange({target:{value:  p.id}})}>•  {p.title}
            </button> 
            ))}
          <button
            id="AK"
            class="sidebars"
            onClick={()=>setUserCode(selectedProblem.solutionCode[currentLang])}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>

            
             Show Correct Answer
          </button>
          <button id="submit" class="sidebars" onClick={handleSubmit}>▶ RUN & SUBMIT</button>
          <p class="sidebars" id="feedback">{feedback}</p>
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
    
  );
}
export default App;