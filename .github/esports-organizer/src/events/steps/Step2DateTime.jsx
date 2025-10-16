import React, { useState, useRef, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import dayjs from "dayjs";
import { formatTime } from "../utils/helpers";

export default function Step2DateTime({ data, onNext, onBack }) {
  const [date, setDate] = useState(data.date);
  const [time, setTime] = useState(data.time);
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [showPicker, setShowPicker] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNext = () => {
    if (!date || !time) return alert("Please select both date and time");
    onNext({ date, time });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="form-container">
        <h2>Step 2: Date & Time</h2>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group" ref={ref}>
            <label className="form-label">Time *</label>
            <input
              type="text"
              value={time}
              onClick={() => setShowPicker(!showPicker)}
              readOnly
              className="form-input time-input"
            />
            {showPicker && (
              <div className="static-time-picker-container">
                <StaticTimePicker
                  value={selectedTime}
                  onChange={(t) => {
                    setSelectedTime(t);
                    setTime(formatTime(t));
                  }}
                  slotProps={{ actionBar: { actions: [] } }}
                />
                <div className="time-picker-actions">
                  <button
                    type="button"
                    className="time-picker-accept"
                    onClick={() => setShowPicker(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-button" onClick={onBack}>
            ← Back
          </button>
          <button className="create-button" onClick={handleNext}>
            Next →
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
}