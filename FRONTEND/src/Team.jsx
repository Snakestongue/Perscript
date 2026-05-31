import { useState } from "react";

function TeamModal({ onSubmit }) {
  const [value, setValue] = useState("");

  return (
    <div id="bgModal">
      <div id="modal">
        <h2 id="h2Team">Enter FRC Team Number</h2>
        <input id="modalInput"
          value={value}
          onChange={(i) => setValue(i.target.value)}
          placeholder="Team number"
        />
        <button id="modalSubmit" onClick={()=>onSubmit(value)}>
          Submit
        </button>
        <p id="notice">This is just to count users.</p>
      </div>
    </div>
  );
}
export default TeamModal;