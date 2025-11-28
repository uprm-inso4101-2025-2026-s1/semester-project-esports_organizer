import React, { useState, useRef, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import dayjs from "dayjs";
import { formatTime } from "../../utils/helpers";
import "../../pages/CreateEventWizard.css";

export default function Step2DateTime({ data, onNext, onBack }) {
  const [date, setDate] = useState(data.date);
  const [time, setTime] = useState(data.time);
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef();

  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    const handleClickOutside = (event) => {
      setTimeout(() => {
        if (pickerRef.current && !pickerRef.current.contains(event.target)) {
          setShowPicker(false);
        }
      }, 0);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (!date || !time) {
      alert("Please select both date and time");
      return;
    }
    
    // Convert inputs to a full datetime
    const selectedDateTime = dayjs(`${date} ${time}`);
    const now = dayjs();
  
    // Case 1: The selected date is before today
    if (selectedDateTime.isBefore(now)) {
      alert("You cannot select a date in the past.");
      return;
    }
  
    // Valid
    onNext({ date, time });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="wizard-container">
        <div className="wizard-step-card">
          <h2 className="wizard-step-title">Step 2: Date & Time</h2>

          <div className="wizard-form-group">
            <label className="wizard-label">Date *</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="wizard-input"
            />
          </div>

          <div className="wizard-form-group" ref={pickerRef}>
            <label className="wizard-label">Time *</label>
            <input
              type="text"
              value={time}
              onClick={() => setShowPicker(!showPicker)}
              readOnly
              className="wizard-input time-input"
              placeholder="Select time"
            />

            {showPicker && (
              <div className="static-time-picker-container">
                <StaticTimePicker
                  displayStaticWrapperAs="mobile"
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
    </LocalizationProvider>
  );
}