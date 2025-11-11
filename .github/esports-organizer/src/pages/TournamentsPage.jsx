import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/shared/Navbar";
import TournamentCard from "../components/shared/TournamentCard";
import { TOURNAMENT_DATA, EVENTS_DATA } from "../data/mockData";
import { toggleSetItem } from "../utils/helpers";
import "./TournamentsPage.css";
import { db } from "../database/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function TournamentsPage() {
  // State management
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState(new Set());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [, setSelectedEvent] = useState(null);
  const [modalStep, setModalStep] = useState(1);

  // Effects
  useEffect(() => {
    document.body.style.overflow = showJoinModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showJoinModal]); 

  //Notifications
  const userId = 'demoUser123'; 

  const sendJoinNotification = async (eventTitle) => {
    try {
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        message: `You joined the event "${eventTitle}" `,
        createdAt: serverTimestamp(),
        read: false,
      });
      console.log('Notification sent');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };


  // Event handlers

  const toggleSaved = (cardId) => {
    setSavedCards(prev => toggleSetItem(prev, cardId));
  };

  const handleJoinEvent = (eventTitle) => {
    setSelectedEvent(eventTitle);
    setShowJoinModal(true);
    setModalStep(1);

  };

  const closeModal = () => {
    setShowJoinModal(false);
    setSelectedEvent(null);
    setModalStep(1);
  };

  const handleNext = () => setModalStep(2);
  const handleBack = () => setModalStep(1);
  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  // Components

  const PageHeader = () => (
    <section className="page-header">
      <div className="page-header-content">
        <h1 className="page-title">EVENTS</h1>
        <div className="search-and-create-container">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search for the event" 
              className="search-input"
            />
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
          <button 
            className="create-event-button"
            onClick={handleCreateEvent}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Event
          </button>
        </div>
      </div>
    </section>
  );

  const RecommendedSection = () => (
    <section className="recommended-section">
      <div className="section-container">
        <h2 className="section-subtitle">RECOMMENDED EVENTS</h2>
        <div className="recommended-cards">
          {TOURNAMENT_DATA.map((tournament, index) => (
            <TournamentCard 
              key={tournament.id} 
              tournament={tournament} 
              index={index}
              isSaved={savedCards.has(index)}
              onToggleSaved={toggleSaved}
              onJoinEvent={handleJoinEvent}
            />
          ))}
        </div>
      </div>
    </section>
  );

  const EventsSection = () => (
    <section className="events-section">
      <div className="section-container">
        <div className="events-header">
          <h2 className="section-title">EVENTS</h2>
          <div className="events-filters">
            <select className="filter-select">
              <option>All Games</option>
              <option>Fortnite</option>
              <option>League of Legends</option>
            </select>
            <select className="filter-select">
              <option>All Dates</option>
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>
        </div>
        <div className="events-grid">
          {EVENTS_DATA.map((tournament, index) => (
            <TournamentCard 
              key={tournament.id} 
              tournament={tournament} 
              index={index}
              isSaved={savedCards.has(index)}
              onToggleSaved={toggleSaved}
              onJoinEvent={handleJoinEvent}
            />
          ))}
        </div>
      </div>
    </section>
  );

  const JoinEventModal = () => showJoinModal && (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={closeModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        
        <div className="modal-content-inner">
          <div className="modal-event-banner">
            <img 
              src="/assets/images/fortnite.png" 
              alt="Event Banner" 
              className="modal-banner-image"
            />
          </div>
          
          <div className="modal-event-header">
            <h2 className="modal-event-title">1 VS 1 JUNGLE CUP - FORTNITE</h2>
          </div>
          
          <div className="modal-event-details">
            <div className="event-detail-row">
              <div className="event-detail">Enter Price: Free</div>
              <div className="modal-capacity">Capacity: 0/16</div>
            </div>
            <div className="event-detail-row">
              <div className="event-detail">Date: Saturday, 01 Oct 2025 at 6:00 PM</div>
              <div className="event-detail">Modality: Teams</div>
            </div>
            <div className="event-detail">Location: Online Tournament</div>
          </div>
          
          {modalStep === 1 && (
            <div className="modal-form-section">
              <h3 className="form-title">JOIN EVENT</h3>
              
              <div className="form-inputs">
                <input type="text" placeholder="Enter Name" className="form-input" />
                <input type="text" placeholder="Enter Last Name" className="form-input" />
                <input type="text" placeholder="Enter Username" className="form-input" />
              </div>
              
              <div className="disclaimer-section">
                <label className="disclaimer-checkbox">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="disclaimer-text">
                    BY CHECKING THIS BOX, I AM AWARE THAT ABSENCE FROM THIS EVENT WILL RESULT IN IMMEDIATE DISQUALIFICATION.
                  </span>
                </label>
              </div>
              
              <button className="join-event-button" onClick={handleNext}>
                Next
              </button>
            </div>
          )}

          {modalStep === 2 && (
            <div className="modal-teams-section">
              <div className="teams-header">
                <button className="back-button" onClick={handleBack}>
                  ← Back
                </button>
                <h3 className="teams-title">TEAMS</h3>
              </div>
              
              <div className="teams-container">
                <div className="teams-list">
                  {['Team Alpha', 'Team Beta', 'Team Gamma'].map((team, index) => (
                    <div key={index} className="team-item">
                      <div className="team-info">
                        <span className="team-name">{team}</span>
                        <span className="team-members">{3 - index}/4 members</span>
                      </div>
                      <button className="join-team-button">Join Team</button>
                    </div>
                  ))}
                </div>
                
                <button className="add-team-button">
                  + Add New Team
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="tournaments-page">
      <Navbar />
      
      <PageHeader />
      <RecommendedSection />
      <EventsSection />
      <JoinEventModal />
    </div>
  );
}

export default TournamentsPage;
