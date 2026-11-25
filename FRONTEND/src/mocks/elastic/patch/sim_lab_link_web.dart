import 'dart:convert';
import 'dart:js_interop';

import 'package:web/web.dart' as web;

/// Hears from the practice laptop on the same page: the last deploy is kept in
/// sessionStorage, and deploys / Driver Station changes arrive on a
/// BroadcastChannel named `lab-robot` (as objects or JSON text).
class SimLabLink {
  final void Function(Map<Object?, Object?> message) onMessage;
  web.BroadcastChannel? _channel;

  SimLabLink(this.onMessage);

  void start() {
    try {
      final stored = web.window.sessionStorage.getItem('labRobotDeploy');
      if (stored != null) {
        final decoded = jsonDecode(stored);
        if (decoded is Map) {
          onMessage({'type': 'deploy', ...decoded});
        }
      }
    } catch (_) {
      // no stored deploy
    }
    _channel = web.BroadcastChannel('lab-robot');
    _channel!.onmessage = ((web.MessageEvent event) {
      var data = event.data.dartify();
      if (data is String) {
        try {
          data = jsonDecode(data);
        } catch (_) {
          return;
        }
      }
      if (data is Map) onMessage(data.cast<Object?, Object?>());
    }).toJS;
  }

  void dispose() {
    _channel?.close();
  }
}

web.BroadcastChannel? _reportChannel;

/// Sends a message (as JSON text) to the practice laptop on the `lab-robot` channel.
void labPost(Map<String, dynamic> message) {
  _reportChannel ??= web.BroadcastChannel('lab-robot');
  _reportChannel!.postMessage(jsonEncode(message).toJS);
}
