import React, { useState } from "react";
import { GAMES, MODALITIES } from "../constants/navigation";

export default function Step1Basics({ data, onNext }) {
  const [title, setTitle] = useState(data.title);
  const [game, setGame] = useState(data.game);
  const [modality, setModality] = useState(data.modality);

  function handleNext() {
    if (!title.trim() || !game) {
      alert("Title and Game are required");
      return;
    }
    onNext({ title, game, modality });
  }

  return (
    <div className="form-container">
      <h2>Step 1: Basic Info</h2>

      <div className="form-group">
        <label className="form-label">Event Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="Enter event title"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Modality *</label>
        <select
          value={modality}
          onChange={(e) => setModality(e.target.value)}
          className="form-select"
        >
          {MODALITIES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Game *</label>
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="form-select"
        >
          <option value="">Select a game</option>
          {GAMES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button className="create-button" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}