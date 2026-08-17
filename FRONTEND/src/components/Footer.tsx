import { Link } from "react-router-dom";
import FooterFeedbackPopover from "./FooterFeedback.js";
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="text-[#fff]">FRC Programming Practice</p>
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
        <p className="footer-credit">Built by Snakestongue · UI by Zw96042 & Snakestongue</p>
        {/* <FooterFeedbackPopover /> */}
      </div>
    </footer>
  );
}

export default Footer;
