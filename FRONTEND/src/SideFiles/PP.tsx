import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";

function PP() {
  return (
    <div className="min-h-screen mt-10">
      <Header />
      <Nav />
      <div
        className="
          box-border flex flex-col
          mx-auto my-[30px]
          w-[85%] max-w-[800px]
          min-h-[70vh]
          px-5
          rounded-[10px]
          text-white
          text-[19px]
          border border-white/[0.08] 
          bg-[#13191f]
          !mt-0
          top-0
          py-2
        ">
        <h2 className="mb-6 text-[25px] font-bold text-center">Privacy Policy</h2>
        <section className="mb-6">
          <h3 className="mb-2 text-xl font-semibold">Information We Collect</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              We collect the team number you provide when prompted. This is
              only used to track the number of unique users.
            </li>
            <li>
              We may also collect suggestions or feedback that you voluntarily
              submit through the suggestion form. Providing this information is
              completely optional.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xl font-semibold">How We Use Your Information</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>To understand user engagement and improve the app.</li>
            <li>
              Suggestions are used solely to improve the website and user
              experience.
            </li>
            <li>
              We do not share or sell your team numbers or submitted
              suggestions with third parties.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xl font-semibold">Google Analytics</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              We use Google Analytics to understand how users interact with
              our website and to improve the user experience.
            </li>
            <li>
              Google Analytics may collect information such as your device
              type, browser type, approximate location, pages visited,
              interactions with the website, and usage patterns.
            </li>
            <li>
              This information is collected in an aggregated manner and is not
              intended to directly identify you.
            </li>
            <li>
              Google may process this information according to its own privacy
              practices and policies.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xl font-semibold">Data Storage</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Your team number is stored locally in your browser using{" "}
              <code className="rounded bg-black/30 px-1 text-sm">localStorage</code>.
            </li>
            <li>Suggestions you submit may be stored securely on our servers.</li>
            <li>
              Analytics data collected through Google Analytics may be
              processed and stored by Google according to its services and
              policies.
            </li>
            <li>
              No personal information, such as names, emails, or contact
              information, is required or collected unless explicitly provided
              by you.
            </li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default PP;