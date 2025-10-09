import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../components/shared/Button";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedCards, setSavedCards] = useState(new Set());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Block background scroll when modal is open
  useEffect(() => {
    if (showJoinModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showJoinModal]);

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleJoinEvent = (eventTitle) => {
    setSelectedEvent(eventTitle);
    setShowJoinModal(true);
  };

  const closeModal = () => {
    setShowJoinModal(false);
    setSelectedEvent(null);
  };

  // Bookmark functionality
  const toggleSaved = (cardId) => {
    setSavedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Navigation menu items
  const navItems = [
    { path: "/homepage", label: "Home" },
    { path: "/tournaments", label: "Tournaments" },
    { path: "/teams", label: "Teams" },
    { path: "/community", label: "Community" }
  ];

  // Bookmark button component
  const BookmarkButton = ({ cardId, isSaved }) => (
    <button 
      className={`bookmark-button ${isSaved ? 'saved' : ''}`}
      onClick={() => toggleSaved(cardId)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  );

  // Tournament card component
  const TournamentCard = ({ index, prefix = "" }) => {
    const cardId = prefix ? `${prefix}-${index}` : index;
    const isSaved = savedCards.has(cardId);

    return (
      <div className="tournament-card">
        <div className="tournament-image-wrapper">
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
          <h3 className="tournament-name">1 VS 1 JUNGLE CUP</h3>
          <div className="tournament-details">
            <div className="detail-item">
              <img src="/assets/icons/price.svg" alt="Price" className="detail-icon" />
              <span className="detail-text free">Free</span>
            </div>
            <div className="detail-item">
              <img src="/assets/icons/calendar.svg" alt="Calendar" className="detail-icon" />
              <span className="detail-text">Sat, 01 Oct 2025</span>
            </div>
            <div className="detail-item">
              <img src="/assets/icons/location.svg" alt="Location" className="detail-icon" />
              <span className="detail-text">Online Tournament</span>
            </div>
            <div className="detail-item">
              <img src="/assets/icons/game.svg" alt="Game" className="detail-icon" />
              <span className="detail-text">Fortnite</span>
            </div>
          </div>
          <div className="tournament-actions">
            <button 
              className="join-button"
              onClick={() => handleJoinEvent("1 VS 1 JUNGLE CUP")}
            >
              Join Event
            </button>
            <BookmarkButton cardId={cardId} isSaved={isSaved} />
          </div>
        </div>
      </div>
    );
  };

  // Community card component
  const CommunityCard = ({ index }) => {
    const cardId = `community-${index}`;
    const isSaved = savedCards.has(cardId);

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
            <button className="follow-button">Follow Community</button>
            <button className="view-button">View Community</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="homepage">
      {/* Navigation Header */}
      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo" onClick={() => handleNavigation("/homepage")}>
              <div className="logo-icon">
                <img 
                  src="/assets/images/LOGO.png" 
                  alt="Esport Organizer Logo" 
                  className="logo-image"
                />
              </div>
            </div>
            
            <nav className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-open' : ''}`}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="nav-actions">
            <Button
              text="Login/Sign Up"
              onClick={() => handleNavigation("/login")}
              variant="primary"
            />
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'hamburger-open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </header>

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
                <span>ver más →</span>
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
                {[1, 2, 3, 4, 5].map((index) => (
                  <TournamentCard key={index} index={index} prefix="event" />
                ))}
              </div>
              <div className="view-more-button">
                <span>ver más →</span>
              </div>
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
                <span>ver más →</span>
              </div>
            </div>
        </div>
      </section>

      {/* Join Event Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="modal-close-button" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-content-inner">
              {/* Event Banner Image */}
              <div className="modal-event-banner">
                <img 
                  src="/assets/images/fortnite.png" 
                  alt="Event Banner" 
                  className="modal-banner-image"
                />
              </div>
              
              {/* Event Header */}
              <div className="modal-event-header">
                <h2 className="modal-event-title">1 VS 1 JUNGLE CUP - FORTNITE</h2>
              </div>
              
              {/* Event Details */}
              <div className="modal-event-details">
                <div className="event-detail-row">
                  <div className="event-detail">Enter Price: Free</div>
                  <div className="modal-capacity">Capacity: 0/16</div>
                </div>
                <div className="event-detail">Date: Saturday, 01 Oct 2025 at 6:00 PM</div>
                <div className="event-detail">Location: Online Tournament</div>
              </div>
              
              {/* Join Event Form */}
              <div className="modal-form-section">
                <h3 className="form-title">JOIN EVENT</h3>
                
                <div className="form-inputs">
                  <input 
                    type="text" 
                    placeholder="Enter Name" 
                    className="form-input"
                  />
                  <input 
                    type="text" 
                    placeholder="Enter Last Name" 
                    className="form-input"
                  />
                  <input 
                    type="text" 
                    placeholder="Enter Username" 
                    className="form-input"
                  />
                </div>
                
                <div className="disclaimer-section">
                  <label className="disclaimer-checkbox">
                    <input type="checkbox" className="checkbox-input" />
                    <span className="disclaimer-text">
                      BY CHECKING THIS BOX, I AM AWARE THAT ABSENCE FROM THIS EVENT WILL RESULT IN IMMEDIATE DISQUALIFICATION.
                    </span>
                  </label>
                </div>
                
                <button 
                  className="join-event-button"
                  onClick={() => {
                    alert(`Successfully joined ${selectedEvent}!`);
                    closeModal();
                  }}
                >
                  Join Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
