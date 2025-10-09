import Navbar from "../../components/shared/Navbar";

// Placeholder for the Team Profile Page with navigation
export default function TeamProfilePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--light-gradient)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "var(--font-heading)",
          fontSize: "2rem",
        }}
      >
        Teams Page - Coming Soon...
      </div>
    </div>
  );
}
