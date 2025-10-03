import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Button from './Button';
import { NAV_ITEMS } from '../../constants/navigation';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo" onClick={() => handleNavigation("/")}>
              <div className="logo-icon">
                <img 
                  src="/assets/images/LOGO.png" 
                  alt="Esport Organizer Logo" 
                  className="logo-image"
                />
              </div>
            </div>
            
            <nav className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-open' : ''}`}>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="nav-actions">
            <Button
              text="Login/Sign Up"
              onClick={() => handleNavigation("/login")}
              variant="primary"
            />
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'hamburger-open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
        <div className="nav-indicator"></div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default Navbar;
