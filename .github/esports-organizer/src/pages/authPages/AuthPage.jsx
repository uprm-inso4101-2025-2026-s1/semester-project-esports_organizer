import LoginForm from "../../components/auth/LoginModal";
import SignupForm from "../../components/auth/SignupModal";
import "./AuthPages.css";

//Images for the carrousels
const games_images = [
  { id: 1, url: "src/assets/images/Fortnite.png" },
  { id: 2, url: "src/assets/images/Apex.png" },
  { id: 3, url: "src/assets/images/Fifa25.png" },
  { id: 4, url: "src/assets/images/marvel-rivals.png" },
  { id: 5, url: "src/assets/images/Minecraft.png" },
  { id: 6, url: "src/assets/images/Valorant.png" },
  { id: 7, url: "/assets/images/league_of_legends.png" },
  { id: 8, url: "/assets/images/smash.png" },
];

const communities_images = [
  { id: 1, url: "/assets/images/smash.png" },
  { id: 2, url: "/assets/images/league_of_legends.png" },
  { id: 3, url: "src/assets/images/Valorant.png" },
  { id: 4, url: "src/assets/images/Minecraft.png" },
  { id: 5, url: "src/assets/images/marvel-rivals.png" },
  { id: 6, url: "src/assets/images/Fifa25.png" },
  { id: 7, url: "src/assets/images/Apex.png" },
  { id: 8, url: "src/assets/images/Fortnite.png" },
];

function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";

  return (
    // Greetings section
    <div className="auth-page with-greetings">
      <div className="greetings-section">
        <h1>
          {isLogin ? "It's good to have you back!" : "Let's get you started!"}
        </h1>
        {/* Games Carrousel */}
        <section className="image-carousel">
          <div className="image-carousel-track">
            {games_images.map((image, index) => (
              <div key={`first-${image.id}`} className="image-carousel-container">
                <img src={image.url} alt={`Juego ${index + 1}`} />
              </div>
            ))}
            {/* Second List to give infinite effect */}
            {games_images.map((image, index) => (
              <div key={`second-${image.id}`} className="image-carousel-container">
                <img src={image.url} alt={`Juego ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>
        <h1>
          {isLogin
            ? "Jump back into your favorite Games and Communities"
            : "Connect Through Popular Games and Find your Community"}
        </h1>
        {/* Communities Carrousel */}
        <section className="image-carousel">
          <div className="image-carousel-track">
            {communities_images.map((image, index) => (
              <div key={`first-${image.id}`} className="image-carousel-container">
                <img src={image.url} alt={`Juego ${index + 1}`} />
              </div>
            ))}
            {/* Second List to give infinite effect */}
            {communities_images.map((image, index) => (
              <div key={`first-${image.id}`} className="image-carousel-container">
                <img src={image.url} alt={`Juego ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Form Section */}
      <div className="form-section">
        {mode === "login" ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}

export default AuthPage;
