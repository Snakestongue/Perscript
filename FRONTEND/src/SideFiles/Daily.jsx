import { useEffect, useRef, useState } from "react";
import { initVimMode } from "monaco-vim";
import Editor from "@monaco-editor/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import problems from "../JSON/dc.json";
import Footer from "../components/Footer.js";


const exerciseGroups = [
  { id: "lesson-basics", label: "Basics", problems: problems.slice(0, 4) },
  { id: "lesson-core-patterns", label: "Core patterns", problems: problems.slice(4, 12) },
  { id: "lesson-command-based", label: "Command based", problems: problems.slice(12, 18) },
  { id: "lesson-difficult", label: "Difficult", problems: problems.slice(18,23)},
  { id: "lesson-V3", label: "V3 Commands (Java Only)", problems: problems.slice(23,27)},

];

const languages = [
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "c++", label: "C++" },
];
const languagePositions = ["0.3rem", "calc(33.333% + 0.1rem)", "calc(66.667% - 0.1rem)"];
const monacoLangMap = {
  "c++": "cpp",
};
function defineEditorTheme(monaco) {
  monaco.editor.defineTheme("frc-practice", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "77777F", fontStyle: "italic" },
      { token: "keyword", foreground: "7AADFF" },
      { token: "keyword.control", foreground: "7AADFF" },
      { token: "type", foreground: "C5B9D9" },
      { token: "type.identifier", foreground: "C5B9D9" },
      { token: "identifier", foreground: "E4E4E7" },
      { token: "function", foreground: "B8CADB" },
      { token: "string", foreground: "D6BFC7" },
      { token: "string.escape", foreground: "E0C99A" },
      { token: "number", foreground: "F0B35A" },
      { token: "operator", foreground: "C8C8CD" },
      { token: "annotation", foreground: "AFC9B3" },
      { token: "delimiter", foreground: "AFAFB6" },
    ],
    colors: {
      "editor.background": "#0B0B0D",
      "editor.foreground": "#EDEDEF",
      "editorCursor.foreground": "#D8E8DA",
      "editor.lineHighlightBackground": "#141416",
      "editor.selectionBackground": "#FFFFFF24",
      "editor.selectionHighlightBackground": "#FFFFFF12",
      "editorLineNumber.foreground": "#707077",
      //AI did this part of colors
      "editorLineNumber.activeForeground": "#B8B8BE",
      "editorBracketHighlight.foreground1": "#D0B5F2",
      "editorBracketHighlight.foreground2": "#C3A5E8",
      "editorBracketHighlight.foreground3": "#B595D8",
      "editorBracketHighlight.foreground4": "#A584C8",
      "editorBracketHighlight.foreground5": "#9675B8",
      "editorBracketHighlight.foreground6": "#8768A8",
    },
  });
}

function getTodayKey(){
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
//TESTING
  //return Math.floor(Date.now() / 10000);
}

/**TESTING */
// function getDailyProblem() {
//   const testDay = Math.floor(Date.now() / 10000);

//   return problems[testDay % problems.length];
// }
function getDailyProblem(){
  const today = new Date();
    const dayNumber =
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )/ 86400000;
 // START_DAY= 1;
  return problems[dayNumber % problems.length]
}

