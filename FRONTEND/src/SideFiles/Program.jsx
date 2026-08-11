import {initVimMode } from "monaco-vim";
import {Link } from "react-router-dom"
import {useState, useEffect  }from 'react';
import Editor from '@monaco-editor/react';
import problems from "../JSON/problems.json"
import { useRef } from "react";
import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";
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
  const [checkR, setCheckR] =useState([]);
  const [hasRun, setHasRun] =useState(false);
  const[vimOn, setVimOn] = useState(false)
  const vimRef = useRef (null)
  const editorRef =useRef(null )
  useEffect(() => {
    document.title = "FRC Programming Practice | Live Challenges";
  }, []);
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
        passed = count >= check.min
      }
      results.push({ /**AI */
        message: check.message,
        passed
      })
    }
    return results;
  }
  useEffect(()=>{
    setUserCode(selectedProblem.starterCode[currentLang]);
    setChecks(selectedProblem.checks[currentLang]);
    currentSubmit(false);
  }, [currentLang, selectedProblem]);

  useEffect(()=> {
    setFeedback("Click submit to check your answer.");
  }, [selectedProblem, currentLang]);

  useEffect(() => {
    setCorrectAnswer(selectedProblem.solutionCode[currentLang]);
  }, [selectedProblem, currentLang]);

  const handleProblemChange=(e)=>{
    const problem =problems.find(p =>p.id==parseInt(e.target.value))
    setSelectedProblem(problem)
    setUserCode(problem.starterCode[currentLang]);
    setFeedback('')
    currentSubmit(false)
  }
  const handleSubmit = () => {
    const results = generateSubmit();
    setCheckR(results);
    setHasRun(true);
  };
  const toggleVim =() => {
    if(!editorRef.current){
      return
    }
    if(vimOn){
      vimRef.current?.dispose();
      vimRef.current = null;
    }else{
      const statusNode = document.getElementById("vim-status");
      if (statusNode){
        statusNode.innerHTML = ""
      }
        vimRef.current = initVimMode(editorRef.current, statusNode);
    }
    setVimOn(v =>!v);
  }
  return (
    <div id="overall-program" >
      <div className="[grid-area:header]">
        <Header />
        <Nav />
      </div>
      <div className="
        [grid-area:content]
          flex
          flex-col
          w-full
          mx-auto
          mt-10
          rounded-tl-[10px]
          rounded-tr-[10px]
          max-lg:w-[85%]
          max-lg:mx-auto
          max-lg:mb-2"
          >
        <p className="
        border-none
          border-b border-white/10
          rounded-none m-0
          !p-4 text-white font-mono
          text-sm bg-[#13191f]
          transition-all duration-500 "> {selectedProblem.description} </p>
        <div className="
        font-mono m-0 h-[55vh] 
        overflow-hidden 
        transition duration-500 p-0 bg-[#13191f] 
        border-t border-b border-white/10
        ">
          <Editor
            height="100%"
            language={currentLang}
            theme="themes"
            value={userCode}
            onChange={(value)=>setUserCode(value)} 
            id="editor"
            onMount={(editor, monaco) => {
              editorRef.current = editor;
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
                  "editor.background": "#000000",
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
              monaco.editor.setTheme("themes")
            }}
          />
        </div>
        <div>
          <div className="grid grid-cols-2 w-full max-lg:gap-8">
            <div className="editor-words">
                <div className="flex flex-row justify-center items-center gap-2 pt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#7AADFF" class="words-svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                  </svg>

                  <p className="text-sm font-extrabold tracking-[1.5px] uppercase text-gray-500 !p-0 !m-0">Results</p>
                </div>

              <ul className="words-content">
                {checkR.length > 0?(checkR.map((check) => (
                  <li><span
                    style={{
                      color: check.passed ? "green" : "red",
                      fontWeight: "bold",
                    }}> {check.passed ? "✔" : "✖"}
                    </span>{check.message}</li>
                  ))
                ):(
                <li>Run your code for checks</li>
              )}</ul>
            </div>

            <div className="editor-words">
              <div className="flex flex-row justify-center items-center gap-2 pt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#d900ff" className="words-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                  <p className="text-sm font-extrabold tracking-[1.5px] uppercase text-gray-500 !p-0 !m-0">AI Assist</p>
                </div>
              <p className="words-content">{content? content : "Click AI Assist for help!"}</p>
            </div>
          </div>
          <div className="
            w-full box-border
            mt-0
            flex flex-row
            justify-between items-center
            col-span-full gap-[10px]
            py-[10px] px-1
            max-lg:flex 
            max-lg:flex-row 
            max-lg:order-[-1]
            max-md:flex
            max-md:flex-col
            max-md:overflow-y-auto
            max-md:min-h-[200px]
            ">

          {/* VIM */}
            <button className="action-buttons"
              onClick={toggleVim} 
              id="vim-toggle" style={{
                color: vimOn ? "rgb(122,173,255)" : "#6B7280",
                borderColor: vimOn ? "rgba(122,173,255,0.4)" : "rgba(255,255,255,0.1)"
              }}>
              {vimOn ? "⌨ VIM ON" : "⌨ VIM OFF"}
            </button>

          {/* ANSWER */}
            <button 
              id="show-answer"
              className="action-buttons"
              onClick={()=>setUserCode(selectedProblem.solutionCode[currentLang])}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffd900" className="size-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Show Answer
            </button>

          {/* RUN and AI */}
            <button className="action-buttons" id="run-submit" onClick={handleSubmit}>▶ RUN & SUBMIT</button>

            <button className="action-buttons" id="ai-button" onClick={submitToAI}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#d900ff" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              AI Assist {load && <span className="spinner" id="aiSpin"></span>}
            </button>
          </div>
          
        </div>
      </div>
        <div className="
        [grid-area:sidebar]
        w-full box-border mt-10 px-2.5 bg-[#13191f]
        max-lg:w-[85%] 
        max-lg:flex 
        max-lg:flex-col 
        max-lg:justify-start 
        max-lg:mt-5 
        max-lg:bg-[#13191f] 
        max-lg:border 
        max-lg:border-white/8 
        max-lg:rounded-[10px] 
        max-lg:p-[15px] 
        max-lg:box-border
        max-lg:overflow-hidden
        border-r border-[#7aadff31]
        ">
          <p className="text-sm font-extrabold tracking-[1.5px] uppercase text-gray-500 !py-2">Language</p>
          <select
            value={currentLang}
            onChange={(e) => newLang(e.target.value)}
            className="program-select"
            >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <p className="text-sm font-extrabold tracking-[1.5px] uppercase text-gray-500 !py-4">Exercise</p>
          <div className="
            grid grid-cols-2 gap-2.5
            max-lg:flex max-lg:flex-row
            max-lg:overflow-x-auto max-lg:pb-1
            max-lg:[&::-webkit-scrollbar]:hidden
            max-lg:[scrollbar-width:none]"
            >{problems.slice(0, 10).map((p) => (
              <button
                className="program-buttons !w-auto whitespace-nowrap flex-none"
                key={p.id}
                onClick={() => handleProblemChange({ target:{value: p.id } })}
              >{p.title}</button>
            ))}
          </div>
          <button className="program-buttons flex flex-row justify-center !w-full !mt-4 whitespace-nowrap flex-none">Daily Challenge</button>
        </div>
      <div className="m-0 p-0 w-full [grid-area:footer]">
        <Footer />
      </div>
    </div>
  );
}
export default Program;