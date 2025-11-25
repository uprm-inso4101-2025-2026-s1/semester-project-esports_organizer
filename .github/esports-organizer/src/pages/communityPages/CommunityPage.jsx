import Navbar from "../../components/shared/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../components/shared/Button.jsx";
import CommunityCard from "../../components/CommunityCard.jsx";
import "./CommunityPage.css";
import { getAllCommunitiesFromDatabase } from "../../Comm-Social/CommunityCreation.js";

// Fixed Mini community card component - proper props destructuring
function MiniCommunityCard({ imageUrl, title, onView }) {
  return (
    <div
      className="mini-community-card"
      onClick={onView}
      role="button"
      tabIndex={0}
    >
      <div className="mini-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={`${title} logo`} />
        ) : (
          <div className="mini-card-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="mini-card-title">{title}</div>
    </div>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

  // Fetch communities from Firestore on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoadingCommunities(true);
        const fetchedCommunities = await getAllCommunitiesFromDatabase();
        
        // Transform Firestore data to match the expected format
        const transformedCommunities = fetchedCommunities.map(community => ({
          id: community.id,
          title: community.name,
          imageUrl: community.icon || null,
          currentEvents: 0, // You can add this to your Firestore schema if needed
          followers: community.members ? community.members.length : 0,
          location: community.location || "Global",
          game: community.game,
        }));
        
        setCommunities(transformedCommunities);
        console.log("Fetched communities:", transformedCommunities);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setCommunities([]);
      } finally {
        setIsLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Filter communities based on search
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="communitypage">
      {/* Consistent Navbar */}
      <Navbar
        userIsLoggedIn={false}
        splitAuthLinks={true}
        onLogoClickPath="/"
      />

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
            {isLoadingCommunities ? (
              <div className="loading-state">
                <p>Loading communities...</p>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="no-results">
                <p>No communities found matching your criteria.</p>
              </div>
            ) : (
              <div className="community-cards-container">
                {filteredCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="community-card-wrapper"
                    onClick={() =>
                      handleNavigation(`/community/${community.id}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
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