function Daily() {
  const [selectedProblem, setSelectedProblem] = useState(getDailyProblem);
const [todayKey, setTodayKey] = useState(getTodayKey);
  const [currentLang, setCurrentLang] = useState("java");
  const [userCode, setUserCode] = useState(selectedProblem.starterCode.java);
  const [aiContent, setAiContent] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [checkResults, setCheckResults] = useState([])
  const [vimOn, setVimOn] = useState(false);
  const vimRef = useRef(null)
  const editorRef = useRef(null)
  const selectedProblemIndex = problems.findIndex((problem) => problem.id === selectedProblem.id)
  const location = useLocation();
  const navigate = useNavigate()
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openGroupId, setOpenGroupId] = useState(() => {
  const group = exerciseGroups.find((g) => g.problems.some((p) => p.id === selectedProblem.id));
    return group?.id ?? exerciseGroups[0].id;
  });
  const validLangs = languages.map((l) => l.value);
  const v3Group =exerciseGroups.find((g)=>g.id=="lesson-V3")
  const isJavaOnly = v3Group?.problems.some((p)=>p.id== selectedProblem.id)?? false


  function normalizeLang(value) {
    return validLangs.includes(value) ? value : "java";
  }

  async function shareLink() {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "")
    const url = `${window.location.origin}${base}/program/${currentLang}/${selectedProblem.link}`;
    if(navigator.share){
      try {
        await navigator.share({
          title: `Perscript · ${selectedProblem.title}`,
          text: selectedProblem.description,
          url,
        });
        return;
      } catch {
        return //meaning like user said nuhuh
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() =>setCopiedLink(false),1500);
    }catch (error){ //dont want alerts anymore!
      console.error("Copy failed", error);
    }
  }
  async function shareCode() {
    const code = userCode || "";
    if (!code.trim()) return;
    if(navigator.share){
      try {
        await navigator.share({
          title: `${selectedProblem.title} — my ${currentLang} solution`,
          text: code,
        });
        return;
      } catch {
        return //user said nope
      }
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  useEffect(() => {
    const checkDate = () =>{
      const newKey = getTodayKey();
      if (newKey !== todayKey) {
        setTodayKey(newKey);
        setSelectedProblem(getDailyProblem());
      }}
    const interval = setInterval(checkDate, 30 * 1000);
    return () =>clearInterval(interval);
  },[todayKey]);

 /**TESTING */ 
// useEffect(() => {
//   const checkDate = () => {
//     const newKey = getTodayKey();

//     if (newKey !== todayKey) {
//       setTodayKey(newKey);
//       setSelectedProblem(getDailyProblem());
//     }
//   };

//   const interval = setInterval(checkDate, 1000);

//   return () => clearInterval(interval);
// }, [todayKey]);

  useEffect(() => {
    setUserCode(selectedProblem.starterCode[currentLang]);
    setCheckResults([]);
    setAiContent("");
  }, [currentLang, selectedProblem]);

  useEffect(()=>{
    document.title = "Perscript · " + selectedProblem.title;
  }, [selectProblem]);

  useEffect(() => {
    if (isJavaOnly && currentLang !== "java") {
      changeLang("java");
    }
  }, [isJavaOnly, selectedProblem]);

  useEffect(() => () => vimRef.current?.dispose(), []);
  useEffect(() => {
    const group = exerciseGroups.find((g) => g.problems.some((p) => p.id === selectedProblem.id));
    if (group) setOpenGroupId(group.id);
  }, [selectedProblem]);


  function selectProblem(problem) {
    setSelectedProblem(problem);
    navigate(`/program/${currentLang}/${problem.link}`, { replace: false });
  }

  function changeLang(newLang) {
    setCurrentLang(newLang);
    // navigate(`/program/${newLang}/${selectedProblem.link}`, { replace: false });
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function runChecks() {
    const code = (userCode || "").toLowerCase();
    const results = selectedProblem.checks[currentLang].map((check) => {
      let passed = true;
      if (check.type === "includes"){
        passed = code.includes(check.value.toLowerCase());
      }

      if (check.type === "count"){
        const escaped = escapeRegExp(check.value);
        const count = (code.match(new RegExp(escaped, "gi")) || []).length;
        passed = count >= check.min;
      }

      return {
        message: check.message, 
        passed 
      };
    });

    setCheckResults(results);
  }

  async function submitToAI() {
    if (!userCode?.trim()) {
      setAiContent("Add code in the editor before asking for help.");
      return;
    }

    setAiLoading(true);
    setAiContent("");

    try {
      const response = await fetch(import.meta.env.VITE_LINK + "/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userCode,
          language: currentLang,
          problem: selectedProblem.title,
          correctAnswer: selectedProblem.solutionCode[currentLang],
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI request failed");
      }

      setAiContent(data.result);
    } catch (error) {
      console.error(error);
      setAiContent("AI Assist is unavailable right now. Run the built-in checks or try again later.");
    } finally {
      setAiLoading(false);
    }
  }

  function toggleVim() {
    if (!editorRef.current) return;

    if (vimOn) {
      vimRef.current?.dispose();
      vimRef.current = null;
    } else {
      const statusNode = document.getElementById("vim-status");
      if (statusNode) statusNode.innerHTML = "";
      vimRef.current = initVimMode(editorRef.current, statusNode);
    }

    setVimOn((value) => !value);
  }

  return (
    <div className="site-page practice-page" id="overall-program">
      <main id="main-content" className="practice-shellDC">
        
        <section id="browser-editor" className="editor-stage" aria-labelledby="exercise-title">
          <header className="exercise-heading">
            <div>
              <p>Daily Challenge {String(selectedProblem.id).padStart(2, "0")}</p>

              <div className="flex flex-row items-center gap-3">
                <h1 id="exercise-title">{selectedProblem.title}</h1>
                
              </div>
            </div>

            <p>{selectedProblem.description}<span
                  className="difficulty-badge ml-6 "
                  data-difficulty={selectedProblem.difficulty}
                >
                  {selectedProblem.difficulty}
                </span></p>
          </header>

          <div className="editor-frame">
            <Editor
              height="100%"
              language={monacoLangMap[currentLang] ?? currentLang}
              theme="frc-practice"
              value={userCode}
              onChange={(value) => setUserCode(value || "")}
              beforeMount={defineEditorTheme}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                lineHeight: 22,
                bracketPairColorization: { enabled: true },
                minimap: { enabled: false },
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
              }}
            />
            <div id="vim-status" aria-live="polite" />
          </div>

          <div className="editor-actions" aria-label="Editor actions">
            <button
              className="action-buttons quiet-action"
              type="button"
              onClick={toggleVim}
              id="vim-toggle"
              aria-pressed={vimOn}
            >
              Vim {vimOn ? "on" : "off"}
            </button>
            <button
              id="show-answer"
              className="action-buttons quiet-action"
              type="button"
              onClick={() => setUserCode(selectedProblem.solutionCode[currentLang])}
            >Show answer
            </button>
            <button
              className="action-buttons quiet-action"
              type="button"
              id="clear-button"
              onClick={() => setUserCode(selectedProblem.starterCode[currentLang])}
            >Reset Code
            </button>

            <button type="button" className="action-buttons quiet-action" onClick={shareLink}>
                {copiedLink ? "Link copied!" : "Share link"}
            </button>

            <button type="button" className="action-buttons quiet-action" onClick={shareCode}>
                {copiedCode ? "Code copied!" : "Share code"}
            </button>
            
            <button className="action-buttons" type="button" onClick={submitToAI} disabled={aiLoading}>
              {aiLoading ? "Thinking…" : "Ask AI"}
            </button>
            <button className="action-buttons primary-action" id="run-submit" type="button" onClick={runChecks}>
              Run checks
            </button>
          </div>
          <fieldset className="rail-language !my-6">
            {/* <legend className="max-lg:!text-center">Language</legend> */}
            <div className="language-switch">
              <span
                aria-hidden="true"
                className="language-indicator"
                style={{
                  borderRadius: 1000,
                  left: languagePositions[languages.findIndex(({ value }) => value === currentLang)],
                }}
              />
              {languages.map((language, index) => {
                const disabled = isJavaOnly && language.value !== "java";
                return (
                  <label
                    className="language-option"
                    data-active={currentLang === language.value}
                    data-disabled={disabled}
                    key={language.value}
                    style={{ gridColumn: index + 1, gridRow: 1 }}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="language"
                      value={language.value}
                      checked={currentLang === language.value}
                      disabled={disabled}
                      onChange={() => !disabled && changeLang(language.value)}
                    />
                    <span>{language.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="feedback-grid">
            <section id="built-in-checks" className="feedback-panel" aria-labelledby="results-heading">
              <h2 id="results-heading">Results</h2>
              <ul className="words-content" aria-live="polite">
                {checkResults.length > 0 ? checkResults.map((check, index) => (
                  <li key={`${check.message}-${index}`} className={check.passed ? "check-passed" : "check-failed"}>
                    <span aria-hidden="true">{check.passed ? "✓" : "×"}</span>
                    {check.message}
                  </li>
                )) : (
                  <li className="feedback-empty">Run your code to see focused checks here.</li>
                )}
              </ul>
            </section>
            
            <section id="ai-assist" className="feedback-panel" aria-labelledby="ai-heading">
              <h2 id="ai-heading">AI Assist</h2>
              <div className="words-content ai-content" aria-live="polite">
                {aiLoading ? "Reviewing your code…" : aiContent || "Ask for a hint when the built-in checks are not enough."}
              </div>
              
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Daily;
