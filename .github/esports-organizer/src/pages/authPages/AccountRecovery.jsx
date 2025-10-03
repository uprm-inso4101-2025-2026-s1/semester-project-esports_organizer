import { useState } from "react";
import Modal from "../../components/shared/Modal";
import Button from "../../components/shared/Button";
import "./AuthPages.css";
import { useNavigate } from "react-router-dom";

function AccountRecovery() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    // validar email/username (mock)
    if (email.trim() !== "") {
      setStep(2);
    }
  };

  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    // validar respuesta (mock)
    if (securityAnswer.trim() !== "") {
      setStep(3);
    }
  };

  const handleSubmitStep3 = (e) => {
    e.preventDefault();
    // validar contraseñas iguales
    if (newPassword === confirmPassword && newPassword.trim() !== "") {
      setStep(4);
    } else {
      alert("Passwords do not match");
    }
  };

  const handleCancel = () => {
    setStep(1);
    setEmail("");
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmPassword("");
    navigate("/login");
  };
  return (
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
          {step === 1 && (
            <>
              <h2>
                Please enter your e-mail or username to validate your
                information.
              </h2>
              <form onSubmit={handleSubmitStep1}>
                <label htmlFor="email">E-mail or Username</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. awesomegamer123@email.com"
                  required
                />
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2>What is the name of your first pet?</h2>
              <form onSubmit={handleSubmitStep2}>
                <label htmlFor="answer">Answer</label>
                <input
                  type="text"
                  id="answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Enter your new password</h2>
              <form onSubmit={handleSubmitStep3}>
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </form>
            </>
          )}

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
