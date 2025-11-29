import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Event from "../EventClass.js"; // <-- adjust path
import "../../pages/CreateEventWizard.css";
import {getProfileById, addEventToUserProfile} from "../../services/profile-service.js";
import { db } from "../../database/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export default function Step4Review({ data, onBack, onSubmit }) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { title, game, description, location, modality, date, time, maxTeams, maxPlayersPerTeam, community } = data;

  // Combine date + time -> JS Date (assumes date like "2025-11-08" and time like "14:30")
  function toDate(dateStr, timeStr) {
    // If you care about TZ, you can attach "Z" or use the user's local
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      // Verifica si evento existe este día y hora
      const eventDate = toDate(date, time);
      const start = eventDate.getTime();
      const end = start + 1000 * 60; // 1-minute range

      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("startAt", ">=", Timestamp.fromMillis(start - 1000)),
        where("startAt", "<=", Timestamp.fromMillis(end + 1000))
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
      setIsSaving(false);

      alert("This time slot is already taken. Please choose a different time.");

      return;
      }

      const evt = new Event({
        title,
        description: description,
        dateValue: toDate(date, time),
        participants: [],        //empty for now
        teams: [],
        game,
        location: location,
        createdBy:  await getProfileById(localStorage.getItem("currentUserUid")),
        community: community,
        tournament: null,

        maxTeams: maxTeams,
        maxPlayersPerTeam: maxPlayersPerTeam
      });

      const id = await evt.CreateEvent();
      console.log("Created event id:", id);

      // Add the created event to the creator's participated events
        const uid =
            localStorage.getItem("currentUserUid") || localStorage.getItem("uid");

        await addEventToUserProfile(uid, id, title);

      // Let parent close/reset or navigate
      onSubmit?.(id);

      navigate("/tournaments");
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