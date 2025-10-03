
import React from "react";
import "./NavButton.css";

function NavButton({ text, active, onClick }) {
  return (
    <button
      className={`nav-btn ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default NavButton;
