import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="text-[#fff]">FRC Programming Practice</p>
        <nav aria-label="Footer navigation">
          <Link to="/PP">Privacy</Link>
          <a
            href="https://github.com/Snakestongue/FRC-Programming-Practice"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
        <p className="footer-credit">Built by Snakestongue. UI by Zw96042.</p>
      </div>
    </footer>
  );
}

export default Footer;
