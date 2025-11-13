import React, { useState } from "react";
import { GAMES, MODALITIES } from "../../constants/navigation";
import "../../pages/CreateEventWizard.css";

export default function Step1Basics({ data, onNext }) {
  const [title, setTitle] = useState(data.title);
  const [game, setGame] = useState(data.game);
  const [modality, setModality] = useState(data.modality);
  const [description, setDescription] = useState(data.description || "");
  const [location, setLocation] = useState(data.description || "");

  function handleNext() {
    if (!title.trim() || !game) {
      alert("Title and Game are required");
      return;
    }
    // Pass description along with the other info to the next step
    onNext({ title, description, game, modality, location });
  }

  return (
      <div className="wizard-container">
        <div className="wizard-step-card">
          <h2 className="wizard-step-title">Step 1: Basic Info</h2>

          {/* Event Title */}
          <div className="wizard-form-group">
            <label className="wizard-label">Event Title *</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="wizard-input"
                placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div className="wizard-form-group">
            <label className="wizard-label">Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="wizard-input"
                placeholder="Write a short description of your event"
                rows={4}
            />
          </div>

          {/* Location */}
          <div className="wizard-form-group">
            <label className="wizard-label">Location</label>
            <textarea
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="wizard-input"
                placeholder="Write the location of your event"
                rows={1}
            />
          </div>

          {/* Modality */}
          <div className="wizard-form-group">
            <label className="wizard-label">Modality *</label>
            <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="wizard-select"
            >
              {MODALITIES.map((m) => (
                  <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Game */}
          <div className="wizard-form-group">
            <label className="wizard-label">Game *</label>
            <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="wizard-select"
            >
              <option value="">Select a game</option>
              {GAMES.map((g) => (
                  <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Next Button */}
          <div className="wizard-actions">
            <button className="wizard-btn" onClick={handleNext}>
              Next →
            </button>
          </div>
        </div>
      </div>
  );
}
