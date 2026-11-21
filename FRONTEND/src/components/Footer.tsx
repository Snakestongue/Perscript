import { Link } from "react-router-dom";
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="text-[#fff]">Perscript</p>
        <nav aria-label="Footer navigation">
          <Link to="/PP">Privacy</Link>
          <a
            href="https://github.com/Snakestongue/Perscript"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
        <Link
          to="https://www.thebluealliance.com/team/353"
          className="footer-credit">
          Built by FRC Team  <span className="cool3"> 353</span> · Shaped by the Community
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
