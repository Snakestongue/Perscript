// Quick behavioural check of the Python engine against the generated indexes.  node scripts/test-py-engine.cjs
(async () => {
  const { createPythonEngine } = await import("../src/lang/pythonEngine.js");
  const eng = createPythonEngine();
  eng.loadIndex(require("../src/api/py-wpilib.json"), "WPILib");
  eng.loadIndex(require("../src/api/py-ctre.json"), "CTRE");
  eng.loadIndex(require("../src/api/py-rev.json"), "REV");
  let fail = 0;
  const run = (label, src, expect, opts = {}) => {
    const off = src.indexOf("|"); src = src.replace("|", "");
    const t = performance.now();
    const r = opts.sig ? eng.signatureHelp(src, off) : opts.hover ? eng.hover(src, off) : eng.complete(src, off);
    const ms = (performance.now() - t).toFixed(1);
    let got, ok;
    if (opts.sig) { got = r ? r.signatures[r.active].label : "null"; ok = r && expect.test(got); }
    else if (opts.hover) { got = r ? r.title.replace(/\n/g, " ") : "null"; ok = r && expect.test(got); }
    else { got = r.items.slice(0, 5).map((i) => i.label).join(", ") + ` (${r.items.length})`; ok = r.items.some((i) => expect.test(i.label) && (!opts.imp || opts.imp.test(i.importText || ""))); }
    if (!ok) fail++;
    console.log(ok ? "PASS" : "FAIL", label.padEnd(22), ms.padStart(6) + "ms", got.slice(0, 110));
  };
  const hdr = "import wpilib\nimport commands2\nfrom phoenix6 import hardware, controls\nfrom wpimath.controller import PIDController\n";
  run("module attr", hdr + "wpilib.PWMSpa|", /^PWMSparkMax$/);
  run("submodule", hdr + "from wpimath import geo|", /^geometry$/);
  run("from-import names", "from wpimath.controller import PID|", /^PIDController$/);
  run("import path", "import phoenix6.ha|", /^hardware$/);
  run("var = Class()", hdr + "m = hardware.TalonFX(1)\nm.set_con|", /^set_control$/);
  run("from-import class", "from phoenix6.hardware import TalonFX\nm = TalonFX(1)\nm.get_pos|", /^get_position$/);
  run("self attr", hdr + "class R(commands2.Subsystem):\n    def __init__(self):\n        self.motor = hardware.TalonFX(2)\n    def go(self):\n        self.motor.set_|", /^set_control$/);
  run("inherited self", hdr + "class R(commands2.Subsystem):\n    def go(self):\n        self.|", /^getName$|^get_name$|^periodic$/);
  run("param annotation", hdr + "def f(pid: PIDController):\n    pid.calc|", /^calculate$/);
  run("chain return", hdr + "m = hardware.TalonFX(1)\nm.get_position().|", /^value$|^value_as_double$|^status$/);
  run("class prefix import", "x = PIDCo|", /^PIDController$/, { imp: /^from wpimath\.controller import PIDController$/ });
  run("camel prefix", "x = MMV|", /^MotionMagicVoltage$/, { imp: /phoenix6\.controls/ });
  run("rev class", "import rev\nm = rev.SparkMax(1, rev.SparkLowLevel.MotorType.kBrushless)\nm.|", /^set$|^setVoltage$|^getEncoder$|^get_encoder$/i);
  run("sig ctor", hdr + "p = PIDController(1.0, |", /PIDController\(Kp/, { sig: true });
  run("sig method", hdr + "m = hardware.TalonFX(1)\nm.set_control(|", /set_control/, { sig: true });
  run("sig module class", hdr + "x = wpilib.PWMSparkMax(|", /PWMSparkMax\(channel/, { sig: true });
  run("hover class", hdr + "p = PIDCont|roller(1,0,0)", /PIDController/, { hover: true });
  run("hover method", hdr + "m = hardware.TalonFX(1)\nm.set_cont|rol(None)", /set_control/, { hover: true });
  console.log(fail ? `${fail} FAILED` : "all passed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log("ERR", e.stack); process.exit(1); });
