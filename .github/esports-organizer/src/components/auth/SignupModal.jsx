import { useState } from "react";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import DropDown from "../shared/DropDown";
import Label from "../shared/Label";
import "../shared/Modal.css";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    sqAnswer: "",
  });

  const [errors, setErrors] = useState({});

  const securityQuestions = [
    { value: "sq1", label: "Security Question 1" },
    { value: "sq2", label: "Security Question 2" },
    { value: "sq3", label: "Security Question 3" },
  ];

  // Handle Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = "E-mail is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format.";

    if (!form.password) newErrors.password = "Password is required.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (!form.securityQuestion)
      newErrors.securityQuestion = "Select a security question.";

    if (!form.sqAnswer.trim()) newErrors.sqAnswer = "Answer is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Signup data:", form);
    navigate("/create-profile");
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
        <Label required>E-mail</Label>
        <input
          type="text"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={errors.email ? "error-input" : ""}
          placeholder="e.g. awesomegamer123@email.com"
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

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

        <Label required>Confirm Password</Label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className={errors.confirmPassword ? "error-input" : ""}
          required
        />
        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword}</p>
        )}

        <Label required>Security Question</Label>
        <DropDown
          value={form.securityQuestion}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, securityQuestion: value }))
          }
          options={securityQuestions}
          required
          error={!!errors.securityQuestion}
        />
        {errors.securityQuestion && (
          <p className="error">{errors.securityQuestion}</p>
        )}

        <Label required>SQ Answer</Label>
        <input
          type="text"
          name="sqAnswer"
          value={form.sqAnswer}
          onChange={handleChange}
          placeholder="Type an Answer"
          required
          className={errors.sqAnswer ? "error-input" : ""}
        />
        <p className="error">{errors.sqAnswer}</p>
      </form>
    </Modal>
  );
}

export default SignupForm;
