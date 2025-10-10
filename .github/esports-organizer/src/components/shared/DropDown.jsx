import "./DropDown.css";

function Dropdown({ label, options = [], value, onChange, required = false, error }) {
  return (
    <div className="dropdown-wrapper">
      <label>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "error-input" : ""}
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
