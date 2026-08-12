import { motion } from "motion/react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/program", label: "Practice" },
  { to: "/debug", label: "Debug" },
  { to: "/tut", label: "Reference" },
];

function Nav() {
  const location = useLocation();
  const activeIndex = links.findIndex((item) =>
    item.to === "/tut" ? location.pathname.startsWith("/tut") : item.to === location.pathname
  );

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <motion.span
        className="mobile-nav-pill"
        aria-hidden="true"
        animate={{
          x: `${Math.max(activeIndex, 0) * 100}%`,
          opacity: activeIndex === -1 ? 0 : 1,
        }}
        transition={{ duration: 0.14, ease: "easeOut" }}
      />
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            (item.to === "/tut" ? location.pathname.startsWith("/tut") : isActive)
              ? "mobile-nav-link active"
              : "mobile-nav-link"
          }
        >
          <span className="mobile-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default Nav;
