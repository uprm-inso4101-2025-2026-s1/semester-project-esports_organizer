import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Button from "../../components/shared/Button";
import "./TeamProfilePage.css";
import "./TeamForms.css";
import Team from "../../services/TeamClass";

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

export default function TeamProfilePage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState({});

  // const team = useMemo(
  //   () => Team.getAll().find((entry) => entry.id === teamId) ?? null,
  //   [ teamId ]
  // );
  useState(() => {
    async function loadTeam() {
      console.log(await Team.getById(teamId));
      setTeam(await Team.getById(teamId));
    }
    loadTeam();
  }, [ teamId ]);

  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isManageRosterOpen, setIsManageRosterOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const anyModalOpen = isEditTeamOpen || isManageRosterOpen;
    document.body.style.overflow = anyModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isEditTeamOpen, isManageRosterOpen]);

  // if (!team) {
  //   return (
  //     <div className="team-profile-page">
  //       <Navbar />
  //       <main className="team-profile team-profile--empty">
  //         <div className="team-profile__empty-card">
  //           <h1>We couldn’t find that team.</h1>
  //           <p>
  //             The roster you’re looking for might be private or still in the
  //             works. Head back to the teams directory to explore active teams.
  //           </p>
  //           <Button
  //             text="Back to teams"
  //             onClick={() => navigate("/teams")}
  //             variant="secondary"
  //           />
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }

  // TODO:
  const userHasEditPermissions = false;

  const openEditTeamModal = () => setIsEditTeamOpen(true);
  const closeEditTeamModal = () => setIsEditTeamOpen(false);

  const openRosterModal = (player = null) => {
    setSelectedPlayer(player);
    setIsManageRosterOpen(true);
  };
  const closeRosterModal = () => {
    setSelectedPlayer(null);
    setIsManageRosterOpen(false);
  };

  return (
    <div className="team-profile-page">
      <Navbar />
      <main className="team-profile">
        <button
          type="button"
          className="team-profile__back"
          onClick={() => navigate("/teams")}
        >
          ← Back to teams
        </button>

        <section className="team-hero">
          <div
            className="team-hero__background"
            style={{ backgroundImage: `url(${team ? team.coverImage : ''})` }}
            role="presentation"
          />
          <div className="team-hero__scrim" />

          <div className="team-hero__inner">
            <div className="team-hero__identity">
              <div className="team-hero__logo">
                <img src={team?.logo ?? '../../src/assets/team-profile-pics/team1.png'} alt={`${team?.teamName} logo`} />
              </div>
              <div className="team-hero__meta">
                <div className="team-hero__title-row">
                  <h1 className="team-hero__title">{(team?.teamName ?? "").toUpperCase()}</h1>
                  <span className="team-hero__game">{team?.game}</span>
                </div>
                <div className="team-hero__record">
                  <span className="team-hero__record-value">
                    {
                      (team && team.record ? team.record.wins : '0')
                    } - {
                      (team && team.record ? team.record.losses : '0')
                    }
                  </span>
                  <span className="team-hero__record-label">Wins · Losses</span>
                </div>
                <p className="team-hero__description">{team?.description}</p>
                {userHasEditPermissions && (
                  <button
                    type="button"
                    className="team-hero__edit"
                    onClick={openEditTeamModal}
                  >
                    Edit team profile
                  </button>
                )}
              </div>
            </div>

            <ul className="team-hero__socials" aria-label="Team social links">
              {Object.entries(team?.social ?? {})
                .filter(([, value]) => value)
                .map(([network, url]) => (
                  <li key={network}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="team-hero__social-link"
                    >
                      {network}
                    </a>
                  </li>
                ))}
              {Object.values(team?.social ?? {}).every((value) => !value) && (
                <li className="team-hero__social-empty">
                  Social channels coming soon
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="team-sections">
          <div className="team-card team-card--matches">
            <header className="team-card__header">
              <div>
                <h2>Recent Matches</h2>
                <span className="team-card__subtitle">
                  Track the latest series results
                </span>
              </div>
              {userHasEditPermissions && (
                <button type="button" className="team-card__action">
                  Log result
                </button>
              )}
            </header>

            {team?.matches && team.matches.length === 0 ? (
              <p className="team-empty-state">
                This team hasn’t recorded any matches yet. Results will appear
                here once the season starts.
              </p>
            ) : (
              <ul className="team-matches__list">
                {team?.matches && team?.matches.map((match) => (
                  <li key={match.id} className="team-match">
                    <div className="team-match__opponent">
                      <div className="team-match__logo">
                        <img
                          src={match.opponentLogo || team.logo}
                          alt={`${match.opponent} logo`}
                        />
                      </div>
                      <div>
                        <p className="team-match__name">{match.opponent}</p>
                        <span className="team-match__detail">
                          {match.tournament}
                        </span>
                      </div>
                    </div>
                    <div className="team-match__score">
                      <span>{match.score.for}</span>
                      <span>-</span>
                      <span>{match.score.against}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="team-card team-card--roster">
            <header className="team-card__header">
              <div>
                <h2>Roster</h2>
                <span className="team-card__subtitle">{team?.game}</span>
              </div>
              {userHasEditPermissions && (
                <button
                  type="button"
                  className="team-card__action"
                  onClick={() => openRosterModal()}
                >
                  Manage roster
                </button>
              )}
            </header>

            {team?.roster && team.roster.length === 0 ? (
              <p className="team-empty-state">
                No players have been added yet. Once roster slots are assigned,
                each member will appear here with their role, socials, and
                highlight reel.
              </p>
            ) : (
              <div className="team-roster__grid">
                {team?.roster && team.roster.map((player) => (
                  <article key={player.id} className="team-player-card">
                    <div className="team-player-card__media">
                      <img src={player.photo} alt={`${player.gamerTag} avatar`} />
                      {userHasEditPermissions && (
                        <button
                          type="button"
                          className="team-player-card__edit"
                          onClick={() => openRosterModal(player)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="team-player-card__body">
                      <h3>{player.gamerTag}</h3>
                      <p className="team-player-card__name">{player.name}</p>
                      <div className="team-player-card__meta">
                        <span>{player.position}</span>
                        <span>{player.nationality}</span>
                      </div>
                    </div>
                    <ul className="team-player-card__socials">
                      {Object.entries(player.socials)
                        .filter(([, url]) => url)
                        .map(([network, url]) => (
                          <li key={network}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {network}
                            </a>
                          </li>
                        ))}
                      {Object.values(player.socials).every((value) => !value) && (
                        <li className="team-player-card__socials-empty">
                          No socials added
                        </li>
                      )}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {isEditTeamOpen && (
        <TeamModal
          title="Edit team profile"
          onClose={closeEditTeamModal}
          footer={
            <>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--ghost"
                onClick={closeEditTeamModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--primary"
                onClick={closeEditTeamModal}
              >
                Save changes
              </button>
            </>
          }
        >
          <form className="team-form" onSubmit={(event) => event.preventDefault()}>
            <label className="team-form__label" htmlFor="team-name">
              Team name
            </label>
            <input
              id="team-name"
              type="text"
              className="team-form__input"
              defaultValue={team.name}
            />

            <label className="team-form__label" htmlFor="team-game">
              Primary game
            </label>
            <input
              id="team-game"
              type="text"
              className="team-form__input"
              defaultValue={team.game}
            />

            <label className="team-form__label" htmlFor="team-description">
              Team description
            </label>
            <textarea
              id="team-description"
              className="team-form__textarea"
              rows={4}
              defaultValue={team.description}
            />

            <div className="team-form__group">
              <span className="team-form__label">Social media</span>
              {Object.entries(team.social).map(([network, url]) => (
                <input
                  key={network}
                  type="url"
                  className="team-form__input"
                  defaultValue={url}
                  placeholder={`${network} link`}
                />
              ))}
            </div>
          </form>
        </TeamModal>
      )}

      {isManageRosterOpen && (
        <TeamModal
          title={selectedPlayer ? "Edit roster slot" : "Add roster slot"}
          onClose={closeRosterModal}
          footer={
            <>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--ghost"
                onClick={closeRosterModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--primary"
                onClick={closeRosterModal}
              >
                {selectedPlayer ? "Update player" : "Add player"}
              </button>
            </>
          }
        >
          <form className="team-form" onSubmit={(event) => event.preventDefault()}>
            <label className="team-form__label" htmlFor="player-gamer-tag">
              Player gamer tag
            </label>
            <input
              id="player-gamer-tag"
              type="text"
              className="team-form__input"
              defaultValue={selectedPlayer?.gamerTag}
            />

            <label className="team-form__label" htmlFor="player-name">
              Player name
            </label>
            <input
              id="player-name"
              type="text"
              className="team-form__input"
              defaultValue={selectedPlayer?.name}
            />

            <label className="team-form__label" htmlFor="player-position">
              Position
            </label>
            <input
              id="player-position"
              type="text"
              className="team-form__input"
              defaultValue={selectedPlayer?.position}
            />

            <label className="team-form__label" htmlFor="player-nationality">
              Nationality
            </label>
            <input
              id="player-nationality"
              type="text"
              className="team-form__input"
              defaultValue={selectedPlayer?.nationality}
            />

            <label className="team-form__label" htmlFor="player-photo">
              Player photo URL
            </label>
            <input
              id="player-photo"
              type="url"
              className="team-form__input"
              defaultValue={selectedPlayer?.photo}
            />

            <div className="team-form__group">
              <span className="team-form__label">Social media</span>
              {["twitch", "twitter", "instagram", "tiktok"].map((network) => (
                <input
                  key={network}
                  type="url"
                  className="team-form__input"
                  defaultValue={selectedPlayer?.socials?.[network] ?? ""}
                  placeholder={`${network} link`}
                />
              ))}
            </div>
          </form>
        </TeamModal>
      )}
    </div>
  );
}
