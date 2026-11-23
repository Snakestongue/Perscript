// Quick behavioural check of the Java engine against the generated index.  node scripts/test-engine.cjs
const Parser = require("web-tree-sitter");
(async () => {
  const { createEngine } = await import("../src/lang/javaEngine.js");
  await Parser.init();
  const Java = await Parser.Language.load(require.resolve("tree-sitter-wasms/out/tree-sitter-java.wasm"));
  const parser = new Parser(); parser.setLanguage(Java);
  const eng = createEngine(parser);
  eng.loadIndex(require("../src/api/wpilib.json"), "WPILib");
  eng.loadIndex(require("../src/api/ctre.json"), "CTRE");
  let fail = 0;
  const run = (label, src, expect, opts = {}) => {
    const off = src.indexOf("|"); src = src.replace("|", "");
    const t = performance.now();
    const r = opts.sig ? eng.signatureHelp(src, off) : opts.hover ? eng.hover(src, off) : eng.complete(src, off);
    const ms = (performance.now() - t).toFixed(1);
    let got, ok;
    if (opts.sig) { got = r ? r.signatures[r.active].label : "null"; ok = r && expect.test(got); }
    else if (opts.hover) { got = r ? r.title.replace(/\n/g, " ") : "null"; ok = r && expect.test(got); }
    else { got = r.items.slice(0, 5).map((i) => i.label).join(", ") + ` (${r.items.length})`; ok = r.items.some((i) => expect.test(i.label)); }
    if (!ok) fail++;
    console.log(ok ? "PASS" : "FAIL", label.padEnd(20), ms.padStart(6) + "ms", got.slice(0, 110));
  };
  const wrap = (b) => "public class Robot extends SubsystemBase {\n  void f() {\n" + b + "\n  }\n}";
  run("local var .", wrap("    TalonFX motor = new TalonFX(1);\n    motor.|"), /^setControl$/);
  run("member prefix", wrap("    TalonFX motor = new TalonFX(1);\n    motor.setC|"), /^setControl$/);
  run("new chain", wrap("    new PIDController(1,0,0).|"), /^calculate$/);
  run("static class .", wrap("    Commands.|"), /^runOnce$/);
  run("nested ctor var", wrap("    var c = new TrapezoidProfile.Constraints(1, 2);\n    c.|"), /maxVelocity|^m?axVelocity$/i);
  run("field decl", "class A extends SubsystemBase {\n private final ElevatorFeedforward ff = new ElevatorFeedforward(1,2,3);\n void g(){ double v = ff.|\n}\n}", /^calculate$/);
  run("param", "class A {\n void g(ProfiledPIDController pid){ pid.|\n}\n}", /^calculate$/);
  run("chain call", wrap("    ProfiledPIDController pid = new ProfiledPIDController(1,0,0,new TrapezoidProfile.Constraints(1,2));\n    pid.getSetpoint().|"), /^position$/);
  run("class prefix", wrap("    ProfiledPI|"), /^ProfiledPIDController$/);
  run("camel prefix", wrap("    MMV|"), /^MotionMagicVoltage$/);
  run("inherited member", wrap("    getNa|"), /^getName$/);
  run("incomplete stmt", wrap("    Pose2d p = new Pose2d(1.0, 2.0, Rotation2d.fromDe|"), /^fromDegrees$/);
  run("sig ctor", wrap("    PIDController p = new PIDController(1.0, |"), /PIDController\(/, { sig: true });
  run("sig method", wrap("    TalonFX m = new TalonFX(1);\n    m.setControl(|"), /setControl/, { sig: true });
  run("hover class", wrap("    TalonFX m = new TalonFX(1);\n    Tal|onFX x;"), /TalonFX/, { hover: true });
  run("hover method", wrap("    TalonFX m = new TalonFX(1);\n    m.setCont|rol(null);"), /setControl/, { hover: true });
  console.log(fail ? `${fail} FAILED` : "all passed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log("ERR", e.stack); process.exit(1); });
