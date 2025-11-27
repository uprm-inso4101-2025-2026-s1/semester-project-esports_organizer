import { useEffect, useState } from "react";
import { addToGoogleCalendar } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
function TournamentCard({
  tournament, 
  index, 
  prefix = "", 
  isSaved, 
  onJoinEvent,
  userTeam
}) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Check if user's team has already joined this event
  // let hasTeamJoined = false;
  const [hasTeamJoined, setTeamJoined] = useState(false);
  useEffect(() => {
    setTeamJoined(userTeam && tournament.teams && 
      tournament.teams.some(eventTeam => eventTeam == userTeam.id)
    );
  }, [userTeam, tournament]);

  return (
    <div className="tournament-card">
      <div
        className="tournament-image-wrapper"
        role="button"
        tabIndex={0}
        onClick={() => handleNavigation("/brackets-tournaments")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNavigation("/brackets-tournaments");
        }}
      >
        <img
          src="/assets/images/fortnite.png"
          alt="Tournament"
          className="tournament-image"
        />
        <div className="tournament-overlay">
          <div className="tournament-type-overlay">CLASIFICATORIO</div>
        </div>
      </div>
      <div className="tournament-info">
        <h3 className="tournament-name">{tournament.title}</h3>
        <div className="tournament-details">
          <div className="detail-item">
            <img src="/assets/icons/price.svg" alt="Price" className="detail-icon" />
            <span className="detail-text free">{tournament.price}</span>
          </div>
          <div className="detail-item">
            <img src="/assets/icons/calendar.svg" alt="Calendar" className="detail-icon" />
            <span className="detail-text">{tournament.date}</span>
          </div>
          <div className="detail-item">
            <img src="/assets/icons/location.svg" alt="Location" className="detail-icon" />
            <span className="detail-text">{tournament.location}</span>
          </div>
          <div className="detail-item">
            <img src="/assets/icons/game.svg" alt="Game" className="detail-icon" />
            <span className="detail-text">{tournament.game}</span>
          </div>
        </div>
        <div className="tournament-actions">
          <button 
            type="button"
            className={`join-event-button ${hasTeamJoined ? 'joined' : ''}`}
            onClick={hasTeamJoined ? undefined : () => onJoinEvent(tournament)}
            disabled={hasTeamJoined}
            style={{
              background: hasTeamJoined ? '#666' : '',
              cursor: hasTeamJoined ? 'default' : 'pointer',
              opacity: hasTeamJoined ? 0.7 : 1
            }}
          >
            {hasTeamJoined ? 'Joined!' : 'Join Event'}
          </button>
          <button 
            type="button"
            className={`bookmark-button ${isSaved ? 'saved' : ''}`}
            onClick={() => {
              addToGoogleCalendar(tournament);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}

          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TournamentCard;
