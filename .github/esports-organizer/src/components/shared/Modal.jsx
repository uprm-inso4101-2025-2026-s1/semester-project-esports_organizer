import "./Modal.css";
import { useNavigate } from "react-router-dom";

function Modal({
  title,
  children,
  buttons,
  buttonsDirection = "row",
  expanded = false,
  showLogo = false,
}) {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="auth-modal-overlay">
      {showLogo && (
        <>
          <div className="logo-container" onClick={() => handleNavigation("/")}>
            <img
              src="/assets/images/LOGO.png"
              alt="Esport Organizer Logo"
              className="auth-logo-image"
            />
          </div>
        </>
      )}
      <div className={`auth-modal-container ${expanded ? "expanded" : ""}`}>
        <h1>{title}</h1>
        <div className="auth-modal-content">{children}</div>

        {/* Footer para botones */}
        {buttons && (
          <div className={`modal-buttons ${buttonsDirection}`}>{buttons}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
