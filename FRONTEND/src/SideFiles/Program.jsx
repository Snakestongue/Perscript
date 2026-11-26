import { useAuth } from "@clerk/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { initVimMode } from "monaco-vim";
import Editor from "@monaco-editor/react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import problems from "../JSON/problems.json";
import Footer from "../components/Footer.js";
import { attachLint } from "../codeLint.js";
import {
  registerJavaIntelliSense,
  attachJavaHelpers,
} from "../lang/javaProvider.js";
import Tune from "./Tune.jsx";

const ElasticLesson = lazy(() => import("../mocks/elastic/index.jsx"));

const exerciseGroups = [
  { id: "lesson-OOP", label: "OOP", problems: problems.slice(0, 4) },
  { id: "lesson-basics", label: "FRC Basics", problems: problems.slice(4, 8) },
  { id: "lesson-core-patterns", label: "Core patterns", problems: problems.slice(8, 16) },
  { id: "lesson-command-based", label: "Command based", problems: problems.slice(16, 22) },
  { id: "lesson-difficult", label: "Difficult", problems: problems.slice(22, 27) },
  { id: "lesson-V3", label: "V3 Commands", problems: problems.slice(27, 31) },
  { id: "lesson-spark-max", label: "SparkMax", problems: problems.slice(31, 34) },
];

const languages = [
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "c++", label: "C++" },
];

const languagePositions = [
  "0.3rem",
  "calc(33.333% + 0.1rem)",
  "calc(66.667% - 0.1rem)",
];

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

