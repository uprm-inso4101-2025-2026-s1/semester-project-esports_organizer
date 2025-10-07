import React from "react";
import "../styles/EventCard.css";
import {
  TagIcon,
  CalendarIcon,
  LocationIcon,
  GamepadIcon,
  BookmarkIcon,
} from "../assets/Icons";

export default function EventCard({
  title,
  imageUrl,
  priceLabel,
  date,
  location,
  gameName,
  onJoin,
  onSave,
  isSaved = false,
  badge, // optional prop
}) {
  return (
    <div className="event-card">
      {/* Header (badge only if provided) */}
      <div className="ecard__header">
        {badge ? (
          <div className="ecard__badge">{badge}</div>
        ) : (
          <div
            className="ecard__badge ecard__badge--placeholder"
            aria-hidden="true"
          >
            placeholder
          </div>
        )}
      </div>

      {/* Media (image goes here) */}
      <div
        className="ecard__media"
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label={gameName || title}
      />

      {/* Body (title sits right below the image) */}
      <div className="ecard__body">
        <h3 className="ecard__title">{title}</h3>

        <ul className="ecard__meta-list">
          <MetaItem
            icon={<TagIcon />}
            text={priceLabel}
            accent={priceLabel?.toLowerCase() === "free"}
          />
          <MetaItem icon={<CalendarIcon />} text={date} />
          <MetaItem icon={<LocationIcon />} text={location} />
          <MetaItem icon={<GamepadIcon />} text={gameName} />
        </ul>
      </div>

      {/* Footer buttons */}
      <div className="ecard__footer">
        <button className="ecard__join-btn" onClick={onJoin}>
          Join Tournament
        </button>
        <button
          aria-label={isSaved ? "Unsave event" : "Save event"}
          title={isSaved ? "Unsave" : "Save"}
          onClick={onSave}
          className={`ecard__save-btn ${isSaved ? "is-active" : ""}`}
        >
          <BookmarkIcon active={isSaved} />
        </button>
      </div>
    </div>
  );
}

function MetaItem({ icon, text, accent = false }) {
  return (
    <li className="ecard__meta-item">
      <span className="ecard__icon-wrap">{icon}</span>
      <span
        className={`ecard__meta-text ${
          accent ? "ecard__meta-text--accent" : ""
        }`}
      >
        {text}
      </span>
    </li>
  );
}
