import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react"

import App from "./App.tsx";
import Bug from "./SideFiles/Bug.jsx";
import PP from "./SideFiles/PP.tsx";
import Sug from "./SideFiles/Sug.tsx";
import Tut from "./SideFiles/Tut.tsx";
import Program from "./SideFiles/Program.jsx";
import GA from "./GA.jsx";
import TeamModal from "./Team.jsx";
function RoutesPage(){
  const [team, setTeam] = useState(false);
  useEffect(()=>{
    const saved = localStorage.getItem("teamNumber");
    if (!saved) setTeam(true);
  }, []);
  const handleSubmit =async(num)=>{
    setTeam(false);
    try {
      const resp = await fetch("https://frc-programming-practice.onrender.com/alert",
        {
          method:"POST",
          headers:{"Content-Type": "application/json"},
          body:  JSON.stringify({numReq: num }),
        }
      )
      const data = await resp.json();
      if(resp.ok){
        localStorage.setItem("teamNumber", num);
        console.log("Number logged")
      }else{
        alert(data.message);
        console.log(data.message)
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting team number");
    }
  };
  return (
    <BrowserRouter basename="/FRC-Programming-Practice">
      <GA />
      {team && <TeamModal onSubmit={handleSubmit} />}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/debug" element={<Bug />} />
        <Route path="/PP" element={<PP />} />
        <Route path="/Sug" element={<Sug />} />
        <Route path="/tut" element={<Tut />} />
        <Route path="/program" element={<Program />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesPage;