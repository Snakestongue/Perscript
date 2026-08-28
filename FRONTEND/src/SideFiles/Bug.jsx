import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import problems from "../JSON/debugProblems.json";
import Footer from "../components/Footer.js";
import SyntaxCode from "../components/SyntaxCode.js";

const languages = [
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "c++", label: "C++" },
];
const languagePositions = ["0.3rem", "calc(33.333% + 0.1rem)", "calc(66.667% - 0.1rem)"];
const difficulties = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
const difficultyValues = difficulties.map((d) => d.value);

function Bug() {
  const { language: languageParam, difficulty: difficultyParam, problemId } = useParams();
  const navigate = useNavigate();

  const [selectedChoices, setSelectedChoices] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [highlightedProblem, setHighlightedProblem] = useState(null);

  useEffect(() => {
    document.title = "Perscript | Debugging Practice";
  }, []);

  useEffect(() => {
    if (problemId){
      return
    }
    const isValidLanguage = languageParam && languages.some((l) => l.value === languageParam);
    const isValidDifficulty = difficultyParam && difficultyValues.includes(difficultyParam);

    if (isValidLanguage && isValidDifficulty) {
      setSelectedLanguage(languageParam);
      setSelectedDifficulty(difficultyParam);
      return;
    }

    if (languageParam && difficultyValues.includes(languageParam) && difficultyParam) {
      const legacyMatch = problems.find((p) => p.title === difficultyParam);
      if (legacyMatch) {
        navigate(`/debug/${legacyMatch.language}/${legacyMatch.difficulty}/${legacyMatch.title}`, {
          replace: true,
        });
        return;
      }
    }

    setSelectedLanguage(isValidLanguage ? languageParam : "java");
    setSelectedDifficulty(isValidDifficulty ? difficultyParam : "all");
  }, [languageParam, difficultyParam, problemId, navigate]);
  
  useEffect(() => {
    if (!problemId) {
      return
    }
    const match = problems.find((p) => p.title === problemId);
    if(!match){
      navigate("/debug", { replace: true });
      return;
    }
    if(languageParam !== match.language ||difficultyParam !== match.difficulty){
      navigate(
        `/debug/${match.language}/${match.difficulty}/${match.title}`,
        { replace: true }
      );
      return
    }
    if(selectedLanguage !== match.language || selectedDifficulty !== match.difficulty){
      setSelectedLanguage(match.language);
      setSelectedDifficulty(match.difficulty);
      return;
    }

    // double frame wait so not extra scrollly
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        const element = document.getElementById(problemId)
        if(element){
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      })
      return ()=> cancelAnimationFrame(frame2)
    });
    return () => cancelAnimationFrame(frame1)
  },[
    problemId,
    languageParam,
    difficultyParam,
    selectedLanguage,
    selectedDifficulty,
    navigate,
  ])

  useEffect(() => {
  if (!problemId) return;

  setHighlightedProblem(problemId);

  const timer = setTimeout(() => {
    setHighlightedProblem(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [problemId]);

  function changeLanguage(newLanguage) {
    setSelectedLanguage(newLanguage);
    navigate(`/debug/${newLanguage}/${selectedDifficulty}`, { replace: true });
  }

  function changeDifficulty(newDifficulty) {
    setSelectedDifficulty(newDifficulty);
    navigate(`/debug/${selectedLanguage}/${newDifficulty}`, { replace: true });
  }

  const shareProblem = async (problem) => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${window.location.origin}${base}/debug/${problem.language}/${problem.difficulty}/${problem.title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perscript Debugging Practice — ${problem.title}`,
          text: problem.question,
          url,
        });
      } catch (err) {
        // nothing - user said nope donnt wanna.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(problem.title);
        setTimeout(() => setCopiedId(null), 1500);
      } catch (err) {
        console.error("Copy failed", err);
      }
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesLanguage = problem.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    return matchesLanguage && matchesDifficulty;
  });

  const activeLanguageLabel = languages.find((l) => l.value === selectedLanguage)?.label ?? selectedLanguage;
  const activeDifficultyLabel = difficulties.find((d) => d.value === selectedDifficulty)?.label ?? "";

  return (
    <div className="site-page">
      <main id="main-content" className="debug-page">
        <header className="page-intro debug-intro">
          <p className="eyebrow">Debugging practice</p>
          <h1>Find the bug before the robot does.</h1>
          <p>Read each snippet, select the issue, and use the explanation to sharpen your skills.</p>
        </header>

        <div className="debug-shell">
          <aside className="exercise-rail" aria-label="Problem filters">
            {/* Sliding language switch, same pattern as the Program page */}
            <fieldset className="rail-language">
              <legend className="max-lg:!text-center">Language</legend>
              <div className="language-switch">
                <span
                  aria-hidden="true"
                  className="language-indicator"
                  style={{
                    borderRadius: 1000,
                    left: languagePositions[languages.findIndex((l) => l.value === selectedLanguage)],
                  }}
                />
                {languages.map((language, index) => (
                  <label
                    className="language-option"
                    data-active={selectedLanguage === language.value}
                    key={language.value}
                    style={{ gridColumn: index + 1, gridRow: 1 }}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="debug-language"
                      value={language.value}
                      checked={selectedLanguage === language.value}
                      onChange={() => changeLanguage(language.value)}
                    />
                    <span>{language.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <nav className="exercise-nav" aria-label="Difficulty">
              <section className="exercise-group">
                <div className="group-header">
                  <h2>Difficulty</h2>
                </div>
                <div className="group-collapse-inner">
                  <div>
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty.value}
                        type="button"
                        className={
                          difficulty.value === selectedDifficulty ? "program-buttons active" : "program-buttons"
                        }
                        aria-pressed={difficulty.value === selectedDifficulty}
                        onClick={() => changeDifficulty(difficulty.value)}
                      >
                        <span className="exercise-step-dot" aria-hidden="true" />
                        {difficulty.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </nav>
          </aside>
          <section id="f3" className="debug-language-group">
            <div className="bugLangDiv">
              <h2 className="bugLang">
                {activeLanguageLabel}
                {selectedDifficulty !== "all" ? ` · ${activeDifficultyLabel}` : ""}
              </h2>
            </div>

            <div className="debug-question-grid">
              {filteredProblems.length === 0 ? (
                <p className="feedback-empty">No problems match this filter yet.</p>
              ) : (
                filteredProblems.map((problem) => {
                  const choices = [problem.choice1, problem.choice2, problem.choice3];
                  const userChoice = selectedChoices[problem.title];
                  const isCorrect = userChoice === problem.CC;

                  return (
                    <article  className={`bQ ${
                        highlightedProblem == problem.title ? "selected-problem" : ""
                      }`}
                      id={problem.title}
                      key={problem.id}>
                      <div className="bug-prompt">
                        <div className="flex flex-row items-center justify-between gap-4">
                          <Link
                            to={`/debug/${problem.language}/${problem.difficulty}/${problem.title}`}
                            className="bug-permalink"
                            aria-label={`Link to problem ${problem.title}`}
                          >
                            #{problem.id}
                          </Link>
                          <h2>{problem.question}</h2>
                          <span className="difficulty-badge" data-difficulty={problem.difficulty}>
                            {problem.difficulty}
                          </span>
                          <button
                            type="button"
                            className="bug-share"
                            onClick={() => shareProblem(problem)}
                            aria-label={`Share problem ${problem.title}`}
                          >
                            {copiedId === problem.title ? "Copied!" : "Share"}
                          </button>
                        </div>
                        <pre id={`sample-${problem.title}`}>
                          <SyntaxCode code={problem.sampleCode} />
                        </pre>
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
                              onChange={(event) =>
                                setSelectedChoices({
                                  ...selectedChoices,
                                  [problem.title]: event.target.value,
                                })
                              }
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
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Bug;