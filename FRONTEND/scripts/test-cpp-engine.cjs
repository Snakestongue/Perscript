// Quick behavioural check of the C++ engine against the generated indexes.  node scripts/test-cpp-engine.cjs
(async () => {
  const { createCppEngine } = await import("../src/lang/cppEngine.js");
  const eng = createCppEngine();
  eng.loadIndex(require("../src/api/cpp-wpilib.json"), "WPILib");
  eng.loadIndex(require("../src/api/cpp-ctre.json"), "CTRE");
  eng.loadIndex(require("../src/api/cpp-rev.json"), "REV");
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
  const inc = '#include <frc/motorcontrol/PWMSparkMax.h>\n#include <frc/controller/PIDController.h>\n#include <ctre/phoenix6/TalonFX.hpp>\n';
  const fn = (b) => inc + "void Robot::Run() {\n" + b + "\n}";
  run("ns ::", inc + "frc::PWMSpa|", /^PWMSparkMax$/);
  run("nested ns ::", inc + "ctre::phoenix6::hardware::Talon|", /^TalonFX$/);
  run("sub namespace", inc + "ctre::phoenix6::|", /^hardware$/);
  run("local var .", fn("  frc::PWMSparkMax motor{0};\n  motor.Se|"), /^Set$|^SetVoltage$|^SetInverted$/);
  run("ctor-paren decl", fn("  ctre::phoenix6::hardware::TalonFX m(1);\n  m.SetCon|"), /^SetControl$/);
  run("using namespace", "using namespace frc;\n" + fn("  PIDController pid{1, 0, 0};\n  pid.Calc|"), /^Calculate$/);
  run("pointer ->", fn("  frc::PIDController* p = nullptr;\n  p->Calc|"), /^Calculate$/);
  run("auto = Type()", fn("  auto pid = frc::PIDController(1, 0, 0);\n  pid.SetT|"), /^SetTolerance$/);
  run("unique_ptr", fn("  std::unique_ptr<frc::PIDController> p;\n  p->Calc|"), /^Calculate$/);
  run("param", inc + "void Foo(frc::PIDController& pid) {\n  pid.Calc|\n}", /^Calculate$/);
  run("chain return", fn("  ctre::phoenix6::hardware::TalonFX m{1};\n  m.GetPosition().|"), /^GetValue$|^Refresh$|^GetName$|^GetStatus$|^WaitForUpdate$/);
  run("inherited", fn("  ctre::phoenix6::hardware::TalonFX m{1};\n  m.GetDev|"), /^GetDeviceID$|^GetDeviceHash$/);
  run("class prefix include", "int main() { PIDCo|", /^PIDController$/, { imp: /^#include <frc\/controller\/PIDController\.h>$/ });
  run("camel prefix", "int main() { MMV|", /^MotionMagicVoltage$/, { imp: /phoenix6\/controls/ });
  run("include path", "#include <frc/controller/PID|", /^frc\/controller\/PIDController\.h$/);
  run("rev ns", "rev::spark::Spark|", /^SparkMax$/);
  run("sig ctor decl", fn("  frc::PIDController pid(1.0, |"), /PIDController\(double Kp/, { sig: true });
  run("sig method", fn("  ctre::phoenix6::hardware::TalonFX m{1};\n  m.SetControl(|"), /SetControl/, { sig: true });
  run("sig brace init", fn("  frc::PWMSparkMax m{|"), /PWMSparkMax\(int/, { sig: true });
  run("hover class", fn("  frc::PIDCont|roller pid{1,0,0};"), /PIDController/, { hover: true });
  run("hover method", fn("  frc::PIDController pid{1,0,0};\n  pid.Calcul|ate(1.0);"), /Calculate/, { hover: true });
  console.log(fail ? `${fail} FAILED` : "all passed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log("ERR", e.stack); process.exit(1); });
