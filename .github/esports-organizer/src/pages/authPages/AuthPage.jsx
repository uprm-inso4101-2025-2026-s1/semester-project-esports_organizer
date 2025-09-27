import LoginForm from "../../components/auth/LoginModal";
import SignupForm from "../../components/auth/SignupModal";
import "./AuthPages.css";

function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";

  return (
    <div className="auth-page with-greetings">
      <div className="greetings-section">
        <h1>
          {isLogin ? "It's good to have you back!" : "Let's get you started!"}
        </h1>
        <section className="image-carousel"></section>
        <h1>
          {isLogin
            ? "Jump back into your favorite Games and Communities"
            : "Connect Through Popular Games and Find your Community"}
        </h1>
        <section className="image-carousel"></section>
      </div>

      <div className="form-section">
        {mode === "login" ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}

export default AuthPage;
