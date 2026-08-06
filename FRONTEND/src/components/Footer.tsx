
import {Link, useLocation  } from "react-router-dom"
import clsx from "clsx";
function Footer(){
  const location = useLocation();
  return (
      <footer className="
        [grid-area:footer]
        h-[150px
        bg-transparent
        backdrop-blur-md
        m-0
        p-[10px]
        w-full
        z-100
        flex flex-row
        max-md:flex-col
        items-center
        justify-between
      ">
        <div className="
        flex flex-row  justify-center items-center max-md:justify-around max-md:w-full
        ">
          <Link to="/PP" className={clsx(
            "links !mb-4",
            location.pathname === "/PP" && "bg-[#7aadff3c]"
          )} >Privacy Policy</Link>
          <Link to="/Sug" className={clsx(
            "links !mb-4",
            location.pathname === "/Sug" && "bg-[#7aadff3c]"
          )}>Add a suggestion</Link>
          <a className="links !mb-4" target="_blank" rel="noopener noreferrer"href="https://github.com/Snakestongue/FRC-Programming-Practice">Github</a>
        </div>
        <p className="
        text-white
        font-medium
        tracking-[.5px]
        max-md:text-[12px]
        max-md:mt-10
        ">© By Snakestongue. All rights reserved.</p>
      </footer>
    )
}
export default Footer