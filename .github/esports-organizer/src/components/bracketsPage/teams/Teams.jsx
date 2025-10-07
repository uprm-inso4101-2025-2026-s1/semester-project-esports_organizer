import "./Teams.css";

function Teams({ teamNames = [], teamLogos = [] }) {
  const defaultNames = ["Team Name", "Team Name"];
  const defaultLogos = ["https://via.placeholder.com/150", "https://via.placeholder.com/150"];
  const displayNames = teamNames.length > 0 ? teamNames : defaultNames;
  const displayLogos = teamLogos.length > 0 ? teamLogos : defaultLogos;
  return (
    <div className="Teams">
      {displayNames.map((name, idx) => (
        <div className={`team-img-wrapper${idx % 2 === 1 ? ' light' : ''}`} key={idx}>
          <img src={displayLogos[idx] || defaultLogos[0]} alt={`Team ${idx + 1}`} />
          <span className="team-name">{name}</span>
        </div>
      ))}
    </div>
  );
}

export default Teams;