# Lab desktop

A pretend laptop for robot-lab lessons (`/program/desktop`): draggable windows, a taskbar, a mini
Visual Studio Code and the Elastic dashboard (PathPlanner is wired in as an optional window).

| File | What it does |
|---|---|
| `index.jsx` | The desktop: window manager (drag, resize, minimize, maximize, close), taskbar, robot status, full screen. |
| `VsCode.jsx` | Mini VS Code: file explorer, tabs, the site's Monaco editor with the Java autocomplete / hover / syntax checks, and a terminal. |
| `gradle.js` | A pretend `./gradlew`: nothing is compiled or sent anywhere. It lints the Java files, prints GradleRIO-style output, and reports which `SmartDashboard.put*` topics a deploy would publish. |
| `project/` | The practice robot project. Real files, loaded with `import.meta.glob`, so adding or editing a file here changes the student's project. |

## Deploy to the dashboard

`./gradlew deploy` succeeds only when the Java files pass the syntax check. On success the desktop
stores the result in `sessionStorage["labRobotDeploy"]` and posts it on the `lab-robot`
BroadcastChannel:

```json
{ "type": "deploy", "ok": true, "topics": [{ "name": "/SmartDashboard/Elevator Height", "type": "double" }] }
```

The Elastic window is loaded with `?lab=1`. In that mode its simulated robot starts with only the
topics every robot has (Gyro, Field, Auto Chooser) and then adds or removes the student topics as
deploys arrive (see `../elastic/patch/`). Elastic must be built with the lab-mode patch for this.

## Edits

Student edits are kept in `localStorage["labDesktopFiles"]` (only files that differ from the
starting project). The Explorer's **Reset** button restores the starting files.

## Adding an app window

Add an entry to `APPS` in `index.jsx` (`id`, `title`, `icon`, `src` for an iframe app) and an
initial position in the `wins` state. An app with `optional: true` is shown in the taskbar but is
closed at first.
