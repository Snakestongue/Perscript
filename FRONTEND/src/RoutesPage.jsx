import {BrowserRouter,Routes, Route} from "react-router-dom"
import App from "./App.jsx"
import Bug from "./SideFiles/Bug.jsx"
import PP from "./SideFiles/PP.jsx"
import Sug from "./SideFiles/Sug.jsx"
import Tut from "./SideFiles/Tut.jsx"
import Program from "./SideFiles/Program.jsx"
function RoutesPage(){
  return(
    <BrowserRouter basename="/FRC-Programming-Practice">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/debug" element={<Bug />} />
        <Route path="/PP" element={<PP />}/>
        <Route path="/Sug" element={<Sug />}/>
        <Route path="/tut" element={<Tut />}/>
        <Route path="/program" element={<Program />}/>
      </Routes>
    </BrowserRouter>
  );
}
export default RoutesPage