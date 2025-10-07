import React from "react";
import "../styles/CommunityCard.css";

export default function CommunityCard({
  imageUrl,
  title,
  currentEvents = 0,
  followers = 0,
  onJoin,
}) {
  const eventsLabel = String(currentEvents).padStart(3, "0"); // e.g., 000, 012, 145
  const followersLabel = new Intl.NumberFormat().format(followers);

  return (
    <div className="community-card">
      {/* Media */}
      <div className="ccard__media">
        {imageUrl ? (
          <img src={imageUrl} alt={`${title} cover`} />
        ) : (
          <div className="ccard__media-placeholder" aria-hidden />
        )}
      </div>

      {/* Body */}
      <div className="ccard__body">
        <h3 className="ccard__title">{title}</h3>

        <ul className="ccard__stats">
          <li>
            <span className="ccard__label">Current Events:</span>
            <span className="ccard__value">{eventsLabel}</span>
          </li>
          <li>
            <span className="ccard__label">Followers:</span>
            <span className="ccard__value">{followersLabel}</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="ccard__footer">
        <button className="ccard__join-btn" onClick={onJoin}>
          Join
        </button>
      </div>
    </div>
  );
}
