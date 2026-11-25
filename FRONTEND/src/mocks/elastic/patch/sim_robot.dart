import 'dart:math';

/// Compile-time switch: build with `--dart-define=SIM_ROBOT=true` to run against
/// a simulated robot instead of a real NetworkTables server (used by the web
/// training build, where no robot is reachable).
const bool kSimulatedRobot = bool.fromEnvironment(
  'SIM_ROBOT',
  defaultValue: false,
);

/// "Lab" mode (`?lab=1` in the page URL): the dashboard only sees what the
/// student's deployed robot code publishes, plus the topics every robot has.
bool get kLabMode => Uri.base.queryParameters['lab'] == '1';

class SimTopic {
  final String name;
  final String type;
  final Map<String, dynamic> properties;
  Object? value;

  SimTopic(this.name, this.type, this.value, [Map<String, dynamic>? props])
    : properties = props ?? {};
}

/// A topic a deployed robot program publishes (from the practice laptop).
class SimDeployTopic {
  final String name;
  final String type;
  const SimDeployTopic(this.name, this.type);
}

class SimDeployChange {
  final List<SimTopic> added;
  final List<SimTopic> removed;
  const SimDeployChange(this.added, this.removed);
}

/// One step of a deployed autonomous routine: drive to a point or run a command.
class SimAutoItem {
  final bool isCommand;
  final double x;
  final double y;
  final String name;
  const SimAutoItem.point(this.x, this.y) : isCommand = false, name = '';
  const SimAutoItem.command(this.name) : isCommand = true, x = 0, y = 0;
}

/// A tiny made-up robot that publishes the kind of topics a student's
/// `SmartDashboard.put*` calls would, so the dashboard has live data to show.
/// It can also run an autonomous routine deployed from the practice laptop.
class SimRobot {
  static const String _sd = '/SmartDashboard';
  static const String _chooser = '$_sd/Auto Chooser';
  static const double _autoSpeed = 3.0; // meters per second
  static const double _commandSeconds = 1.0;
  static const double _pulseSeconds = 1.5;

  /// Topics every robot has, deployed code or not.
  static List<SimTopic> _baseTopics() => [
    SimTopic('$_sd/Gyro/.type', 'string', 'Gyro'),
    SimTopic('$_sd/Gyro/Value', 'double', 0.0),
    SimTopic('$_sd/Field/.type', 'string', 'Field2d'),
    SimTopic('$_sd/Field/Robot', 'double[]', [2.0, 4.0, 0.0]),
    SimTopic('$_sd/Auto Status', 'string', 'Idle'),
    SimTopic('$_chooser/.type', 'string', 'String Chooser'),
    SimTopic('$_chooser/options', 'string[]', [
      'Do Nothing',
      'Leave Zone',
      'One Piece',
      'Two Piece',
    ]),
    SimTopic('$_chooser/default', 'string', 'Do Nothing'),
    SimTopic('$_chooser/active', 'string', 'Do Nothing'),
    // The ComboBox Chooser widget in this Elastic build reads the active choice
    // here and publishes the dashboard pick to `selected/tune`.
    SimTopic('$_chooser/selected/value', 'string', 'Do Nothing'),
  ];

  /// Topics with a built-in simulation; in lab mode they appear once the
  /// deployed code publishes a topic with the same name.
  static final Map<String, SimTopic Function()> _knownStudent = {
    '$_sd/Elevator Height': () =>
        SimTopic('$_sd/Elevator Height', 'double', 0.2),
    '$_sd/Elevator Setpoint': () =>
        SimTopic('$_sd/Elevator Setpoint', 'double', 0.2),
    '$_sd/Intake Has Piece': () =>
        SimTopic('$_sd/Intake Has Piece', 'boolean', false),
    '$_sd/Intake Running': () =>
        SimTopic('$_sd/Intake Running', 'boolean', false),
    '$_sd/Battery Voltage': () =>
        SimTopic('$_sd/Battery Voltage', 'double', 12.5),
    '$_sd/Match Time': () => SimTopic('$_sd/Match Time', 'double', 135.0),
  };

  /// Topics that only change because of something the robot did.
  static const Set<String> _eventDriven = {'$_sd/Intake Running'};

  final bool lab;
  late final List<SimTopic> topics;
  final Map<String, SimTopic> _byName = {};
  final Set<String> _studentNames = {};
  final List<String> _generic = [];
  String? _selectedAuto;
  double _height = 0.2;
  double _velocity = 0.0;

