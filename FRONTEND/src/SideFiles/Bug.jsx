import {useState} from 'react'
import problems from '../JSON/debugProblems.json'
import {Link } from "react-router-dom"

function Bug(){
  const [selectedChoices, setSelectedChoices] = useState({})
  return(
  <div id="mainDivBug">
      <header>
        <p id="headerFPP"><span>FRC</span> Programming Practice</p>
        <ul id="headerList">
            <li><Link to="/" className="headerLinks">Programming Practice</Link></li>
            <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
            <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
        </ul>
    </header>
    
    <nav>
      <ul id="newHeaderList">
        <li><Link to="/" className="headerLinks">Programming Practice</Link></li>
        <li><Link to="/debug" className="headerLinks">Debugging Practice</Link></li>
        <li><Link to="/tut" className="headerLinks">Tutorials</Link></li>
      </ul>
    </nav>
    <div id="f3">
      {problems.map((p)=>{
        const choices = [p.choice1, p.choice2, p.choice3]
        const userChoice = selectedChoices[p.id]
        let feedbackText = ""
        let feedbackColor = "";
        if (userChoice){
          if (userChoice === p.CC){
            feedbackText = "Correct!"
            feedbackColor = "green"
          }else{
            feedbackText = `Incorrect! ${p.whyCorrect}`
            feedbackColor = "red"
          }
        }
        return(
          <div className="bQ" key={p.id}>
            <p>{p.question}</p>
            <pre>{p.sampleCode}</pre>{/** keeps format same (\n)*/}
            {choices.map((choice, index)=>(
            <label key={index} style={{display: "block"}}>
              <input
              type="radio"
              name={`problem-${p.id}`}
              value={choice}
              checked={selectedChoices[p.id]== choice}
              onChange={(r)=>setSelectedChoices({...selectedChoices, [p.id]: r.target.value,})}//this line was all AI
              />
              {choice}
            </label>
            ))}
            {userChoice && (<p style={{color: feedbackColor}}>{feedbackText}</p>)}
          </div>
          )
      })}
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

export default Bug;