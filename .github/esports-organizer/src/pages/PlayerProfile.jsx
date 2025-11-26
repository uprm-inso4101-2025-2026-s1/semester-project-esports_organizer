import { useRef, useState, useEffect } from "react";
import "./PlayerProfile.css";
import Navbar from "../components/shared/Navbar";
import { checkUserPermission } from "../Roles/checkUserPermission";
import { getUserParticipatedEvents } from "../services/profile-service.js";

// Constants
const FLAG_EMOJI = { US: "🇺🇸", PR: "🇵🇷", ES: "🇪🇸" };
const BADGE_PATH = "/assets/images/LOGO1.png";
const uid = localStorage.getItem("currentUserUid");

function PlayerProfile() {
  // Primary player state
  const [player, setPlayer] = useState({
    username: "username",
    flag: "PR",
    bio: "Competitive support player. Always learning, always grinding.",
    yearsActive: 3,
    role: "Support",
    currentTeam: "No current team",
    avatarUrl: "",
  });

  const [participatedEvents, setParticipatedEvents] = useState([]);

  // Static data (cards)
  const [games] = useState([
    {
      id: "cr",
      title: "Clash Royale",
      desc: "Real-time mobile strategy game mixing card battles with tower defense.",
      bg: "/assets/images/clash_royale.png",
    },
    {
      id: "ssbu",
      title: "Super Smash Bros. Ult.",
      desc: "Nintendo's crossover fighter with fast-paced battles on dynamic stages.",
      bg: "/assets/images/smash.png",
    },
    {
      id: "fortnite",
      title: "Fortnite",
      desc: "A colorful battle royale combining shooting, building, and seasonal events.",
      bg: "/assets/images/fortnite1.png",
    },
    {
      id: "lol",
      title: "League of Legends",
      desc: "5v5 MOBA where teams push lanes and take objectives to destroy the Nexus.",
      bg: "/assets/images/league_of_legends.png",
    },
    {
      id: "valo",
      title: "Valorant",
      desc: "Tactical 5v5 shooter that blends precise gunplay with unique agent abilities.",
      bg: "/assets/images/valorant.png",
    },
  ]);

  const [achievements] = useState([
    { id: 1, iconUrl: "/assets/images/CRL.png", description: "Won the national finals with clutch plays." },
    { id: 2, iconUrl: "/assets/images/FNCS.png", description: "Top 4 finish in the 2024 intercollegiate league." },
    { id: 3, iconUrl: "/assets/images/circuito_nacional.png", description: "Consistent high-impact performance all season." },
  ]);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: player.username,
    flag: player.flag,
    bio: player.bio,
    role: player.role,
    currentTeam: player.currentTeam,
  });

  // Used only to block save when empty
  const [usernameError, setUsernameError] = useState(false);

  const [achIndex, setAchIndex] = useState(0);
  const fileInputRef = useRef(null);

  const remainingBio = 300 - form.bio.length;
  const totalAch = achievements.length;

  // Load participated events on mount
  useEffect(() => {
    const loadParticipatedEvents = async () => {
      const currentUid = localStorage.getItem("currentUserUid");
      if (currentUid) {
        const result = await getUserParticipatedEvents(currentUid);
        if (result.success) {
          setParticipatedEvents(result.data);
        }
      }
    };
    loadParticipatedEvents();
  }, []);

  // Edit mode handlers
  const startEdit = () => {
    setForm({
      username: player.username,
      flag: player.flag,
      bio: player.bio,
      role: player.role,
      currentTeam: player.currentTeam,
    });
    setUsernameError(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUsernameError(false);
    setForm({
      username: player.username,
      flag: player.flag,
      bio: player.bio,
      role: player.role,
      currentTeam: player.currentTeam,
    });
  };

  // Prevent enter in bio
  const handleBioKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "bio" ? value.replace(/\n/g, " ") : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));

    if (name === "username" && usernameError) {
      if (nextValue.trim().length > 0) setUsernameError(false);
    }
  };

  const saveEdit = () => {
    const trimmedUsername = form.username.trim();
    if (!trimmedUsername) {
      setUsernameError(true); // block save
      return;
    }

    setPlayer((prev) => ({
      ...prev,
      username: trimmedUsername,
      flag: form.flag,
      bio: form.bio,
      role: form.role,
      currentTeam: form.currentTeam.trim(),
    }));

    setIsEditing(false);
    setUsernameError(false);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleChangeAvatar = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPlayer((prev) => ({ ...prev, avatarUrl: url }));
  };

  // Carousel
  const prevAch = () => setAchIndex((i) => (i - 1 + totalAch) % totalAch);
  const nextAch = () => setAchIndex((i) => (i + 1) % totalAch);

  // Render helpers
  const achievementItems = achievements.map((a, idx) => {
    const active = idx === achIndex ? "active" : "";
    return (
      <div key={a.id} className={`ach-item ${active}`}>
        <img className="ach-icon-img" src={a.iconUrl} alt={a.description || "achievement"} />
        <p className="ach-desc">{a.description}</p>
      </div>
    );
  });

  const gameItems = games.map((g) => (
    <article
      key={g.id}
      className="game-card"
      style={{ backgroundImage: `url(${g.bg})` }}
    >
      <div className="game-center">
        <h3>{g.title}</h3>
      </div>
      <div className="game-overlay">
        <p className="game-desc">{g.desc}</p>
      </div>
    </article>
  ));

  // UI
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
                  {FLAG_EMOJI[isEditing ? form.flag : player.flag] || "🏳️"}
                </div>
                {isEditing && (
                  <select
                    className="edit-select--compact"
                    name="flag"
                    value={form.flag}
                    onChange={handleInputChange}
                  >
                    <option value="US">United States</option>
                    <option value="PR">Puerto Rico</option>
                    <option value="ES">Spain</option>
                  </select>
                )}
              </div>

              {/* Username */}
              <div className="username editable">
                {!isEditing && <span className="display-layer">{player.username}</span>}
                {isEditing && (
                  <input
                    required
                    className="edit-layer edit-layer--center"
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
              <span className="chip">{player.yearsActive} yrs active</span>
              <span className="chip editable">
                {!isEditing && <span className="display-layer">{player.role}</span>}
                {isEditing && (
                  <select
                    className="edit-layer edit-select--chip"
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                  >
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

          {/* Achievements */}
          <section className="achievements">
            <h2 className="ach-title-center">ACHIEVEMENTS</h2>
            <div className="ach-viewport">
              <button className="ach-nav-btn ach-nav-left" type="button" onClick={prevAch}>
                ‹
              </button>
              <button className="ach-nav-btn ach-nav-right" type="button" onClick={nextAch}>
                ›
              </button>
              {achievementItems}
            </div>
          </section>

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
          <h2>GAMES PLAYED</h2>
          <div className="games-scroll">{gameItems}</div>
        </aside>
      </div>
    </>
  );
}

export default PlayerProfile;
