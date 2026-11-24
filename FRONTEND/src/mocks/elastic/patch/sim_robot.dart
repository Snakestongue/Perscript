import 'dart:math';

/// Compile-time switch: build with `--dart-define=SIM_ROBOT=true` to run against
/// a simulated robot instead of a real NetworkTables server (used by the web
/// training build, where no robot is reachable).
const bool kSimulatedRobot = bool.fromEnvironment(
  'SIM_ROBOT',
  defaultValue: false,
);

class SimTopic {
  final String name;
  final String type;
  final Map<String, dynamic> properties;
  Object? value;

  SimTopic(this.name, this.type, this.value, [Map<String, dynamic>? props])
    : properties = props ?? {};
}

/// A tiny made-up robot that publishes the kind of topics a student's
/// `SmartDashboard.put*` calls would, so the dashboard has live data to show.
class SimRobot {
  static const String _sd = '/SmartDashboard';
  static const String _chooser = '$_sd/Auto Chooser';

  final List<SimTopic> topics = [
    SimTopic('$_sd/Elevator Height', 'double', 0.2),
    SimTopic('$_sd/Elevator Setpoint', 'double', 0.2),
    SimTopic('$_sd/Intake Has Piece', 'boolean', false),
    SimTopic('$_sd/Battery Voltage', 'double', 12.5),
    SimTopic('$_sd/Match Time', 'double', 135.0),
    SimTopic('$_sd/Gyro/.type', 'string', 'Gyro'),
    SimTopic('$_sd/Gyro/Value', 'double', 0.0),
    SimTopic('$_sd/Field/.type', 'string', 'Field2d'),
    SimTopic('$_sd/Field/Robot', 'double[]', [2.0, 4.0, 0.0]),
    SimTopic('$_chooser/.type', 'string', 'String Chooser'),
    SimTopic('$_chooser/options', 'string[]', [
      'Do Nothing',
      'Leave Zone',
      'One Piece',
      'Two Piece',
    ]),
    SimTopic('$_chooser/default', 'string', 'Do Nothing'),
    SimTopic('$_chooser/active', 'string', 'Do Nothing'),
  ];

  final Map<String, SimTopic> _byName = {};
  String? _selectedAuto;
  double _height = 0.2;
  double _velocity = 0.0;

  SimRobot() {
    for (final t in topics) {
      _byName[t.name] = t;
    }
  }

  /// The dashboard wrote a value (e.g. picked an auto in the chooser).
  /// Returns any topic values that change as a result.
  Map<String, Object?> onClientWrite(String name, Object? value) {
    if (name == '$_chooser/selected' && value is String) {
      _selectedAuto = value;
      _byName['$_chooser/active']!.value = value;
      return {'$_chooser/active': value};
    }
    return const {};
  }

  /// Advance the simulation to time [t] (seconds) and return changed values.
  Map<String, Object?> step(double t, double dt) {
    final out = <String, Object?>{};
    void set(String name, Object? v) {
      _byName[name]!.value = v;
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

    final a = t * 0.35;
    set('$_sd/Field/Robot', [
      8.0 + 3.0 * cos(a),
      4.0 + 2.0 * sin(a * 1.3),
      (a * 180 / pi) % 360,
    ]);
    if (_selectedAuto == null) {
      // keep the default visible until the dashboard chooses something
      set('$_chooser/active', 'Do Nothing');
    }
    return out;
  }
}
