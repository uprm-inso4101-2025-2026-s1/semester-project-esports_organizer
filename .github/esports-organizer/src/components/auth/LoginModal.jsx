import { useState } from "react";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import "../shared/Modal.css";
import { Link, useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };
  return (
    <Modal
      title="Log in to your Account"
      buttonsDirection="column"
      showLogo = {true}
      buttons={[
        <Button key="login" text="Log In" onClick={handleSubmit}></Button>,
        <Button
          key="signup"
          text="Don't have an account? Sign Up"
          variant="secondary"
          onClick={() => navigate("/signup")}
        ></Button>,
      ]}
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail or Username</label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. awesomegamer123@email.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </form>
      <div id="invalid-data-forgotPassword">
        <Link to={"/recover"} className=".link">
          Forgot Password?
        </Link>
      </div>
    </Modal>
  );
}

export default LoginForm;
