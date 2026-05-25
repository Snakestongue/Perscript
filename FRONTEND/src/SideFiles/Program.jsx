import {Link } from "react-router-dom"
import {useState, useEffect  }from 'react';
import Editor from '@monaco-editor/react';
import problems from "../JSON/problems.json"
function Program(){
  const [currentLang, newLang] = useState("java")
  const[selectedProblem, setSelectedProblem]=useState(problems[0]);
  const[userCode, setUserCode]= useState(selectedProblem.starterCode[currentLang]);
  const [checks, setChecks] = useState(selectedProblem.checks[currentLang])
  const[submit, currentSubmit] = useState(false)
  const [feedback, setFeedback]= useState('');
  const [correctAnswer, setCorrectAnswer] = useState('')
  const[content, selectContent] = useState("")
  const [load, currentLoad ] = useState(false)
  const [checkR, setCheckR] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  async function submitToAI() {
    if (!userCode){
      alert("Make sure there is code to be checked!")
      return;
    }
    currentLoad(true);
    try{
      let response = await fetch("https://frc-programming-practice.onrender.com/create", {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userCode,
          language: currentLang,
          problem: selectedProblem.title,
          correctAnswer: correctAnswer
        }),
      })
        const data = await response.json();
        if (response.ok){
          selectContent(data.result);
          console.log("good")
        }else{
          alert("Faileed:" + data.message);
        }
    }catch (error){
      alert("Internal server error.");
      console.log(error.message)
    }finally{
      currentLoad(false);
    }
  }
  const generateSubmit= () =>{
  let code = userCode.toLowerCase();
  let checks = selectedProblem.checks[currentLang];
  let results = [];
  for (let check of checks) {
    let passed = true;
    if (check.type == "includes") {
      passed = code.includes(check.value.toLowerCase());
    }
    if (check.type == "count") {
      let count = (code.match(new RegExp(check.value, "gi"))||[]).length;
      passed = count >= check.min;
    }
    results.push({ /**AI */
      message: check.message,
      passed
    });
  }
  return results;
};
  useEffect(()=>{
    setUserCode(selectedProblem.starterCode[currentLang]);
    setChecks(selectedProblem.checks[currentLang]);
      currentSubmit(false);
  }, [currentLang, selectedProblem]);

  useEffect(()=> {
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
    currentSubmit(false);
  }
  const handleSubmit = () => {
    const results = generateSubmit();
    setCheckR(results);
    setHasRun(true);
  };
  return (
    <div id="appJSX" >
      <header>
            {/* <img src={frcImg} id="imgHead" /> */}
            <Link to="/"><p id="headerFPP"><span>FRC</span> Programming Practice</p></Link>
            <ul id="headerList">
                {/* <li><Link to="/" className="headerLinks">Home</Link></li> */}
                <li><Link to="/program" className="headerLinks">Programming Practice</Link></li>
                <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
                <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
            </ul>
      </header>
      <nav>
        <ul id="newHeaderList">
          <li><Link to="/program" className="headerLinks">Programming Practice</Link></li>
          <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
          <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
        </ul>
      </nav>
      {/* <div id="overallProgram"> */}
        <div id="contentApp">
        <p id="questionProgram"> {selectedProblem.description} </p>
        <div id="divEditor">
          <Editor
            height="100%"
            language={currentLang}
            theme="themes"
            value={userCode}
            onChange={(value)=>setUserCode(value)} 
            id="editor"
            onMount={(editor, monaco) => {
              monaco.editor.defineTheme("themes", {
                base: "vs-dark",
                inherit: true,
                rules:[
                  { token: "keyword", foreground: "#7AADFF" },   
                  {token:"number",  foreground: "#22D3EE" },
                  {token: "string",  foreground: "#34D399" }, 
                  {token: "comment", foreground: "#6B7280" }
                ],
                colors: {
                  "editor.background": "#13191F",
                  "editor.foreground": "#E5E7EB",
                  "editorCursor.foreground": "#7AADFF",
                  "editor.lineHighlightBackground": "#111A2E",
                  "editor.selectionBackground": "#7AADFF22",
                  "editor.selectionHighlightBackground": "#7AADFF14",
                  "editorLineNumber.foreground": "#4B5563",
                  "editorLineNumber.activeForeground": "#9CA3AF",
                  "editorBracketHighlight.foreground1": "#7AADFF",
                  "editorBracketHighlight.foreground2": "#22D3EE",
                  "editorBracketHighlight.foreground3": "#34D399",
                }
              });
              monaco.editor.setTheme("themes");
            }}
            />
        </div>
        <p id="AICONTENT">{content}</p>
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
          <div id="gridButton">
            {problems.slice(0, 8).map((p)=>(
            <button
              onClick={()=>handleProblemChange({target:{value:  p.id}})}>•  {p.title}
            </button> 
            ))}
            </div>
          <div id="lowerSide">
          <button
            id="AK"
            class="sidebars"
            onClick={()=>setUserCode(selectedProblem.solutionCode[currentLang])}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
             Show Correct Answer
          </button>
          <button id="submit" onClick={
            handleSubmit
            }>▶ RUN & SUBMIT</button>
          <button id="aiAssist" onClick={submitToAI}>AI Assist 
            {load && <span className="spinner"></span>}
          </button>
          {hasRun && (
          <ul id="checky">
            {checkR.map((check) => (
              <li>{check.passed ? "✔ " : "✖ "}{check.message}</li>
            ))}
          </ul>
        )}
        </div>
        </div>
      {/* </div> */}
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
export default Program;