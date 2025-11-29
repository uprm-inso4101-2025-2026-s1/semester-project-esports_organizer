import { Link } from "react-router-dom";
import "./LandingPage.css";

// Demo images
import logo from "../assets/images/Logo.png";

export default function LandingPage() {
  return (
    <div className="lp">
      {/* Top nav / header */}
      <header className="lp__nav container">
        <div className="lp__brand">
          {/* Logo placeholder */}
          <div className="lp__logo-skeleton" aria-label="App logo placeholder">
            <img
              src={logo}
              alt="Esports Organizer logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <span className="lp__brand-text">esports organizer</span>
        </div>
        <nav className="lp__auth" aria-label="Authentication">
          <a href="/login" className="lp__auth-link">
            Login
          </a>
          <span aria-hidden="true"> / </span>
          <a href="/signup" className="lp__auth-link">
            Sign Up
          </a>
        </nav>
      </header>

      {/* Hero section */}
      <section className="lp__hero container">
        <div className="lp__hero-top">
          <div className="lp__hero-left">
            <h1 className="lp__headline">
              <span className="lp__hl lp__hl--primary">Play</span> More.
              <br />
              <span className="lp__hl lp__hl--primary">Connect</span> More.
              <br />
              <span className="lp__hl lp__hl--primary">Achieve</span> More.
            </h1>
            <p className="lp__sub">
              with the{" "}
              <a href="#app" className="lp__link">
                esports organizer
              </a>{" "}
              app
            </p>
          </div>

          {/* Right graphic area (reserve space for logo/illustration) */}
          <div className="lp__hero-right">
            <div className="lp__illustration-skeleton">
              <img
                src={logo}
                alt="Esports Organizer logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
        <div className="lp__hero-below">
          <p className="lp__copy">
            The all-in-one hub for esports players and esport enthusiasts. Here,
            you can join or host tournaments, create communities, and connect
            with others who share the same interests, all in one place. Whether
            you’re competing, organizing, or just exploring,{" "}
            <a href="#app" className="lp__link">
              Esports Organizer
            </a>{" "}
            gathers it all together in a single platform.
          </p>
          <Link to="/login" className="lp__cta">
            Join Communities and Events Now
          </Link>
        </div>
      </section>

      {/* Cards grid */}
     

      {/* Footer */}
      <footer className="lp__footer">
        <span>© {new Date().getFullYear()} Esports Organizer</span>
        {/* <nav className="lp__footer-links">
          <a href="#privacy" className="lp__link">
            Privacy
          </a>
          <a href="#terms" className="lp__link">
            Terms
          </a>
          <a href="#contact" className="lp__link">
            Contact
          </a>
        </nav> */}
      </footer>
    </div>
  );
}
