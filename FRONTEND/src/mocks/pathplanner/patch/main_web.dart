// Web entry point for the training build: runs PathPlanner against an in-memory project
// folder seeded with the example paths and auto, so no desktop file access is needed.
import 'dart:async';
import 'dart:convert';
import 'dart:js_interop';

import 'package:file/file.dart';
import 'package:file/memory.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:pathplanner/main.dart';
import 'package:pathplanner/auto/pathplanner_auto.dart';
import 'package:pathplanner/path/pathplanner_path.dart';
import 'package:pathplanner/services/pplib_telemetry.dart';
import 'package:pathplanner/util/wpimath/geometry.dart';
import 'package:pathplanner/services/update_checker.dart';
import 'package:pathplanner/util/prefs.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:undo/undo.dart';
import 'package:web/web.dart' as web;

const _seed = <String, String>{
  'settings.json': 'web_seed/settings.json',
  'navgrid.json': 'web_seed/navgrid.json',
  'paths/Pickup.path': 'web_seed/paths/Pickup.path',
  'paths/Score.path': 'web_seed/paths/Score.path',
};

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final fs = MemoryFileSystem();
  const projectDir = '/project';
  final deploy = fs.directory('$projectDir/deploy/pathplanner')
    ..createSync(recursive: true);
  for (final entry in _seed.entries) {
    final file = fs.file('${deploy.path}/${entry.key}');
    file.parent.createSync(recursive: true);
    file.writeAsStringSync(await rootBundle.loadString(entry.value));
  }

  // Fake file system hook: the practice laptop can hand PathPlanner the files of its project
  // (sessionStorage `labFs`, a JSON map of 'autos/Name.auto' / 'paths/Name.path' -> text).
  // When present it replaces the example autos and paths.
  try {
    final stored = web.window.sessionStorage.getItem('labFs');
    if (stored != null) {
      final injected = jsonDecode(stored);
      if (injected is Map) {
        for (final folder in ['autos', 'paths']) {
          final dir = fs.directory('${deploy.path}/$folder');
          if (dir.existsSync()) dir.deleteSync(recursive: true);
          dir.createSync(recursive: true);
        }
        for (final entry in injected.entries) {
          final file = fs.file('${deploy.path}/${entry.key}');
          file.parent.createSync(recursive: true);
          file.writeAsStringSync('${entry.value}');
        }
      }
    }
  } catch (_) {
    // keep the seeded project
  }

  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(PrefsKeys.currentProjectDir, projectDir);
  await prefs.setBool(PrefsKeys.telemetryUseSim, true);
  await prefs.setBool(PrefsKeys.seen2026ResetPopup, true);

  _reportProject(fs, deploy.path);

  final packageInfo = await PackageInfo.fromPlatform();
  runApp(PathPlanner(
    appVersion: packageInfo.version,
    prefs: prefs,
    fs: fs,
    undoStack: ChangeStack(),
    telemetry: OfflineTelemetry(),
    updateChecker: UpdateChecker(),
  ));
}

/// Stands in for the robot connection: there is no robot in a browser, and the real client
/// retries a closed WebSocket endlessly, which floods the page. Never connects.
class OfflineTelemetry implements PPLibTelemetry {
  @override
  void setServerAddress(String serverAddress) {}

  @override
  String getServerAddress() => '127.0.0.1';

  @override
  void hotReloadPath(PathPlannerPath path) {}

  @override
  void hotReloadAuto(PathPlannerAuto auto) {}

  @override
  Stream<List<num>> velocitiesStream() => const Stream.empty();

  @override
  Stream<Pose2d?> currentPoseStream() => const Stream.empty();

  @override
  Stream<List<Pose2d>?> currentPathStream() => const Stream.empty();

  @override
  Stream<bool> connectionStatusStream() => Stream.value(false);

  @override
  Stream<Pose2d?> targetPoseStream() => const Stream.empty();

  @override
  bool get isConnected => false;
}

/// Tells the practice laptop (same page, `lab-robot` channel) which autos and paths exist in
/// PathPlanner's project, so a lesson can notice when the student creates or edits them.
void _reportProject(MemoryFileSystem fs, String deployDir) {
  final channel = web.BroadcastChannel('lab-robot');
  var last = '';
  Timer.periodic(const Duration(seconds: 1), (_) {
    Map<String, String> read(String folder, String extension) {
      final out = <String, String>{};
      final dir = fs.directory('$deployDir/$folder');
      if (!dir.existsSync()) return out;
      for (final entity in dir.listSync()) {
        if (entity is! File || !entity.path.endsWith(extension)) continue;
        final name = entity.path.split('/').last.replaceAll(extension, '');
        out[name] = entity.readAsStringSync();
      }
      return out;
    }

    final report = jsonEncode({
      'type': 'pathplanner',
      'autos': read('autos', '.auto'),
      'paths': read('paths', '.path'),
    });
    if (report == last) return;
    last = report;
    channel.postMessage(report.toJS);
  });
}
