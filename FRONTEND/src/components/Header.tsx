import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const primaryLinks = [
  { to: "/program", label: "Practice" },
  { to: "/debug", label: "Debug" },
  { to: "/tut", label: "Reference" },
];

const menuContent = [
  {
    eyebrow: "Practice workspace",
    title: "Write, run, and refine robot code",
    items: [
      { title: "Basics", description: "Start with constants, objects, methods, and constructors.", to: "/program#lesson-basics" },
      { title: "Core patterns", description: "Practice PID, bindings, and complete robot subsystems.", to: "/program#lesson-core-patterns" },
      { title: "Command based", description: "Build commands, triggers, and command-based robot flows.", to: "/program#lesson-command-based" },
    ],
  },
  {
    eyebrow: "Debugging drills",
    title: "Learn to spot failures before match day",
    items: [
      { title: "Java debugging", description: "Review command-based and object-oriented Java mistakes.", to: "/debug#debug-java" },
      { title: "Python debugging", description: "Find syntax and control-flow problems in Python snippets.", to: "/debug#debug-python" },
      { title: "C++ debugging", description: "Practice diagnosing common robot-code failures in C++.", to: "/debug#debug-cpp" },
    ],
  },
  {
    eyebrow: "Reference library",
    title: "Keep the patterns you need within reach",
    items: [
      { title: "Foundations", description: "Language basics, classes, and common FRC terminology.", to: "/tut" },
      { title: "Hardware", description: "Motor controllers, sensors, and physical inputs.", to: "/tut/hardware" },
      { title: "Robot structure", description: "RobotContainer, commands, constants, and dashboards.", to: "/tut/robot-structure" },
    ],
  },
];

const menuVariants = {
  initial: (direction: number) => ({ x: `${110 * direction}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({ x: `${-110 * direction}%`, opacity: 0 }),
};

function Header() {
  const location = useLocation();
  const activeIndex = primaryLinks.findIndex((item) =>
    item.to === "/tut" ? location.pathname.startsWith("/tut") : item.to === location.pathname
  );
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const lastMenuIndex = useRef(activeIndex >= 0 ? activeIndex : 0);
  const pillIndex = menuIndex ?? (activeIndex >= 0 ? activeIndex : lastMenuIndex.current);
  const pillVisible = menuIndex !== null || activeIndex >= 0;

  function showMenu(index: number) {
    setDirection(index >= lastMenuIndex.current ? 1 : -1);
    lastMenuIndex.current = index;
    setMenuIndex(index);
  }

  useEffect(() => {
    function closeMenu(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuIndex(null);
    }

    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);

  useEffect(() => {
    setMenuIndex(null);
  }, [location.key]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="FRC Programming Practice home">
          <span className="brand-mark" aria-hidden="true">FRC</span>
          <span className="brand-name">Programming Practice</span>
        </Link>

        <div
          className="header-nav-group"
          onPointerLeave={() => setMenuIndex(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuIndex(null);
          }}
        >
          <nav className="desktop-nav" aria-label="Primary navigation">
            <motion.span
              className="site-nav-pill"
              aria-hidden="true"
              animate={{
                x: Math.max(pillIndex, 0) * 110.4,
                opacity: pillVisible ? 1 : 0,
              }}
              transition={{ duration: 0.14, ease: "easeOut" }}
            />
            {primaryLinks.map((item, index) => (
              <button
                key={item.to}
                type="button"
                className={activeIndex === index ? "site-nav-link active" : "site-nav-link"}
                aria-expanded={menuIndex === index}
                aria-controls="primary-nav-panel"
                onPointerEnter={() => showMenu(index)}
                onFocus={() => showMenu(index)}
                onClick={() => showMenu(index)}
              >
                <span className="site-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <AnimatePresence>
            {menuIndex !== null ? (
              <motion.div
                id="primary-nav-panel"
                className="nav-mega-shell"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <div className="nav-mega-panel">
                  <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                    <motion.div
                      className="nav-mega-content"
                      key={menuIndex}
                      custom={direction}
                      variants={menuVariants}
                      initial="initial"
                      animate="active"
                      exit="exit"
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                    >
                      <div className="nav-mega-panel-link">
                        <div className="nav-mega-heading">
                          <span>{menuContent[menuIndex].eyebrow}</span>
                          <strong>{menuContent[menuIndex].title}</strong>
                        </div>
                        <div className="nav-mega-items">
                          {menuContent[menuIndex].items.map((item) => (
                            <Link
                              key={item.title}
                              to={item.to}
                            >
                              <strong>{item.title}</strong>
                              <span>{item.description}</span>
                            </Link>
                          ))}
                        </div>
                        <Link
                          className="nav-mega-cta"
                          to={primaryLinks[menuIndex].to}
                        >
                          Open {primaryLinks[menuIndex].label.toLowerCase()} <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <a
          className="header-github"
          href="https://github.com/Snakestongue/FRC-Programming-Practice"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

export default Header;
