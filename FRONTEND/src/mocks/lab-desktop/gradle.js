// A pretend Gradle: nothing is compiled or sent anywhere. It checks the Java files for syntax
// problems with the site's lint helper, prints output shaped like GradleRIO's, and reports what a
// "deploy" would publish to the dashboard (SmartDashboard.put* calls found in the code).
import { lintCode } from "../../codeLint.js";

export const ROBORIO_HOST = "roboRIO-0000-FRC.local";
const PROMPT_HELP = [
  "Practice terminal commands:",
  "  ./gradlew build         compile the project",
  "  ./gradlew deploy        build and send the code to the (simulated) robot",
  "  ./gradlew clean         delete build output",
  "  ./gradlew tasks         list tasks",
  "  ls   pwd   clear   help",
];

function step(ms, text, kind = "out") {
  return { ms, text, kind };
}

function compileProblems(files) {
  const out = [];
  for (const [path, code] of Object.entries(files)) {
    if (!path.endsWith(".java")) continue;
    for (const m of lintCode(code, "java")) out.push({ path, line: m.startLineNumber, message: m.message });
  }
  return out;
}

// SmartDashboard.putNumber("Name", ...) etc. in the Java sources.
export function findDashboardTopics(files) {
  const types = { Number: "double", Boolean: "boolean", String: "string" };
  const seen = new Map();
  for (const [path, code] of Object.entries(files)) {
    if (!path.endsWith(".java")) continue;
    const noComments = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    for (const m of noComments.matchAll(/SmartDashboard\s*\.\s*put(Number|Boolean|String)\s*\(\s*"([^"]+)"/g)) {
      seen.set(m[2], types[m[1]]);
    }
  }
  return [...seen].map(([name, type]) => ({ name: `/SmartDashboard/${name}`, type }));
}

function buildSteps(files) {
  const problems = compileProblems(files);
  const steps = [step(250, "> Task :compileJava")];
  if (problems.length) {
    for (const p of problems.slice(0, 6)) steps.push(step(120, `${p.path.split("/").pop()}:${p.line}: error: ${p.message}`, "err"));
    if (problems.length > 6) steps.push(step(60, `... ${problems.length - 6} more error(s)`, "err"));
    steps.push(step(150, ""), step(100, "> Task :compileJava FAILED", "err"), step(150, ""));
    steps.push(step(100, "FAILURE: Build failed with an exception.", "err"), step(80, ""));
    steps.push(step(80, "* What went wrong:", "err"), step(80, "Execution failed for task ':compileJava'.", "err"));
    steps.push(step(80, `> Compilation failed; ${problems.length} error(s). See the errors above.`, "err"), step(150, ""));
    steps.push(step(100, `BUILD FAILED in ${2 + problems.length}s`, "err"));
    return { steps, ok: false };
  }
  steps.push(step(500, "> Task :processResources"), step(180, "> Task :classes"), step(300, "> Task :jar"));
  return { steps, ok: true };
}

// Returns { steps, clear?, result? } for a command line.
export function planCommand(line, files) {
  const cmd = line.trim().replace(/^\.\//, "").replace(/^\.\\/, "");
  if (!cmd) return { steps: [] };
  if (cmd === "clear") return { steps: [], clear: true };
  if (cmd === "help") return { steps: PROMPT_HELP.map((t) => step(20, t, "dim")) };
  if (cmd === "pwd") return { steps: [step(20, "/home/student/robot")] };
  if (cmd === "ls") return { steps: [step(20, "build.gradle  README.md  src")] };

  const g = cmd.match(/^gradlew(?:\.bat)?\s*(.*)$/);
  if (!g) return { steps: [step(20, `bash: ${cmd.split(/\s+/)[0]}: command not found`, "err")] };
  const task = g[1].trim().split(/\s+/)[0] || "tasks";

  if (task === "clean") return { steps: [step(300, "> Task :clean"), step(150, ""), step(60, "BUILD SUCCESSFUL in 1s", "ok")] };
  if (task === "tasks") {
    return {
      steps: [
        "Application tasks", "-----------------", "simulateJava - Simulate the robot (not available here)", "", "Build tasks", "-----------", "build - Assembles and tests this project",
        "clean - Deletes the build directory", "", "Deploy tasks", "------------", "deploy - Deploys the robot code to the roboRIO",
      ].map((t) => step(25, t, "dim")),
    };
  }
  if (task === "simulateJava") return { steps: [step(200, "Simulation is not available in this practice environment. Use deploy.", "err")] };
  if (task !== "build" && task !== "deploy") return { steps: [step(100, `FAILURE: Task '${task}' not found in root project 'robot'.`, "err")] };

  const built = buildSteps(files);
  if (!built.ok) return { steps: built.steps, result: { type: task, ok: false } };

  const steps = [...built.steps];
  if (task === "build") {
    steps.push(step(250, "> Task :build"), step(120, ""), step(80, "BUILD SUCCESSFUL in 6s", "ok"), step(40, "4 actionable tasks: 4 executed", "dim"));
    return { steps, result: { type: "build", ok: true } };
  }
  const topics = findDashboardTopics(files);
  steps.push(
    step(300, "> Task :discoverroborio"),
    step(500, `Searching for roboRIO at ${ROBORIO_HOST} ...`, "dim"),
    step(400, "Found roboRIO at 10.0.0.2", "dim"),
    step(250, "> Task :deployfrcJava"),
    step(500, "Deploying frcJava to roborio", "dim"),
    step(600, "  uploading frcUserProgram.jar", "dim"),
    step(500, "  restarting robot code", "dim"),
    step(700, "Deploy Success!", "ok"),
    step(150, "> Task :deploy"),
    step(120, ""),
    step(80, "BUILD SUCCESSFUL in 11s", "ok"),
    step(40, "6 actionable tasks: 6 executed", "dim"),
  );
  return { steps, result: { type: "deploy", ok: true, topics, at: Date.now() } };
}
