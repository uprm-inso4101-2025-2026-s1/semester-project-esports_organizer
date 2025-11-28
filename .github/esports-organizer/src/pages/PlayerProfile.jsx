import { useState, useRef, useEffect, useMemo } from "react";
import Navbar from "../components/shared/Navbar";
import "./PlayerProfile.css";
import { updatePlayerProfile, getProfileById, getUserParticipatedEvents } from "../services/profile-service";
import { checkUserPermission } from "../Roles/checkUserPermission";

// Flag emoji mapping
const FLAG_EMOJI = {
  "United States": "🇺🇸",
  "Puerto Rico": "🇵🇷",
  "Spain": "🇪🇸",
};

// Constants
const BADGE_PATH = "/assets/images/LOGO1.png";
const GAME_IMAGES = {
  "Fortnite": "/assets/images/fortnite.png",
  "League of Legends": "/assets/images/league_of_legends.png",
  "Counter-Strike 2": "/assets/images/counter-strike-2.png",
  "Valorant": "/assets/images/valorant.png",
  "Dota 2": "/assets/images/dota2_image.jpg",
  "Rocket League": "/assets/images/rocket_league_image2.png",
  "Call of Duty": "/assets/images/call_of_duty_image.png",
  "Apex Legends": "/assets/images/Apex_legends_image.jpeg",
  "Overwatch 2": "/assets/images/overwatch_2_image.png",
  "FIFA": "/assets/images/Fifa_game.png"
};

const ALL_GAMES = ["Fortnite", "League of Legends", "Counter-Strike 2", "Valorant", "Dota 2", "Rocket League", "Call of Duty", "Apex Legends", "Overwatch 2", "FIFA"];

