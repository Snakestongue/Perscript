import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import Spinner from "./Spinner.js";

type FormState = "idle" | "loading" | "success" | "error";
const categories = ["Feature", "Bug", "UI/UX", "Performance", "Other"];
const categoryPositions = [
  "0.3rem",
  "calc(20% + 0.18rem)",
  "calc(40% + 0.06rem)",
  "calc(60% - 0.06rem)",
  "calc(80% - 0.18rem)",
];

function FeedbackPopover() {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("Feature");
  const [rating, setRating] = useState(0);
  const [openCycle, setOpenCycle] = useState(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const restoreFocusRef = useRef(false);

  function showFeedback() {
    setOpenCycle((cycle) => cycle + 1);
    setOpen(true);
    setFormState("idle");
    setFeedback("");
    setCategory("Feature");
    setRating(0);
    window.setTimeout(() => textareaRef.current?.focus(), 240);
  }

  function hideFeedback() {
    if (formState !== "loading") {
      restoreFocusRef.current = true;
      setOpen(false);
    }
  }

  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    const focusTimer = window.setTimeout(() => {
      triggerRef.current?.focus();
      restoreFocusRef.current = false;
    }, 220);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (open && !dockRef.current?.contains(event.target as Node)) hideFeedback();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hideFeedback();
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && open && formState === "idle") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, formState]);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  async function submitFeedback(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feedback.trim() || rating === 0 || formState === "loading") return;

    setFormState("loading");
    try {
      const [response] = await Promise.all([
        fetch(import.meta.env.VITE_LINK + "/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suggestReq: feedback, rating, category }),
        }),
        new Promise((resolve) => window.setTimeout(resolve, 900)),
      ]);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed");

      setFormState("success");
      closeTimerRef.current = window.setTimeout(() => {
        restoreFocusRef.current = true;
        setOpen(false);
      }, 1800);
    } catch (error) {
      console.error(error);
      setFormState("error");
    }
  }

  return (
    <div className="feedback-dock" ref={dockRef}>
      <motion.div
        className="feedback-shell"
        data-open={open}
        layout
        style={{ borderRadius: 12 }}
        transition={{ type: "spring", duration: 0.26, bounce: 0 }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
          <motion.section
            key="popover"
            className="feedback-popover"
            role="dialog"
            aria-modal="false"
            aria-labelledby="feedback-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, delay: open ? 0.08 : 0 }}
          >
            <motion.span
              id="feedback-title"
              className="feedback-placeholder"
              data-hidden={formState === "success" || feedback.length > 0}
            >
              Feedback
            </motion.span>

            <AnimatePresence initial={false} mode="popLayout">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  className="feedback-success"
                  initial={{ y: -24, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: 12, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  role="status"
                >
                  <span aria-hidden="true">✓</span>
                  <h2>Feedback received</h2>
                  <p>Thanks for helping improve the practice site.</p>
                </motion.div>
              ) : formState === "error" ? (
                <motion.div
                  key="error"
                  className="feedback-error-state"
                  initial={{ y: -24, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  role="alert"
                >
                  <span aria-hidden="true">!</span>
                  <h2>Couldn&apos;t send feedback</h2>
                  <p>Your response is still here. Check your connection and try again.</p>
                  <button
                    className="feedback-retry"
                    type="button"
                    onClick={() => {
                      setFormState("idle");
                      window.setTimeout(() => textareaRef.current?.focus(), 320);
                    }}
                  >
                    Try again
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  ref={formRef}
                  key="form"
                  className="feedback-form"
                  onSubmit={submitFeedback}
                  initial={{ y: -18, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: 8, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", duration: 0.32, bounce: 0 }}
                >
                  <textarea
                    className="feedback-textarea"
                    ref={textareaRef}
                    value={feedback}
                    onChange={(event) => {
                      setFeedback(event.target.value);
                      // if (formState == "error") setFormState("idle");
                    }}
                    aria-label="Feedback"
                    placeholder="Tell us what should be better…"
                    maxLength={500}
                    required
                  />
                  <fieldset className="feedback-categories">
                    <legend className="sr-only">Feedback category</legend>
                    <span
                      key={`feedback-category-${openCycle}`}
                      aria-hidden="true"
                      className="feedback-category-indicator"
                      style={{
                        borderRadius: 999,
                        left: categoryPositions[categories.indexOf(category)],
                      }}
                    />
                    {categories.map((option, index) => (
                      <label
                        key={option}
                        data-active={category === option}
                        style={{ gridColumn: index + 1, gridRow: 1 }}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="feedback-category"
                          checked={category === option}
                          onChange={() => setCategory(option)}
                        />
                        <span className="feedback-category-label">{option}</span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="feedback-form-footer">
                    <fieldset className="feedback-rating">
                      <legend className="sr-only">Site usefulness rating</legend>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <label key={score} data-filled={score <= rating}>
                          <input
                            className="sr-only"
                            type="radio"
                            name="feedback-rating"
                            checked={rating === score}
                            onChange={() => setRating(score)}
                          />
                          <span aria-hidden="true">★</span>
                          <span className="sr-only">{score} out of 5</span>
                        </label>
                      ))}
                    </fieldset>
                    <button
                      type="submit"
                      className="feedback-submit"
                      disabled={!feedback.trim() || rating === 0 || formState === "loading"}
                      aria-label={formState === "loading" ? "Sending feedback…" : "Send feedback"}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={formState}
                          initial={{ opacity: 0, y: -18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 18 }}
                          transition={{ type: "spring", duration: 0.25, bounce: 0 }}
                        >
                          {formState === "loading" ? <Spinner size={14} color="oklch(0.12 0.003 260 / 0.68)" /> : "Send feedback"}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.section>
          ) : (
            <motion.button
              key="button"
              ref={triggerRef}
              className="feedback-trigger"
              type="button"
              onClick={showFeedback}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <span className="feedback-trigger-copy">
                <strong>Share feedback</strong>
                <small>Feature, bug, or improvement</small>
              </span>
              <span className="feedback-trigger-arrow" aria-hidden="true">↗</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default FeedbackPopover;
