import "./Button.css";
import defaultPfp from "../../assets/icons/common/default-pfp.png";

function Button({
  text,
  onClick,
  variant = "primary",
  isUserProfileButton = false,
  imgSrc,
}) {
  const resolvedImgSrc = imgSrc || defaultPfp;
  return (
    <button className={`btn ${variant}`} onClick={onClick}>
      {isUserProfileButton ? (
        <img
          className="user-profile-icon"
          src={resolvedImgSrc}
          alt="User Profile Picture"
        />
      ) : null}
      <p className="pstyle"> {text}</p>
    </button>
  );
}

export default Button;
