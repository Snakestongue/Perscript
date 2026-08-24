import { useEffect, useRef, useState } from "react";
function TeamModal({ onSubmit }){
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const privacyDialogRef = useRef(null);
  const privacyTriggerRef = useRef(null);
  useEffect(() =>{
    const previousFocus = document.activeElement;
    inputRef.current?.focus();
    return () =>{
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);
  useEffect(() =>{
    if (showPrivacy) {
      privacyDialogRef.current?.focus();
    } else {
      privacyTriggerRef.current?.focus();
    }
  },[showPrivacy]);

  function keepFocusInDialog(event, containerRef) {
    if (event.key !== "Tab" || !containerRef.current){
      return
    }
    const focusable = Array.from(
      containerRef.current.querySelectorAll("button:not([disabled]), input:not([disabled])")
    );
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && (document.activeElement === first || document.activeElement === containerRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleSubmit(event){
    event.preventDefault();
    const teamNumber = value.trim();
    if (!/^\d{1,5}$/.test(teamNumber)) {
      setError("Enter a team number using 1 to 5 digits.");
      return;
    }
    setError("");
    onSubmit(teamNumber);
  }

  function handleDismiss() {
    onSubmit("90019");
  }
  return(
    <div id="bgModal" role="presentation">
      <div
        id="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="h2Team"
        aria-describedby="team-number-note"
        onKeyDown={(event) => keepFocusInDialog(event, dialogRef)}
        tabIndex={-1}
        className="relative">

        <button
          type="button"
          id="modalDismiss"
          aria-label="Close, skip entering team number"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/50 hover:text-white text-xl leading-none hover:cursor-pointer"
        >&times;</button>

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
        <div className="!mx-auto">
          <button
            type="button"
            className="
            mt-4 rounded-lg border border-[#7AADFF] 
            px-4 py-2 w-full text-sm font-semibold 
            text-[#7AADFF] transition-colors 
            hover:bg-[#1f2c3f] hover:text-black hover:cursor-pointer"
            ref={privacyTriggerRef}
            aria-expanded={showPrivacy}
            aria-controls="privacyModal"
            onClick={() => setShowPrivacy((prev) => !prev)}
          >Privacy policy</button>

          {showPrivacy && (
            <div
              id="privacyModal"
              ref={privacyDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="h2Privacy"
              onKeyDown={(event) =>
                keepFocusInDialog(event, privacyDialogRef)
              }
              tabIndex={-1}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
              <div className="w-full max-w-lg rounded-2xl border border-[#7AADFF]/40 bg-black p-6 text-white shadow-2xl shadow-[#7AADFF]/10">
                <div className="mb-5">
                  <h2 id="h2Privacy" className="mb-2 text-2xl font-bold text-[#7AADFF]">Privacy Policy</h2>
                </div>

                <p className="text-sm leading-7 text-white/80">
                  Your FRC team number is required to use Perscript. 
                  We use it to estimate how many unique FRC teams use the practice site. 
                  We may also share aggregated usage statistics, such as the number of users or teams using Perscript. 
                  No name or email is required
                </p>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    id="privacyClose"
                    onClick={() => setShowPrivacy(false)}
                    className="
                    rounded-lg bg-[#7AADFF] px-5 py-2.5 text-sm font-bold 
                    text-black transition-all 
                    hover:bg-[#1f2c3f] 
                    hover:cursor-pointer
                    ">Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamModal;