import React, { useState } from "react";
import "../../pages/CreateEventWizard.css";
import Community from "../../Comm-Social/Community"

export default function Step3Limits({ data, onNext, onBack }) {
  const [maxTeams, setMaxTeams] = useState(data.maxTeams);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(data.maxPlayersPerTeam);
  const [community, setCommunity] = useState(data.community);

  const allCommunities = Array.isArray(Community.allCommunities) ? Community.allCommunities : [];

  function handleNext() {
    if (!maxTeams || !maxPlayersPerTeam) return alert("Both fields required");
    onNext({ maxTeams, maxPlayersPerTeam });
  }

  return (
    <div className="wizard-container">
      <div className="wizard-step-card">
        <h2 className="wizard-step-title">Step 3: Team, Player Limits & Community</h2>

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

        {/* Community */}
        <div className="wizard-form-group">
          <label className="wizard-label">Community</label>
          <select
              value={community ? community.name : ""}
              onChange={(e) => {
                const selected = allCommunities.find(c => c.name === e.target.value);
                setCommunity(selected || null);
              }}
              className="wizard-select"
          >
            <option value="">No Community</option>
            {allCommunities.map((community) => (
                <option key={community.name} value={community.name}>{community.name}</option>
            ))}
          </select>
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