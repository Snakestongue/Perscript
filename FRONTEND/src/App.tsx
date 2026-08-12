import { Link } from "react-router-dom";
import { useEffect } from "react";
import Footer from "./components/Footer.js";
import FeedbackPopover from "./components/FeedbackPopover.js";
import Header from "./components/Header.js";
import SyntaxCode from "./components/SyntaxCode.js";

const tracks = [
  {
    to: "/program",
    title: "Programming practice",
    description: "Write robot code in the browser and run checks as you work.",
    action: "Start practicing",
  },
  {
    to: "/debug",
    title: "Debugging practice",
    description: "Read real FRC-style snippets, find the failure, and learn why it happened.",
    action: "Start debugging",
  },
  {
    to: "/tut",
    title: "Reference library",
    description: "Review programming fundamentals, motors, sensors, and commands.",
    action: "Browse reference",
  },
];

function App() {
  useEffect(() => {
    document.title = "FRC Programming Practice | Java, C++, and Python Practice";
  }, []);

  return (
    <div className="site-page home-page">
      <main id="main-content" className="home-main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Learn FRC coding.
              <span className="mt-6">Practice until it clicks.</span>
            </h1>
            <p className="hero-summary">
              Work on Java, C++, or Python exercises made for the code you will use on a robot.
            </p>
            <div className="hero-actions">
              <Link className="
              button button-primary 
              !transition-opacity 
              !duration-140 ease-in-out 
              hover:opacity-80" to="/program">Start practicing</Link>
              <Link className="text-link" to="/tut">Browse the reference<span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <div className="code-window" aria-label="Example FRC Java code">
            
            <div className="code-window-bar">
              <div className="code-window-mac">
                <div className="dot bg-[#e0605a]"></div>
                <div className="dot bg-[#e0ab5a]"></div>
                <div className="dot bg-[#5ac491]"></div>
              </div>
              <div className="code-window-right">
                <span className="code-file">Intake.java</span>
                <span className="code-language">Java</span>
              </div>
            </div>
            <div className="code-window-body">
              <div className="code-lines" aria-hidden="true">
                {Array.from({ length: 10 }, (_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
              <pre id="home-code">
                <SyntaxCode code={`package frc.robot.subsystems;
import com.ctre.phoenix6.hardware.TalonFX;

public class DriveSubsystem {
  private final TalonFX motor = new TalonFX(1);

  public void setSpeed(double speed) {
    motor.set(speed);
  }
}`} />
              </pre>
            </div>
            <div className="code-status">
              <span className="status-mark" aria-hidden="true">✓</span>
              Check passed: motor output is set from speed
            </div>
          </div>
        </section>

        <section className="tracks-section" aria-labelledby="tracks-title">
          <div className="section-heading">
            <h2 id="tracks-title">Choose where to start</h2>
            <p>Each path is short enough to teach before build season.</p>
          </div>

          <div className="track-list">
            {tracks.map((track) => (
              <Link className="track-row" to={track.to} key={track.to}>
                <span className="track-copy">
                  <strong>{track.title}</strong>
                  <span>{track.description}</span>
                </span>
                <span className="track-action">
                  {track.action} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="suggestion-callout" aria-labelledby="suggestion-title">
          <div>
            <h2 id="suggestion-title">Help shape the next exercise.</h2>
            <p>Send a topic, bug report, or improvement you want the site to cover.</p>
          </div>
          <FeedbackPopover />
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
