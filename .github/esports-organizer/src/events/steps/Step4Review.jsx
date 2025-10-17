import React from "react";
import "../../pages/CreateEventWizard.css";

export default function Step4Review({ data, onBack, onSubmit }) {
  const { title, game, modality, date, time, maxTeams, maxPlayersPerTeam } =
    data;
  return (
    <div className="wizard-container">
      <div className="wizard-step-card">
        <h2 className="wizard-step-title">Step 4: Review & Confirm</h2>

        <div className="wizard-form-group">
          <p><strong>Title:</strong> {title}</p>
          <p><strong>Game:</strong> {game}</p>
          <p><strong>Modality:</strong> {modality}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Time:</strong> {time}</p>
          <p><strong>Max Teams:</strong> {maxTeams}</p>
          <p><strong>Max Players per Team:</strong> {maxPlayersPerTeam}</p>
        </div>

        <div className="wizard-actions">
          <button className="wizard-btn" onClick={onBack}>
            ← Back
          </button>
          <button className="wizard-btn" onClick={onSubmit}>
            ✅ Confirm & Create
          </button>
        </div>
      </div>
    </div>
  );
}