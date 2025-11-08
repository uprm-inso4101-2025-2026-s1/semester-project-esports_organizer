import React, { useState, useEffect } from "react";
import Modal from "../../components/shared/Modal";
import "./PreferencesPage.css";
import "./AuthPages.css";
import Navbar from "../../components/shared/Navbar";
import Label from "../../components/shared/Label";
import { useTheme } from "../../hooks/useTheme";
import Button from "../../components/shared/Button";

const PreferencesPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  // State to manage form data
  //TODO: Fetch user preferences
  const [form, setForm] = useState({
    email: "gamer@email.com", // Default email
    newPassword: "", // New password field
    confirmPassword: "", // Confirm password field
  });

  // State to manage form validation errors
  const [errors, setErrors] = useState({});

  // Handle input changes and update form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form to original user preferences
  //TODO: Fetch original preferences
  const handleCancel = () => {
    setForm({
      email: "gamer@email.com",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  // Validate and save form data
  const handleSave = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    // Validate email
    if (!form.email.trim()) {
      newErrors.email = "E-mail is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid e-mail format.";
    }

    // Validate new password
    if (!form.newPassword.trim()) {
      newErrors.newPassword = "Password is required.";
    }

    // Validate confirm password
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required.";
    } else if (
      form.newPassword.trim() &&
      form.confirmPassword.trim() &&
      form.newPassword !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    // If no errors, simulate success and clear passwords
    if (Object.keys(newErrors).length === 0) {
      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
    }
  };

  // State to manage selected theme (light, dark, or auto)
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return isDarkMode === systemPrefersDark
      ? "auto"
      : isDarkMode
      ? "dark"
      : "light";
  });

  // Sync theme with system preference when "auto" is selected
  useEffect(() => {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (selectedTheme === "auto") {
      if (isDarkMode !== systemPrefersDark) {
        toggleTheme();
      }
    }
  }, [selectedTheme, isDarkMode, toggleTheme]);

  // Handle theme change based on user selection
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    if (theme === "light") {
      if (isDarkMode) toggleTheme();
    } else if (theme === "dark") {
      if (!isDarkMode) toggleTheme();
    } else if (theme === "auto") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (isDarkMode !== systemPrefersDark) toggleTheme();
    }
  };

  return (
    <div className="auth-page centered with-navbar">
      <Navbar />
      <div className="form-section">
        <Modal
          expanded={true}
          title="User Preferences"
          buttons={[
            <Button
              key="cancel"
              text="Cancel"
              variant="secondary"
              onClick={handleCancel}
            />,
            <Button key="save" text="Save" onClick={handleSave} />,
          ]}
        >
          <div className="preferences-container ">
            <h2>Theme Mode</h2>
            <div className="pref-row">
              {/* Light mode option */}
              <div className="preference-option">
                <Label htmlFor="light-mode">🌞 Light Mode</Label>
                <input
                  type="radio"
                  id="light-mode"
                  name="theme"
                  value="light"
                  checked={selectedTheme === "light"}
                  onChange={() => handleThemeChange("light")}
                />
              </div>
              {/* Dark mode option */}
              <div className="preference-option">
                <Label htmlFor="dark-mode">🌜 Dark Mode</Label>
                <input
                  type="radio"
                  id="dark-mode"
                  name="theme"
                  value="dark"
                  checked={selectedTheme === "dark"}
                  onChange={() => handleThemeChange("dark")}
                />
              </div>
              {/* Auto mode option */}
              <div className="preference-option">
                <Label htmlFor="auto-mode">🌗 Use System Preference</Label>
                <input
                  type="radio"
                  id="auto-mode"
                  name="theme"
                  value="auto"
                  checked={selectedTheme === "auto"}
                  onChange={() => handleThemeChange("auto")}
                />
              </div>
            </div>
          </div>
          <div className="preferences-container">
            <h2>User Personal Information (click save to apply)</h2>
            <form onSubmit={handleSave}>
              {/* Email input */}
              <Label>E-mail</Label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. awesomegamer123@email.com"
                className={errors.email ? "error-input" : ""}
              />
              {errors.email && <p className="error">{errors.email}</p>}

              {/* New password input */}
              <Label>New Password</Label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "error-input" : ""}
              />
              {errors.newPassword && (
                <p className="error">{errors.newPassword}</p>
              )}

              {/* Confirm password input */}
              <Label>Confirm New Password</Label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error-input" : ""}
              />
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default PreferencesPage;
