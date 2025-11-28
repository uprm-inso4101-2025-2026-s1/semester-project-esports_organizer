import { useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Button from "../../components/shared/Button.jsx";
import TournamentCard from "../../components/shared/TournamentCard.jsx";
import "../teamProfilePages/TeamForms.css";
import "./CommunityFeedPage.css";
import Post from "../../Comm-Social/PostFolder/Post.js";
import Navbar from "../../components/shared/Navbar.jsx";
import { checkUserPermission } from "../../Roles/checkUserPermission.js";
import Event from "../../events/EventClass.js";

const uid = localStorage.getItem("uid");
import { createCommunity, getAllCommunitiesFromDatabase, getCommunityFromFirestore, updateCommunity, addMembers, removeMembers } from "../../Comm-Social/CommunityCreation.js";
import { getProfileById} from "../../services/profile-service.js"; 

// Mock data as placeholders
const mockCommunity = {
    id: 1,
    name: "Marvel Rivals",
    memberCount: 12500,
    onlineCount: 342,
};


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

function CreatePostForm({onSubmit, communityName, currentUser}) {
    const [postContent, setPostContent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const content = postContent;
        if (!content) return;

        // Creates a new Post instance with current user's info
        const postCreation = new Post({
            content: content,
            author: currentUser?.Username || "Unknown User",
            authorUsername: currentUser?.Username ? `@${currentUser.Username}` : "@unknown",
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
function ActivityFeed({posts, onLoadMore, isLoading}) {
    return (
        <div className="activity-feed">
            <h2>Recent Activity</h2>
            {isLoading ? (
                <div className="loading-message">Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="empty-message">No posts yet. Be the first to post!</div>
            ) : (
                <>
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
                </>
            )}
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

    // Followed communities derived from topCommunities + current user
    const [followedCommunities, setFollowedCommunities] = useState([]);

    // New State for current user
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserUid, setCurrentUserUid] = useState(null);

    useEffect(() => {
        if (!currentUserUid || !Array.isArray(topCommunities)) {
            setFollowedCommunities([]);
            return;
        }

        const followed = topCommunities.filter(c => Array.isArray(c.members) && c.members.includes(currentUserUid));
        setFollowedCommunities(followed);
    }, [topCommunities, currentUserUid]);

    // New State for fetched Posts
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    
    

    const[events, setEvents] = useState([]);

    async function loadEvents() {
        const data = await Event.ListEvents();
        const displayEvents = data.map((event) => ({
        id: event.id,
        title: event.title,
        game: event.game,
        price: "Free",
        date: event.dateValue.toDateString(),
        location: event.location,

        dateValue: event.dateValue,
        participants: event.participants,
        teams: event.teams,
        maxTeams: event.maxTeams,
        maxPlayersPerTeam: event.maxPlayersPerTeam,
        community: event.community,
        }));

        setEvents(displayEvents);
    }

    const filteredEvents = events.filter(event => {
        console.log("Event Community:", event.community ? event.community.name : "N/A");
        console.log("Current Event:", event);
        console.log("Current Community:", currentCommunity ? currentCommunity.name : "N/A");
        if (event.community == null) return false;
        return event.community.name === currentCommunity.name;
    });

    console.log("Filtered Events for Community:", filteredEvents);

    // Fetch the current user on component mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // Get the UID from localStorage
                const uid = localStorage.getItem("currentUserUid");
                
                if (!uid) {
                    console.warn("No user UID found in localStorage");
                    return;
                }
                
                setCurrentUserUid(uid);
                
                // Fetch user profile from Firestore
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
        loadEvents();
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
                    location: community.location,
                    members: community.members || [],
                    followers: community.members ? community.members.length : 0
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

    // Fetch Posts from the community - now depends on currentCommunity
    useEffect(() => {
        const fetchCommunityPosts = async () => {
            // Don't fetch if community isn't loaded yet
            if (!currentCommunity) {
                setIsLoadingPosts(false);
                return;
            }
            
            try {
                setIsLoadingPosts(true);
                
                // Get post IDs from the community
                const postIds = currentCommunity.posts || [];
                
                // If no posts, set empty array
                if (postIds.length === 0) {
                    setPosts([]);
                    console.log("No posts in this community");
                    return;
                }
                
                // Fetch each post from Firestore using the Post class
                const postInstance = new Post({});
                const fetchedPosts = await Promise.all(
                    postIds.map(async (postId) => {
                        try {
                            // Handle both string IDs and object references
                            const id = typeof postId === 'string' ? postId : postId.id;
                            const post = await postInstance.getPost(id);
                            return post;
                        } catch (err) {
                            console.error("Error fetching post:", postId, err);
                            return null;
                        }
                    })
                );
                
                // Filter out null posts and transform for UI
                const transformedPosts = fetchedPosts
                    .filter(post => post !== null)
                    .map(post => ({
                        id: post.id,
                        user: {
                            name: post.author || "Unknown",
                            username: post.authorUsername || "@unknown",
                            avatar: null
                        },
                        timestamp: post.date instanceof Date 
                            ? post.date.toLocaleString() 
                            : new Date(post.date?.seconds * 1000 || post.date).toLocaleString(),
                        content: post.content,
                        likes: post.likes || 0,
                        comments: Array.isArray(post.comments) ? post.comments.length : 0,
                        shares: 0,
                        community: currentCommunity.name.toUpperCase(),
                    }));

                setPosts(transformedPosts);
                console.log("Fetched posts:", transformedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchCommunityPosts();
    }, [currentCommunity]); 

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
                currentUserUid || "currentUserId", // Use actual user UID if available
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
                            {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <TournamentCard
                                key={event.id}
                                tournament={event}
                                index={index}
                                prefix="event"
                                isSaved={false}
                                onToggleSaved={() => {}}
                                onJoinEvent={() => {
                                    if (event && event.id) {
                                        navigate("/tournaments", { state: { openEventId: event.id } });
                                        setIsMobileMenuOpen(false);
                                    }
                                }}
                                />
                            ))
                            ) : (
                            <p>No events found.</p>
                            )}
                        </div>
                    </section>
                </aside>

                {/* MIDDLE COLUMN - MAIN CONTENT */}
                <main className="feed-main-content">
                    <section className="community-header">
                        {isLoadingCommunity ? (
                            <h1>Loading community...</h1>
                        ) : (
                            <div className="community-header-row">
                                <h1>Activity in {displayCommunity.name} Community</h1>
                                {/* Join button - show if user isn't a member yet */}
                                {currentUserUid && displayCommunity && Array.isArray(displayCommunity.members) && displayCommunity.members.includes(currentUserUid) ? (
                                    <button
                                        className="leave-btn"
                                        onClick={async () => {
                                            if (!currentCommunity || !currentCommunity.id) return;
                                            const success = await removeMembers(currentCommunity.id, currentUserUid);
                                            if (success) {
                                                // Remove from local state
                                                const updated = { ...currentCommunity };
                                                updated.members = Array.isArray(updated.members) ? updated.members.filter(m => m !== currentUserUid) : [];
                                                setCurrentCommunity(updated);

                                                // Update topCommunities (decrement followers)
                                                setTopCommunities(prev => prev.map(c => c.id === updated.id ? { ...c, followers: Math.max(0, (c.followers || 0) - 1), members: (c.members || []).filter(m => m !== currentUserUid) } : c));
                                            } else {
                                                alert('Could not leave the community (not a member or error).');
                                            }
                                        }}
                                    >
                                        Leave
                                    </button>
                                ) : (
                                    <button
                                        className="join-btn"
                                        onClick={async () => {
                                            if (!currentCommunity || !currentCommunity.id) return;
                                            // Attempt to add member in Firestore
                                            const success = await addMembers(currentCommunity.id, currentUserUid);
                                            if (success) {
                                                // Update local currentCommunity.members and posts state so UI reflects membership immediately
                                                const updated = { ...currentCommunity };
                                                updated.members = Array.isArray(updated.members) ? [...updated.members, currentUserUid] : [currentUserUid];
                                                setCurrentCommunity(updated);

                                                // Update topCommunities so the community appears with updated follower count in lists
                                                setTopCommunities(prev => prev.map(c => c.id === updated.id ? { ...c, followers: (c.followers || 0) + 1, members: (c.members || []).concat([currentUserUid]) } : c));

                                                // Optionally show the community in the 'Other Communities You Follow' sidebar
                                                setTopCommunities(prev => prev); // trigger refresh
                                            } else {
                                                alert('Could not join community (already a member or error).');
                                            }
                                        }}
                                    >
                                        Join
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Create Post Form */}
                    {isLoggedIn && !isLoadingCommunity && currentUser && (
                        <section className="create-post-section">
                            <CreatePostForm 
                                onSubmit={handleCreatePost}
                                communityName={displayCommunity.name}
                                currentUser={currentUser}
                            />
                        </section>
                    )}

                    {/* Activity Feed */}
                    <section className="activity-feed">
                        <ActivityFeed 
                            posts={posts} 
                            onLoadMore={handleLoadMore}
                            isLoading={isLoadingPosts}
                        />
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
                        communities={followedCommunities}
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