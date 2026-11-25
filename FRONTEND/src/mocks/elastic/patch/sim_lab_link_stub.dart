/// Non-web builds have no practice laptop to hear from or report to.
class SimLabLink {
  final void Function(Map<Object?, Object?> message) onMessage;

  SimLabLink(this.onMessage);

  void start() {}

  void dispose() {}
}

void labPost(Map<String, dynamic> message) {}
