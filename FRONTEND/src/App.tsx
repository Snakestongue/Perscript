import { Link } from "react-router-dom";
import { useEffect } from "react";
import Footer from "./components/Footer.js";
import FeedbackPopover from "./components/FeedbackPopover.js";
import SyntaxCode from "./components/SyntaxCode.js";

const tracks = [
  {
    number: "01",
    title: "Programming practice",
    description:
      "Write robot code in the browser. Build your understanding one exercise at a time.",
    action: "Start practicing",
    to: "/program",
  },
  {
    number: "02",
    title: "Debugging practice",
    description:
      "Investigate real FRC-style snippets, identify failures, and learn how to fix them.",
    action: "Start debugging",
    to: "/debug",
  },
  {
    number: "03",
    title: "Reference library",
    description:
      "Explore Java, C++, Python, motors, sensors, and the command-based framework.",
    action: "Browse reference",
    to: "/tut",
  },
  {
    number: "04",
    title: "Daily challenge",
    description:
      "Take on a quick coding challenge each day to sharpen your FRC programming skills.",
    action: "Take the challenge",
    to: "/daily",
  },
];

function App() {
  useEffect(() => {
    document.title = "Perscript | Learn Programming for FRC";
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-slate-100 selection:bg-[#7AADFF]/40 selection:text-white">
      <main>
        <section className="relative isolate px-6 pb-24 pt-20 sm:px-10 sm:pt-28 lg:px-12 lg:pb-32 lg:pt-32">
          <div className="mx-auto w-full max-w-[1300px]">
            <div className="grid w-full min-w-0 grid-cols-1 
            items-center justify-items-center gap-12 text-center
             lg:grid-cols-[0.92fr_1.08fr] lg:justify-items-stretch lg:gap-8 lg:text-left">
              <div className="flex w-full min-w-0 flex-col items-center lg:items-start">
                <p className="mb-5 text-sm text-slate-500">
                  Formerly known as FRC Programming Practice
                </p>
                <h1 className="text-[40px] font-semibold leading-[1.06] 
                tracking-[-0.055em] text-white sm:text-5xl lg:text-[70px]">
                  <span className="block">Learn FRC coding.</span>
                  <span className="mt-2 block pb-2 text-[30px] tracking-normal text-[#7AADFF] sm:text-4xl lg:text-5xl">
                    Practice until it clicks.
                  </span>
                </h1>
                <p className="mt-7 max-w-lg text-[15px] leading-7 text-slate-400 sm:leading-8 lg:text-lg">
                  Work on Java, C++, or Python exercises made for the code you will use during build season.
                </p>
                <div className="mt-9 grid w-full max-w-md grid-cols-1 gap-3 
                sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
                  <Link
                    to="/program"
                    className="group inline-flex min-h-12 w-full items-center 
                    justify-center gap-3 rounded-xl bg-[#7AADFF] px-5 py-3 text-sm font-semibold 
                    !text-black transition-all duration-200 ease-in-out hover:-translate-y-0.5 sm:w-auto">
                    Start practicing
                    <span className="transition-transform duration-200">→</span>
                  </Link>

                  <Link
                    to="/tut"
                    className="inline-flex min-h-12 w-full items-center justify-center 
                    gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium 
                    text-slate-300 transition duration-200 hover:border-[#7AADFF]/60 hover:bg-[#7AADFF]/10 
                    hover:text-white sm:w-auto">Explore the reference
                    <span aria-hidden="true" className="text-slate-500">↗
                    </span>
                  </Link>
                </div>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 lg:justify-start">
                  <span className="mr-1 uppercase tracking-[0.16em]">
                    Practice with
                  </span>

                  {["Java", "C++", "Python"].map((language) => (
                    <span
                      key={language}
                      className="rounded-md border border-white/[0.09] bg-white/[0.025] 
                      px-2.5 py-1.5 font-mono text-slate-300 transition-colors 
                      hover:border-[#7AADFF]/50 hover:text-[#7AADFF] hover:cursor-default">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code editor */}
              <div className="relative flex w-full min-w-0 justify-center">
                <div
                  aria-hidden="true"
                  className="absolute -inset-5 -z-10 rounded-[2rem] bg-[#7AADFF]/[0.04] blur-2xl"
                />

                <div className="w-full min-w-0 max-w-[540px] overflow-hidden 
                rounded-2xl border border-white/[0.12] bg-[#0d131c]">
                  <div className="border-b border-white/[0.08] bg-[#0d131c]">
                    <div className="flex overflow-x-auto">
                      {[
                        { name: "Robot.java", active: false },
                        { name: "Constants.java", active: false },
                        { name: "Intake.java", active: true },
                        { name: "DriveSubsystem.java", active: false },
                      ].map((file) => (
                        <div
                          key={file.name}
                          className={`flex shrink-0 items-center gap-2 border-r border-white/[0.06] px-3
                             py-3 font-mono text-xs ${
                            file.active
                              ?"bg-[#151e29] text-slate-100"
                              :"border-t-2 border-t-transparent bg-[#0d131c] text-slate-500"
                          }`}>
                          <span className="font-bold text-red-500">J</span>
                          {file.name}
                          {file.active && (
                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#7AADFF]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="min-w-0 overflow-x-auto px-3 py-5 sm:px-5 sm:py-7">
                    <div className="flex min-w-max gap-5 sm:gap-7">
                      <div
                        aria-hidden="true"
                        className="flex select-none flex-col text-right font-mono
                         text-[12px] leading-[1.9rem] text-slate-600">
                        {Array.from({ length: 10 }, (_, index) => (
                          <span key={index}>{index + 1}</span>
                        ))}
                      </div>

                      <pre className="!m-0 !w-max min-w-max !bg-transparent text-left 
                      font-mono text-[12px] leading-[1.9rem] text-slate-300 sm:text-[13px]">                        
                      <SyntaxCode
                      code=
{`package frc.robot.subsystems;
import com.ctre.phoenix6.hardware.TalonFX;

public class DriveSubsystem {
  private final TalonFX motor = new TalonFX(1);

  public void setSpeed(double speed) {
    motor.set(speed);
  }
}`}
                        />
                      </pre>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between 
                  gap-3 border-t border-white/[0.08] bg-[#101923] px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-[11px]">
                        ✓</span>Check passed
                    </div>
                    <span className="text-xs text-slate-500">
                      Motor output is set from speed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          aria-labelledby="tracks-title"
          className="relative border-t border-white/[0.07] bg-black px-6 py-20 sm:px-10 sm:py-24 lg:px-12 lg:py-28"
        >
          <div className="relative mx-auto w-full max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
              <h2
                id="tracks-title"
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Choose your starting point.
              </h2>

              <p className="text-sm text-slate-400 md:max-w-sm">
                Each path is short enough to teach or learn before build season.
              </p>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tracks.map((track) => (
                <Link
                  key={track.to}
                  to={track.to}
                  className="group relative flex min-h-[260px] 
                  min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.09] 
                  bg-[#101721]/90 p-6 transition-all duration-300 hover:-translate-y-1 
                  hover:border-[#7AADFF]/60 hover:shadow-[4px_4px_0px_0px_#7AADFF] sm:p-7">
                  <span className="mb-5 font-mono text-xs text-slate-500">
                    {track.number}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-[#7AADFF]">
                    {track.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {track.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-8">
                    <span className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                      {track.action}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center 
                    rounded-full border border-white/10 text-slate-400 transition-all duration-200 
                    group-hover:translate-x-1 group-hover:border-[#7AADFF] group-hover:bg-[#7AADFF]/10 
                    group-hover:text-[#7AADFF]">→</span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-px w-0 bg-[#7AADFF] transition-all duration-300 group-hover:w-full"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <FeedbackPopover />
      </main>

      <Footer />
    </div>
  );
}

export default App;
