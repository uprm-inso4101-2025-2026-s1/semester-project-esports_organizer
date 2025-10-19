import Navbar from "../../components/shared/Navbar";
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import Button from "../../components/shared/Button.jsx";
import CommunityCard from "../../components/CommunityCard.jsx";
import "./CommunityPage.css";

// Fixed Mini community card component - proper props destructuring
function MiniCommunityCard({imageUrl, title, onView}) {
    return (
        <div className="mini-community-card" onClick={onView} role="button" tabIndex={0}>
            <div className="mini-card-media">
                {imageUrl ? (
                    <img src={imageUrl} alt={`${title} logo`}/>
                ) : (
                    <div className="mini-card-placeholder" aria-hidden="true"/>
                )}
            </div>
            <div className="mini-card-title">{title}</div>
        </div>
    );
}

export default function CommunityPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navItems = [
        {path: "/homepage", label: "Home"},
        {path: "/tournaments", label: "Tournaments"},
        {path: "/teams", label: "Teams"},
        {path: "/community", label: "Community"},
    ];

    // Better placeholder data with variety
    const placeholderCommunities = [
        {
            id: 1,
            title: "Fortnite",
            imageUrl: "/assets/images/fortnite.png",
            currentEvents: 3,
            followers: 1200,
            location: "United States"
        },
        {
            id: 2,
            title: "Valorant",
            imageUrl: "/assets/images/valorant.png",
            currentEvents: 5,
            followers: 2500,
            location: "Global"
        },
        {
            id: 3,
            title: "League of Legends",
            imageUrl: "/assets/images/valorant.png",
            currentEvents: 8,
            followers: 4200,
            location: "Global"
        },
        {
            id: 4,
            title: "Counter-Strike 2",
            imageUrl: "/assets/images/fortnite.png",
            currentEvents: 4,
            followers: 1800,
            location: "Europe"
        },
        {
            id: 5,
            title: "Apex Legends",
            imageUrl: "/assets/images/valorant.png",
            currentEvents: 2,
            followers: 950,
            location: "United States"
        },
        {
            id: 6,
            title: "Rocket League",
            imageUrl: "/assets/images/fortnite.png",
            currentEvents: 3,
            followers: 1100,
            location: "Global"
        },
    ];

    // Filter communities based on search and filter
    const filteredCommunities = placeholderCommunities.filter(community => {
        const matchesSearch = community.title.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="communitypage">
            {/* Navigation Header */}
            <header className="nav-header">
                <div className="nav-container">
                    <div className="nav-left">
                        <div
                            className="nav-logo"
                            onClick={() => handleNavigation("/homepage")}
                            role="button"
                            tabIndex={0}
                        >
                            <img
                                src="/assets/images/LOGO.png"
                                alt="Esport Organizer Logo"
                                className="logo-image"
                            />
                        </div>

                        <nav
                            className={`nav-menu ${isMobileMenuOpen ? "nav-menu-open" : ""}`}
                            aria-label="Main navigation"
                        >
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    className={`nav-link ${
                                        location.pathname === item.path ? "active" : ""}`}
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
                            aria-expanded={isMobileMenuOpen}
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
            </header>

            {/* Page Layout */}
            <div className="community-layout">
                {/* Sidebar */}
                <aside className="sidebar" aria-label="Followed communities">
                    <h2>COMMUNITIES YOU FOLLOW</h2>
                    <div className="mini-community-list">
                        <MiniCommunityCard
                            title="Valorant"
                            imageUrl="/assets/images/valorant.png"
                            onView={() => handleNavigation("/community/valorant")}
                        />
                        <MiniCommunityCard
                            title="Super Smash Bros. Ultimate"
                            imageUrl="/assets/images/smash.png"
                            onView={() => handleNavigation("/community/smash")}
                        />
                        <MiniCommunityCard
                            title="Fortnite"
                            imageUrl="/assets/images/fortnite.png"
                            onView={() => handleNavigation("/community/fortnite")}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <section className="discovery-section">
                        <h1>DISCOVER NEW COMMUNITIES FOR YOUR FAVORITE GAMES</h1>
                    </section>

                    <section className="top-communities" aria-label="Top communities">
                        <div className="top-communities-header">
                        <h2>TOP COMMUNITIES</h2>
                        <div className="search-filter">
                            <input
                                type="search"
                                placeholder="Search for a Community"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        </div>
                        {filteredCommunities.length === 0 ? (
                            <div className="no-results">
                                <p>No communities found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="community-cards-container">
                                {filteredCommunities.map((community) => (
                                    <div key={community.id} className="community-card-wrapper">
                                        <CommunityCard
                                            imageUrl={community.imageUrl}
                                            title={community.title}
                                            currentEvents={community.currentEvents}
                                            followers={community.followers}
                                            location={community.location}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}