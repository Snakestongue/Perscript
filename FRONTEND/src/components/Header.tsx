import {Link, useLocation  } from "react-router-dom"
import clsx from "clsx";
function Header(){
const location = useLocation();
  return (
      <header className="
          [grid-area:header]
          h-[55px]
          bg-transparent 
          backdrop-blur-md
          m-0 //margin
          p-[10px] 
          w-full 
          fixed 
          top-0 left-0 
          z-100 //z index
          flex flex-row  
          items-center 
          justify-between
          max-lg:mx-auto
            max-lg:flex
            max-lg:justify-center
            max-lg:bg-[rgb(13,17,23)]
      ">
            <Link to="/" className="
            mr-20
            ml-4
            max-lg:m-0
            "><p className="
            text-[25px] 
            font-bold 
            tracking-[3px]  
            uppercase text-white
            transition duration-200 
            underline decoration-dashed decoration-[#2a3444] 
            underline-offset-[6px] 
            hover:decoration-[#7AADFF] 
            hover:-translate-y-[3px] 
            max-md:text-[20px]
             "><span className="
             text-[#7AADFF]
             ">FRC</span> Programming Practice</p></Link>
            <ul className="
            flex flex-row items-center gap-[4px] m-0 p-0 list-none header-ul 
            ">
                <li><Link to="/program" className={clsx(
                    "links",
                    location.pathname === "/program" && "bg-[#7aadff3c]"
                )}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7AADFF" className="header-links-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>Programming Practice</Link></li>

                <li><Link to="/debug" className={clsx(
                    "links",
                    location.pathname === "/debug" && "bg-[#7aadff3c]"
                )}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7AADFF" className="header-links-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082" />
                </svg>Debugging Practice</Link></li>

                <li><Link to="/tut" className={clsx(
                    "links",
                    location.pathname === "/tut" && "bg-[#7aadff3c]"
                )}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7AADFF" className="header-links-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                </svg>Tutorials</Link></li>
            </ul>
      </header>
    )
}
export default Header