import "./WinningTeam.css";

function WinningTeam({ teamName = "Team Name", teamLogo = "https://via.placeholder.com/150" }) {
  return (
    <div className="winner-card">
      <div className="winner-logo-container">
        <img src={teamLogo} alt={teamName} />
      </div>
      <div className="winner-text">
        <span className="winner-label">First Place</span>
        <span className="winner-team-name">{teamName}</span>
      </div>
    </div>
  );
}

export default WinningTeam;