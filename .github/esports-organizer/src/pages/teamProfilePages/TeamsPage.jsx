import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
// import { TEAMS } from "../../data/teams";
import Team from "../../services/TeamClass";
import { makeTeam } from "../../services/makeTeam";
import "./TeamsPage.css";
import "./TeamForms.css";
import { assignUserRole } from "../../Roles/assignUserRole";

function TeamModal({ title, children, onClose, footer }) {
  return (
    <div className="team-modal-overlay" onClick={onClose}>
      <div
        className="team-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="team-modal__header">
          <h2>{title}</h2>
          <button
            type="button"
            className="team-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="team-modal__body">{children}</div>
        {footer && <div className="team-modal__actions">{footer}</div>}
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTeamData, setForm] = useState({
    teamName: "",
    mainGame: "",
  });
  const [teams, setTeams] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!newTeamData.teamName.trim())
      newErrors.teamName = "Please input a team name";
    if (!newTeamData.mainGame.trim())
      newErrors.mainGame = "Please pick a main game (or just pick your favorite!)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const userId = localStorage.getItem("uid");

  useEffect(() => {
    async function loadTeams() {
      const query = search.trim().toLowerCase();
      const allTeams = await Team.getAll();
      if (!query) {
        setTeams(allTeams);
        return;
      }
      setTeams(allTeams.filter((team) => {
        const haystack = `${team.name} ${team.game}`.toLowerCase();
        return haystack.includes(query);
      }));
    }
    loadTeams();
  }, [search]);

  const closeCreateModal = () => setIsCreateModalOpen(false);
  const createTeam = async () => {
    if (!validate()) return;

    // make the user a team manager,,
    assignUserRole(userId, "Team Manager", {
      viewTournaments: true,
      createCommunities: true,
      canCreatePrivateTournaments: true,
      canCreatePublicTournaments: true,
      joinTournament: true,
      joinCommunities: true,
      joinTournamentwithTeam: true,
      editTeamProfile: true,
      editTeamRoster: true,
      invitePlayerstoTeam: true,
      assignTeamClasses: true,
      addPlayerToRoster: true,
      removePlayerFromRoster: true,
      canEditUserProfile: true,
      requestToJoinTeam: true,
      editUserEvent: true,
      createUserEvent: true,
      removeUserEvent: true,
    });

    makeTeam(newTeamData);

    // aaaand close the modal
    closeCreateModal();
  };

  useEffect(() => {
    document.body.style.overflow = isCreateModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCreateModalOpen]);

  return (
    <div className="teams-page">
      <Navbar />
      <main className="teams-page__content">
          <div>
            <h1>TEAM PROFILES:</h1>
            <p>
            </p>
          </div>
        <div className="teams-page__toolbar">
          <div className="teams-page__search">
            <input
              type="search"
              placeholder="Search for teams"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="teams-page__create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create new team
          </button>
        </div>

        <section className="teams-table" aria-label="Teams standings">
          <div className="teams-table__head">
            <span>Team</span>
            <span>Tournaments played</span>
            <span>Matches played</span>
            <span>Tournaments won</span>
          </div>

          <div className="teams-table__body">
            {teams.length === 0 ? (
              <p className="teams-table__empty">
                No teams match that search yet. Try another keyword or launch
                your own roster.
              </p>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  className="teams-table__row"
                  onClick={() => navigate(`/teams/${team.id}`)}
                  type="button"
                >
                  <span className="teams-table__team">
                    <span className="teams-table__team-logo">
                      <img src={team.logo ?? '../../src/assets/team-profile-pics/team1.png'} alt={`${team.teamName} logo`} />
                    </span>
                    <span className="teams-table__team-name">
                      <strong>{team.teamName}</strong>
                      <span>{team.mainGame}</span>
                    </span>
                  </span>
                  {/* team.stats.tournamentsPlayed */}
                  <span>{ 0 }</span>
                  {/* team.stats.matchesPlayed */}
                  <span>{ 0 }</span>
                  {/* team.stats.tournamentsWon */}
                  <span>{ 0 }</span>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      {isCreateModalOpen && (
        <TeamModal
          title="Create a new team"
          onClose={closeCreateModal}
          footer={
            <>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--ghost"
                onClick={closeCreateModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--primary"
                onClick={createTeam}
              >
                Create team
              </button>
            </>
          }
        >
          <form className="team-form" onSubmit={(event) => event.preventDefault()}>
            <label className="team-form__label" htmlFor="create-team-name">
              Team name
            </label>
            <input
              id="create-team-name"
              type="text"
              className="team-form__input"
              placeholder="e.g. Lunar Vanguard"
              name="teamName"
              onInput={handleChange}
            />
            {errors.teamName && (
              <p className="error">{errors.teamName}</p>
            )}

            <label className="team-form__label" htmlFor="create-team-game">
              Primary game
            </label>
            <input
              id="create-team-game"
              type="text"
              className="team-form__input"
              placeholder="Select the title you compete in"
              name="mainGame"
              onInput={handleChange}
            />
            {errors.mainGame && (
              <p className="error">{errors.mainGame}</p>
            )}

            <label className="team-form__label" htmlFor="create-team-description">
              Team description
            </label>
            <textarea
              id="create-team-description"
              className="team-form__textarea"
              rows={3}
              placeholder="Tell the community what makes your team stand out."
              name="description"
              onInput={handleChange}
            />

            <div className="team-form__group">
              <span className="team-form__label">Social media</span>
              <input
                type="url"
                className="team-form__input"
                placeholder="Twitch link"
                name="twitchUrl"
                onInput={handleChange}
              />
              <input
                type="url"
                className="team-form__input"
                placeholder="Instagram link"
                name="instagramUrl"
                onInput={handleChange}
              />
              <input
                type="url"
                className="team-form__input"
                placeholder="X / Twitter link"
                name="twitterUrl"
                onInput={handleChange}
              />
            </div>
          </form>
        </TeamModal>
      )}
    </div>
  );
}
