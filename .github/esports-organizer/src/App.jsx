import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import TournamentsPage from "./pages/TournamentsPage";
import CreateEventWizard from "./pages/CreateEventWizard";
import AuthPage from "./pages/authPages/AuthPage";
import AccountRecovery from "./pages/authPages/AccountRecovery";
import PlayerProfile from "./pages/PlayerProfile";
import CreateProfile from "./pages/authPages/CreateProfile";
import HelpCenter from "./pages/HelpCenter";
// brackets page is commented for now until path is determined

import TeamsPage from "./pages/teamProfilePages/TeamsPage";
import TeamProfilePage from "./pages/teamProfilePages/TeamProfilePage";
import CommunityPage from "./pages/communityPages/CommunityPage";
import BracketsTournamentPage from "./pages/bracketsTournamentPage/BracketsTournamentPage";

function App() {
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) document.body.classList.add("dark-mode");
  }, []);

  return (
    // ROUTER
    <Routes>
      {/* INITIAL PAGES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/homepage" element={<HomePage />} />

      {/* AUTHENTICATION PAGES */}
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/recover" element={<AccountRecovery />} />

      {/* CORE FEATURE PAGES */}
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="/create-event" element={<CreateEventWizard />} />
      <Route path="/profile" element={<PlayerProfile />} />
      <Route path="/brackets-tournaments" element={<BracketsTournamentPage />} />
      <Route path="/help-center" element={<HelpCenter />} />


      {/* MISSING DESIGNS */}
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/teams/:teamId" element={<TeamProfilePage />} />
      <Route path="/team-profile" element={<TeamProfilePage />} />
      <Route path="/community" element={<CommunityPage />} />
    </Routes>
  );
}

export default App;