  // Deployed program + autonomous run state.
  Set<String> _registered = {};
  String? _autoName;
  List<SimAutoItem> _timeline = const [];
  bool _running = false;
  int _index = 0;
  double _wait = 0;
  double _pulse = 0;
  double _x = 2.0;
  double _y = 4.0;
  double _heading = 0.0;
  String _status = 'Idle';

  /// Events for the practice laptop (a command ran, an auto finished, ...).
  final List<Map<String, Object?>> events = [];

  SimRobot({this.lab = false}) {
    topics = _baseTopics();
    if (!lab) {
      for (final make in _knownStudent.values) {
        topics.add(make());
      }
    }
    for (final t in topics) {
      _byName[t.name] = t;
    }
  }

  /// A deploy brought new robot code: what it registered and which auto it returns.
  void setProgram({
    required Iterable<String> registered,
    String? autoName,
    List<SimAutoItem> timeline = const [],
  }) {
    _registered = registered.toSet();
    _autoName = autoName;
    _timeline = timeline;
    _running = false;
    _status = autoName == null ? 'Idle' : 'Ready: $autoName';
    if (timeline.isNotEmpty) {
      final first = timeline.firstWhere(
        (i) => !i.isCommand,
        orElse: () => const SimAutoItem.point(2.0, 4.0),
      );
      _x = first.x;
      _y = first.y;
    }
  }

  /// The Driver Station changed mode or enabled state.
  void onDriverStation(String mode, bool enabled) {
    if (!enabled) {
      if (_running) events.add({'type': 'auto-stopped', 'name': _autoName});
      _running = false;
      _status = _autoName == null ? 'Disabled' : 'Ready: $_autoName';
      return;
    }
    if (mode != 'auto') {
      _status = 'Teleoperated';
      return;
    }
    final name = _autoName;
    if (name == null || _timeline.isEmpty) {
      _status = 'No autonomous command';
      events.add({'type': 'auto-missing'});
      return;
    }
    _running = true;
    _index = 0;
    _wait = 0;
    _status = 'Running $name';
    events.add({'type': 'auto-started', 'name': name});
  }

  /// Update the student topics to match what the deployed code publishes.
  SimDeployChange applyDeploy(List<SimDeployTopic> deployed) {
    final wanted = {for (final d in deployed) d.name: d};
    final removed = <SimTopic>[];
    for (final name in _studentNames.toList()) {
      if (wanted.containsKey(name)) continue;
      final t = _byName.remove(name);
      if (t != null) {
        topics.remove(t);
        removed.add(t);
      }
      _studentNames.remove(name);
      _generic.remove(name);
    }
    final added = <SimTopic>[];
    for (final d in wanted.values) {
      if (_studentNames.contains(d.name) || _byName.containsKey(d.name)) {
        continue;
      }
      final known = _knownStudent[d.name];
      final t =
          known?.call() ??
          SimTopic(
            d.name,
            d.type,
            d.type == 'boolean' ? false : (d.type == 'string' ? 'ok' : 0.0),
          );
      if (known == null) _generic.add(t.name);
      topics.add(t);
      _byName[t.name] = t;
      _studentNames.add(t.name);
      added.add(t);
    }
    return SimDeployChange(added, removed);
  }

  /// The dashboard wrote a value (e.g. picked an auto in the chooser).
  /// Returns any topic values that change as a result.
  Map<String, Object?> onClientWrite(String name, Object? value) {
    if ((name == '$_chooser/selected' || name == '$_chooser/selected/tune') &&
        value is String) {
      _selectedAuto = value;
      _byName['$_chooser/active']!.value = value;
      _byName['$_chooser/selected/value']!.value = value;
      return {'$_chooser/active': value, '$_chooser/selected/value': value};
    }
    return const {};
  }

