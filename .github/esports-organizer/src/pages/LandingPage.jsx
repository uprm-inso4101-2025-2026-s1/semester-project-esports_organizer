import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import TournamentCard from "../components/shared/TournamentCard.jsx";
import CommunityCard from "../components/CommunityCard.jsx";
import {
  TagIcon,
  CalendarIcon,
  LocationIcon,
  GamepadIcon,
  BookmarkIcon,
} from "../assets/icons"; // not used here directly, but keeping for reference

// Demo images
import logo from "../assets/images/Logo.png";
import fortniteCover from "../assets/images/Fortnite.png";
import valorantCover from "../assets/images/Valorant.png";
import apexCover from "../assets/images/Apex.png";
import marvelRivals from "../assets/images/marvel-rivals.png";
import fifa25 from "../assets/images/Fifa25.png";
import minecraft from "../assets/images/Minecraft.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  const tournaments = [
    {
      id: 1,
      title: "1 vs 1 Jungle Cup",
      imageUrl: fortniteCover,
      priceLabel: "Free",
      date: "Sat, 11 Oct 2025",
      location: "Online Tournament",
      gameName: "Fortnite",
      badge: "PLAYOFFS",
    },
    { 
      id: 2,
      title: "Trios Arena Rush",
      imageUrl: valorantCover,
      priceLabel: "$10",
      date: "Sun, 16 Nov 2025",
      location: "Online Tournament",
      gameName: "Valorant",
    },
    {
      id: 3,
      title: "Open Scrims Night",
      imageUrl: apexCover,
      priceLabel: "Free",
      date: "Fri, 20 Nov 2025",
      location: "San Juan Arena",
      gameName: "Apex Legends",
      badge: "OPEN",
    },
  ];
  const communities = [
    {
      id: 1,
      title: "Marvel Rivals",
      imageUrl: marvelRivals,
      currentEvents: 3,
      followers: 12450,
    },
    {
      id: 2,
      title: "EA Sports FC 25",
      imageUrl: fifa25,
      currentEvents: 5,
      followers: 8019,
    },
    {
      id: 3,
      title: "Minecraft",
      imageUrl: minecraft,
      currentEvents: 12,
      followers: 34917,
    },
  ];

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
          <Link to="/homepage" className="lp__cta">
            Join Communities and Events Now
          </Link>
        </div>
      </section>

      {/* Cards grid */}
      <section id="events" className="lp__section container">
        <div className="lp__section-head container">
          <h2>Ongoing Events</h2>
        </div>

        <div className="lp__cards">
          {tournaments.map((t, index) => {
            const tournament = {
              title: t.title,
              game: t.gameName,
              price: t.priceLabel,
              date: t.date,
              location: t.location,
            };
            return (
              <TournamentCard
                key={t.id}
                tournament={tournament}
                index={index}
                prefix="lp"
                isSaved={false}
                onToggleSaved={() => {}}
                onJoinEvent={() => alert(`Joining ${t.title}…`)}
              />
            );
          })}
        </div>
      </section>

      <section id="communities" className="lp__section container">
        <div className="lp__section-head container">
          <h2>Popular Communities</h2>
        </div>
        <div className="lp__cards">
          {communities.map((c, index) => {
            const communityId = slugify(c.title || "community");
            return (
              <div key={index} className="community-card">
                <div className="community-image-wrapper">
                  <img
                    src={c.imageUrl}
                    alt={`${c.title} cover`}
                    className="tournament-image"
                  />
                  <div className="community-overlay" />
                </div>
                <div className="community-info">
                  <h3 className="community-title">{c.title?.toUpperCase()}</h3>
                  <div className="community-details">
                    <div className="community-details-left">
                      <div className="detail-item">
                        <span className="detail-text">
                          {new Intl.NumberFormat().format(c.followers)} followers
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-text">United States</span>
                      </div>
                    </div>
                    <div className="community-details-right">
                      <div className="detail-item">
                        <span className="detail-text">
                          {c.currentEvents} upcoming events
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-text">128 posts</span>
                      </div>
                    </div>
                  </div>
                  <div className="community-actions">
                    <button
                      type="button"
                      className="follow-button"
                      onClick={() => navigate(`/community/${communityId}`)}
                    >
                      Follow Community
                    </button>
                    <button
                      type="button"
                      className="view-button"
                      onClick={() => navigate(`/community/${communityId}`)}
                    >
                      View Community
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
