import { useState } from "react";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import DropDown from "../shared/DropDown";
import "../shared/Modal.css";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [sqAnswer, setSqAnswer] = useState("");

  const securityQuestions = [
    { value: "sq1", label: "Security Question 1" },
    { value: "sq2", label: "Security Question 2" },
    { value: "sq3", label: "Security Question 3" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      email,
      username,
      password,
      confirmPassword,
      securityQuestion,
      sqAnswer,
    });
  };
  return (
    <Modal
      title="Create an Account"
      buttonsDirection="column"
      showLogo={true}
      buttons={[
        <Button key="signup" text={"Sign Up"} onClick={handleSubmit}></Button>,
        <Button
          key="signup"
          text="Already have an account? Log in"
          variant="secondary"
          onClick={() => navigate("/login")}
        ></Button>,
      ]}
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail *</label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. awesomegamer123@email.com"
          required
        />

        <label htmlFor="username">Username *</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="AwesomeGamerXx"
          required
        />

        <label htmlFor="password">Password *</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />

        <DropDown
          label={"Security Question"}
          value={securityQuestion}
          onChange={setSecurityQuestion}
          options={securityQuestions}
          required
        />

        <label htmlFor="sqAnswer">SQ Answer *</label>
        <input
          type="text"
          id="sqAnswer"
          value={sqAnswer}
          onChange={(e) => setSqAnswer(e.target.value)}
          placeholder="Type an Answer"
          required
        />
      </form>
    </Modal>
  );
}

export default SignupForm;
