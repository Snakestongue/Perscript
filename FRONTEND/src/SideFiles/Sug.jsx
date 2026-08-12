import { useEffect, useState } from "react";
import Footer from "../components/Footer.js";

function Sug() {
  const [currentSug, setSug] = useState("");
  const [category, setCategory] = useState("Feature");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    document.title = "FRC Programming Practice | Add a Suggestion";
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");

    if (!currentSug.trim()) {
      setError("Write a suggestion before submitting.");
      setErrorField("suggestion");
      return;
    }

    if (rating === 0) {
      setError("Choose a rating from 1 to 5.");
      setErrorField("rating");
      return;
    }

    setError("");
    setErrorField("");
    setLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_LINK + "/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestReq: currentSug,
          rating,
          category,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setSug("");
      setRating(0);
      setStatus("Suggestion submitted. Thank you for helping improve the site.");
    } catch (submissionError) {
      console.error(submissionError);
      setError("The suggestion could not be sent. Check your connection and try again.");
      setErrorField("form");
    } finally {
      setLoading(false);
    }
  }

  function handleTextareaKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="site-page">
      <main id="main-content" className="form-page">
        <header className="page-intro">
          <p className="eyebrow">Feedback</p>
          <h1>Make the practice site better.</h1>
          <p>Report a bug, request an exercise, or tell us what slowed you down.</p>
        </header>

        <form className="suggestion-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="category-fieldset">
            <legend>Category</legend>
            <div className="category-control">
              {["Feature", "Bug", "UI/UX", "Performance", "Other"].map((option) => (
                <label className="category-option" data-active={category === option} key={option}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="category"
                    value={option}
                    checked={category === option}
                    onChange={() => setCategory(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-field">
            <div className="field-label-row">
              <label htmlFor="suggestion-copy">Your suggestion</label>
              <span className="character-count">{currentSug.length}/500</span>
            </div>
            <textarea
              id="suggestion-copy"
              name="suggestion"
              value={currentSug}
              onChange={(event) => {
                setSug(event.target.value);
                if (errorField === "suggestion") {
                  setError("");
                  setErrorField("");
                }
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Example: Add an exercise for command groups…"
              maxLength={500}
              aria-invalid={errorField === "suggestion"}
              aria-describedby={`suggestion-shortcut${errorField === "suggestion" ? " suggestion-error" : ""}`}
            />
            <p id="suggestion-shortcut" className="field-hint">
              Press Cmd+Enter or Ctrl+Enter to submit.
            </p>
            {errorField === "suggestion" && <p id="suggestion-error" className="field-error" role="alert">{error}</p>}
          </div>

          <fieldset className="rating-fieldset" aria-describedby={errorField === "rating" ? "rating-error" : undefined}>
            <legend>How useful is the site today?</legend>
            <div className="rating-control">
              {[1, 2, 3, 4, 5].map((score) => (
                <label key={score} className="rating-option" data-filled={score <= rating}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="rating"
                    value={score}
                    aria-label={`${score} out of 5`}
                    checked={rating === score}
                    onChange={() => {
                      setRating(score);
                      if (errorField === "rating") {
                        setError("");
                        setErrorField("");
                      }
                    }}
                  />
                  <span aria-hidden="true">★</span>
                  <span className="sr-only">{score} out of 5</span>
                </label>
              ))}
            </div>
            {errorField === "rating" && <p id="rating-error" className="field-error" role="alert">{error}</p>}
          </fieldset>

          <div id="suggestion-feedback" className="form-feedback" aria-live="polite">
            {errorField === "form" && <p className="field-error">{error}</p>}
            {status && <p className="field-success">{status}</p>}
          </div>

          <button className="button button-primary submit-button" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send suggestion"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Sug;
