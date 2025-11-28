import { useState } from "react";
import "./SubTeamCreationMenu.css";

export default function SubTeamCreationMenu({ menuOpen, setMenuOpen, handleCreateTeam, selectedEvent }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  const handleSave = () => {
    handleCreateTeam(selectedEvent, input);
    setInput("");
    setEditing(false);
    setMenuOpen(false);
  };

  if (!menuOpen) return null;

  return (
    <div className="subteam-overlay">
      <div className="subteam-modal">
        <button className="subteam-close-button" onClick={() => setMenuOpen(false)}>✕</button>

        <div className="subteam-content">
          <button className="subteam-button">Sub-Team</button>

          {!editing && (
            <button className="subteam-add-button" onClick={() => setEditing(true)}>
              Add Custom Team
            </button>
          )}

          {editing && (
            <>
              <input
                type="text"
                placeholder="Sub-Team name"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="subteam-input"
              />
              <button className="subteam-create-button" onClick={handleSave}>
                Create
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