function Program() {
  const { lang, problemLink } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  console.log("CLERK STATUS:", {
    isLoaded,
    isSignedIn,
  });

  const validLangs = languages.map((l) => l.value);

  function normalizeLang(value) {
    return validLangs.includes(value) ? value : "java";
  }

  const [selectedProblem, setSelectedProblem] = useState(() => {
    const fromUrl = problems.find(
      (p) => String(p.link) === problemLink
    );
    return fromUrl || problems[0];
  });

  const [currentLang, setCurrentLang] = useState(() =>
    normalizeLang(lang)
  );

  const [userCode, setUserCode] = useState(selectedProblem.starterCode.java);
  const [loadedCodeKey, setLoadedCodeKey] = useState(null);
  const codeKey = `${selectedProblem.link}:${currentLang}`;
  const [completedProblems, setCompletedProblems] = useState([]);
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [checkResults, setCheckResults] = useState([]);
  const [vimOn, setVimOn] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const vimRef = useRef(null);
  const editorRef = useRef(null);

  const selectedProblemIndex = problems.findIndex(
    (problem) => problem.id === selectedProblem.id
  );

  const isPid = location.pathname.endsWith("/program/pid-tuning");
  const isElastic = location.pathname.endsWith("/program/elastic");
  const isDesktop = location.pathname.endsWith("/program/desktop");
  const isTool = isPid || isElastic || isDesktop;

  const [openGroupId, setOpenGroupId] = useState(() => {
    const group = exerciseGroups.find((g) =>
      g.problems.some((p) => p.id === selectedProblem.id)
    );
    return group?.id ?? exerciseGroups[0].id;
  });

  const javaOnlyGroups = exerciseGroups.filter(
    (g) =>
      g.id === "lesson-V3" ||
      g.id === "lesson-spark-max"
  );

  const isJavaOnly = javaOnlyGroups.some((group) =>
    group.problems.some((p) => p.id === selectedProblem.id)
  );

  useEffect(() => {
    document.title = isPid
      ? "Perscript · PID Tuning Lab"
      : isElastic
        ? "Perscript · Elastic Dashboard"
        : isDesktop
          ? "Perscript · Robot Lab Desktop"
          : "Perscript · " + selectedProblem.title;
  }, [isPid, isElastic, isDesktop, selectedProblem.title]);



  useEffect(() => {
    console.log("COMPLETION EFFECT RUNNING");

    if (!isLoaded || !isSignedIn) {
      console.log("User not signed in yet");
      setCompletedProblems([]);
      return;
    }

    const loadCompletions = async () => {
      try {
        console.log("Getting Clerk token...");

        const token = await getToken();

        console.log("TOKEN:", token ? "Received" : "Missing");
        console.log("API URL:", import.meta.env.VITE_LINK + "/completions");

        const response = await fetch(
          `${import.meta.env.VITE_LINK}/completions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("RESPONSE STATUS:", response.status);

        const data = await response.json();
        console.log("RESPONSE DATA:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load completions");
        }

        setCompletedProblems(data.completedProblems);
      } catch (error) {
        console.error("COMPLETION ERROR:", error);
      }
    };

    loadCompletions();
  }, [isLoaded, isSignedIn, getToken]);




  useEffect(() => {
    if (!problemLink) return;

    const match = problems.find((p) => p.link === problemLink);

    if (match && match.id !== selectedProblem.id) {
      setSelectedProblem(match);
    }

    const normalizedLang = normalizeLang(lang);

    if (normalizedLang !== currentLang) {
      setCurrentLang(normalizedLang);
    }
  }, [problemLink, lang]);

  useEffect(() => {
    let cancelled = false;

    async function loadCode() {
      setLoadedCodeKey(null);

      if (!isLoaded) return;

      if (!isSignedIn) {
        setUserCode(selectedProblem.starterCode[currentLang] || "");
        setLoadedCodeKey(codeKey);
        return;
      }

      try {
        const token = await getToken();

        const params = new URLSearchParams({
          slug: selectedProblem.link,
          language: currentLang,
        });

        const response = await fetch(
          `${import.meta.env.VITE_LINK}/saved-code?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load code");
        }

        if (!cancelled) {
          setUserCode(
            data.code ?? selectedProblem.starterCode[currentLang] ?? ""
          );
          setLoadedCodeKey(codeKey);
        }
      } catch (error) {
        console.error("LOADING CODE FAILED:", error);

        if (!cancelled) {
          setUserCode(selectedProblem.starterCode[currentLang] || "");
          setLoadedCodeKey(codeKey);
        }
      }
    }

    loadCode();

    return () => {
      cancelled = true;
    };
  }, [
    codeKey,
    isLoaded,
    isSignedIn,
    getToken,
    selectedProblem,
    currentLang,
  ]);

  useEffect(() => {
    // Only save after the correct problem's code has loaded.
    if (
      !isLoaded ||
      !isSignedIn ||
      loadedCodeKey !== codeKey
    ) {
      return;
    }

    const saveTimeout = setTimeout(async () => {
      try {
        const token = await getToken();

        const response = await fetch(
          `${import.meta.env.VITE_LINK}/saved-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              slug: selectedProblem.link,
              title: selectedProblem.title,
              language: currentLang,
              code: userCode,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save code");
        }

        console.log("CODE AUTOSAVED:", selectedProblem.link);
      } catch (error) {
        console.error("AUTOSAVE FAILED:", error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [
    userCode,
    loadedCodeKey,
    codeKey,
    isLoaded,
    isSignedIn,
    getToken,
    selectedProblem.link,
    selectedProblem.title,
    currentLang,
  ]);
  useEffect(() => {
    if (isJavaOnly && currentLang !== "java") {
      changeLang("java");
    }
  }, [isJavaOnly, selectedProblem]);

  useEffect(() => {
    if (!location.hash) return;

    const group = exerciseGroups.find(
      ({ id }) => `#${id}` === location.hash
    );

    const firstProblem = group?.problems[0];
    if (firstProblem) {
      setSelectedProblem(firstProblem);
    }

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(group ? "browser-editor" : location.hash.slice(1))
        ?.scrollIntoView({ block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key]);




  useEffect(() => {
    if (!problemLink) return;

    const frame = requestAnimationFrame(() => {
      document
        .getElementById("browser-editor")
        ?.scrollIntoView({ block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [problemLink]);

  useEffect(() => {
    const group = exerciseGroups.find((g) =>
      g.problems.some((p) => p.id === selectedProblem.id)
    );

    if (group) {
      setOpenGroupId(group.id);
    }
  }, [selectedProblem]);

  useEffect(() => {
    return () => vimRef.current?.dispose();
  }, []);

  function selectProblem(problem) {
    setSelectedProblem(problem);
    navigate(`/program/${currentLang}/${problem.link}`, {
      replace: false,
    });
  }

  function changeLang(newLang) {
    setCurrentLang(newLang);
    navigate(`/program/${newLang}/${selectedProblem.link}`, {
      replace: false,
    });
  }

  function toggleGroup(groupId) {
    setOpenGroupId((current) =>
      current === groupId ? null : groupId
    );
  }

  async function shareLink() {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${window.location.origin}${base}/program/${currentLang}/${selectedProblem.link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perscript · ${selectedProblem.title}`,
          text: selectedProblem.description,
          url,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }

  async function shareCode() {
    const code = userCode || "";

    if (!code.trim()) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedProblem.title} — my ${currentLang} solution`,
          text: code,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async function runChecks() {
    const code = (userCode || "").toLowerCase();

    const results = selectedProblem.checks[currentLang].map((check) => {
      let passed = true;

      if (check.type === "includes") {
        passed = code.includes(check.value.toLowerCase());
      }

      if (check.type === "count") {
        const escaped = escapeRegExp(check.value);
        const count = (
          code.match(new RegExp(escaped, "gi")) || []
        ).length;

        passed = count >= check.min;
      }

      return {
        message: check.message,
        passed,
      };
    });
    setCheckResults(results);

    if (results.length > 0 && results.every((check) => check.passed)) {
      if (!isLoaded || !isSignedIn) {
        console.log("Sign in to save your progress!");
        return;
      }

      try {
        const token = await getToken();

        const response = await fetch(
          `${import.meta.env.VITE_LINK}/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              slug: selectedProblem.link,
              title: selectedProblem.title,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save completion");
        }

        console.log("COMPLETION SAVED:", data);

        setCompletedProblems((previous) =>
          previous.includes(selectedProblem.link)
            ? previous
            : [...previous, selectedProblem.link]
        );
      } catch (error) {
        console.error("SAVING COMPLETION FAILED:", error);
      }
    }
  }

  async function submitToAI() {
    if (!userCode?.trim()) {
      setAiContent("Add code in the editor before asking for help.");
      return;
    }

    setAiLoading(true);
    setAiContent("");

    try {
      const response = await fetch(
        import.meta.env.VITE_LINK + "/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: userCode,
            language: currentLang,
            problem: selectedProblem.title,
            correctAnswer: selectedProblem.solutionCode[currentLang],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI request failed");
      }

      setAiContent(data.result);
    } catch (error) {
      console.error(error);
      setAiContent(
        "AI Assist is unavailable right now. Run the built-in checks or try again later."
      );
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

      if (statusNode) {
        statusNode.innerHTML = "";
      }

      vimRef.current = initVimMode(
        editorRef.current,
        statusNode
      );
    }

    setVimOn((value) => !value);
  }

  return (
    <div className="site-page practice-page" id="overall-program">
      <main id="main-content" className="practice-shell">
        <aside className="exercise-rail" aria-label="Exercise selection">
          <fieldset className="rail-language" hidden={isTool}>
            <legend className="max-lg:!text-center">Language</legend>

            <div className="language-switch">
              <span
                aria-hidden="true"
                className="language-indicator"
                style={{
                  borderRadius: 1000,
                  left: languagePositions[
                    languages.findIndex(
                      ({ value }) => value === currentLang
                    )
                  ],
                }}
              />

              {languages.map((language, index) => {
                const disabled =
                  isJavaOnly && language.value !== "java";

                return (
                  <label
                    className="language-option"
                    data-active={currentLang === language.value}
                    data-disabled={disabled}
                    key={language.value}
                    style={{
                      gridColumn: index + 1,
                      gridRow: 1,
                    }}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="language"
                      value={language.value}
                      checked={currentLang === language.value}
                      disabled={disabled}
                      onChange={() =>
                        !disabled && changeLang(language.value)
                      }
                    />
                    <span>{language.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <nav
            className="exercise-nav media-moveable"
            aria-label="Exercises"
          >
            {exerciseGroups.map((group) => {
              const isOpen = openGroupId === group.id;

              return (
                <section
                  id={group.id}
                  key={group.id}
                  className="exercise-group"
                  style={{
                    "--group-progress": Math.min(
                      1,
                      Math.max(
                        0,
                        (selectedProblemIndex -
                          problems.indexOf(group.problems[0])) /
                        (group.problems.length - 1)
                      )
                    ),
                  }}
                >
                  <button
                    type="button"
                    className="group-header max-lg:hidden"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    aria-controls={`${group.id}-panel`}
                  >
                    <h2>{group.label}</h2>

                    <span
                      className="group-chevron"
                      data-open={isOpen}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>

                  <div
                    className="group-collapse"
                    data-open={isOpen}
                    id={`${group.id}-panel`}
                  >
                    <div className="group-collapse-inner">
                      <div>
                        {group.problems.map((problem) => (
                          <button
                            className={
                              !isTool &&
                                problem.id === selectedProblem.id
                                ? "program-buttons active"
                                : "program-buttons"
                            }
                            key={problem.id}
                            type="button"
                            data-complete={completedProblems.includes(problem.link)}
                            aria-current={
                              !isTool &&
                                problem.id === selectedProblem.id
                                ? "true"
                                : undefined
                            }
                            aria-label={`Exercise ${problem.id}: ${problem.title}`}
                            onClick={() => selectProblem(problem)}
                          >
                            <span
                              className="exercise-step-dot"
                              aria-hidden="true"
                            />
                            {problem.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}

            {/* PID Tuning */}
            <section
              id="lesson-pid-tuning"
              className="exercise-group"
            >
              <button
                type="button"
                className="group-header max-lg:hidden"
                onClick={() => toggleGroup("pid")}
                aria-expanded={openGroupId === "pid"}
                aria-controls="pid-panel"
              >
                <h2>PID Tuning</h2>

                <span
                  className="group-chevron"
                  data-open={openGroupId === "pid"}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              <div
                className="group-collapse"
                data-open={openGroupId === "pid"}
                id="pid-panel"
              >
                <div className="group-collapse-inner">
                  <div>
                    <Link
                      className={
                        isPid
                          ? "program-buttons active"
                          : "program-buttons"
                      }
                      to="/program/pid-tuning"
                      aria-label="PID Tuning Lab"
                      aria-current={isPid ? "page" : undefined}
                    >
                      <span
                        className="exercise-step-dot"
                        aria-hidden="true"
                      />
                      PID Tuning Lab
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Dashboards */}
            <section
              id="lesson-dashboards"
              className="exercise-group"
            >
              <button
                type="button"
                className="group-header max-lg:hidden"
                onClick={() => toggleGroup("dashboards")}
                aria-expanded={openGroupId === "dashboards"}
                aria-controls="dashboards-panel"
              >
                <h2>Dashboards</h2>

                <span
                  className="group-chevron"
                  data-open={openGroupId === "dashboards"}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              <div
                className="group-collapse"
                data-open={openGroupId === "dashboards"}
                id="dashboards-panel"
              >
                <div className="group-collapse-inner">
                  <div>
                    <Link
                      className={
                        isElastic
                          ? "program-buttons active"
                          : "program-buttons"
                      }
                      to="/program/elastic"
                      aria-label="Elastic Dashboard"
                      aria-current={isElastic ? "page" : undefined}
                    >
                      <span
                        className="exercise-step-dot"
                        aria-hidden="true"
                      />
                      Elastic Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Robot Lab */}
            <section
              id="lesson-robot-lab"
              className="exercise-group max-[999px]:hidden"
            >
              <button
                type="button"
                className="group-header max-lg:hidden"
                onClick={() => toggleGroup("robot-lab")}
                aria-expanded={openGroupId === "robot-lab"}
                aria-controls="robot-lab-panel"
              >
                <h2>Robot Lab</h2>

                <span
                  className="group-chevron"
                  data-open={openGroupId === "robot-lab"}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              <div
                className="group-collapse"
                data-open={openGroupId === "robot-lab"}
                id="robot-lab-panel"
              >
                <div className="group-collapse-inner">
                  <div>
                    <Link
                      className={
                        isDesktop
                          ? "program-buttons active robot-lab-nav-link"
                          : "program-buttons robot-lab-nav-link"
                      }
                      to="/program/desktop"
                      aria-label="Lab Desktop"
                      aria-current={isDesktop ? "page" : undefined}
                    >
                      <span
                        className="exercise-step-dot"
                        aria-hidden="true"
                      />
                      Robot Lab
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </nav>
        </aside>

        {isPid ? (
          <section
            id="browser-editor"
            className="editor-stage"
            aria-label="PID Tuning Lab"
          >
            <Tune embedded />
          </section>
        ) : isElastic ? (
          <section
            id="browser-editor"
            className="editor-stage"
            aria-label="Elastic Dashboard"
          >
            <header className="exercise-heading">
              <div>
                <p>Dashboards</p>
                <h1>Elastic: build a driver dashboard</h1>
              </div>

              <p>
                The real Elastic dashboard running against a simulated
                robot. Add widgets, make a graph, and pick an auto routine.
              </p>
            </header>

            <div
              style={{
                overflow: "auto",
                minHeight: 0,
                flex: 1,
                padding: "0 0 1rem",
              }}
            >
              <Suspense
                fallback={
                  <p className="p-4 text-sm text-slate-400">
                    Loading lesson…
                  </p>
                }
              >
                <ElasticLesson />
              </Suspense>
            </div>
          </section>
        ) : isDesktop ? (
          <section
            id="browser-editor"
            className="editor-stage"
            aria-label="Lab Desktop"
          >
            <header className="exercise-heading">
              <div>
                <p>Robot Lab</p>
                <h1>Write it, deploy it, see it</h1>
              </div>

              <p>
                A pretend laptop: edit robot code in VS Code, deploy it,
                build an auto in PathPlanner, and watch it in Elastic.
              </p>
            </header>

            <div style={{ padding: "0 0 1rem" }}>
              <p
                style={{
                  maxWidth: "40rem",
                  lineHeight: 1.6,
                }}
              >
                Two guided lessons. Lesson 1 publishes a value to the
                dashboard. Lesson 2 builds an autonomous routine. The
                lab opens full screen, and Exit Robot Lab brings you
                back here.
              </p>

              <Link
                to="/lab"
                className="program-buttons active"
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  padding: "0.6rem 1.2rem",
                }}
              >
                Enter Robot Lab
              </Link>
            </div>
          </section>
        ) : (
          <section
            id="browser-editor"
            className="editor-stage"
            aria-labelledby="exercise-title"
          >
            <header className="exercise-heading">
              <div>
                <p>
                  Exercise {String(selectedProblem.id).padStart(2, "0")}
                </p>
                <h1 id="exercise-title">
                  {selectedProblem.title}
                </h1>
              </div>

              <p>{selectedProblem.description}</p>
            </header>

            {/* Code editor */}
            <div className="editor-frame">
              <Editor
                height="100%"
                language={monacoLangMap[currentLang] ?? currentLang}
                theme="frc-practice"
                value={userCode}
                onChange={(value) => setUserCode(value || "")}
                beforeMount={defineEditorTheme}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  attachLint(monaco, editor);
                  registerJavaIntelliSense(monaco);
                  attachJavaHelpers(editor, { monaco });
                }}
                options={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 14,
                  lineHeight: 22,
                  bracketPairColorization: { enabled: true },
                  fixedOverflowWidgets: true,
                  parameterHints: {
                    enabled: true,
                    cycle: true,
                  },
                  hover: {
                    enabled: true,
                    delay: 250,
                    sticky: true,
                  },
                  suggest: {
                    showStatusBar: true,
                    preview: true,
                  },
                  minimap: { enabled: false },
                  padding: { top: 20, bottom: 20 },
                  scrollBeyondLastLine: false,
                }}
              />

              <div id="vim-status" aria-live="polite" />
            </div>

            {/* Editor buttons */}
            <div
              className="editor-actions"
              aria-label="Editor actions"
            >
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
                onClick={() =>
                  setUserCode(selectedProblem.solutionCode[currentLang])
                }
              >
                Show answer
              </button>

              <button
                className="action-buttons quiet-action"
                type="button"
                id="clear-button"
                onClick={() =>
                  setUserCode(selectedProblem.starterCode[currentLang])
                }
              >
                Reset Code
              </button>

              <button
                type="button"
                className="action-buttons quiet-action"
                onClick={shareLink}
              >
                {copiedLink ? "Link copied!" : "Share link"}
              </button>

              <button
                type="button"
                className="action-buttons quiet-action"
                onClick={shareCode}
              >
                {copiedCode ? "Code copied!" : "Share code"}
              </button>

              <button
                className="action-buttons"
                type="button"
                onClick={submitToAI}
                disabled={aiLoading}
              >
                {aiLoading ? "Thinking…" : "Ask AI"}
              </button>

              <button
                className="action-buttons primary-action"
                id="run-submit"
                type="button"
                onClick={runChecks}
              >
                Run checks
              </button>
            </div>

            {/* Results and AI Assist — only one copy */}
            <div className="feedback-grid">
              <section
                id="built-in-checks"
                className="feedback-panel"
                aria-labelledby="results-heading"
              >
                <h2 id="results-heading">Results</h2>

                <ul className="words-content" aria-live="polite">
                  {checkResults.length > 0 ? (
                    checkResults.map((check, index) => (
                      <li
                        key={`${check.message}-${index}`}
                        className={
                          check.passed
                            ? "check-passed"
                            : "check-failed"
                        }
                      >
                        <span aria-hidden="true">
                          {check.passed ? "✓" : "×"}
                        </span>
                        {check.message}
                      </li>
                    ))
                  ) : (
                    <li className="feedback-empty">
                      Run your code to see focused checks here.
                    </li>
                  )}
                </ul>
              </section>

              <section
                id="ai-assist"
                className="feedback-panel"
                aria-labelledby="ai-heading"
              >
                <h2 id="ai-heading">AI Assist</h2>

                <div
                  className="words-content ai-content"
                  aria-live="polite"
                >
                  {aiLoading
                    ? "Reviewing your code…"
                    : aiContent ||
                    "Ask for a hint when the built-in checks are not enough."}
                </div>
              </section>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Program;
