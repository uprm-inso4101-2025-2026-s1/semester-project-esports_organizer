import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import { TEAMS } from "../../data/teams";
import "./TeamsPage.css";
import "./TeamForms.css";
import { assignUserRole } from "../../Roles/assignUserRole";

const uid = localStorage.getItem("uid");

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

  const uid = localStorage.getItem("uid");

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return TEAMS;

    return TEAMS.filter((team) => {
      const haystack = `${team.name} ${team.game}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  const closeCreateModal = () => setIsCreateModalOpen(false);

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
            {filteredTeams.length === 0 ? (
              <p className="teams-table__empty">
                No teams match that search yet. Try another keyword or launch
                your own roster.
              </p>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  className="teams-table__row"
                  onClick={() => navigate(`/teams/${team.id}`)}
                  type="button"
                >
                  <span className="teams-table__team">
                    <span className="teams-table__team-logo">
                      <img src={team.logo} alt={`${team.name} logo`} />
                    </span>
                    <span className="teams-table__team-name">
                      <strong>{team.name}</strong>
                      <span>{team.game}</span>
                    </span>
                  </span>
                  <span>{team.stats.tournamentsPlayed}</span>
                  <span>{team.stats.matchesPlayed}</span>
                  <span>{team.stats.tournamentsWon}</span>
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
                onClick={async () => {closeCreateModal(); assignUserRole(uid,"Team Manager",{
                  viewTournaments:true,
                  createCommunities: true,
                  canCreatePrivateTournaments: true,
                  canCreatePublicTournaments:true,
                  joinTournament:true,
                  joinCommunities:true,
                  joinTournamentwithTeam:true,
                  editTeamProfile:true,
                  editTeamRoster:true,
                  invitePlayerstoTeam:true,
                  assignTeamClasses:true,
                  addPlayerToRoster:true,
                  removePlayerFromRoster:true,
                  canSendNotifications: true,
                  canEditUserProfile:true,
                  requestToJoinTeam:true,
                  editUserEvent:true,
                  createUserEvent:true,
                  removeUserEvent:true,
                  });
                  closeCreateModal()}}
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
            />

            <label className="team-form__label" htmlFor="create-team-game">
              Primary game
            </label>
            <input
              id="create-team-game"
              type="text"
              className="team-form__input"
              placeholder="Select the title you compete in"
            />

            <label className="team-form__label" htmlFor="create-team-description">
              Team description
            </label>
            <textarea
              id="create-team-description"
              className="team-form__textarea"
              rows={3}
              placeholder="Tell the community what makes your team stand out."
            />

            <div className="team-form__group">
              <span className="team-form__label">Social media</span>
              <input
                type="url"
                className="team-form__input"
                placeholder="Twitch link"
              />
              <input
                type="url"
                className="team-form__input"
                placeholder="Instagram link"
              />
              <input
                type="url"
                className="team-form__input"
                placeholder="X / Twitter link"
              />
            </div>
          </form>
        </TeamModal>
      )}
    </div>
  );
}
