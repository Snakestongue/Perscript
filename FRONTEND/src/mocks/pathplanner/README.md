# PathPlanner (web build)

PathPlanner is the FRC path editor by mjansen4857 (<https://github.com/mjansen4857/pathplanner>, MIT
licensed, license text in `PATHPLANNER_LICENSE`). The desktop app is a Flutter program; this folder
documents the small changes that let it run in a browser for the lab desktop (`../lab-desktop`).

## What was changed

- **A web entry point**, `patch/main_web.dart`. It runs PathPlanner against an **in-memory project
  folder** (`package:file`'s `MemoryFileSystem`, which PathPlanner already supports through its
  `fs` parameter) seeded from `patch/web_seed/` (the example paths and auto from PathPlanner's own
  `examples/java` project). No desktop file access is needed. Edits live in memory and are lost on
  reload.
- **Web guards** (`patch/pathplanner-web.patch`): `Platform.isMacOS` and `Platform.pathSeparator`
  throw on the web, so five files check `kIsWeb` first; and the call to `path_provider`'s
  `getApplicationSupportDirectory()` (no web implementation) uses a folder in the in-memory file
  system instead.
- **A loading bar** in `web/index.html` (`patch/index.html`), plus the `<base href>` placeholder
  Flutter needs to serve from a subfolder.

Everything else is PathPlanner as released. The desktop-only pieces (window buttons, update checker,
the robot connection that retries in the background) are still compiled in but unused; the failed
connection attempts show up in the browser console and are harmless.

## Rebuilding

```
git clone https://github.com/mjansen4857/pathplanner.git
cd pathplanner
git apply <this repo>/FRONTEND/src/mocks/pathplanner/patch/pathplanner-web.patch
flutter create --platforms web --project-name pathplanner .
cp <this repo>/FRONTEND/src/mocks/pathplanner/patch/main_web.dart lib/
cp <this repo>/FRONTEND/src/mocks/pathplanner/patch/index.html web/
cp -r <this repo>/FRONTEND/src/mocks/pathplanner/patch/web_seed .
flutter build web --release -t lib/main_web.dart --base-href=/Perscript/pathplanner/ \
  --pwa-strategy=none --no-web-resources-cdn
# copy build/web/* to FRONTEND/public/pathplanner/
```

Built with Flutter 3.50.1 against PathPlanner commit `e02bbf3`.
