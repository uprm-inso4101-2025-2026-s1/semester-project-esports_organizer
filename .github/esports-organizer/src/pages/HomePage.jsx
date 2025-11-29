import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../components/shared/Button";
import "./HomePage.css";
import { addToGoogleCalendar } from "../utils/helpers";
import Navbar from "../components/shared/Navbar";
import TournamentCard from "../components/shared/TournamentCard";
import Event from "../events/EventClass";
import { getAllCommunitiesFromDatabase } from "../Comm-Social/CommunityCreation.js";
import CommunityCard from "../components/CommunityCard";

function HomePage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

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

  // Fetch communities (same behavior as CommunityPage)
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoadingCommunities(true);
        const fetched = await getAllCommunitiesFromDatabase();
        const transformed = fetched.map((c) => ({
          id: c.id,
          title: c.name,
          imageUrl: c.icon || null,
          currentEvents: 0,
          followers: c.members ? c.members.length : 0,
          location: c.location || "Global",
          game: c.game,
        }));
        setCommunities(transformed);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setCommunities([]);
      } finally {
        setIsLoadingCommunities(false);
      }
    };
    fetchCommunities();
  }, []);

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
                  <p>No events found.</p>
                )}
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
            {isLoadingCommunities ? (
              <p>Loading communities...</p>
            ) : communities.length === 0 ? (
              <p>No communities found.</p>
            ) : (
              <div className="community-cards">
                {communities.map((c) => (
                  <div
                    key={c.id}
                    className="community-card-wrapper"
                    onClick={() => handleNavigation(`/community/${c.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <CommunityCard
                      imageUrl={c.imageUrl}
                      title={c.title}
                      currentEvents={c.currentEvents}
                      followers={c.followers}
                      location={c.location}
                      onJoin={() => handleNavigation(`/community/${c.id}`)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="view-more-button">
              <button className="view-more-button" onClick={() => handleNavigation("/community")}>View more →</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
