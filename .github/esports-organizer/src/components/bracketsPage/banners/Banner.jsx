import "./Banner.css";
import defaultImage from "../../../assets/marvel-rivals.png";

function Banner({
  game = "MARVEL RIVALS",
  registeredTeams = "15 / 29",
  teamSize = "5v5",
  prizePool = "100$",
  host = "Host Name",
  gameImage = defaultImage
}) {
  return (
    <div className="banner">
      <div className="game-photo-holder">
        <img src={gameImage} alt="Game Banner" className="game-photo-img" />
      </div>
      <div className="banner-bottom-container">
        <div className="tournament-info-bar">
          <div className="info-group">
            <div className="info-label">Game:</div>
            <div className="info-value">{game}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Registered Teams:</div>
            <div className="info-value">{registeredTeams}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Team Size:</div>
            <div className="info-value">{teamSize}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Prize Pool:</div>
            <div className="info-value">{prizePool}</div>
          </div>
          <div className="info-group host-group">
            <div className="info-label">Hosted By:</div>
            <div className="host-box">{host}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;

