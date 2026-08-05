import {Link} from "react-router-dom"
import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";
function PP(){
    return (
    <div id="PPO">
    <Header />
      <Nav />
    <div id="PP">
        <h2>Information We Collect</h2>
        <ul>
            <li>Information We Collect:</li>
        <ul>
            <li>
            We collect the team number you provide when prompted. This is only used to track the number of unique users.
            </li>
            <li>
            We may also collect suggestions or feedback that you voluntarily submit through the suggestion form. Providing this information is completely optional.
            </li>
        </ul>
        <li>How We Use Your Information:</li>
        <ul>
            <li>
            To understand user engagement and improve the app.
            </li>
            <li>
            Suggestions are used solely to improve the website and user experience.
            </li>
            <li>
            We do not share or sell your team numbers or submitted suggestions with third parties.
            </li>
        </ul>
        <li>Data Storage:</li>
        <ul>
            <li>
            Your team number is stored locally in your browser (localStorage).
            </li>
            <li>
            Suggestions you submit may be stored securely on our servers.
            </li>
            <li>
            No personal information, such as names, emails, or contact info, is required or collected unless explicitly provided by you.
            </li>
        </ul>
        </ul>
    </div>
       <footer>
        <div id="newFooterDiv">
          <Link id="PPLINK" to="/PP" className="footerLinks active" >Privacy Policy</Link>
          <Link id="Sug" to="/Sug" className="footerLinks" >Add a suggestion</Link>
          <a id="git" className="footerLinks" target="_blank" rel="noopener noreferrer"href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
        </div>
        <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
      </footer>
    </div>
    )
}
export default PP;