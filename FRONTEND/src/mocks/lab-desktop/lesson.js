// The guided lesson for the lab desktop: publish the elevator height from the robot code, deploy,
// then find it in the dashboard. In lesson mode only the file for the current lesson is editable and
// apps unlock as steps are completed, so it is hard to wander off.
import { findDashboardTopics } from "./gradle.js";
import { describeProject, findAutoRefs, findRegisteredCommands } from "./autoPlan.js";

export const LESSON_FILE = "src/main/java/frc/robot/subsystems/Elevator.java";
export const TOPIC = "/SmartDashboard/Elevator Height";

export const STEPS = [
  {
    id: "open",
    title: "Find the TODO",
    body: "In VS Code, Elevator.java is open. Find the TODO comment inside periodic().",
    hint: "It is the last line of the periodic() method: “publish the height so it shows up in the Elastic dashboard”.",
    done: (s) => s.openedLessonFile && s.todoVisited,
  },
  {
    id: "publish",
    title: "Publish the height",
    body: "Replace the TODO with a line that sends the elevator height to the dashboard under the name “Elevator Height”.",
    hint: 'SmartDashboard.putNumber("Elevator Height", getHeightMeters());',
    done: (s) => s.publishedTopics.includes(TOPIC),
  },
  {
    id: "deploy",
    title: "Deploy to the robot",
    body: "Click the WPILib icon at the top right of the editor and choose Deploy Robot Code (or press Shift+F5). Wait for BUILD SUCCESSFUL.",
    hint: "If the build fails, read the error in the terminal. It names the file and the line.",
    done: (s) => s.deployedTopics.includes(TOPIC),
  },
  {
    id: "dashboard",
    title: "Find it in Elastic",
    body: "Open Elastic from the taskbar. Click Add Widget, expand SmartDashboard, and drag Elevator Height onto the grid. The lesson notices when the tile is placed.",
    hint: "If Elevator Height is missing from the list, deploy again. The dashboard only shows what the deployed code publishes.",
    done: (s) => s.placedTopics.includes(TOPIC),
  },
];

export const AUTO_NAME = "Score Auto";
export const COMMAND = "runIntake";
export const AUTO_FILE = "src/main/java/frc/robot/RobotContainer.java";

export const STEPS_2 = [
  {
    id: "auto",
    title: "Create the auto",
    body: `In PathPlanner, create a new auto named “${AUTO_NAME}” and add the Pickup path to it.`,
    hint: `Open the Autos tab, press the + button, rename the auto to ${AUTO_NAME}, then use Add Path and pick Pickup. The name must match exactly, including the capital letters.`,
    done: (s) => s.auto2.hasAuto,
  },
  {
    id: "command",
    title: "Add a named command",
    body: `Add a Named Command called “${COMMAND}” to ${AUTO_NAME}, after the path.`,
    hint: `In the auto, use Add Named Command and type ${COMMAND}. PathPlanner only stores the name. The robot code has to supply what it does.`,
    done: (s) => s.auto2.hasCommand,
  },
  {
    id: "register",
    title: "Register it in Java",
    body: `In RobotContainer.java, replace TODO 1 with a line that registers “${COMMAND}” so the auto can find it.`,
    hint: `NamedCommands.registerCommand("${COMMAND}", intake.runIntakeCommand());`,
    done: (s) => s.registered.includes(COMMAND),
  },
  {
    id: "return",
    title: "Return the auto",
    body: `Replace TODO 2 so getAutonomousCommand() returns the PathPlanner auto named “${AUTO_NAME}”.`,
    hint: `return new PathPlannerAuto("${AUTO_NAME}");`,
    done: (s) => s.autoRefs.includes(AUTO_NAME),
  },
  {
    id: "deploy",
    title: "Deploy",
    body: "Deploy the robot code from the WPILib menu in VS Code (or press Shift+F5).",
    hint: "If the robot console warns about a missing auto or command, the names do not match. Compare them letter by letter.",
    done: (s) => s.deployedAuto === AUTO_NAME && s.deployedRegistered.includes(COMMAND),
  },
  {
    id: "run",
    title: "Run it",
    body: "In the Driver Station window, choose Autonomous and press Enable. Watch the robot drive and the command fire.",
    hint: "Add the Field widget in Elastic to watch the robot move. Intake Running turns on when the command runs.",
    done: (s) => s.commandRuns.includes(COMMAND),
  },
];

export const LESSONS = [
  { id: "l1", title: "Lesson 1: Publish a value", file: LESSON_FILE, steps: STEPS, apps: ["code", "elastic"] },
  { id: "l2", title: "Lesson 2: Your first auto", file: AUTO_FILE, steps: STEPS_2, apps: ["code", "elastic", "pathplanner", "ds"] },
];

export function lessonState({ files, deploy, openedLessonFile, todoVisited, widgets = [], project = { autos: {}, paths: {} }, commandRuns = [] }) {
  const described = describeProject(project);
  const mine = described.autos[AUTO_NAME];
  return {
    openedLessonFile,
    todoVisited,
    widgets,
    placedTopics: widgets.map((w) => w.topic),
    publishedTopics: findDashboardTopics(files).map((t) => t.name),
    deployedTopics: deploy?.ok ? (deploy.topics || []).map((t) => t.name) : [],
    registered: findRegisteredCommands(files),
    autoRefs: findAutoRefs(files),
    auto2: { hasAuto: !!mine && mine.paths.includes("Pickup"), hasCommand: !!mine && mine.commands.includes(COMMAND) },
    deployedAuto: deploy?.ok ? deploy.autonomous?.name ?? null : null,
    deployedRegistered: deploy?.ok ? deploy.registered || [] : [],
    commandRuns,
  };
}

// Index of the first unfinished step (steps.length when all are done).
export function currentStep(state, steps = STEPS) {
  const i = steps.findIndex((st) => !st.done(state));
  return i === -1 ? steps.length : i;
}
