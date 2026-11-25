# Robot Lab: planned lessons

Lessons 1 and 2 exist (see `lesson.js`). These four are planned next. Each is written against the
hooks the lab already has, and lists what is missing.

Existing hooks: fake `./gradlew deploy`, deploy payload (`topics`, `registered`, `autonomous`),
Elastic layout/chooser reports on the `lab-robot` channel, PathPlanner project report plus the
`labFs` fake file system, Driver Station mode/enable messages, per-lesson snapshots.

## Lesson 3: Auto chooser (two autos, pick one)

**Goal:** build two autos, register commands for them, offer them through an auto chooser, and select
one from Elastic.

1. In PathPlanner, create "Score Auto" (Pickup + `runIntake`) and "Leave Auto" (Score path only).
2. In `RobotContainer.java`, build the chooser: `autoChooser = AutoBuilder.buildAutoChooser();`
   and publish it with `SmartDashboard.putData("Auto Chooser", autoChooser);`.
3. Return `autoChooser.getSelected()` from `getAutonomousCommand()`.
4. Deploy.
5. In Elastic, add the Auto Chooser widget and pick "Score Auto".
6. In the Driver Station, enable Autonomous. The robot runs the chosen auto.
7. Switch to "Leave Auto", re-enable, and watch the other route run.

**Checks:** both autos exist (project report); `buildAutoChooser` and `putData("Auto Chooser"` in the
Java (`usesAutoChooser` already exists in `autoPlan.js`); Elastic reports the chooser selection
(existing `chooser` message); two `auto-started` events with different names.

**Needs:** the deploy payload carries every PathPlanner auto, not just one, and the sim picks the
timeline by the chooser selection (`selected` topic). Elastic's chooser must list the PathPlanner
auto names instead of the fixed demo options after a deploy.

## Lesson 4: Debugging a broken deploy

**Goal:** read the robot console and dashboard to find three planted bugs.

Starting project has a working auto with three problems, introduced one at a time:
1. A compile error (missing semicolon). The build fails and names the file and line.
2. A command registered as `"runIntake "` (trailing space). Deploy succeeds, but the console warns
   the named command is not registered, and the auto skips it.
3. `new PathPlannerAuto("Score auto")` (wrong case). Deploy succeeds, console prints
   `ERROR: PathPlanner auto "Score auto" was not found`, and the Driver Station reports no autonomous
   command.

**Checks:** each bug is "fixed" when the matching warning/error stops appearing and the next
deploy succeeds; the final step is the command firing in the Driver Station run.

**Needs:** a lesson that starts from a pre-broken project (extra starting files per lesson, as
`startFiles` already does); a step type that is "the last deploy had no console warnings".
Most console messages already exist in `onDeploy`.

## Lesson 5: Teleop and button bindings

**Goal:** bind a gamepad button to move the elevator and see it on the dashboard.

1. Add a Gamepad window with on-screen buttons (A, B, X, Y) that can also be driven from the keyboard.
2. In `RobotContainer.configureBindings()`, bind button A to `elevator.setSetpoint(1.0)` and B to
   `elevator.setSetpoint(0.2)` using `new CommandXboxController(0)`.
3. Deploy, enable Teleop in the Driver Station.
4. Press A and B. Elevator Height in Elastic follows the setpoint.

**Checks:** the Java contains the bindings for the right buttons (`findBindings(files)` to write);
a `button` message reaches the sim and changes the Elevator Setpoint topic; the placed Elastic tile
for Elevator Height still reports a changing value.

**Needs:** a Gamepad window component and message type; the sim runs binding actions (`button` ->
set the elevator setpoint) only in Teleop; teleop topics respond to buttons rather than the demo
oscillation.

## Lesson 6: PID tuning inside the lab

**Goal:** tune the elevator's `kP` and `kD` so it reaches its setpoint without overshoot, using the
dashboard graph.

1. Publish `Elevator Setpoint` and `Elevator Height` (lesson 1 style).
2. Put the two on one Elastic graph.
3. Change `kP` in `Constants.java`, deploy, and watch the response.
4. Reach: rise time under 1 s, overshoot under 10 percent.

**Checks:** the sim's elevator model uses the deployed `kP`/`kD` (parsed from `Constants.java`
like the deploy payload parses topics); the lesson reads step response numbers from the sim and
reports them in the Driver Station console after each enable.

**Needs:** parse `kP`/`kD` from Constants into the deploy payload; make `SimRobot` use them in the
elevator model instead of fixed gains; emit a step-response summary event (rise time, overshoot).
Reuse the controls and checks from the existing PID Tuning Lab where possible.

## Order

3 (chooser) first, since it builds directly on lesson 2. Then 4 (debugging), which needs only
console work. 5 and 6 each need a new sim feature.
