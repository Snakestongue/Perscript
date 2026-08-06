import {Link } from "react-router-dom"
import Header from "./components/Header.js";
import Nav from "./components/Nav.js";
import Footer from "./components/Footer.js";

function App(){
  
  return (
    <div className="pt-[35px] max-md:!pt-[0px]">
    <Header />
    <Nav />
      <div className="min-h-[80vh] h-auto ">
        <div className="flex flex-row items-center justify-between gap-12 max-w-[1200px] my-18 mx-auto px-6 max-xl:flex-col">{/**Updown margin */}
        <div className="flex-1 w-full max-w-[560px]">
          <h1 className="max-md:text-5xl m-0 font-bold text-6xl">Learn FRC Programming.</h1>
          <h2 className="max-md:text-4xl mt-4 mb-4 font-bold text-5xl text-[#7AADFF]">Practice until it clicks.</h2>
           <h5 className="text-[#71717A] font-bold">Java, C++, and Python — pick a language and start coding.</h5>
          <div className="max-md:flex-col max-md:justify-center max-md:items-center flex flex-row">
            <Link className="m-4" to="/program"><button className="home-button bg-[#7AADFF] hover:bg-transparent">Start Practicing</button></Link>
            <Link className="m-4" to="/tut"><button className="home-button hover:bg-[#7AADFF] ">Browse Tutorials</button></Link>
          </div>
        </div>

        <div className=" 
        flex-1 w-full max-w-[560px] bg-[#10141d] border border-[#232838] rounded-[10px] text-left">
          <div className="
          flex flex-row items-center 
          p-2 bg-[#151a25] 
          border-b border-[#232838]
          gap-4 rounded-t-lg">
            <div className="dot bg-[#e0605a]"></div>
            <div className="dot bg-[#e0ab5a]"></div>
            <div className="dot bg-[#5ac491]"></div>
            <span className="ml-2 font-mono text-xs text-[#7f8695]">Intake.java</span>
          </div>
          <div className="flex pb-4 pt-3 font-mono text-sm min-h-[200px]">
            <div className="pl-3 pr-3 text-[#3d4354] text-right select-none whitespace-pre">
              1<br />
              2<br />
              3<br />
              4<br />
              5<br />
              6<br />
              7<br />
              8<br />
              9<br />
              10<br />
            </div>

            <div className="pl-2 text-[#cdd3e0] whitespace-pre-wrap break-words">
              <pre id="home-code"> 
{`package frc.robot.subsystems;
import com.ctre.phoenix6.hardware.TalonFX;
public class DriveSubsystem {
    private final TalonFX motor = new TalonFX(1);
    private double motorSpeed = 0.6;
    public void setSpeed(double speed) {
        motorSpeed = speed;
        motor.set(speed);
    }
}`}
              </pre>
            </div>
          </div>
          <div className="
          flex items-center 
          gap-2 px-4 py-[10px] 
          border-t border-[#232838] 
          bg-[#0f1319] font-mono text-[12px] 
          text-[#5ac491]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5ac491" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>Output correct - motor speed set to 0.6
          </div>
        </div>
      </div>
        <div id="">
          <p className="titles">Choose a workspace</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 px-2">

            <Link to="/program">
              <div className="home-card">
                <div className="upper-card">
                  <h4 className="card-titles">Programming Practice</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="home-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                </div>
                <p>Live coding exercise - write code in the browser and get feedback.</p>
                <div className="card-extras">
                    <div className="color-box">8 Exercises</div>
                    <p className="arrow">➡</p>
                  </div>
              </div>
            </Link>
            
            <Link to="/debug">
              <div className="home-card">
                <div className="upper-card">
                  <h4 className="card-titles">Debugging Practice</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="home-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082" />
                  </svg>
                </div>
                  <p>Multiple choice challenges - spot the bug in FRC Java snippets.</p>
                  <div className="card-extras">
                    <div className="color-box">4 Challenges</div>
                    <p className="arrow">➡</p>
                  </div>
              </div>
            </Link>

            <Link to="/tut">
              <div className="home-card">
                <div className="upper-card">
                  <h4 className="card-titles">Tutorials</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="home-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p>Step by step guide to master your programming skills.</p>
                <div className="card-extras">
                    <div className="color-box">10 Tutorials</div>
                    <p className="arrow">➡</p>
                  </div>
              </div>
            </Link>

          </div>
        </div>
        <div className="!w-full flex flex-row">
              <div className="
              font-['Rajdhani'] 
              border border-[#7aadff31] 
              bg-[#7aadff11] h-auto min-h-[20vh] 
              rounded-[10px] 
              flex flex-col 
               transition-all 
              w-full max-lg:w-[93%]
              m-4 p-4
              ">
                <div className="upper-card">
                  <h4 className="card-titles">Have an idea for a new exercise?</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="home-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>

                </div>
                <p>Help shape FRC Programming Practice. Suggest new tutorials, challenges, or features.</p>
                <div className="flex flex-row justify-center mt-auto">
                  <Link to="/Sug">
                    <div
  className="
    mt-auto mb-[2px]
    w-64 self-start
    px-4 py-2.5
    rounded-lg
    border border-[#7AADFF]/40
    bg-gradient-to-b from-white/[0.08] to-white/[0.02]
    text-sm font-medium
    text-zinc-300
    text-center
    cursor-pointer
    transition-all duration-300 ease-out
    hover:-translate-y-1
    hover:border-[#7AADFF]/70
    hover:text-white
    hover:bg-white/[0.08]
    hover:shadow-[0_8px_30px_rgba(122,173,255,0.18)]
    active:translate-y-0
    max-md:!mt-6
  ">
  Add a suggestion →
</div>
                      {/* <p className="arrow">➡</p> */}
                    </Link>
                  </div>
                </div>
              </div>
        {/* <div id="home2">
          <p className="titles" id="WH">Features</p>
          <div id="home2Cover">
              <div className="h3FDIV" id="sect4">
                <div className="upperHome">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="aisvg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                  </svg>
                </div>
                <h4>AI Assist</h4>
                <p>Get hints, explanations, and debugging help while learning — without giving away the answer.</p>
              </div>
            
              <div  className="h3FDIV" id="sect5">
                <div className="upperHome">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="langsvg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>
                </div>
                <h4>3 Different Languages</h4>
                <p>Code, Debug or use Tutorials in Java, C++ or Python.</p>
              </div>
              <div className="h3FDIV" id="sect6">
                <div className="upperHome">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="ossvg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                </svg>

                </div>
                <h4>Open Source Code</h4>
                <p>All code is open source on Github and contibutions are always welcome!</p>
              </div>
          </div>
        </div> */}
      </div>
      <Footer />
    </div>
    
  );
}
export default App;