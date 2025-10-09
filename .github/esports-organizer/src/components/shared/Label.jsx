import React from "react";
import "./Label.css";

function Label({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className="form-label">
      {children}
      {required && <span className="required">*</span>}
    </label>
  );
}

export default Label;
