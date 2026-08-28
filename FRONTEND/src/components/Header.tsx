import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
const menuVariants = {
  initial: (direction: number) => ({ x: `${110 * direction}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({ x: `${-110 * direction}%`, opacity: 0 }),
};
function Header() {
  const location = useLocation();
  //0=Practice,1 =Debug, 2 =Reference, -1=none active
  const activeIndex =
    location.pathname === "/program" ? 0 :
    location.pathname === "/debug" ? 1 :
    location.pathname.startsWith("/tut") ? 2 :
    -1;


  const [menuIndex, setMenuIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)
  const lastMenuIndex = useRef(activeIndex >= 0 ? activeIndex : 0)
  const pillIndex = menuIndex ?? (activeIndex >= 0 ? activeIndex : lastMenuIndex.current)
  const pillVisible = menuIndex !== null || activeIndex >= 0
  function showMenu(index: number){
    setDirection(index >= lastMenuIndex.current ? 1 : -1)
    lastMenuIndex.current = index;
    setMenuIndex(index);
  }

  useEffect(()=>{
    function closeMenu(event: KeyboardEvent){
      if (event.key == "Escape"){
        setMenuIndex(null);
      }
    }
    window.addEventListener("keydown", closeMenu)
    return () => window.removeEventListener("keydown", closeMenu)
  }, []);

  useEffect(() =>{
    setMenuIndex(null);
  }, [location.key]);

  function navTriggerProps(index: number){
    return{
      className: activeIndex === index ? "site-nav-link active" : "site-nav-link",
      "aria-expanded": menuIndex === index,
      "aria-controls": "primary-nav-panel",
      onPointerEnter: () => showMenu(index),
      onFocus: () => showMenu(index),
      onClick: () => showMenu(index),
    };
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          to="/"
          className="justify-self-start inline-flex items-center gap-[0.5rem] min-h-11 font-bold leading-none tracking-[-0.03em] transition-all duration-200 ease-in max-lg:justify-self-center"
          aria-label="FRC Programming Practice home"
        >
          <span className="
          brand-name text-[25px] 
          font-bold !text-lg tracking-[3px] 
          uppercase text-white transition duration-200 
          underline decoration-dashed decoration-[#2a3444] underline-offset-[6px]
           hover:decoration-[#fff] hover:-translate-y-[3px] max-md:text-[20px]
           flex flex-row justify-center items-center
           ">
            {/* <span className="text-[#7AADFF]"></span> */}
            <img className="w-auto h-7 mr-2"src="IMG/image.png"/> Perscript
          </span>
        </Link>

        <div
          className="header-nav-group"
          onPointerLeave={() => setMenuIndex(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuIndex(null);
          }}>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <motion.span
              className="site-nav-pill"
              aria-hidden="true"
              animate={{
                x: Math.max(pillIndex, 0) * 110.4,
                opacity: pillVisible ? 1 : 0,
              }}
              transition={{duration: 0.14, ease: "easeOut"}}
            />

            <button type="button" {...navTriggerProps(0)}>
              <span className="site-nav-label">Practice</span>
            </button>

            <button type="button" {...navTriggerProps(1)}>
              <span className="site-nav-label">Debug</span>
            </button>

            <button type="button" {...navTriggerProps(2)}>
              <span className="site-nav-label">Reference</span>
            </button>
          </nav>

          <AnimatePresence>
            {menuIndex !== null ? (
              <motion.div
                id="primary-nav-panel"
                className="nav-mega-shell"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}>
                <div className="nav-mega-panel">
                  <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                    {menuIndex === 0 ? (
                      <motion.div
                        className="nav-mega-content"
                        key={0}
                        custom={direction}
                        variants={menuVariants}
                        initial="initial"
                        animate="active"
                        exit="exit"
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}>

                        <div className="nav-mega-panel-link">
                          <div className="nav-mega-heading">
                            <span className="!tracking-tighter">Practice workspace</span>
                            <strong>Write, run, and fix robot code</strong>
                          </div>
                          <div className="nav-mega-items">
                            <Link to="/program#lesson-basics">
                              <strong>Basics</strong>
                              <span>Start with constants, objects, methods, and constructors.</span>
                            </Link>
                            <Link to="/program#lesson-core-patterns">
                              <strong>Core patterns</strong>
                              <span>Practice PID, bindings, and basic robot subsystems.</span>
                            </Link>
                            <Link to="/program#lesson-command-based">
                              <strong>Command based</strong>
                              <span>Build commands, triggers, and command-based robot flows.</span>
                            </Link>
                            <Link to="/program#lesson-difficult">
                              <strong>Difficult Problems</strong>
                              <span>Use hardware and complex commaands.</span>
                            </Link>
                          </div>
                          <Link className="nav-mega-cta" to="/program">
                            Open practice <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </motion.div>
                    ):null}

                    {menuIndex == 1 ?(
                      <motion.div
                        className="nav-mega-content"
                        key={1}
                        custom={direction}
                        variants={menuVariants}
                        initial="initial"
                        animate="active"
                        exit="exit"
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}>

                        <div className="nav-mega-panel-link">
                          <div className="nav-mega-heading">
                            <span className="!tracking-tighter">Debugging drills</span>
                            <strong>Learn to spot failures before match day</strong>
                          </div>
                          <div className="nav-mega-items">
                            <Link to="/debug/java/all">
                              <strong>Java debugging</strong>
                              <span>Review command-based and object-oriented Java mistakes.</span>
                            </Link>
                            <Link to="/debug/python/all">
                              <strong>Python debugging</strong>
                              <span>Find syntax and control-flow problems in Python snippets.</span>
                            </Link>
                            <Link to="/debug/c++/all">
                              <strong>C++ debugging</strong>
                              <span>Practice diagnosing common robot-code failures in C++.</span>
                            </Link>
                          </div>
                          <Link className="nav-mega-cta" to="/debug"> Open debug <span aria-hidden="true">→</span></Link>
                        </div>
                      </motion.div>
                    ):null}

                    {menuIndex === 2?(
                      <motion.div
                        className="nav-mega-content"
                        key={2}
                        custom={direction}
                        variants={menuVariants}
                        initial="initial"
                        animate="active"
                        exit="exit"
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}>

                        <div className="nav-mega-panel-link">
                          <div className="nav-mega-heading">
                            <span className="!tracking-tighter">Reference library</span>
                            <strong>Keep the code you need within reach</strong>
                          </div>
                          <div className="nav-mega-items">
                            <Link to="/tut">
                              <strong>Foundations</strong>
                              <span>Language basics, classes, and common FRC terminology.</span>
                            </Link>
                            <Link to="/tut/hardware">
                              <strong>Hardware</strong>
                              <span>Motor controllers, sensors, and physical inputs.</span>
                            </Link>
                            <Link to="/tut/robot-structure">
                              <strong>Robot structure</strong>
                              <span>RobotContainer, commands, constants, and dashboards.</span>
                            </Link>
                          </div>
                          <Link className="nav-mega-cta" to="/tut">
                            Open reference <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </motion.div>
                    ):null}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) :null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;