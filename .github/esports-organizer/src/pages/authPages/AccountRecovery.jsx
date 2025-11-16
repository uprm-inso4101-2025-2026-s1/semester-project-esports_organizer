import { useState } from "react";
import Modal from "../../components/shared/Modal";
import Button from "../../components/shared/Button";
import "./AuthPages.css";
import { useNavigate } from "react-router-dom";
import Label from "../../components/shared/Label";

function AccountRecovery() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    emailOrUsername: "",
    securityAnswer: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);

  const [errors, setErrors] = useState({});
  const newErrors = {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    // validate email/username (mock)
    if (form.emailOrUsername.trim() !== "") {
      setStep(2);
    } else {
      newErrors.emailOrUsername =
        "E-mail or Username is required or is Invalid.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    // validate respuesta (mock)
    if (form.securityAnswer.trim() !== "") {
      setStep(3);
    } else {
      newErrors.securityAnswer = "Security Answer is required or is Incorrect.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitStep3 = (e) => {
    e.preventDefault();
    // validate contraseñas iguales
    if (form.newPassword.trim() === "") {
      newErrors.newPassword = "Password is required.";
    }

    if (form.confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Confirm Password is required.";
    }

    if (
      form.newPassword &&
      form.confirmPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    // Solo avanzar si no hay errores
    if (Object.keys(newErrors).length === 0) {
      setStep(4);
    }
  };

  const handleCancel = () => {
    setForm({
      emailOrUsername: "",
      securityAnswer: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setStep(1);

    navigate("/login");
  };
  return (
    // Center Form
    <div className="auth-page centered">
      <div className="form-section">
        <Modal
          title={
            step === 1
              ? "Account Recovery"
              : step === 2
              ? "Security Question"
              : step === 3
              ? "Reset Password"
              : "Success"
          }
          // Navigation Buttons
          buttons={
            step < 4
              ? [
                  <Button
                    key="cancel"
                    text="Cancel"
                    variant="secondary"
                    onClick={handleCancel}
                  />,
                  <Button
                    key="next"
                    text="Next"
                    onClick={
                      step === 1
                        ? handleSubmitStep1
                        : step === 2
                        ? handleSubmitStep2
                        : handleSubmitStep3
                    }
                  />,
                ]
              : [
                  <Button
                    key="login"
                    text="Return to Login"
                    onClick={handleCancel}
                  />,
                ]
          }
        >
          {/* Email validation */}
          {step === 1 && (
            <>
              <h2>
                Please enter your e-mail or username to validate your
                information.
              </h2>
              <form onSubmit={handleSubmitStep1}>
                <Label required>E-mail or Username</Label>
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
              </form>
            </>
          )}

          {/* Security Question validation */}
          {step === 2 && (
            <>
              <h2>What is the name of your first pet?</h2>
              <form onSubmit={handleSubmitStep2}>
                <Label required>Answer</Label>
                <input
                  type="text"
                  name="securityAnswer"
                  value={form.securityAnswer}
                  onChange={handleChange}
                  placeholder="Type your answer..."
                  className={errors.securityAnswer ? "error-input" : ""}
                  required
                />
                <p className="error">{errors.securityAnswer}</p>
              </form>
            </>
          )}

          {/* New Password entry */}
          {step === 3 && (
            <>
              <h2>Enter your new password</h2>
              <Label required>New Password</Label>
              <form onSubmit={handleSubmitStep3}>
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? "error-input" : ""}
                  required
                />
                <p className="error">{errors.newPassword}</p>

                <Label required>Confirm New Password</Label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error-input" : ""}
                  required
                />
                <p className="error">{errors.confirmPassword}</p>
              </form>
            </>
          )}

          {/* Confirmation */}
          {step === 4 && (
            <>
              <h2>Your password has been successfully reset.</h2>
              <p>You can now log in using your new credentials.</p>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default AccountRecovery;
