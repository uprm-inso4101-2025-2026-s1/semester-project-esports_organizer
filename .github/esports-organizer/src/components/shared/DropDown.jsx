import { useState } from "react";
import "./DropDown.css";

function Dropdown({ label, options = [], value, onChange, required = false }) {
  return (
    <div className="dropdown-wrapper">
      <label>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;
