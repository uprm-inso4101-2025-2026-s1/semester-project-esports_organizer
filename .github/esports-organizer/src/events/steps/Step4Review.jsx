import React from "react";

export default function Step4Review({ data, onBack, onSubmit }) {
  return (
    <div className="form-container">
      <h2>Step 4: Review</h2>

      <ul>
        <li><strong>Title:</strong> {data.title}</li>
        <li><strong>Game:</strong> {data.game}</li>
        <li><strong>Modality:</strong> {data.modality}</li>
        <li><strong>Date:</strong> {data.date}</li>
        <li><strong>Time:</strong> {data.time}</li>
        <li><strong>Max Teams:</strong> {data.maxTeams}</li>
        <li><strong>Max Players:</strong> {data.maxPlayersPerTeam}</li>
      </ul>

      <div className="form-actions">
        <button className="cancel-button" onClick={onBack}>← Back</button>
        <button className="create-button" onClick={onSubmit}>Create Event</button>
      </div>
    </div>
  );
}