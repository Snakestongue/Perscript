import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { MotionConfig } from "motion/react";

import App from "./App.tsx";
import GA from "./GA.jsx";
import TeamModal from "./Team.jsx";
import Header from "./components/Header.tsx";
import Nav from "./components/Nav.jsx";

const Bug = lazy(() => import("./SideFiles/Bug.jsx"));
const PP = lazy(() => import("./SideFiles/PP.tsx"));
const Sug = lazy(() => import("./SideFiles/Sug.jsx"));
const Tut = lazy(() => import("./SideFiles/Tut.tsx"));
const Program = lazy(() => import("./SideFiles/Program.jsx"));

function RoutesPage(){
  const [team, setTeam] = useState(() => !localStorage.getItem("teamNumber"));
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
    <BrowserRouter basename="/Perscript">
      <GA />
      {team && <TeamModal onSubmit={handleSubmit} />}
      <MotionConfig reducedMotion="user">
        <div className="app-content" inert={team ? true : undefined} aria-hidden={team ? "true" : undefined}>
          <Header />
          <Nav />
          <Suspense fallback={<main className="route-loading" aria-live="polite">Loading practice tools…</main>}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/debug" element={<Bug />} />
              <Route path="/debug/:language/:difficulty" element={<Bug />} />
              <Route path="/debug/:language/:difficulty/:problemId" element={<Bug />} />
              <Route path="/PP" element={<PP />} />
              <Route path="/Sug" element={<Sug />} />
              <Route path="/tut" element={<Tut />} />
              <Route path="/tut/hardware" element={<Tut section="hardware" />} />
              <Route path="/tut/robot-structure" element={<Tut section="structure" />} />
              <Route path="/program/:lang/:problemLink" element={<Program />} />
              <Route path="/program" element={<Program />} />
            </Routes>
          </Suspense>
        </div>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default RoutesPage;
