import "./Modal.css";

function Modal({
  title,
  children,
  buttons,
  buttonsDirection = "row",
  showLogo = false,
}) {
  return (
    <div className="modal-overlay">
      {showLogo && (
        <>
          <div className="logo-container">logo</div>
        </>
      )}
      <div className="modal-container">
        <h1>{title}</h1>
        <div className="modal-content">{children}</div>

        {/* Footer para botones */}
        {buttons && (
          <div className={`modal-buttons ${buttonsDirection}`}>{buttons}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