function PlayerProfile() {
  // State management
  const [player, setPlayer] = useState({
    Username: "",
    bio: "",
    country: "",
    role: "",
    currentTeam: "",
    avatarUrl: "",
    createdAt: null,
    gamesPlayed: []
  });
  
  const [loading, setLoading] = useState(true);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    flag: "",
    role: "",
    currentTeam: ""
  });

  const [usernameError, setUsernameError] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const fileInputRef = useRef(null);
  
  // Calculate remaining bio characters safely
  const remainingBio = useMemo(() => {
    const bioLength = typeof form.bio === 'string' ? form.bio.length : 0;
    return 300 - bioLength;
  }, [form.bio]);

  // Calculate available games for modal
  const availableGames = useMemo(() => {
    if (!Array.isArray(player.gamesPlayed)) {
      return ALL_GAMES;
    }
    return ALL_GAMES.filter(game => !player.gamesPlayed.includes(game));
  }, [player.gamesPlayed]);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
        console.log("Loading profile for UID:", uid);
        
        if (!uid) {
          console.error("No user ID found");
          setLoading(false);
          return;
        }
        
        const profileData = await getProfileById(uid);
        console.log("Profile data loaded:", profileData);
        console.log("Role data:", profileData?.role, typeof profileData?.role);
        
        if (profileData) {
          // Ensure role is a string, not an object
          let roleValue = "";
          if (typeof profileData.role === 'string') {
            roleValue = profileData.role;
            console.log("Role is string:", roleValue);
          } else if (profileData.role && typeof profileData.role === 'object') {
            // If role is an object, try to extract a string value
            roleValue = profileData.role.value || profileData.role.name || profileData.role.type || "";
            console.log("Role extracted from object:", roleValue);
          } else {
            console.log("Role is empty or undefined");
          }
          
          // Check if we have a gameRole field instead
          let gameRole = profileData.gameRole || "";
          if (typeof gameRole === 'string' && gameRole.trim()) {
            roleValue = gameRole;
            console.log("Using gameRole field:", roleValue);
          }
          
          const playerData = {
            Username: String(profileData.Username || ""),
            bio: String(profileData.bio || ""),
            country: String(profileData.country || ""), 
            role: roleValue,
            currentTeam: String(profileData.currentTeam || ""),
            avatarUrl: String(profileData.avatarUrl || ""),
            createdAt: profileData.createdAt,
            gamesPlayed: Array.isArray(profileData.gamesPlayed) ? profileData.gamesPlayed : []
          };
          
          console.log("Final player data:", playerData);
          console.log("Final role value:", playerData.role);
          setPlayer(playerData);
          
          // Update form with loaded data
          setForm({
            username: String(profileData.Username || ""),
            bio: String(profileData.bio || ""),
            flag: String(profileData.country || ""),
            role: roleValue,
            currentTeam: String(profileData.currentTeam || "")
          });
        } else {
          console.log("No profile data found, using defaults");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  // Load participated events on mount
  useEffect(() => {
    const loadParticipatedEvents = async () => {
      const currentUid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
      console.log("PlayerProfile - Loading participated events for uid:", currentUid);
      if (currentUid) {
        const result = await getUserParticipatedEvents(currentUid);
        console.log("PlayerProfile - getUserParticipatedEvents result:", result);
        if (result && result.success && result.data) {
          console.log("PlayerProfile - Setting participatedEvents to:", result.data);
          setParticipatedEvents(result.data);
        } else if (result && result.data && Array.isArray(result.data)) {
          console.log("PlayerProfile - Setting participatedEvents (non-standard format) to:", result.data);
          setParticipatedEvents(result.data);
        } else {
          console.warn("PlayerProfile - No events found or error:", result);
          setParticipatedEvents([]);
        }
      } else {
        console.warn("PlayerProfile - No uid found in localStorage");
      }
    };
    loadParticipatedEvents();
  }, []);

  // Listen for global updates when participated events change elsewhere in the app
  useEffect(() => {
    const handler = async (e) => {
      console.log("PlayerProfile - participatedEventsUpdated event received");
      try {
        const currentUid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
        if (!currentUid) {
          console.warn("PlayerProfile - No uid found for refresh");
          return;
        }
        const result = await getUserParticipatedEvents(currentUid);
        console.log("PlayerProfile - refresh after participatedEventsUpdated:", result);
        if (result && result.success && result.data) {
          setParticipatedEvents(result.data);
        }
      } catch (err) {
        console.error("PlayerProfile - Error refreshing participated events:", err);
      }
    };

    window.addEventListener('participatedEventsUpdated', handler);
    return () => window.removeEventListener('participatedEventsUpdated', handler);
  }, []);

  // Edit mode handlers
  const startEdit = () => {
    setForm({
      username: String(player.Username || ""),
      bio: String(player.bio || ""),
      flag: String(player.country || ""),
      role: String(player.role || ""),
      currentTeam: String(player.currentTeam || ""),
    });
    setUsernameError(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUsernameError(false);
    setForm({
      username: String(player.Username || ""),
      bio: String(player.bio || ""),
      flag: String(player.country || ""),
      role: String(player.role || ""),
      currentTeam: String(player.currentTeam || ""),
    });
  };

  // Prevent enter in bio
  const handleBioKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "bio" ? String(value || "").replace(/\n/g, " ") : String(value || "");

    setForm((prev) => ({ ...prev, [name]: nextValue }));

    if (name === "username" && usernameError) {
      if (nextValue.trim().length > 0) setUsernameError(false);
    }
  };

  const saveEdit = async () => {
    const trimmedUsername = form.username.trim();
    if (!trimmedUsername) {
      setUsernameError(true);
      return;
    }

    try {
      const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
      if (!uid) {
        alert("Error: No user ID found");
        return;
      }

      const updateData = {
        Username: String(trimmedUsername),
        bio: String(form.bio || ""),
        country: String(form.flag || ""),
        gameRole: String(form.role || ""),
        currentTeam: String(form.currentTeam || "").trim()
      };

      const result = await updatePlayerProfile(uid, updateData);
      if (result.success) {
        setPlayer(prev => ({ 
          ...prev, 
          Username: String(trimmedUsername),
          bio: String(form.bio || ""),
          country: String(form.flag || ""),
          role: String(form.role || ""),
          currentTeam: String(form.currentTeam || "").trim()
        }));
        setIsEditing(false);
        setUsernameError(false);
        alert("Profile updated successfully!");
      } else {
        alert(result.error || "Error updating profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error updating profile");
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleChangeAvatar = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setPlayer((prev) => ({ ...prev, avatarUrl: base64String }));

        // Save avatar to database
        try {
          const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
          if (uid) {
            const updateData = { avatarUrl: base64String };
            await updatePlayerProfile(uid, updateData);
          }
        } catch (error) {
          console.error("Error saving avatar:", error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing avatar:", error);
    }
  };

  // Game management functions
  const addGame = async (gameName) => {
    const updatedGames = [...player.gamesPlayed, gameName];
    setPlayer(prev => ({ ...prev, gamesPlayed: updatedGames }));

    try {
      const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
      if (uid) {
        await updatePlayerProfile(uid, { gamesPlayed: updatedGames });
      }
    } catch (error) {
      console.error("Error saving games:", error);
    }
  };

  const removeGame = async (gameName) => {
    const updatedGames = player.gamesPlayed.filter(game => game !== gameName);
    setPlayer(prev => ({ ...prev, gamesPlayed: updatedGames }));

    try {
      const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
      if (uid) {
        await updatePlayerProfile(uid, { gamesPlayed: updatedGames });
      }
    } catch (error) {
      console.error("Error saving games:", error);
    }
  };

  // Calculate time since profile creation
  const calculateTimeActive = () => {
    try {
      if (!player.createdAt) {
        return "New profile";
      }
      
      let createdDate;
      if (typeof player.createdAt.toDate === 'function') {
        createdDate = player.createdAt.toDate();
      } else if (player.createdAt instanceof Date) {
        createdDate = player.createdAt;
      } else {
        return "New profile";
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "New profile";
      if (diffDays === 1) return "1 day active";
      if (diffDays < 30) return `${diffDays} days active`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? "1 month active" : `${months} months active`;
      }
      const years = Math.floor(diffDays / 365);
      return years === 1 ? "1 year active" : `${years} years active`;
    } catch (error) {
      console.error("Error calculating time active:", error);
      return "New profile";
    }
  };

  // Render helpers
  const gameItems = useMemo(() => {
    if (!Array.isArray(player.gamesPlayed)) {
      return [];
    }
    
    return player.gamesPlayed.map((gameName) => {
      try {
        const imageUrl = GAME_IMAGES[gameName];
        const fallbackLetter = (gameName || "G").charAt(0).toUpperCase();

        return (
          <div key={gameName} className="game-card-content">
            <button
              className="remove-game-btn"
              onClick={() => removeGame(gameName)}
              title={`Remove ${gameName}`}
            >
              ×
            </button>
            <div className="game-card-image">
              {imageUrl ? (
                <img src={imageUrl} alt={gameName} />
              ) : (
                <div className="game-card-placeholder">{fallbackLetter}</div>
              )}
            </div>
            <div className="game-card-title">{gameName}</div>
          </div>
        );
      } catch (error) {
        console.error("Error rendering game item:", error);
        return null;
      }
    }).filter(Boolean);
  }, [player.gamesPlayed]);

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="player-profile" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p style={{ fontSize: '1.5rem', color: '#fff' }}>Loading profile...</p>
        </div>
      </>
    );
  }

  // UI
  try {
    return (
      <>
        <Navbar />

        <div className="player-profile">
          {/* Left Column */}
          <div className="left-col">
            <section className="profile-card">
              <div className="flag-and-name">
                <div className="flag editable">
                  <div className="display-layer">
                    {FLAG_EMOJI[isEditing ? form.flag : player.country] || "🏳️"}
                  </div>
                  {isEditing && (
                    <select
                      className="edit-select--compact"
                      name="flag"
                      value={form.flag}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="Puerto Rico">Puerto Rico</option>
                      <option value="Spain">Spain</option>
                    </select>
                  )}
                </div>

                {/* Username */}
                <div className="username editable">
                  {!isEditing && <span className="display-layer">{player.Username || "Username"}</span>}
                  {isEditing && (
                    <input
                      required
                      className={`edit-layer edit-layer--center ${usernameError ? "error" : ""}`}
                      name="username"
                      type="text"
                      maxLength={14}
                      value={form.username}
                      onChange={handleInputChange}
                      placeholder="Enter a username"
                    />
                  )}
                </div>
              </div>

              <div className="bio editable" style={{ position: "relative" }}>
                {!isEditing && (
                  <span className="display-layer">
                    {player.bio && player.bio.trim() ? player.bio : "No bio."}
                  </span>
                )}
                {isEditing && (
                  <>
                    <textarea
                      className="edit-layer"
                      name="bio"
                      maxLength={300}
                      value={form.bio}
                      onChange={handleInputChange}
                      onKeyDown={handleBioKeyDown}
                      placeholder="Tell us about you (≤ 300 chars)"
                    />
                    <span className="bio-counter">{remainingBio}</span>
                  </>
                )}
              </div>

              <div className="chips">
                <span className="chip">{calculateTimeActive()}</span>
                <span className="chip editable">
                  {!isEditing && (
                    <span className="display-layer">
                      {player.role && player.role.trim() ? player.role : "Select Role"}
                    </span>
                  )}
                  {isEditing && (
                    <select
                      className="edit-layer edit-select--chip"
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Role</option>
                      <option value="Support">Support</option>
                      <option value="Assault">Assault</option>
                      <option value="Tank">Tank</option>
                    </select>
                  )}
                </span>
              </div>

              <div className="actions">
                {!isEditing && (
                  <button className="btn primary" type="button" onClick={async () => {
                    const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
                    if (await checkUserPermission(uid, "canEditUserProfile")==true) {
                      // Allowed
                      startEdit();
                    } else {
                      alert("You do not have permission to edit the profile.");
                    }
                  }}>
                    Edit Profile
                  </button>
                )}
                {isEditing && (
                  <>
                    <button className="btn success" type="button" onClick={saveEdit}>
                      Done
                    </button>
                    <button className="btn secondary" type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Center Column */}
          <section className="profile-hero">
            <h1 className="profile-hero-title">
              {player.currentTeam && player.currentTeam.trim() ? player.currentTeam : "CURRENT TEAM"}
            </h1>

            <div
              className={`avatar-circle ${player.avatarUrl ? "has-image" : "no-image"}`}
              onClick={handleAvatarClick}
              style={player.avatarUrl ? { backgroundImage: `url(${player.avatarUrl})` } : undefined}
            >
              {!player.avatarUrl && (
                <span className="avatar-hint">
                  click to change
                  <br />
                  profile picture
                </span>
              )}
              <img className="avatar-badge" src={BADGE_PATH} alt="badge" draggable="false" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChangeAvatar}
                className="visually-hidden"
                tabIndex={-1}
              />
            </div>
          </section>

          {/* Right Column */}
          <aside className="games-played">
            <h2>FAVORITE GAMES</h2>
            <div className="user-games-list">
              {gameItems.length === 0 ? (
                <div className="no-games-message">No games added yet</div>
              ) : (
                gameItems
              )}
              <button
                className="add-game-btn"
                onClick={() => setShowGameModal(true)}
                disabled={availableGames.length === 0}
              >
                + Add Game
              </button>
            </div>
          </aside>

          {/* Participated Events */}
          <section className="participated-events">
            <h2 className="events-title-center">PARTICIPATED EVENTS</h2>
            <div className="events-list">
              {participatedEvents.length > 0 ? (
                <ul className="events-ul">
                  {participatedEvents.map((event) => (
                    <li key={event.id} className="event-item">
                      <span className="event-name">{event.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-events">No events participated yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Game Selection Modal */}
        {showGameModal && (
          <div className="game-modal-overlay" onClick={() => setShowGameModal(false)}>
            <div className="game-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Select a Game</h3>
              <div className="game-modal-list">
                {availableGames.length === 0 ? (
                  <p>All games have been added!</p>
                ) : (
                  availableGames.map((game) => (
                    <button
                      key={game}
                      className="game-modal-item"
                      onClick={() => {
                        addGame(game);
                        setShowGameModal(false);
                      }}
                    >
                      {game}
                    </button>
                  ))
                )}
              </div>
              <button className="game-modal-close" onClick={() => setShowGameModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error("Error rendering PlayerProfile:", error);
    return (
      <>
        <Navbar />
        <div className="player-profile" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p style={{ fontSize: '1.5rem', color: '#fff' }}>Error loading profile. Please try again.</p>
        </div>
      </>
    );
  }
}

export default PlayerProfile;
