import "./Teams.css";

function Teams({ teamNames = [], teamLogos = [], onTeamClick, matchId, winnerName }) {
  const defaultNames = ["Team Name", "Team Name"];
  const defaultLogos = ["https://via.placeholder.com/150", "https://via.placeholder.com/150"];
  const displayNames = teamNames.length > 0 ? teamNames : defaultNames;
  const displayLogos = teamLogos.length > 0 ? teamLogos : defaultLogos;

  const handleClick = (name, logo) => {
    if (onTeamClick && name !== "Team Name") {
      onTeamClick(name, logo, matchId);
    }
  };

  return (
    <div className="Teams">
      {displayNames.map((name, idx) => {
        const isWinner = winnerName && winnerName === name;
        return (
          <div 
            className="team-img-wrapper"
            key={idx}
            onClick={() => handleClick(name, displayLogos[idx])}
            style={{ cursor: name !== "Team Name" ? 'pointer' : 'default' }}
          >
            <img src={displayLogos[idx] || defaultLogos[0]} alt={`Team ${idx + 1}`} />
            <span className="team-name">{name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Teams;