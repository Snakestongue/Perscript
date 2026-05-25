import { Link } from "react-router-dom";
import { useState } from "react";
function Sug() {
  const [currentSug, setSug] = useState("")
  const [loading, setLoading] = useState(false);
  const handleSubmit = async()=>{
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
      alert("Suggestion submitted!");
      setSug(""); 
    }catch (error){
      alert("Error!" +error);
      console.log(error)
    }
    setLoading(false);
  };
  return (
    <div id="sugMain">
      <header>
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
      <div id="sugDiv">
        <label id="sugLab">
          If you have any suggestions, find any errors or have any ideas on how to make
          this website better please add them below. I will read all of them!
        </label>

        <textarea 
          id="sugInput"
          value={currentSug}
          onChange={(e) => setSug(e.target.value)}
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
          <Link id="Sug" to="/Sug" className="footerLinks" >Add a suggestion</Link>
          <a id="git" className="footerLinks" href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
        </div>
        <p style={{color:"white"}} id="copy">© By Snakestongue. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Sug;