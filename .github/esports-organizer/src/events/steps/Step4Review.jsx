import React, { useState } from "react";
import Event from "../EventClass.js"; // <-- adjust path
import "../../pages/CreateEventWizard.css";
import {getProfileById} from "../../services/profile-service.js";

export default function Step4Review({ data, onBack, onSubmit }) {
  const [isSaving, setIsSaving] = useState(false);
  const { title, game, description, location, modality, date, time, maxTeams, maxPlayersPerTeam } = data;

  // Combine date + time -> JS Date (assumes date like "2025-11-08" and time like "14:30")
  function toDate(dateStr, timeStr) {
    // If you care about TZ, you can attach "Z" or use the user's local
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  const handleConfirm = async () => {
    try {
      setIsSaving(true);

      const evt = new Event({
        title,
        description: description,
        dateValue: toDate(date, time),
        participants: [],        //empty for now
        game,
        location: location,
        createdBy:  await getProfileById(localStorage.getItem("currentUserUid")),
        community: false,
        tournament: null,
      });

      const id = await evt.CreateEvent();
      console.log("Created event id:", id);

      // Let parent close/reset or navigate
      onSubmit?.(id);
      alert("Event created!");
    } catch (e) {
      console.error(e);
      alert("Failed to create event.");
    } finally {
      setIsSaving(false);
    }
  };

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
            <button className="wizard-btn" onClick={onBack} disabled={isSaving}>
              ← Back
            </button>
            <button className="wizard-btn" onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? "Saving..." : "✅ Confirm & Create"}
            </button>
          </div>
        </div>
      </div>
  );
}