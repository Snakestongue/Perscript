import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import problems from "../JSON/debugProblems.json";
import Footer from "../components/Footer.js";
import SyntaxCode from "../components/SyntaxCode.js";
import { Link } from "react-router-dom";
const languages = ["Java", "Python", "C++"];

function Bug() {
  const { problemId } = useParams();
  const [selectedChoices, setSelectedChoices] = useState({});

  useEffect(() => {
    document.title = "Perscript | Debugging Practice";
  }, []);

  useEffect(() => {
    if (!problemId){
      return;
    }
    const target =problemId
    const frame= requestAnimationFrame(()=>{
      document.getElementById(target)?.scrollIntoView({block: "start", behavior:"smooth"});
    }); return () => cancelAnimationFrame(frame);
  },[problemId])
  
  useEffect(() => {
    if (!location.hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key]);


  // share
  const [copiedId, setCopiedId] = useState(null);
  const shareProblem =async (problem) =>{
    const base = import.meta.env.BASE_URL.replace(/\/$/, "")
    const url = `${window.location.origin}${base}/debug/${problem.title}`
    if(navigator.share){
      try {
        await navigator.share({
          title: `Perscript Debugging Practice — ${problem.title}`,
          text: problem.question,
          url,
        });
      } catch (err) {
        //nothing - user said nope donnt wanna.
      }
    }else{
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(problem.title);
        setTimeout(()=>setCopiedId(null), 1500);
      } catch (err) {
        console.error("Copy failed", err);
      }
    }
  };

  return (
    <div className="site-page">
      <main id="main-content" className="debug-page">
        <header className="page-intro debug-intro">
          <p className="eyebrow">Debugging practice</p>
          <h1>Find the bug before the robot does.</h1>
          <p>Read each snippet, select the issue, and use the explanation to sharpen your skills.</p>
        </header>

        <div id="f3">
          {languages.map((language, languageIndex) => (
            <section
              id={`debug-${language === "C++" ? "cpp" : language.toLowerCase()}`}
              className="debug-language-group"
              key={language}
            >
              <div className="bugLangDiv">
                <h2 className="bugLang">{language}</h2>
              </div>
              <div className="debug-question-grid">
                
                {problems.slice(languageIndex * 10, languageIndex * 10 + 10).map((problem) => {
                  const choices = [problem.choice1, problem.choice2, problem.choice3];
                  const userChoice = selectedChoices[problem.title];
                  const isCorrect = userChoice === problem.CC;

                  return <article className="bQ" id={problem.title} key={problem.id}>
                  <div className="bug-prompt">
                      <div className="
                      flex flex-row 
                      items-center justify-between
                       gap-4">
                        <Link to={`/debug/${problem.title}`} className="bug-permalink" aria-label={`Link to problem ${problem.title}`}>
                          #{problem.id}
                        </Link>
                        <h2>{problem.question}</h2>
                        <button
                          type="button"
                          className="
                          text-sm px-2 py-1 
                          rounded-md border border-[#7AADFF] 
                          bg-transparent cursor-pointer 
                          whitespace-nowrap transition duration-200 
                          hover:bg-[#7AADFF] 
                          hover:!text-black"
                          onClick={() => shareProblem(problem)}
                          aria-label={`Share problem ${problem.title}`}
                        >
                          {copiedId === problem.title ? "Copied!" : "Share"}
                        </button>
                      </div>
                      <pre id={`sample-${problem.title}`}><SyntaxCode code={problem.sampleCode} /></pre>
                  </div>
                  <fieldset>
                    <legend className="sr-only">Choose the cause of the bug</legend>
                    {choices.map((choice, choiceIndex) => (
                      <label className="bug-labels" key={choiceIndex}>
                        <input
                          type="radio"
                          name={`problem-${problem.title}`}
                          value={choice}
                          checked={userChoice === choice}
                          onChange={(event) => setSelectedChoices({
                            ...selectedChoices,
                            [problem.title]: event.target.value,
                          })}
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="bug-feedback-slot" aria-live="polite" aria-atomic="true">
                    <p
                      className={`bug-feedback ${userChoice ? (isCorrect ? "correctFeedback" : "incorrectFeedback") : "is-empty"}`}
                      aria-hidden={!userChoice}
                    >
                      <strong>{isCorrect ? "Correct." : "Not quite."}</strong>{" "}
                      {!isCorrect && problem.whyCorrect}
                    </p>
                  </div>
                  </article>;
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Bug;