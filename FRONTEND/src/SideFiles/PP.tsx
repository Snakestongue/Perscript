import { useEffect } from "react";
import Footer from "../components/Footer.js";
function PP() {
  useEffect(() => {
    document.title = "FRC Programming Practice | Privacy Policy";
  }, []);
  return (
    <div className="site-page">
      <main id="main-content" className="legal-page">
        <header className="page-intro">
          <p className="eyebrow">Privacy</p>
          <h1>A short, plain-language policy.</h1>
          <p>The site collects only what it needs to understand usage and improve practice material.</p>
        </header>

        <div className="legal-sections">
          <section>
            <h2>Information we collect</h2>
            <ul>
              <li>Your FRC team number, used only to estimate the number of unique teams using the site.</li>
              <li>Suggestions or feedback you choose to send through the suggestion form.</li>
            </ul>
          </section>

          <section>
            <h2>How we use it</h2>
            <ul>
              <li>To understand engagement and improve exercises, tutorials, and site usability.</li>
              <li>We do not sell team numbers or submitted suggestions.</li>
            </ul>
          </section>

          <section>
            <h2>Google Analytics</h2>
            <ul>
              <li>Google Analytics may collect device type, browser type, approximate location, pages visited, and interaction patterns.</li>
              <li>The data is aggregated and is not intended to identify you directly.</li>
              <li>Google processes this information under its own privacy practices.</li>
            </ul>
          </section>

          <section>
            <h2>Data storage</h2>
            <ul>
              <li>Your team number is stored in your browser using <code>localStorage</code>.</li>
              <li>Suggestions may be stored securely on the site&apos;s servers.</li>
              <li>No name, email, or contact information is required.</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PP;
