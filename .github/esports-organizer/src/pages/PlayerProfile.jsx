import { useRef, useState } from "react";
import "./PlayerProfile.css";
import Navbar from "../components/shared/Navbar";

const FLAG_EMOJI = { US: "🇺🇸", PR: "🇵🇷", ES: "🇪🇸" };
const FLAG_LABEL = { US: "United States", PR: "Puerto Rico", ES: "Spain" };
const BADGE_PATH = "/assets/images/LOGO1.png";

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

  // Static data for cards
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
      desc: "Nintendo’s crossover fighter with fast-paced battles on dynamic stages.",
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

  // Achievements w icon + short description
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
  const [errors, setErrors] = useState({}); // basic client validation messages

  // Carousel index + avatar input
  const [achIndex, setAchIndex] = useState(0);
  const fileInputRef = useRef(null);

  const remainingBio = 300 - form.bio.length;
  const totalAch = achievements.length;

  // Toggle into edit mode with fresh form values
  function startEdit() {
    setForm({
      username: player.username,
      flag: player.flag,
      bio: player.bio,
      role: player.role,
      currentTeam: player.currentTeam,
    });
    setErrors({});
    setIsEditing(true);
  }

  // Revert edits
  function cancelEdit() {
    setIsEditing(false);
    setErrors({});
    setForm({
      username: player.username,
      flag: player.flag,
      bio: player.bio,
      role: player.role,
      currentTeam: player.currentTeam,
    });
  }

  // Two-way bind edit fields
  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Keep constraints simple
  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required.";
    if (form.username.length > 14) e.username = "Max 14 characters.";
    if (form.bio.length > 300) e.bio = "Bio must be ≤ 300 characters.";
    if (!form.flag) e.flag = "Select a flag.";
    if (!form.role) e.role = "Select a role.";
    if (form.currentTeam && form.currentTeam.length > 40) e.currentTeam = "Max 40 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Commit edits into the main player object
  function saveEdit() {
    if (!validate()) return;
    setPlayer((prev) => ({
      ...prev,
      username: form.username.trim(),
      flag: form.flag,
      bio: form.bio,
      role: form.role,
      currentTeam: form.currentTeam.trim(),
    }));
    setIsEditing(false);
  }

  // Avatar: click or keyboard triggers file input; preview via blob URL
  function onAvatarClick() {
    if (fileInputRef.current) fileInputRef.current.click();
  }
  function onAvatarKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") onAvatarClick();
  }
  function onChangeAvatar(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPlayer((prev) => ({ ...prev, avatarUrl: url }));
  }

  // Carousel
  function prevAch() {
    setAchIndex((i) => (i - 1 + totalAch) % totalAch);
  }
  function nextAch() {
    setAchIndex((i) => (i + 1) % totalAch);
  }

  // Pre-render lists for clarity
  const achievementItems = achievements.map((a, idx) => {
    const active = idx === achIndex ? "active" : "";
    return (
      <div key={a.id} className={"ach-item " + active}>
        <img className="ach-icon-img" src={a.iconUrl} alt={a.description || "achievement"} />
        <p className="ach-desc">{a.description}</p>
      </div>
    );
  });

  const gameItems = games.map((g) => (
    <article
      key={g.id}
      className="game-card"
      style={{ backgroundImage: "url(" + g.bg + ")" }}
    >
      <div className="game-center">
        <h3>{g.title}</h3>
      </div>
      <div className="game-overlay">
        <p className="game-desc">{g.desc}</p>
      </div>
    </article>
  ));

  return (
    <>
      <Navbar />
      <div className="player-profile">
        {/* LEFT: card with flag, username, bio, chips, actions */}
        <div className="left-col">
          <section className="profile-card" aria-label="Profile information">
            <div className="flag-and-name">
              <div
                className="flag editable"
                role="img"
                aria-label={FLAG_LABEL[isEditing ? form.flag : player.flag] || "Flag"}
              >
                <div className="display-layer" aria-hidden="true">
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

              <div className="username editable">
                {!isEditing && <span className="display-layer">{player.username}</span>}
                {isEditing && (
                  <input
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

            <div className="bio editable">
              {!isEditing && <span className="display-layer">{player.bio}</span>}
              {isEditing && (
                <>
                  <textarea
                    className="edit-layer"
                    name="bio"
                    maxLength={300}
                    value={form.bio}
                    onChange={handleInputChange}
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
                <button className="btn primary" type="button" onClick={startEdit}>
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

          {/* ACHIEVEMENTS: small carousel with chevrons */}
          <section className="achievements" aria-label="Achievements">
            <h2 className="ach-title-center">ACHIEVEMENTS</h2>

            <div className="ach-viewport">
              <button
                className="ach-nav-btn ach-nav-left"
                type="button"
                aria-label="Previous achievement"
                onClick={prevAch}
              >
                ‹
              </button>

              <button
                className="ach-nav-btn ach-nav-right"
                type="button"
                aria-label="Next achievement"
                onClick={nextAch}
              >
                ›
              </button>

              {achievementItems}
            </div>
          </section>
        </div>

        {/* CENTER: team title + avatar with badge overlay */}
        <section className="profile-hero">
          <h1 className="profile-hero-title">
            {player.currentTeam && player.currentTeam.trim()
              ? player.currentTeam
              : "CURRENT TEAM"}
          </h1>

          <div
            className={"avatar-circle " + (player.avatarUrl ? "has-image" : "no-image")}
            role="button"
            tabIndex={0}
            aria-label="Change profile picture"
            onClick={onAvatarClick}
            onKeyDown={onAvatarKeyDown}
            style={
              player.avatarUrl
                ? { backgroundImage: "url(" + player.avatarUrl + ")" }
                : undefined
            }
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
              onChange={onChangeAvatar}
              className="visually-hidden"
            />
          </div>
        </section>

        {/* RIGHT: vertical list of game cards */}
        <aside className="games-played">
          <h2>GAMES PLAYED</h2>
          <div className="games-scroll">{gameItems}</div>
        </aside>
      </div>
    </>
  );
}

export default PlayerProfile;
