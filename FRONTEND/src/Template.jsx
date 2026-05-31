import {Link } from "react-router-dom"
function Template(){
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
    <div id="templateMain">
        
    </div>
      <footer>
        <div id="newFooterDiv">
          <Link id="PPLINK" to="/PP" className="footerLinks" >Privacy Policy</Link>
          <Link id="Sug" to="/Sug" className="footerLinks" >Add a suggestion</Link>
          <a id="git" className="footerLinks" target="_blank" rel="noopener noreferrer"href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
        </div>
        <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
      </footer>
    </div>
    
  );
}
export default App;