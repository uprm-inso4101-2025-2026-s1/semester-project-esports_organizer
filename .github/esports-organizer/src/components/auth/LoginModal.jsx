import { useState } from "react";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import "../shared/Modal.css";
import { Link, useNavigate } from "react-router-dom";
import Label from "../shared/Label";

function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Handle Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.emailOrUsername.trim())
      newErrors.emailOrUsername = "E-mail or Username is required or is Invalid.";
    if (!form.password.trim())
      newErrors.password = "Password is Required or is Invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Signup data:", form);
    navigate("/homepage");
  };

  return (
    <Modal
      title="Log in to your Account"
      buttonsDirection="column"
      showLogo={true}
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
      <Label required>E-mail or Username</Label>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="emailOrUsername"
          value={form.emailOrUsername}
          onChange={handleChange}
          placeholder="e.g. awesomegamer123@email.com"
          className={errors.emailOrUsername ? "error-input" : ""}
          required
        />
        {errors.emailOrUsername && (
          <p className="error">{errors.emailOrUsername}</p>
        )}

        <Label required>Password</Label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className={errors.password ? "error-input" : ""}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </form>

      <div id="forgotPassword">
        <Link to={"/recover"} className=".link">
          Forgot Password?
        </Link>
      </div>
    </Modal>
  );
}

export default LoginForm;
