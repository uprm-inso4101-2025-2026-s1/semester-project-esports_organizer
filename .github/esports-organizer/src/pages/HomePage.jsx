import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../components/shared/Button";
import "./HomePage.css";
import { addToGoogleCalendar } from "../utils/helpers";
import Navbar from "../components/shared/Navbar";
import TournamentCard from "../components/shared/TournamentCard";
import Event from "../events/EventClass";

function HomePage() {
  const navigate = useNavigate();
  const [savedCards] = useState(new Set());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);

  async function loadEvents() {
    const data = await Event.ListEvents();
    const displayEvents = data.map((event) => ({
      id: event.id,
      title: event.title,
      game: event.game,
      price: "Free",
      date: event.dateValue.toDateString(),
      location: event.location,
      dateValue: event.dateValue,
      participants: event.participants,
      teams: event.teams,
      maxTeams: event.maxTeams,
      maxPlayersPerTeam: event.maxPlayersPerTeam
    }));
    setEvents(displayEvents);
  }

  // Effects
  useEffect(() => {
    loadEvents();
  }, []);

  // Block background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleJoinEvent = (event) => {
    if (event && event.id) {
      navigate("/tournaments", { state: { openEventId: event.id } });
      setIsMobileMenuOpen(false);
    }
  };

  // Community card component
  const CommunityCard = ({ communityId = "fortnite" }) => {
    const handleFollowCommunity = () => {
      handleNavigation(`/community/${communityId}`);
    };
    const handleViewCommunity = () => {
      handleNavigation(`/community/${communityId}`);
    };

    return (
      <div className="community-card">
        <div className="community-image-wrapper">
          <img 
            src="/assets/images/fortnite.png" 
            alt="Community" 
            className="tournament-image"
          />
          <div className="community-overlay">
          </div>
        </div>
        <div className="community-info">
          <h3 className="community-title">FORTNITE</h3>
          <div className="community-details">
            <div className="community-details-left">
              <div className="detail-item">
                <span className="detail-text">1.2k followers</span>
              </div>
              <div className="detail-item">
                <span className="detail-text">United States</span>
              </div>
            </div>
            <div className="community-details-right">
              <div className="detail-item">
                <span className="detail-text">3 upcoming events</span>
              </div>
              <div className="detail-item">
                <span className="detail-text">128 posts</span>
              </div>
            </div>
          </div>
          <div className="community-actions">
            <button type="button" className="follow-button" onClick={handleFollowCommunity}>Follow Community</button>
            <button type="button" className="view-button" onClick={handleViewCommunity}>View Community</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="homepage">
     <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-placeholder">
            <div className="arena-overlay">
              <div className="crowd-silhouette"></div>
              <div className="stage-lights"></div>
            </div>
            <div className="placeholder-content">
              <div className="placeholder-icon">🏟️</div>
              <p>Esports Arena Background</p>
            </div>
          </div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title">Esport Organizer</h1>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search for your game" 
              className="search-input"
            />
          </div>
          
          <div className="hero-buttons">
            <Button
              text="Discover communities"
              onClick={() => handleNavigation("/community")}
              variant="secondary"
            />
            <Button
              text="Discover Tournaments"
              onClick={() => handleNavigation("/tournaments")}
              variant="secondary"
            />
          </div>
          
            {/* Tournament Cards in Hero */}
            <div className="hero-tournament-cards-container">
              <div className="hero-tournament-cards">
                {[1, 2, 3].map((index) => (
                  <TournamentCard key={index} index={index} />
                ))}
              </div>
              <div className="view-more-button">
                <span>View more →</span>
              </div>
            </div>
        </div>
      </section>


      {/* Featured Events Section */}
      <section className="featured-events-section">
        <div className="section-container">
          <h2 className="section-title">FEATURED EVENTS</h2>
            <div className="tournament-cards-container">
              <div className="event-cards">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <TournamentCard
                      key={event.id}
                      tournament={event}
                      index={index}
                      prefix="event"
                      isSaved={false}
                      onToggleSaved={() => {}}
                      onJoinEvent={handleJoinEvent}
                    />
                  ))
                ) : (
                  <p>Loading events...</p>
                )}
                {[1, 2, 3, 4, 5].map((index) => (
                  <TournamentCard key={index} index={index} prefix="event" />
                ))}
              </div>
              <div className="view-more-button">
                <span>View more →</span>
              </div>
                <button className="view-more-button" onClick={() => handleNavigation("/tournaments")}>View more →</button>

            </div>
        </div>
      </section>

      {/* Communities Section */}
      <section className="communities-section">
        <div className="section-container">
          <h2 className="section-title">COMMUNITIES</h2>
            <div className="tournament-cards-container">
              <div className="community-cards">
                {[1, 2, 3].map((index) => (
                  <CommunityCard key={index} index={index} />
                ))}
              </div>
              <div className="view-more-button">
                <span>View more →</span>
              </div>
              <button className="view-more-button" onClick={() => handleNavigation("/community")}>View more →</button>
            </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
