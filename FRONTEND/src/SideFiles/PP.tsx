import { useEffect } from "react";
import Footer from "../components/Footer.js";

function PP() {
  useEffect(() => {
    document.title = "Perscript | Privacy Policy";
  }, []);

  return (
    <div className="site-page">
      <main id="main-content" className="legal-page">
        <header className="page-intro">
          <p className="eyebrow">Privacy</p>
          <h1>A short, plain-language policy.</h1>
          <p>
            We collect a limited amount of information to operate the practice
            site, understand how it is being used, and improve its exercises,
            tutorials, and usability.
          </p>
          <p><strong>Last updated: August 23, 2026</strong></p>
        </header>

        <div className="legal-sections">
          <section>
            <h2>Information we collect</h2>
            <ul>
              <li>
                Your FRC team number, which is required to use the practice
                site. We use it to estimate how many unique FRC teams use
                Perscript.
              </li>
              <li>
                Suggestions or feedback you choose to send through the
                suggestion form.
              </li>
              <li>
                Website usage information collected through Google Analytics 4,
                such as device type, browser type, pages visited, interaction
                patterns, and approximate geographic location.
              </li>
              <li>
                Your FRC team number by itself does not tell us your name, email
                address, or other direct contact information. We do not require
                your name, email address, or other contact information to use the
                practice site.
              </li>
            </ul>
          </section>
          <section>
            <h2>How we use information</h2>
            <ul>
              <li>To estimate how many unique FRC teams use Perscript.</li>
              <li>To understand general website usage and engagement.</li>
              <li>To improve exercises, tutorials, and site usability.</li>
              <li>To review suggestions and feedback.</li>
              <li>To monitor and improve the performance and functionality of the site.</li>
            </ul>
          </section>
          <section>
            <h2>Aggregate statistics</h2>
            <p>We may publicly share aggregated or anonymized statistics about Perscript's usage.</p>
            <p>Examples include:</p>
            <ul>
              <li>The approximate number of users who have used Perscript.</li>
              <li>The approximate number of unique FRC teams using Perscript.</li>
              <li>Usage during a particular time period.</li>
              <li>General geographic information about where users access the site.</li>
              <li>General usage or engagement trends.</li>
              <li>General traffic source or referral source.</li>
            </ul>
          </section>
          <section>
            <h2>Google Analytics</h2>
            <ul>
              <li>
                Perscript uses Google Analytics 4 (GA4), a web analytics
                service provided by Google, to understand how visitors use the
                site.
              </li>
              <li>
                Google Analytics may collect information about your device,
                browser, pages visited, interactions with the site, and
                approximate geographic location.
              </li>
              <li>The FRC team number collected by Perscript is not provided to Google Analytics.</li>
              <li>Google processes Analytics information according to its own privacy practices.</li>
            </ul>
          </section>
          <section>
            <h2>Data storage</h2>
            <ul>
              <li>
                Your FRC team number may be stored in your browser using{" "}<code>localStorage</code>.
              </li>
              <li>Suggestions and feedback may be stored on the site's servers.</li>
              <li>We do not require a name or email address to use Perscript.</li>
            </ul>
          </section>

          <section>
            <h2>Information we do not sell</h2>
            <p>
              We do not sell FRC team numbers, suggestions, feedback, or other
              information collected directly through Perscript.
            </p>
          </section>
          <section>
            <h2>Changes to this policy</h2>
            <p>
              We may update this Privacy Policy if Perscript's features or
              data practices change. When we make changes, we will update the
              "Last updated" date at the top of this page.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PP;