  void _advanceAuto(double dt) {
    if (_wait > 0) {
      _wait -= dt;
      return;
    }
    var budget = _autoSpeed * dt;
    while (_running && _index < _timeline.length) {
      final item = _timeline[_index];
      if (item.isCommand) {
        _index++;
        if (_registered.contains(item.name)) {
          events.add({'type': 'command', 'name': item.name, 'executed': true});
          _pulse = _pulseSeconds;
        } else {
          events.add({'type': 'command', 'name': item.name, 'executed': false});
          _status = 'Missing command: ${item.name}';
        }
        _wait = _commandSeconds;
        return;
      }
      final dx = item.x - _x;
      final dy = item.y - _y;
      final dist = sqrt(dx * dx + dy * dy);
      if (dist > 1e-6) _heading = atan2(dy, dx);
      if (dist <= budget) {
        _x = item.x;
        _y = item.y;
        budget -= dist;
        _index++;
      } else {
        _x += dx / dist * budget;
        _y += dy / dist * budget;
        return;
      }
    }
    if (_running && _index >= _timeline.length) {
      _running = false;
      if (!_status.startsWith('Missing')) _status = 'Finished ${_autoName ?? ''}';
      events.add({'type': 'auto-finished', 'name': _autoName});
    }
  }

  /// Advance the simulation to time [t] (seconds) and return changed values.
  Map<String, Object?> step(double t, double dt) {
    final out = <String, Object?>{};
    void set(String name, Object? v) {
      final topic = _byName[name];
      if (topic == null) return;
      topic.value = v;
      out[name] = v;
    }

    // Elevator chases a setpoint that moves every few seconds.
    const setpoints = [0.2, 0.9, 1.3, 0.6];
    final target = setpoints[(t ~/ 4) % setpoints.length];
    final err = target - _height;
    _velocity += (30 * err - 9 * _velocity) * dt;
    _height += _velocity * dt;
    set('$_sd/Elevator Setpoint', target);
    set('$_sd/Elevator Height', _height + (Random().nextDouble() - 0.5) * 0.004);

    set('$_sd/Intake Has Piece', (t % 6) > 3.5);
    set(
      '$_sd/Battery Voltage',
      12.6 - 0.35 * _velocity.abs().clamp(0, 2) - 0.1 * sin(t * 0.7),
    );
    set('$_sd/Match Time', max(0, 135 - (t % 150)));
    set('$_sd/Gyro/Value', 25 * sin(t * 0.4));

    // Topics from the student's own code that have no built-in model just wiggle.
    for (var i = 0; i < _generic.length; i++) {
      final name = _generic[i];
      final topic = _byName[name];
      if (topic == null || _eventDriven.contains(name)) continue;
      set(
        name,
        topic.type == 'boolean'
            ? ((t + i) % 4) > 2
            : topic.type == 'string'
            ? 'running'
            : 0.5 + 0.5 * sin(t * 0.8 + i),
      );
    }

    if (_running) _advanceAuto(dt);
    if (_pulse > 0) _pulse -= dt;
    set('$_sd/Intake Running', _pulse > 0);
    set('$_sd/Auto Status', _status);

    if (lab) {
      set('$_sd/Field/Robot', [_x, _y, (_heading * 180 / pi) % 360]);
    } else {
      final a = t * 0.35;
      set('$_sd/Field/Robot', [
        8.0 + 3.0 * cos(a),
        4.0 + 2.0 * sin(a * 1.3),
        (a * 180 / pi) % 360,
      ]);
    }
    if (_selectedAuto == null) {
      // keep the default visible until the dashboard chooses something
      set('$_chooser/active', 'Do Nothing');
      set('$_chooser/selected/value', 'Do Nothing');
    }
    return out;
  }
}

/// Describes every tile on the dashboard that is bound to a NetworkTables
/// topic, so the practice laptop can tell when the student placed one.
Map<String, dynamic> labLayoutReport(Map<String, dynamic> layout) {
  final widgets = <Map<String, dynamic>>[];

  void walk(Object? node, String tab) {
    if (node is Map) {
      final props = node['properties'];
      final topic = props is Map ? props['topic'] : null;
      if (topic is String && topic.isNotEmpty && node['type'] is String) {
        widgets.add({
          'tab': tab,
          'type': node['type'],
          'title': node['title'] ?? '',
          'topic': topic,
        });
      }
      for (final value in node.values) {
        walk(value, tab);
      }
    } else if (node is List) {
      for (final value in node) {
        walk(value, tab);
      }
    }
  }

  final tabs = layout['tabs'];
  if (tabs is List) {
    for (final tab in tabs) {
      if (tab is Map) walk(tab['grid_layout'], '${tab['name']}');
    }
  }
  return {'type': 'layout', 'widgets': widgets};
}
