# Elastic lesson

This folder holds the lesson wrapper for **Elastic**, the FRC driver dashboard by Gold872
(<https://github.com/Gold872/elastic-dashboard>, MIT licensed, license text in `ELASTIC_LICENSE`).

The dashboard in the lesson is the real Elastic web build. The only changes to Elastic are:

- a **simulated robot** (`patch/sim_robot.dart`) that Elastic uses instead of a NetworkTables
  connection when built with `--dart-define=SIM_ROBOT=true`. It publishes the topics a student's
  `SmartDashboard.put*` calls would: Elevator Height, Intake Has Piece, Battery Voltage, Match
  Time, Gyro, a Field robot pose and an Auto Chooser;
- a hook in `lib/services/nt4_client.dart` that starts the simulation, and a
  `<base href="$FLUTTER_BASE_HREF">` line in `web/index.html` so it can be served from a subfolder.

The edits are in `patch/elastic-sim-robot.patch`; `patch/sim_robot.dart`, `sim_lab_link_stub.dart` and `sim_lab_link_web.dart` are new files.

**Lab mode.** When the page is opened with `?lab=1` (as in the lab desktop), the simulated robot only publishes the topics every robot has and then adds or removes the topics a deploy from the practice laptop publishes (`sessionStorage["labRobotDeploy"]` plus a `lab-robot` BroadcastChannel). Without `?lab=1` it publishes everything, as in the Elastic lesson.

## Rebuilding

```
git clone https://github.com/Gold872/elastic-dashboard.git
cd elastic-dashboard
git apply <this repo>/FRONTEND/src/mocks/elastic/patch/elastic-sim-robot.patch
cp <this repo>/FRONTEND/src/mocks/elastic/patch/sim_*.dart lib/services/
flutter pub upgrade elegant_notification   # 2.5.1 does not compile on Flutter 3.50; the pubspec range already allows 2.5.5
flutter build web --release --dart-define=SIM_ROBOT=true \
  --base-href=/Perscript/elastic/ --pwa-strategy=none --no-web-resources-cdn
# copy build/web/* to FRONTEND/public/elastic/
```

Built with Flutter 3.50.1 against Elastic commit `7c548c1` (2027.0.0-alpha10).
The patch changes behavior only when `SIM_ROBOT=true`.
