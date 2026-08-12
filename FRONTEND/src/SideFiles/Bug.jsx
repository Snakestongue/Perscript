import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import problems from "../JSON/debugProblems.json";
import Footer from "../components/Footer.js";
import SyntaxCode from "../components/SyntaxCode.js";

const languages = ["Java", "Python", "C++"];

function Bug() {
  const location = useLocation();
  const [selectedChoices, setSelectedChoices] = useState({});

  useEffect(() => {
    document.title = "FRC Programming Practice | Debugging Practice";
  }, []);

  useEffect(() => {
    if (!location.hash) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  return (
    <div className="site-page">
      <main id="main-content" className="debug-page">
        <header className="page-intro debug-intro">
          <p className="eyebrow">Debugging practice</p>
          <h1>Find the bug before the robot does.</h1>
          <p>Read each snippet, choose the root cause, and use the explanation to sharpen your review habits.</p>
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
                {problems.slice(languageIndex * 4, languageIndex * 4 + 4).map((problem) => {
                  const choices = [problem.choice1, problem.choice2, problem.choice3];
                  const userChoice = selectedChoices[problem.id];
                  const isCorrect = userChoice === problem.CC;

                  return <article className="bQ" key={problem.id}>
                  <div className="bug-prompt">
                    <h2>{problem.question}</h2>
                    <pre id={`sample-${problem.id}`}><SyntaxCode code={problem.sampleCode} /></pre>
                  </div>
                  <fieldset>
                    <legend className="sr-only">Choose the cause of the bug</legend>
                    {choices.map((choice, choiceIndex) => (
                      <label className="bug-labels" key={choiceIndex}>
                        <input
                          type="radio"
                          name={`problem-${problem.id}`}
                          value={choice}
                          checked={userChoice === choice}
                          onChange={(event) => setSelectedChoices({
                            ...selectedChoices,
                            [problem.id]: event.target.value,
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
