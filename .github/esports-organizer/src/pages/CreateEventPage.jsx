import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs from 'dayjs';
import Navbar from '../components/shared/Navbar';
import { GAMES, MODALITIES } from '../constants/navigation';
import { formatTime, preventDefault } from '../utils/helpers';
import './CreateEventPage.css';


const INITIAL_FORM_DATA = {
  title: '',
  date: '',
  time: '',
  modality: 'Teams',
  game: '',
  maxTeams: '',
  maxPlayersPerTeam: ''
};

function CreateEventPage() {
  // State management
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedTime, setSelectedTime] = useState(dayjs().hour(12).minute(0));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerRef = useRef(null);

  // Effects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setShowTimePicker(false);
      }
    };

    if (showTimePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimePicker]);

  // Event handlers

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleTimeChange = useCallback((newTime) => {
    setSelectedTime(newTime);
    const timeString = formatTime(newTime);
    setFormData(prev => ({ ...prev, time: timeString }));
  }, []);

  const toggleTimePicker = useCallback(() => {
    setShowTimePicker(!showTimePicker);
  }, [showTimePicker]);

  const handleSubmit = useCallback((e) => {
    preventDefault(e);
    // No validation, just prevent default form submission
  }, []);

  const handleBack = useCallback(() => {
    navigate('/tournaments');
  }, [navigate]);

  // Components

  const PageHeader = () => (
    <header className="create-event-header">
      <div className="header-content">
        <button className="back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Events
        </button>
        <h1 className="page-title">CREATE EVENT</h1>
      </div>
    </header>
  );

  const TimePicker = () => (
    <div className="time-picker-wrapper" ref={timePickerRef}>
      <input
        type="text"
        name="time"
        value={formData.time}
        onClick={toggleTimePicker}
        className="form-input time-input"
        placeholder="Select time"
        readOnly
      />
      {showTimePicker && (
        <div className="static-time-picker-container">
          <StaticTimePicker
            value={selectedTime}
            onChange={handleTimeChange}
            slotProps={{
              actionBar: {
                actions: [],
              },
            }}
          />
          <div className="time-picker-actions">
            <button
              type="button"
              className="time-picker-cancel"
              onClick={() => setShowTimePicker(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="time-picker-accept"
              onClick={() => setShowTimePicker(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const FormSection = () => (
    <section className="create-event-form-section">
      <div className="form-container">
        <form onSubmit={handleSubmit} className="create-event-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter event title"
            />
          </div>

          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <TimePicker />
            </div>
          </div>

          {/* Modality */}
          <div className="form-group">
            <label className="form-label">Modality *</label>
            <select
              name="modality"
              value={formData.modality}
              onChange={handleInputChange}
              className="form-select"
            >
              {MODALITIES.map(modality => (
                <option key={modality} value={modality}>{modality}</option>
              ))}
            </select>
          </div>

          {/* Game Selection */}
          <div className="form-group">
            <label className="form-label">Game *</label>
            <select
              name="game"
              value={formData.game}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select a game</option>
              {GAMES.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>

          {/* Max Teams and Players */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Max Teams *</label>
              <input
                type="number"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 16"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Players per Team *</label>
              <input
                type="number"
                name="maxPlayersPerTeam"
                value={formData.maxPlayersPerTeam}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 4"
                min="1"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleBack}>
              Cancel
            </button>
            <button type="submit" className="create-button">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </section>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="create-event-page">
        <Navbar />
        <PageHeader />
        <FormSection />
      </div>
    </LocalizationProvider>
  );
}

export default CreateEventPage;