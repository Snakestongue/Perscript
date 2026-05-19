import {Link } from "react-router-dom"
import {useState, useEffect  }from 'react';
import Editor from '@monaco-editor/react';
function App(){
  return (
    <div id="homePage" >
      <header>
            {/* <img src={frcImg} id="imgHead" /> */}
            <Link to="/"><p id="headerFPP"><span>FRC</span> Programming Practice</p></Link>
            <ul id="headerList">
                {/* <li><Link to="/" className="headerLinks">Home</Link></li> */}
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
          <p class="homeFade" id="FFRT">For FRC Robotics Teams</p>
          <h2 id="LTCR">Learn to code robots.</h2>
          <h2 id="PUIC">Practice until it clicks.</h2>
          <h5 class="homeFade">Java exercises, debugging challenges, and tutorials built specifically for FIRST Robotics Competition programming.</h5>
          <div id="buttonRowHome">
            <Link to="/program"><button class="homeButtons">Start Practicing</button></Link>
            <Link to="/tut"><button class="homeButtons">Browse Tutorials</button></Link>
          </div>
        </div>
        <div id="home2">
          <p className="titles" id="WH">Choose a workspace</p>
          <div id="home2Cover">
            <Link to="/program">
              <div class="h2cDIV" id="sect1">
                <div class="upperHome">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svgHome" id="prsvg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                  <p id="parrow">→</p>
                </div>
                <h4>Programming Practice</h4>
                <p>Live coding exercise - write code in the browser and get feedback.</p>
                <div class="colorBox" id="colorPP">3 Exercise</div>
              </div>
            </Link>
            
            <Link to="/debug">
              <div  class="h2cDIV" id="sect2">
                <div class="upperHome">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svgHome" id="bugsvg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082" />
                </svg>
                <p id="darrow">→</p>
                </div>
                <h4>Debugging Practice</h4>
                <p>Multiple choice challenges - spot the bug in FRC Java snippets.</p>
                <div class="colorBox" id="colorDe">4 Challenges</div>
              </div>
            </Link>
            <Link to="/tut">
              <div class="h2cDIV" id="sect3">
                <div class="upperHome">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svgHome" id="tutsvg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <p id="tarrow">→</p>
                </div>
                <h4>Tutorials</h4>
                <p>Step by step guide to master your programming skills.</p>
                <div class="colorBox" id="colorTut">2 Tutorials</div>
              </div>
            </Link>
          </div>
        </div>
        {/* <div id="home3">
          <div id="part1">hi</div>
          <div id="part2">hi</div>
          <div id="part3">hi</div>
        </div> */}
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