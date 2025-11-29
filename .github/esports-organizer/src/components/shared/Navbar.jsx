import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Button from "./Button";
import { NAV_ITEMS } from "../../constants/navigation";
import { IoPerson } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import "./Navbar.css";
import Notifications from '../../notifications/notificationsUI';
import { getProfileById } from "../../services/profile-service";
import AdminMenu from "./AdminMenu";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserProfilePopUpOpen, setIsUserProfilePopUpOpen] = useState(false);
  const [userName, setUserName] = useState("Loading...");

  const [userIsLoggedIn, setUserIsLoggedIn] = useState(true); // Placeholder for user authentication state TODO: Integrate with auth system
  const userButtonRef = useRef(null); 
  const userPopupRef = useRef(null);

  // Load user's username
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const uid = localStorage.getItem("currentUserUid") || localStorage.getItem("uid");
        if (uid) {
          const profileData = await getProfileById(uid);
          if (profileData && profileData.Username) {
            setUserName(profileData.Username);
          } else {
            setUserName("User");
          }
        } else {
          setUserName("User");
        }
      } catch (error) {
        console.error("Error loading username:", error);
        setUserName("User");
      }
    };
    
    if (userIsLoggedIn) {
      loadUserName();
    }
  }, [userIsLoggedIn]);

  const toggleUserProfilePopUp = () => {
    setIsUserProfilePopUpOpen(!isUserProfilePopUpOpen);
  };

  const isNavItemActive = (path) => {
    if (location.pathname === path) return true;
    if (path === "/homepage") return false;
    return location.pathname.startsWith(`${path}/`);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!isUserProfilePopUpOpen) return;

      const clickedOutsidePopup =
        userPopupRef.current && !userPopupRef.current.contains(event.target);
      const clickedOutsideButton =
        userButtonRef.current && !userButtonRef.current.contains(event.target);

      if (clickedOutsidePopup && clickedOutsideButton) {
        setIsUserProfilePopUpOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserProfilePopUpOpen]);

  return (
    <>
      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-left">
            <div
              className="nav-logo"
              onClick={() => handleNavigation("/homepage")}
            >
              <div className="logo-icon">
                <img
                  src="/assets/images/LOGO.png"
                  alt="Esport Organizer Logo"
                  className="logo-image"
                />
              </div>
            </div>

            <nav
              className={`nav-menu ${isMobileMenuOpen ? "nav-menu-open" : ""}`}
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  className={`nav-link ${
                    isNavItemActive(item.path) ? "active" : ""
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="nav-actions">
            <Notifications inline />
            <AdminMenu inline />
            {/* TODO: Logic to load user preferences */}
            {userIsLoggedIn ? (
              <span ref={userButtonRef}>
                <Button
                  text={userName}
                  variant="primary"
                  isUserProfileButton={true}
                  // There is a {imgSrc} prop to pass the user profile image source, e.g., imgSrc="/path/to/user/profile.jpg"
                  // For now, it uses the default image defined in Button.jsx
                  onClick={toggleUserProfilePopUp}
                />
              </span>
            ) : (
              <Button
                text="Login/Sign Up"
                onClick={() => handleNavigation("/login")}
                variant="primary"
              />
            )}
            
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span
                className={`hamburger ${
                  isMobileMenuOpen ? "hamburger-open" : ""
                }`}
              >
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
        <div className="nav-indicator"></div>
      </header>

      {/* User Profile Pop up */}
      {isUserProfilePopUpOpen && (
        <div className="user-profile-popup" ref={userPopupRef}>
          <button
            className="user-option"
            onClick={() => {
              setIsUserProfilePopUpOpen(false);
              navigate("/profile");
            }}
          >
            <IoPerson size={20} />
            View Profile
          </button>
          <button
            className="user-option"
            onClick={() => {
              navigate("/preferences");
            }}
          >
            <IoMdSettings size={20} />
            Preferences
          </button>
          <button
            className="user-option"
            onClick={() => {
              /* TODO: Implement logout functionality */
              navigate("/");
            }}
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-link ${
                isNavItemActive(item.path) ? "active" : ""
              }`}
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
