import {useState} from 'react'
import problems from '../JSON/debugProblems.json'
import {Link } from "react-router-dom"
import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";

function Bug(){
  const [selectedChoices, setSelectedChoices] = useState({})
  return(
  <div id="mainDivBug">
      <Header />
      <Nav />
    <div className="bugLangDiv">
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
          <> 
          {index %4 ==0 &&(
            <div className="bugLangDiv">
              <p className="bugLang">{lang}</p>
            </div>
          )}
          
          <div className="bQ" key={p.id}>
            <p>{p.question}</p>
            <pre id="sample">{p.sampleCode}</pre>{/** keeps format same (\n)*/}
            {choices.map((choice, index)=>(
            <label className="bug-labels" key={index} style={{display: "block"}}>
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
    
    <Footer />
  </div>
);
}

export default Bug;