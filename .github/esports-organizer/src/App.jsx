import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TournamentsPage from "./pages/TournamentsPage";
import CreateEventPage from "./pages/CreateEventPage";
import AuthPage from "./pages/authPages/AuthPage";
import AccountRecovery from "./pages/authPages/AccountRecovery";

const TeamsPage = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: 'var(--light-gradient)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: 'white',
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem'
  }}>
    Teams Page - Coming Soon
  </div>
);

const CommunityPage = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: 'var(--light-gradient)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: 'white',
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem'
  }}>
    Community Page - Coming Soon
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/recover" element={<AccountRecovery />} />
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/community" element={<CommunityPage />} />
    </Routes>
  );
}

export default App;
