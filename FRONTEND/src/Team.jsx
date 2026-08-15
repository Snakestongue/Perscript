import { useEffect, useRef, useState } from "react";

function TeamModal({ onSubmit }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    inputRef.current?.focus();

    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function keepFocusInDialog(event) {
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll("button:not([disabled]), input:not([disabled])")
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function handleSubmit(event) {
    event.preventDefault();
    const teamNumber = value.trim();
    if (!/^\d{1,5}$/.test(teamNumber)) {
      setError("Enter a team number using 1 to 5 digits.");
      return;
    }

    setError("");
    onSubmit(teamNumber);
  }

  return (
    <div id="bgModal" role="presentation">
      <div
        id="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="h2Team"
        aria-describedby="team-number-note"
        onKeyDown={keepFocusInDialog}
        tabIndex={-1}
      >
        <p className="modal-kicker">One quick question</p>
        <h2 id="h2Team">What is your FRC team number?</h2>
        <p id="team-number-note">
          It helps count how many teams use the practice site. No name or email is collected.
        </p>

        <form onSubmit={handleSubmit} className="team-form">
          <label htmlFor="modalInput">Team number</label>
          <input
            id="modalInput"
            ref={inputRef}
            name="teamNumber"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError("");
            }}
            placeholder="Example: 353"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "team-number-error" : "team-number-note"}
          />
          {error && <p id="team-number-error" className="field-error">{error}</p>}
          <button id="modalSubmit" type="submit">Continue</button>
        </form>
      </div>
    </div>
  );
}

export default TeamModal;
