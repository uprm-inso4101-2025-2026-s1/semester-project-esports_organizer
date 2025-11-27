import Navbar from "../../components/shared/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../components/shared/Button.jsx";
import CommunityCard from "../../components/CommunityCard.jsx";
import "./CommunityPage.css";
import "../teamProfilePages/TeamForms.css";
import { getAllCommunitiesFromDatabase, createCommunity } from "../../Comm-Social/CommunityCreation.js";
import { getProfileById } from "../../services/profile-service.js";

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

// Modal function component
function CommunityModal({title, children, onClose, footer}) {
  return (
    <div className="team-modal-overlay" onClick={onClose}>
      <div
        className="team-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="team-modal__header">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="team-modal__close"
            onClick={onClose}
            aria-label="Close"
          >x
          </button>
        </div>
        <div className="team-modal__body">{children}</div>
        {footer && <div className="team-modal__actions">{footer}</div>}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  
  // State for create community modal
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [game, setGame] = useState("");
  const [communityLocation, setCommunityLocation] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current user state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserUid, setCurrentUserUid] = useState(null);

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const uid = localStorage.getItem("currentUserUid");
        
        if (!uid) {
          console.warn("No user UID found in localStorage");
          return;
        }
        
        setCurrentUserUid(uid);
        const userProfile = await getProfileById(uid);
        
        if (userProfile) {
          setCurrentUser(userProfile);
          console.log("Current user loaded:", userProfile);
        } else {
          console.error("User profile not found");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

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

  const handleCreateCommunity = () => {
    setName("");
    setDescription("");
    setGame("");
    setCommunityLocation("");
    setIconUrl("");
    setBannerUrl("");
    setIsSubmitting(false);
    setIsCreateCommunityModalOpen(true);
  };
  
  const handleSubmitCommunity = async (e) => {
    e.preventDefault();
    if (!name || !game) {
      alert("Community Name and Game are required.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const communityData = {
        name, 
        description, 
        game, 
        location: communityLocation, 
        iconUrl, 
        bannerUrl
      };
      
      await createCommunity(
        communityData.name, 
        communityData.description, 
        currentUserUid || "currentUserId",
        [], 
        communityData.game, 
        communityData.location, 
        communityData.iconUrl, 
        communityData.bannerUrl
      );
      
      // Re-fetch communities to include the newly created one
      const updatedCommunities = await getAllCommunitiesFromDatabase();
      const transformedCommunities = updatedCommunities.map(community => ({
        id: community.id,
        title: community.name,
        imageUrl: community.icon || null,
        currentEvents: 0,
        followers: community.members ? community.members.length : 0,
        location: community.location || "Global",
        game: community.game,
      }));
      setCommunities(transformedCommunities);
      
      setIsSubmitting(false);
      setIsCreateCommunityModalOpen(false);
      alert(`Community "${name}" created successfully!`);
    } catch (error) {
      console.error("Error creating community:", error);
      alert("Failed to create community. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const closeCreateModal = () => {
    setIsCreateCommunityModalOpen(false);
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
          
          {/* Create Community Button */}
          <div className="sidebar-create-button" style={{ marginTop: '2rem' }}>
            <Button
              variant="primary"
              onClick={handleCreateCommunity}
              style={{ width: '100%' }}
              text="Create Communities"
            >
            </Button>
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
      
      {/* Modal rendering */}
      {isCreateCommunityModalOpen && (
        <CommunityModal
          title="Create a Community"
          onClose={closeCreateModal}
          footer={
            <>
              <button
                type="button"
                className="team-modal__btn team-modal__btn--ghost"
                onClick={closeCreateModal}
                disabled={isSubmitting}
              >Cancel</button>
              <button
                type="submit"
                form="create-community-form"
                className="team-modal__btn team-modal__btn--primary"
                disabled={isSubmitting || !name || !game}
              >{isSubmitting ? "Creating..." : "Create"}</button>
            </>
          }
        >
          <form
            id="create-community-form"
            className="team-form"
            onSubmit={handleSubmitCommunity}
          >
            <label className="team-form__label" htmlFor="communityName">Community Name</label>
            <input
              id="communityName"
              type="text"
              className="team-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marvel Rivals Champions"
              required
            />
            <label className="team-form__label" htmlFor="communityGame">Primary Game</label>
            <input
              id="communityGame"
              type="text"
              className="team-form__input"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="e.g., Marvel Rivals"
              required
            />
            <label className="team-form__label" htmlFor="communityLocation">Location</label>
            <input
              id="communityLocation"
              type="text"
              className="team-form__input"
              value={communityLocation}
              onChange={(e) => setCommunityLocation(e.target.value)}
              placeholder="e.g., North America"
            />
            <label className="team-form__label" htmlFor="communityDescription">Description</label>
            <textarea
              id="communityDescription"
              className="team-form__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the community what your place is about..."
              rows={3}
            />
            <div className="team-form__group">
              <span className="team-form__label">Assets (Optional)</span>
              <input
                id="communityIcon"
                type="text"
                className="team-form__input"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="Icon URL: https://.../my_icon.png"
              />
              <input
                id="communityBanner"
                type="text"
                className="team-form__input"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Banner URL: https://.../my_banner.jpg"
              />
            </div>
          </form>
        </CommunityModal>
      )}
    </div>
  );
}