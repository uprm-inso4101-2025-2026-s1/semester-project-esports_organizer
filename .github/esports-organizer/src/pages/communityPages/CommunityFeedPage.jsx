import {useLocation, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Button from "../../components/shared/Button.jsx";
import TournamentCard from "../../components/shared/TournamentCard.jsx";
import "../teamProfilePages/TeamForms.css";
import "./CommunityFeedPage.css";
import Post from "../../Comm-Social/PostFolder/Post.js";
import Navbar from "../../components/shared/Navbar.jsx";
import { createCommunity, getAllCommunitiesFromDatabase, getCommunityFromFirestore, updateCommunity } from "../../Comm-Social/CommunityCreation.js";
import Community from "../../Comm-Social/Community.js";
// Mock data as placeholders
const mockCommunity = {
    id: 1,
    name: "Marvel Rivals",
    memberCount: 12500,
    onlineCount: 342,
};

const mockPosts = [
    {
        id: 1,
        user: {name: "John", username: "@john67", avatar: null},
        timestamp: "1hr ago",
        content: "wassssssssssuuuuuuup guys",
        likes: 256,
        comments: 5,
        shares: 1,
        community: "MARVEL RIVALS",
    },
    {
        id: 2,
        user: {name: "Johnie", username: "@john420", avatar: null},
        timestamp: "56hr ago",
        content: "wasdwasdwasdwasdwasdw",
        likes: 986,
        comments: 10,
        shares: 698,
        community: "MARVEL RIVALS",
    },
    {
        id: 3,
        user: {name: "Johnster", username: "@john21", avatar: null},
        timestamp: "83hr ago",
        content: "Yelllowww wa",
        likes: 24,
        comments: 3,
        shares: 2,
        community: "MARVEL RIVALS",
    },
];

const mockEvents = [
    {
        id: 1,
        title: "Marvel Rivals Tournament",
        date: "01 Oct 2025",
        price: "Free",
        location: "Online",
        game: "Marvel Rivals",
    },
    {
        id: 2,
        title: "Weekly Rivals Comp",
        date: "16 Oct 2025",
        price: "20$",
        location: "Online",
        game: "Marvel Rivals",
    },
];

const mockSidebarCommunities = {
    followed: [
        {id: 2, title: "Valorant", imageUrl: "/assets/images/valorant.png"},
        {id: 3, title: "Fortnite", imageUrl: "/assets/images/fortnite.png"},
        {
            id: 4,
            title: "League of Legends",
            imageUrl: "/assets/images/valorant.png",
        },
    ],
};

// Mini Community Card Component - Same as in CommunityPage.jsx
function MiniCommunityCard({imageUrl, title, onView}) {
    return (
        <div
            className="mini-community-card"
            onClick={onView}
            role="button"
            tabIndex={0}
        >
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

function CreatePostForm({onSubmit, communityName}) {
    const [postContent, setPostContent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const content = postContent;
        if (!content) return;

        // Creates a new Post instance
        const postCreation = new Post({
            content: content,
            author: "Current User",
            authorUsername: "@currentuser",
            community: communityName.toUpperCase(),
        });
        
        // Pass the Post instance to parent
        onSubmit(postCreation);

        setPostContent("");
    };
    return (
        <form className="create-post-form" onSubmit={handleSubmit}>
            <div className="create-post-header">
                <h3>Share what's on your mind...</h3>
            </div>
            <div className="create-post-content">
        <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share your thoughts with the community..."
            maxLength={500}
            rows={4}
        />
                <div className="create-post-actions">
                    <span className="character-count">{postContent.length}/500</span>
                    <button
                        type="submit"
                        className="post-submit-btn"
                        disabled={!postContent.trim()}
                    >
                        Post
                    </button>
                </div>
            </div>
        </form>
    );
}

// Add this component after CreatePostForm
function PostCard({post}) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleComment = () => {
        console.log("Comment on post:", post.id);
    };

    const handleShare = () => {
        console.log("Share post:", post.id);
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-user-info">
                    <div className="user-avatar">
                        {post.user.avatar ? (
                            <img src={post.user.avatar} alt={post.user.name}/>
                        ) : (
                            <div className="avatar-placeholder">
                                {post.user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{post.user.name}</span>
                        <span className="user-username">{post.user.username}</span>
                        <span className="post-timestamp">{post.timestamp}</span>
                    </div>
                </div>
                <div className="post-community">{post.community}</div>
            </div>

            <div className="post-content">
                <p>{post.content}</p>
            </div>

            <div className="post-stats">
                <span>{likeCount} likes</span>
                <span>{post.comments} comments</span>
                <span>{post.shares} shares</span>
            </div>

            <div className="post-actions">
                <button
                    className={`post-action-btn ${isLiked ? "liked" : ""}`}
                    onClick={handleLike}
                >
                    <span className="action-icon">👍</span>
                    Like
                </button>
                <button className="post-action-btn" onClick={handleComment}>
                    <span className="action-icon">💬</span>
                    Comment
                </button>
                <button className="post-action-btn" onClick={handleShare}>
                    <span className="action-icon">🔄</span>
                    Share
                </button>
            </div>
        </div>
    );
}

// Add this component after PostCard
function EventCard({event, onJoin}) {
    const [isJoined, setIsJoined] = useState(false);

    const handleJoin = () => {
        setIsJoined(!isJoined);
        onJoin(event.id, !isJoined);
    };

    return (
        <div className="event-card">
            <div className="event-header">
                <span className="event-type">{event.type}</span>
                <span className="event-date">{event.date}</span>
            </div>

            <div className="event-content">
                <h4 className="event-title">{event.title}</h4>
                <div className="event-details">
                    <span className="event-location">📍 {event.location}</span>
                    <span className="event-game">🎮 {event.game}</span>
                </div>
            </div>

            <div className="event-actions">
                <button
                    className={`join-btn ${isJoined ? "joined" : ""}`}
                    onClick={handleJoin}
                >
                    {isJoined ? "Joined" : "Join"}
                </button>
            </div>
        </div>
    );
}

// Add this component after EventCard
function ActivityFeed({posts, onLoadMore}) {
    return (
        <div className="activity-feed">
            <h2>Recent Activity</h2>
            <div className="posts-container">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post}/>
                ))}
            </div>
            <div className="load-more-section">
                <button className="load-more-btn" onClick={onLoadMore}>
                    See more...
                </button>
            </div>
        </div>
    );
}

// Action card with onClick button for the sidebar
function ActionCard({title, onClick}) {
    return (
        <div className="action-card" onClick={onClick} role="button" tabIndex={0}>
            <div className="action-card-content">
                <h3>{title}</h3>
            </div>
        </div>
    );
}

// Community Section Component using MiniCommunityCard
function CommunitySection({title, communities, onCommunityClick, isLoading}) {
    return (
        <div className="community-section">
            <h3>{title}</h3>
            {isLoading ? (
                <div className="loading-message">Loading communities...</div>
            ) : communities.length === 0 ? (
                <div className="empty-message">No communities found</div>
            ) : (
                <div className="community-section-list">
                    {communities.map((community) => (
                        <MiniCommunityCard
                            key={community.id}
                            title={community.title}
                            imageUrl={community.imageUrl}
                            onView={() => onCommunityClick(community.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// modal function component
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


export default function CommunityFeedPage() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn] = useState(true); // For testing only, change later
    const [posts, setPosts] = useState([]);
    const {communityId} = useParams();
    const [currentCommunity, setCurrentCommunity] = useState(null);
    const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
    const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [game, setGame] = useState("");
    const [location, setLocation] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // New state for fetched communities
    const [topCommunities, setTopCommunities] = useState([]);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

    // New State for fetched Posts
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    // Fetch the current community by ID
    useEffect(() => {
        const fetchCurrentCommunity = async () => {
            if (!communityId) {
                setIsLoadingCommunity(false);
                return;
            }

            try {
                setIsLoadingCommunity(true);
                const community = await getCommunityFromFirestore(communityId);
                
                if (community) {
                    setCurrentCommunity(community);
                    console.log("Current community loaded:", community);
                } else {
                    console.error("Community not found:", communityId);
                    setCurrentCommunity(mockCommunity); // Fallback to mock
                }
            } catch (error) {
                console.error("Error fetching community:", error);
                setCurrentCommunity(mockCommunity); // Fallback to mock
            } finally {
                setIsLoadingCommunity(false);
            }
        };

        fetchCurrentCommunity();
    }, [communityId]);

    // Fetch communities from Firestore on component mount
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                setIsLoadingCommunities(true);
                const communities = await getAllCommunitiesFromDatabase();
                
                // Transform Firestore data to match the expected format
                const transformedCommunities = communities.map(community => ({
                    id: community.id,
                    title: community.name,
                    imageUrl: community.icon || null,
                    game: community.game,
                    location: community.location
                }));
                
                setTopCommunities(transformedCommunities);
                console.log("Fetched communities:", transformedCommunities);
            } catch (error) {
                console.error("Error fetching communities:", error);
                setTopCommunities([]);
            } finally {
                setIsLoadingCommunities(false);
            }
        };

        fetchCommunities();
    }, []);

    // Fetch Posts from the community
    useEffect(() => {
        const fetchCommunityPosts = async () => {
            try{
                setIsLoadingPosts(true);
                const posts = currentCommunity ? currentCommunity.posts : [];
                
                const transformedPosts = posts.map(post => ({
                    id: post.id,
                    user: {name: post.authorUsername || "Unknown"},
                    timestamp: post.date,
                    content: post.content,
                    likes: post.likes || 0,
                    comments: post.comments.length || 0,
                    shares: 0, // to be implemented
                    community: currentCommunity ? currentCommunity.name.toUpperCase() : "UNKNOWN",
                }))

                setPosts(transformedPosts);    
                console.log("Fetched posts:", transformedPosts);
            }
            catch(error){
                console.error("Error fetching posts:", error);
                setPosts([]);
            }
            finally{
                setIsLoadingPosts(false);
            };
        };

        fetchCommunityPosts(); 
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };
    
    const handleCommunityClick = (communityId) => {
        console.log(`Navigating to community ${communityId}`);
        navigate(`/community/${communityId}`);
    };
    
    const handleCreateCommunity = () => {
        setName("")
        setDescription("")
        setGame("")
        setLocation("")
        setIconUrl("")
        setBannerUrl("")
        setIsSubmitting(false)
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
                location, 
                iconUrl, 
                bannerUrl
            };
            
            await createCommunity(
                communityData.name, 
                communityData.description, 
                "currentUserId", 
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
                game: community.game,
                location: community.location
            }));
            setTopCommunities(transformedCommunities);
            
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
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navItems = [
        {path: "/homepage", label: "Home"},
        {path: "/tournaments", label: "Tournaments"},
        {path: "/teams", label: "Teams"},
        {path: "/community", label: "Community"},
    ];

    // Handling button clicks
    const handleToggleSaved = (tournamentId, isSaved) => {
        console.log(`${isSaved ? "Unsaving" : "Saving"} tournament:`, tournamentId);
    };
    
    const handleJoinEvent = (eventId, isJoining) => {
        console.log(`${isJoining ? "Joining" : "Leaving"} event:`, eventId);
    };

    const handleCreatePost = async (postInstance) => {
        try {
            if (!currentCommunity) {
                alert("Community not loaded. Please try again.");
                return;
            }

            console.log("Creating post for community:", currentCommunity.id);
            console.log("Post instance:", postInstance);

            // Add post to Firestore Posts collection
            await postInstance.addPostToCommunity(postInstance);
            console.log("Post added to Firestore Posts collection");

            // Add post ID to the community's posts array using addPost method
            currentCommunity.addPost(postInstance.id);
            
            // Update the community in Firestore with the modified Community object
            await updateCommunity(currentCommunity.id, currentCommunity);
            console.log("Community posts array updated");

            // Update local community state
            setCurrentCommunity({...currentCommunity});

            // Create display object for UI
            const timestamp = postInstance.date instanceof Date
                ? postInstance.date.toLocaleString()
                : new Date(postInstance.date).toLocaleString();

            const displayPost = {
                id: postInstance.id,
                user: {
                    name: postInstance.author || "Current User",
                    username: postInstance.authorUsername || "@currentuser",
                    avatar: null,
                },
                timestamp,
                content: postInstance.content,
                likes: postInstance.likes,
                comments: Array.isArray(postInstance.comments) ? postInstance.comments.length : 0,
                shares: 0,
                community: postInstance.community || currentCommunity.name.toUpperCase(),
            };

            // Add to UI
            setPosts((prev) => [displayPost, ...prev]);

            alert(`Post created successfully in ${currentCommunity.name}!`);
            console.log("Post added to community:", currentCommunity.id, "Post ID:", postInstance.id);
        } catch (error) {
            console.error("Error creating post:", error);
            console.error("Error details:", error.message);
            alert("Failed to create post. Please try again.");
        }
    };

    const handleLoadMore = () => {
        console.log("Loading more posts...");
        alert("Loading more posts...");
    };

    const displayCommunity = currentCommunity || mockCommunity;

    return (
        <div className="community-feed-page">
            <Navbar/>

            {/*full layout*/}
            <div className="community-feed-layout">
                {/*left column*/}
                <aside className="events-sidebar">
                    <section className="events-section">
                        <h2>Upcoming Events</h2>
                        <div className="events-container">
                            {mockEvents.map((event, index) => (
                                <TournamentCard
                                    key={event.id}
                                    tournament={event}
                                    index={index}
                                    prefix="event"
                                    isSaved={false}
                                    onToggleSaved={handleToggleSaved}
                                    onJoinEvent={handleJoinEvent}
                                />
                            ))}
                        </div>
                    </section>
                </aside>

                {/* MIDDLE COLUMN - MAIN CONTENT */}
                <main className="feed-main-content">
                    <section className="community-header">
                        {isLoadingCommunity ? (
                            <h1>Loading community...</h1>
                        ) : (
                            <h1>Activity in {displayCommunity.name} Community</h1>
                        )}
                    </section>

                    {/* Create Post Form */}
                    {isLoggedIn && !isLoadingCommunity && (
                        <section className="create-post-section">
                            <CreatePostForm 
                                onSubmit={handleCreatePost}
                                communityName={displayCommunity.name}
                            />
                        </section>
                    )}

                    {/* Activity Feed */}
                    <section className="activity-feed">
                        <ActivityFeed posts={posts} onLoadMore={handleLoadMore}
                        isLoading={isLoadingPosts}/>
                    </section>
                </main>

                {/* RIGHT COLUMN - MINI COMMUNITIES & ACTIONS */}
                <aside className="communities-sidebar">
                    {/* Action Cards */}
                    <div className="sidebar-actions">
                        <ActionCard
                            title="Explore Communities"
                            onClick={() => handleNavigation("/community")}
                        />
                        <ActionCard
                            title="Create Communities"
                            onClick={handleCreateCommunity}
                        />
                    </div>

                    {/* Other Communities You Follow (mock data) */}
                    <CommunitySection
                        title="Other Communities You Follow"
                        communities={mockSidebarCommunities.followed}
                        onCommunityClick={handleCommunityClick}
                        isLoading={false}
                    />

                    {/* Top Communities from Firestore */}
                    <CommunitySection
                        title="Top Communities"
                        communities={topCommunities}
                        onCommunityClick={handleCommunityClick}
                        isLoading={isLoadingCommunities}
                    />
                </aside>
            </div>
            
            {/*  Modal rendering*/}
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
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
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