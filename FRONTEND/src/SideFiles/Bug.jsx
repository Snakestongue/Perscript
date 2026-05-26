import {useState} from 'react'
import problems from '../JSON/debugProblems.json'
import {Link } from "react-router-dom"

function Bug(){
  const [selectedChoices, setSelectedChoices] = useState({})
  return(
  <div id="mainDivBug">
      <header>
            {/* <img src={frcImg} id="imgHead" /> */}
            <Link to="/"><p id="headerFPP"><span>FRC</span> Programming Practice</p></Link>
            <ul id="headerList">
                {/* <li><Link to="/" className="headerLinks">Home</Link></li> */}
                <li><Link to="/program" className="headerLinks">Programming Practice</Link></li>
                <li><Link to="/debug" className="headerLinks active">Debugging Practice</Link></li>
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
    <div class="bugLangDiv">
    </div>
    <div id="f3">  
      {problems.map((p, index)=>{
        let languages = ["Java", "Python", "C++"];
        let lang = languages[Math.floor(index / 4) % languages.length];
        let choices = [p.choice1, p.choice2, p.choice3]
        let userChoice = selectedChoices[p.id]
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
          <> {/** <> was AI */}
          {index %4 ==0 &&(
            <div className="bugLangDiv">
              <p className="bugLang">{lang}</p>
            </div>
          )}
          
          <div className="bQ" key={p.id}>
              
            <p>{p.question}</p>
            <pre id="sample">{p.sampleCode}</pre>{/** keeps format same (\n)*/}
            {choices.map((choice, index)=>(
            <label key={index} style={{display: "block"}}>
              <input
              type="radio"
              name={`problem-${p.id}`}
              value={choice}
              checked={selectedChoices[p.id]== choice}
              onChange={(r)=>setSelectedChoices({...selectedChoices, [p.id]: r.target.value,})}//this line was AI
              />
              {choice}
            </label>
            ))}
            {userChoice && (<p className={userChoice == p.CC? "correctFeedback" : "incorrectFeedback"}>{feedbackText}</p>)}
          </div>
          </>
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