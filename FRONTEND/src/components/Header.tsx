import {Link } from "react-router-dom"
function Header(){
  return (
      <header>
            <Link to="/"><p id="headerFPPa"><span>FRC</span> Programming Practice</p></Link>
            <ul id="headerList">
                <li><Link to="/program" className="headerLinks">Programming Practice</Link></li>
                <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
                <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
            </ul>
      </header>
    )
}
export default Header