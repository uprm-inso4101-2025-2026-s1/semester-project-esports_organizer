import React, { useState } from "react";

export default function Step3Limits({ data, onNext, onBack }) {
  const [maxTeams, setMaxTeams] = useState(data.maxTeams);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(data.maxPlayersPerTeam);

  function handleNext() {
    if (!maxTeams || !maxPlayersPerTeam) return alert("Both fields required");
    onNext({ maxTeams, maxPlayersPerTeam });
  }

  return (
    <div className="form-container">
      <h2>Step 3: Limits</h2>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Max Teams *</label>
          <input
            type="number"
            value={maxTeams}
            onChange={(e) => setMaxTeams(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Max Players per Team *</label>
          <input
            type="number"
            value={maxPlayersPerTeam}
            onChange={(e) => setMaxPlayersPerTeam(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="cancel-button" onClick={onBack}>← Back</button>
        <button className="create-button" onClick={handleNext}>Next →</button>
      </div>
    </div>
  );
}