import { Link } from "react-router-dom";
import type { ChangeEvent } from "react";
import { useState } from "react";
import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";
function Sug() {
  const [currentSug, setSug] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async():Promise<void> =>{
    if (!currentSug.trim()){
      alert("Please fill out textbox!")
      return;
    }
    setLoading(true)
    try {
      const res = await fetch("https://frc-programming-practice.onrender.com/suggest", {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({suggestReq: currentSug}),
      });
      const data = await res.json();
      if (res.ok){
        alert("Suggestion submitted!");
        setSug(""); 
      }else{
        console.log("Error " +data.message)
        alert("Error:")
      }
    }catch (error:unknown){
      alert("Error!" +String(error));
      console.log(error)
    }finally{
      setLoading(false);
    }
  };
  return (
    <div id="sugMain">
      <Header />
      <Nav />
      <div id="sugDiv">
        <label id="sugLab">
          If you have any suggestions, find any errors or have any ideas on how to make
          this website better please add them below. I will read all of them!
        </label>

        <textarea 
          id="sugInput"
          value={currentSug}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSug(e.target.value)}
          placeholder="Start typing here..."
        />
        <button id="sugSubmit" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            Submitting
            <span className="spinner"></span>
          </>
        ) : (
          "Submit"
        )}
      </button>
      </div>

      <footer>
        <div id="newFooterDiv">
          <Link id="PPLINK" to="/PP" className="footerLinks" >Privacy Policy</Link>
          <Link id="Sug" to="/Sug" className="footerLinks active" >Add a suggestion</Link>
          <a id="git" className="footerLinks" target="_blank" rel="noopener noreferrer"href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
        </div>
        <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Sug;