import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/shared/Navbar";
import TournamentCard from "../components/shared/TournamentCard";
import { TOURNAMENT_DATA, EVENTS_DATA } from "../data/mockData";
import { toggleSetItem } from "../utils/helpers";
import "./TournamentsPage.css";
import { db } from "../database/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { checkUserPermission } from "../Roles/checkUserPermission";
import Event from "../events/EventClass";
import { getProfileById, addEventToUserProfile } from "../services/profile-service.js";
import Team from "../services/TeamClass.js";

async function getEventById(eventID) {
  const data = await Event.ListEvents();
  for (let e of data) {
    if (e.id === eventID) {
      return new Event({
        title: e.title, 
        id: e.id, 
        decription: e.description,
        dateValue: e.dateValue,
        participants: e.participants,
        teams: e.teams,
        game: e.game,
        location: e.location,
        createdBy: e.createdBy,
        community: e.community,
        tournament: e.tournament,
        maxTeams: e.maxTeams,
        maxPlayersPerTeam: e.maxPlayersPerTeam
      });
    }
  }
}

function PageHeader({search, setSearch, handleCreateEvent}) {
  return (
    // <section className="page-header">
    <section className={"page-header"}>
      <div className="page-header-content">
        <h1 className="page-title">EVENTS</h1>
        <div className="search-and-create-container">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search for the event" 
              className="search-input"
              value={search} 
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
          <button 
            className="create-event-button"
            onClick={async () => {
                 const uid = localStorage.getItem("uid");
                if (await checkUserPermission(uid, "createUserEvent")==true || await checkUserPermission(uid, "createTeamEvent")==true ) {
                    // Allowed
                    handleCreateEvent();
                    } else {
                      alert("You do not have permission to create an event.");
                    }
              }}
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
}

function TournamentsPage() {
  // State management
  const navigate = useNavigate();
  const location = useLocation();
  const [savedCards, setSavedCards] = useState(new Set());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showNoTeamModal, setShowNoTeamModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', actions: [] });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const[events, setEvents] = useState([]);

  const [wantsNotifications, setWantsNotifications] = useState(true);
  const [userTeam, setUserTeam] = useState(null);

  const [userTeamId, setUserTeamId] = useState(null);
  useEffect(() => {
    async function fetchUserProfile() {
      const uid = localStorage.getItem("currentUserUid");
      if (uid) {
        const profile = await getProfileById(uid);
        setUserTeamId(profile?.teamId || null);
      }
    }
    fetchUserProfile();
  });

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

  useEffect(() => {
    const openEventId = location?.state?.openEventId;
    if (openEventId && events.length > 0) {
      const evt = events.find((e) => e.id === openEventId);
      if (evt) {
        setSelectedEvent(evt);
        setShowJoinModal(true);
        try {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } catch { 0; }
      }
    }
  }, [events, location]);

  useEffect(() => {
    document.body.style.overflow = showJoinModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showJoinModal]); 

  //Notifications
  const userId = localStorage.getItem('currentUserUid');

  const sendJoinNotification = async (eventTitle) => {
    try {
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        message: `You joined the event "${eventTitle}" `,
        createdAt: serverTimestamp(),
        read: false,
      });
      await addDoc(collection(db, 'User', userId, 'participatedEvents'), {
        event: eventTitle,
        createxAt: serverTimestamp(),
      });
      console.log('Notification sent');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matches = event.title.toLowerCase().includes(search);
    return matches;
  });

  const recommendedEvents = events.filter((event) => {
    const matches = (event.participants.length < event.maxPlayersPerTeam * event.maxTeams);
    return matches;
  })

  recommendedEvents.sort((e1, e2) => e2.participants.length - e1.participants.length);
  // Event handlers

  const toggleSaved = (cardId) => {
    setSavedCards(prev => toggleSetItem(prev, cardId));
  };

  // Load user profile and team information
  useEffect(() => {
    async function loadUserTeam() {
      const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
      if (uid) {
        try {
          const profile = await getProfileById(uid);
          // setUserProfile(profile);
          
          if (profile && profile.teamId) {
            const team = await Team.getById(profile.teamId);
            setUserTeam(team);
          }
        } catch (error) {
          console.error("Error loading user team:", error);
        }
      }
    }
    
    loadUserTeam();
  }, []);

  const handleJoinEvent = async (event) => {
    const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
    if (!uid) {
      setAlertModal({
        open: true,
        title: "Login Required",
        message: "Please log in to join events.",
        actions: [
          { text: "OK", variant: "primary", onClick: () => setAlertModal({ ...alertModal, open: false }) }
        ]
      });
      return;
    }

    try {
      const profile = await getProfileById(uid);
      if (!profile) {
        setAlertModal({
          open: true,
          title: "Profile Not Found",
          message: "User profile not found. Please log in again.",
          actions: [
            { text: "OK", variant: "primary", onClick: () => setAlertModal({ ...alertModal, open: false }) }
          ]
        });
        return;
      }

      if (!profile.teamId) {
        setShowNoTeamModal(true);
        return;
      }

      const team = await Team.getById(profile.teamId);
      if (!team) {
        setShowNoTeamModal(true);
        return;
      }

      // Check if the team is already in the event
      const currentEvent = await getEventById(event.id);
      const teamAlreadyInEvent = currentEvent.teams.some(eventTeam => 
        eventTeam.name === team.teamName && 
        eventTeam.members.some(member => member.uid === uid)
      );

      if (teamAlreadyInEvent) {
        setAlertModal({
          open: true,
          title: "Already Participating",
          message: `Your team "${team.teamName}" is already participating in this event.`,
          actions: [
            { text: "OK", variant: "primary", onClick: () => setAlertModal({ ...alertModal, open: false }) }
          ]
        });
        return;
      }

      setUserTeam(team);
      setSelectedEvent(event);
      setShowJoinModal(true);
    } catch (error) {
      console.error("Error checking user team:", error);
      setAlertModal({
        open: true,
        title: "Error",
        message: "Error checking your team information. Please try again.",
        actions: [
          { text: "OK", variant: "primary", onClick: () => setAlertModal({ ...alertModal, open: false }) }
        ]
      });
    }
  };

  const handleJoin = async (event, team) => {
    try {
      const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
      
      const currentEvent = await getEventById(event.id);
      
      const currentUser = await getProfileById(uid);

      if (!currentUser) {
        setAlertModal({
          open: true,
          title: "Profile Not Found",
          message: "Error: Your profile was not found. Please log in again.",
          actions: [
            { text: "OK", variant: "primary", onClick: () => setAlertModal({ ...alertModal, open: false }) }
          ]
        });
        return;
      }

      if (!currentUser.uid) {
        currentUser.uid = uid;
      }

      currentEvent.addToTeam(team.name, currentUser);
      currentEvent.teams.push(userTeamId);
      currentEvent.UpdateEvent();
      currentEvent.participants[currentUser.uid] = {
        ...(currentEvent.participants[currentUser.uid] || {}),
        wantsNotifications: wantsNotifications
      };

      await currentEvent.UpdateEvent(currentEvent.id);

      const addResult = await addEventToUserProfile(uid, event.id, event.title);

      if (!addResult || !addResult.success) {
        console.log(addResult);
        setAlertModal({
          open: true,
          title: "Profile Update Failed",
          message: "Event added to team but failed to update your profile. Please refresh.",
          actions: [
            { text: "OK", variant: "primary", onClick: () => { setAlertModal({ ...alertModal, open: false }); window.location.reload(); } }
          ]
        });
        return;
      }
      window.dispatchEvent(new globalThis.Event('participatedEventsUpdated'));
      await sendJoinNotification(event.title);
      await loadEvents();
      closeModal();
      console.log(`Successfully joined "${event.title}" with team "${team.name}!"`);
    } catch (error) {
      setAlertModal({
        open: true,
        title: "Error Joining Event",
        message: "Error joining event: " + error.message,
        actions: [
          { text: "OK", variant: "primary", onClick: () => setAlertModal({ ...alertModal, open: false }) }
        ]
      });
    }
  }


  const closeModal = () => {
    setShowJoinModal(false);
    setSelectedEvent(null);
  };
  const closeNoTeamModal = () => {
    setShowNoTeamModal(false);
  };

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  // Components

  const RecommendedSection = () => (
    <section className="recommended-section">
      <div className="section-container">
        <h2 className="section-subtitle">RECOMMENDED EVENTS</h2>
        <div className="recommended-cards">
          {recommendedEvents.length > 0 ? (
            recommendedEvents.map((tournament, index) => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament} 
                index={index}
                isSaved={savedCards.has(index)}
                onToggleSaved={toggleSaved}
                onJoinEvent={() => handleJoinEvent(tournament)}
              />
              ))) : (
                <p>No events found.</p>
            )}
        </div>
      </div>
    </section>
  );

  const EventsSection = () => (
    <section className="events-section">
      <div className="section-container">
        <div className="events-header">
          <h2 className="section-title">EVENTS</h2>
        </div>
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((tournament, index) => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament} 
                index={index}
                isSaved={savedCards.has(index)}
                onToggleSaved={toggleSaved}
                onJoinEvent={() => handleJoinEvent(tournament)}
              />
              ))) : (
                <p>No events found.</p>
            )}
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
            <h2 className="modal-event-title">{selectedEvent.title}</h2>
          </div>
          
          <div className="modal-event-details">
            <div className="event-detail-row">
              <div className="event-detail">Enter Price: Free</div>
              <div className="modal-capacity">Capacity: {selectedEvent.maxTeams * selectedEvent.maxPlayersPerTeam}</div>
            </div>
            <div className="event-detail-row">
              <div className="event-detail">Date: {selectedEvent.date}</div>
              <div className="event-detail">Modality: Teams</div>
            </div>
            <div className="event-detail">Location: {selectedEvent.location}</div>
          </div>
          
          <div className="modal-form-section">
            <h3 className="form-title">JOIN EVENT</h3>

            {userTeam && (
              <div className="user-team-info" style={{ 
                background: "rgba(255,255,255,0.05)", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "20px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#00d4ff" }}>Your Current Team</h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "18px" }}>{userTeam.teamName}</div>
                    <div style={{ fontSize: "14px", color: "#ccc" }}>{userTeam.mainGame}</div>
                  </div>
                  <div style={{ fontSize: "14px", color: "#aaa" }}>
                    {userTeam.members?.length || 0} members
                  </div>
                </div>
              </div>
            )}

            <div className="join-action-section" style={{ textAlign: "center", marginBottom: "20px" }}>
              <button 
                className="join-event-button" 
                style={{ 
                  width: "100%", 
                  padding: "16px", 
                  fontSize: "18px", 
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => {
                  if (userTeam) {
                    handleJoin(selectedEvent, { name: userTeam.teamName });
                  }
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #0099cc, #0077aa)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #00d4ff, #0099cc)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Join Event with {userTeam ? userTeam.teamName : "Your Team"}
              </button>
            </div>
            
            <div className="disclaimer-section">
              <label className="disclaimer-checkbox">
                <input type="checkbox" className="checkbox-input" />
                <span className="disclaimer-text">
                  BY CHECKING THIS BOX, I AM AWARE THAT ABSENCE FROM THIS EVENT WILL RESULT IN IMMEDIATE DISQUALIFICATION.
                </span>
              </label>
            </div>

            {/* Toggle de notificaciones */}
            <div style={{ margin: "18px 0", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#e0e0e0", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={wantsNotifications}
                  onChange={(e) => setWantsNotifications(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#00d4ff" }}
                />
                Send me reminders and updates for this event
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // Modal for no team
  const NoTeamModal = () => showNoTeamModal && (
    <div className="team-modal-overlay" onClick={closeNoTeamModal}>
      <div className="team-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="team-modal__header">
          <h2>Join a Team First</h2>
          <button type="button" className="team-modal__close" onClick={closeNoTeamModal} aria-label="Close">×</button>
        </div>
        <div className="team-modal__body">
          <p style={{ fontSize: "18px", marginBottom: "16px" }}>
            You need to join a team before you can participate in events.<br />
            Please visit the Teams page to join or create a team.
          </p>
        </div>
        <div className="team-modal__actions">
          <button
            type="button"
            className="team-modal__btn team-modal__btn--primary"
            style={{ minWidth: "120px" }}
            onClick={() => {
              closeNoTeamModal();
              navigate("/teams");
            }}
          >Go to Teams</button>
          <button
            type="button"
            className="team-modal__btn team-modal__btn--ghost"
            style={{ minWidth: "120px" }}
            onClick={closeNoTeamModal}
          >Cancel</button>
        </div>
      </div>
    </div>
  );

  // Generic alert modal
  const AlertModal = () => alertModal.open && (
    <div className="team-modal-overlay" onClick={() => setAlertModal({ ...alertModal, open: false })}>
      <div className="team-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="team-modal__header">
          <h2>{alertModal.title}</h2>
          <button type="button" className="team-modal__close" onClick={() => setAlertModal({ ...alertModal, open: false })} aria-label="Close">×</button>
        </div>
        <div className="team-modal__body">
          <p style={{ fontSize: "18px", marginBottom: "16px" }}>{alertModal.message}</p>
        </div>
        <div className="team-modal__actions">
          {alertModal.actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              className={`team-modal__btn team-modal__btn--${action.variant}`}
              style={{ minWidth: "120px" }}
              onClick={action.onClick}
            >{action.text}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="tournaments-page">
      <Navbar />
      <PageHeader search={search} setSearch={setSearch} handleCreateEvent={handleCreateEvent}/>
      <EventsSection />
      <RecommendedSection />
      <JoinEventModal />
      <NoTeamModal />
      <AlertModal />
    </div>
  );
}

export default TournamentsPage;
