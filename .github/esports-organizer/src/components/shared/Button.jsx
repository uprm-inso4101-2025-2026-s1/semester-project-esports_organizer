import "./Button.css";

function Button({ text, onClick, variant = "primary" }) {
  return (
    <button className={`btn ${variant}`} onClick={onClick}>
      <p className="pstyle"> {text}</p>
    </button>
  );
}

export default Button;
