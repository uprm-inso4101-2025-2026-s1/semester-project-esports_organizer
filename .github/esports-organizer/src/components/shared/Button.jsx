import "./Button.css";
import defaultPfp from "../../assets/icons/common/default-pfp.png";

function Button({
  text,
  onClick,
  variant = "primary",
  isUserProfileButton = false,
  imgSrc,
  size = "normal",
  className = "",
}) {
  const resolvedImgSrc = imgSrc || defaultPfp;
  const sizeClass = size === "small" ? "btn--small" : "";
  return (
    <button className={`btn ${variant} ${sizeClass} ${className}`} onClick={onClick}>
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
