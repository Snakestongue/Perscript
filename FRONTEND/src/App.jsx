import {Link } from "react-router-dom"
import {useState, useEffect  }from 'react';
import Editor from '@monaco-editor/react';
function App(){
  return (
    <div id="homePage" >
      <header>
            <Link to="/"><p id="headerFPPa"><span>FRC</span> Programming Practice</p></Link>
            <ul id="headerList">
                <li><Link to="/program" className="headerLinks">Programming Practice</Link></li>
                <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
                <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
            </ul>
      </header>
      <nav>
        <ul id="newHeaderList">
          <li><Link to="/program" className="headerLinks">Programming Practice</Link></li>
          <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
          <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
        </ul>
      </nav>
      <div id="homePageContent">
        <div id="home1">
          <p className="homeFade" id="FFRT">For FRC Robotics Teams</p>
          <h2 id="LTCR">Learn to code robots.</h2>
          <h2 id="PUIC">Practice until it clicks.</h2>
          <h5 className="homeFade">Java, Python and C++ exercises, debugging challenges, and tutorials built specifically for FIRST Robotics Competition programming.</h5>
          <div id="buttonRowHome">
            <Link className="homeButtonsLink" to="/program"><button className="homeButtons">Start Practicing</button></Link>
            <Link className="homeButtonsLink" to="/tut"><button className="homeButtons">Browse Tutorials</button></Link>
          </div>
        </div>
        <div id="home2">
          <p className="titles" id="WH">Choose a workspace</p>
          <div id="home2Cover">
            <Link to="/program">
              <div className="h2cDIV" id="sect1">
                <div className="upperHome">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="prsvg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                  <p id="parrow">→</p>
                </div>
                <h4>Programming Practice</h4>
                <p>Live coding exercise - write code in the browser and get feedback.</p>
                <div className="colorBox" id="colorPP">4 Exercises</div>
              </div>
            </Link>
            
            <Link to="/debug">
              <div  className="h2cDIV" id="sect2">
                <div className="upperHome">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="bugsvg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082" />
                </svg>
                <p id="darrow">→</p>
                </div>
                <h4>Debugging Practice</h4>
                <p>Multiple choice challenges - spot the bug in FRC Java snippets.</p>
                <div className="colorBox" id="colorDe">4 Challenges</div>
              </div>
            </Link>
            <Link to="/tut">
              <div className="h2cDIV" id="sect3">
                <div className="upperHome">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="tutsvg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <p id="tarrow">→</p>
                </div>
                <h4>Tutorials</h4>
                <p>Step by step guide to master your programming skills.</p>
                <div className="colorBox" id="colorTut">2 Tutorials</div>
              </div>
            </Link>
          </div>
        </div>
        <div id="home2">
          <p className="titles" id="WH">Features</p>
          <div id="home2Cover">
              <div className="h3FDIV" id="sect4">
                <div className="upperHome">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svgHome" id="aisvg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                  </svg>
                </div>
                <h4>AI Assist</h4>
                <p>Not sure what or why something's wrong? In Programming Practice, use AI Assist for instant help.</p>
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
        </div>
      </div>
      <footer>
        <div id="newFooterDiv">
          <Link id="PPLINK" to="/PP" className="footerLinks" >Privacy Policy</Link>
          <Link id="Sug" to="/Sug" className="footerLinks" >Add a suggestion</Link>
          <a id="git" className="footerLinks" href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
        </div>
        <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
      </footer>
    </div>
    
  );
}
export default App;