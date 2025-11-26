import React, { useEffect, useRef, useState } from "react";
import { FaHammer } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

/*  Admin-only quick actions for the navbar. */
export default function AdminMenu({ inline = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanForm, setShowBanForm] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef(null);

  const styles = getStyles(inline);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setStatus(null);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBanSubmit = async (event) => {
    event.preventDefault();
    if (!identifier.trim()) {
      setStatus({ type: "error", message: "Username or email is required." });
      return;
    }

    // Placeholder: backend wiring not active yet
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus({
        type: "info",
        message: "Ban action not active yet. ",
      });
    }, 450);
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <button
        type="button"
        style={styles.trigger}
      onClick={toggleMenu}
      aria-expanded={isMenuOpen}
      aria-label="Admin actions"
    >
        <FaHammer size={30} color="#de9906ff" />
      </button>

      {isMenuOpen && (
        <div className="admin-panel" style={styles.panel}>
          <div style={styles.headerRow}>
            <span style={styles.headerTitle}>Admin tools</span>
            <span style={styles.headerHint}>
              Quick actions for moderation (ban with reason)
            </span>
          </div>

          <button
            type="button"
            style={styles.actionButton}
            onClick={() => setShowBanForm((prev) => !prev)}
            aria-expanded={showBanForm}
          >
            <div style={styles.actionLabel}>
              <FaHammer size={18} color="var(--link)" />
              <span>Ban player</span>
            </div>
            {showBanForm ? (
              <MdKeyboardArrowUp size={18} />
            ) : (
              <MdKeyboardArrowDown size={18} />
            )}
          </button>

          {showBanForm && (
            <form style={styles.form} onSubmit={handleBanSubmit}>
              <label style={styles.label} htmlFor="ban-identifier">
                Username or email
              </label>
              <input
                id="ban-identifier"
                style={styles.input}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="player@example.com"
              />

              <label style={styles.label} htmlFor="ban-reason">
                Reason for ban
              </label>
              <textarea
                id="ban-reason"
                style={styles.textarea}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Sportsmanship violation, abusive behavior..."
                rows={3}
              />

              {status && (
                <div
                  style={{
                    ...styles.status,
                    color:
                      status.type === "success"
                        ? "var(--link)"
                        : status.type === "info"
                        ? "var(--hover)"
                        : "var(--error-msg)",
                  }}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Ban player"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function getStyles(inline) {
  return {
    container: {
      position: inline ? "relative" : "fixed",
      top: inline ? "auto" : 28,
      right: inline ? "auto" : 72,
      fontFamily: 'var(--font-body, "Arial", sans-serif)',
      zIndex: 3500,
    },
    trigger: {
      display: "inline-flex",
      alignItems: "center",
      gap: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--link)",
      padding: "6px 10px",
      borderRadius: 12,
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
    panel: {
      position: inline ? "absolute" : "fixed",
      top: inline ? 48 : 70,
      right: inline ? 0 : 72,
      width: "min(92vw, 340px)",
      backgroundColor: "var(--container)",
      color: "#ffffff",
      border: "1px solid var(--primary)",
      borderRadius: 14,
      padding: 14,
      boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
      backdropFilter: "blur(6px)",
      zIndex: 3600,
    },
    headerRow: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      marginBottom: 10,
    },
    headerTitle: {
      fontWeight: 800,
      letterSpacing: 0.3,
      fontSize: 15,
      color: "#ffffff",
    },
    headerHint: {
      color: "#e0e0e0",
      fontSize: 12,
    },
    actionButton: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--primary)",
      color: "#ffffff",
      border: "1px solid var(--container)",
      borderRadius: 10,
      padding: "10px 12px",
      cursor: "pointer",
      transition: "border-color 0.2s ease, background 0.2s ease",
    },
    actionLabel: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontWeight: 700,
    },
    form: {
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      background: "var(--primary)",
      border: "1px solid var(--container)",
      borderRadius: 10,
      padding: 12,
      transition: "max-height 0.25s ease, padding 0.2s ease",
    },
    label: {
      fontSize: 12,
      letterSpacing: 0.2,
      color: "#e0e0e0",
      textTransform: "uppercase",
    },
    input: {
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid var(--hover)",
      backgroundColor: "var(--container)",
      color: "#ffffff",
      fontSize: 14,
      outline: "none",
    },
    textarea: {
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid var(--hover)",
      backgroundColor: "var(--container)",
      color: "#ffffff",
      fontSize: 14,
      outline: "none",
      resize: "vertical",
      minHeight: 80,
    },
    status: {
      minHeight: 16,
      fontSize: 12,
      fontWeight: 600,
    },
    submitButton: {
      background: "linear-gradient(135deg, var(--link), var(--hover))",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 12px",
      fontWeight: 800,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
  };
}
