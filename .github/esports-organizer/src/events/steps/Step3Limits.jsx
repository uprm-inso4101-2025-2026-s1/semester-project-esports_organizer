import React, { useState } from "react";
import "../../pages/CreateEventWizard.css";

export default function Step3Limits({ data, onNext, onBack }) {
  const [maxTeams, setMaxTeams] = useState(data.maxTeams);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(data.maxPlayersPerTeam);

  function handleNext() {
    if (!maxTeams || !maxPlayersPerTeam) return alert("Both fields required");
    onNext({ maxTeams, maxPlayersPerTeam });
  }

  return (
    <div className="wizard-container">
      <div className="wizard-step-card">
        <h2 className="wizard-step-title">Step 3: Team & Player Limits</h2>

        <div className="wizard-form-group">
          <label className="wizard-label">Max Teams *</label>
          <input
            type="number"
            min="1"
            className="wizard-input"
            value={maxTeams}
            onChange={(e) => setMaxTeams(e.target.value)}
            placeholder="e.g. 16"
          />
        </div>

        <div className="wizard-form-group">
          <label className="wizard-label">Max Players per Team *</label>
          <input
            type="number"
            min="1"
            className="wizard-input"
            value={maxPlayersPerTeam}
            onChange={(e) => setMaxPlayersPerTeam(e.target.value)}
            placeholder="e.g. 4"
          />
        </div>

        <div className="wizard-actions">
          <button className="wizard-btn" onClick={onBack}>
            ← Back
          </button>
          <button className="wizard-btn" onClick={handleNext}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}