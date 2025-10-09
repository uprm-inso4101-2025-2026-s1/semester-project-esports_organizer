import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import TournamentsPage from "./pages/TournamentsPage";
import CreateEventPage from "./pages/CreateEventPage";
import AuthPage from "./pages/authPages/AuthPage";
import AccountRecovery from "./pages/authPages/AccountRecovery";
import PlayerProfile from "./pages/PlayerProfile";
// import TournamentBrackets from "./pages/bracketsTournamentPage/bracketsTournamentPage";
import TeamProfilePage from "./pages/teamProfilePages/TeamProfilePage";
import CommunityPage from "./pages/communityPages/CommunityPage";

function App() {
  return (
    // ROUTER 
    <Routes>
      {/* INITIAL PAGES */}
      <Route path="/" element={<LandingPage/>} />
      <Route path="/homepage" element={<HomePage />} />

       {/* AUTHENTICATION PAGES */}
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/recover" element={<AccountRecovery />} />

       {/* CORE FEATURE PAGES */}
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/profile" element={<PlayerProfile />} />
      {/* <Route path="/tournament-brackets" element={<TournamentBrackets />} /> */}

      {/* MISSING DESIGNS */}
      <Route path="/teams" element={<TeamProfilePage />} />
      <Route path="/team-profile" element={<TeamProfilePage />} />
      <Route path="/community" element={<CommunityPage />} />
      
    </Routes>
  );
}

export default App;
