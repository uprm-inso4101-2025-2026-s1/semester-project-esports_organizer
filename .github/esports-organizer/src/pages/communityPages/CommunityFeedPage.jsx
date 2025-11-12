import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/shared/Button.jsx";
import TournamentCard from "../../components/shared/TournamentCard.jsx";
import "./CommunityFeedPage.css";
import Post from "../../Comm-Social/PostFolder/Post.js";
import Navbar from "../../components/shared/Navbar.jsx";

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
    user: { name: "John", username: "@john67", avatar: null },
    timestamp: "1hr ago",
    content: "wassssssssssuuuuuuup guys",
    likes: 256,
    comments: 5,
    shares: 1,
    community: "MARVEL RIVALS",
  },
  {
    id: 2,
    user: { name: "Johnie", username: "@john420", avatar: null },
    timestamp: "56hr ago",
    content: "wasdwasdwasdwasdwasdw",
    likes: 986,
    comments: 10,
    shares: 698,
    community: "MARVEL RIVALS",
  },
  {
    id: 3,
    user: { name: "Johnster", username: "@john21", avatar: null },
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
    { id: 2, title: "Valorant", imageUrl: "/assets/images/valorant.png" },
    { id: 3, title: "Fortnite", imageUrl: "/assets/images/fortnite.png" },
    {
      id: 4,
      title: "League of Legends",
      imageUrl: "/assets/images/valorant.png",
    },
  ],
  top: [
    { id: 5, title: "Valorant", imageUrl: "/assets/images/valorant.png" },
    { id: 6, title: "Fortnite", imageUrl: "/assets/images/fortnite.png" },
    { id: 7, title: "Apex Legends", imageUrl: "/assets/images/valorant.png" },
  ],
};

// Mini Community Card Component - Same as in CommunityPage.jsx
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

function CreatePostForm({ onSubmit }) {
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
      community: mockCommunity.name.toUpperCase(),
    });
    postCreation.setPublicState();
    const postObj = postCreation.toObject
      ? postCreation.toObject()
      : postCreation;

    // pasar el objeto al padre
    onSubmit(postObj);

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
function PostCard({ post }) {
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
              <img src={post.user.avatar} alt={post.user.name} />
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
function EventCard({ event, onJoin }) {
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
function ActivityFeed({ posts, onLoadMore }) {
  return (
    <div className="activity-feed">
      <h2>Recent Activity</h2>
      <div className="posts-container">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
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

// Action card with onClick button for the side bar
function ActionCard({ title, onClick }) {
  return (
    <div className="action-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="action-card-content">
        <h3>{title}</h3>
      </div>
    </div>
  );
}

// Community Section Component using MiniCommunityCard
function CommunitySection({ title, communities, onCommunityClick }) {
  return (
    <div className="community-section">
      <h3>{title}</h3>
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
    </div>
  );
}

export default function CommunityFeedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn] = useState(true); // For testing only, change later
  const [posts, setPosts] = useState(mockPosts);
  const { communityId } = useParams();
  console.log("Viewing community:", communityId);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  const handleCommunityClick = (communityId) => {
    console.log(`Navigating to community ${communityId}`);
  };
  const handleCreateCommunity = () => {
    console.log("Create community clicked");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: "/homepage", label: "Home" },
    { path: "/tournaments", label: "Tournaments" },
    { path: "/teams", label: "Teams" },
    { path: "/community", label: "Community" },
  ];

  // Handling button clicks

  const handleToggleSaved = (tournamentId, isSaved) => {
    //proper functionality added in the future
    console.log(`${isSaved ? "Unsaving" : "Saving"} tournament:`, tournamentId);
  };
  const handleJoinEvent = (tournamentTitle) => {
    //proper functionality added later
    console.log(`${isSaved ? "Unsaving" : "Saving"} tournament:`, tournamentId);
  };

  const handleCreatePost = (postObj) => {
    const timestamp =
      postObj.date instanceof Date
        ? postObj.date.toLocaleString()
        : new Date(postObj.date).toLocaleString();

    const obj = {
      id: postObj.id,
      user: {
        name: postObj.author || "Current User",
        username: postObj.authorUsername || "@currentuser",
        avatar: null,
      },
      timestamp,
      content: postObj.content,
      likes: postObj.likes,
      comments: Array.isArray(postObj.comments) ? postObj.comments.length : 0,
      shares: 0,
      community: postObj.community || mockCommunity.name,
    };
    setPosts((prev) => [obj, ...prev]);

    console.log("Creating post:", obj);
    alert(`Post created: "${obj.content}"`);
  };

  const handleLoadMore = () => {
    // functionality to be later added
    console.log("Loading more posts...");
    alert("Loading more posts...");
  };

  return (
    <div className="community-feed-page">
      <Navbar />

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
            <h1>Activity in {mockCommunity.name} Community</h1>
          </section>

          {/* Create Post Form */}
          {isLoggedIn && (
            <section className="create-post-section">
              <CreatePostForm onSubmit={handleCreatePost} />
            </section>
          )}

          {/* Activity Feed */}
          <section className="activity-feed">
            <ActivityFeed posts={posts} onLoadMore={handleLoadMore} />
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

          {/* Other Communities You Follow */}
          <CommunitySection
            title="Other Communities You Follow"
            communities={mockSidebarCommunities.followed}
            onCommunityClick={handleCommunityClick}
          />

          {/* Top Communities */}
          <CommunitySection
            title="Top Communities"
            communities={mockSidebarCommunities.top}
            onCommunityClick={handleCommunityClick}
          />
        </aside>
      </div>
    </div>
  );
}
