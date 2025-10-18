import { useState, useRef } from "react";
import Button from "../../components/shared/Button";
import Dropdown from "../../components/shared/DropDown";
import Modal from "../../components/shared/Modal";
import "./AuthPages.css";
import Label from "../../components/shared/Label";
import { useNavigate } from "react-router-dom";

function CreateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    country: "",
    role: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const countries = [
    { value: "country1", label: "Puerto Rico" },
    { value: "country2", label: "United States" },
    { value: "country3", label: "Spain" },
  ];

  const roles = [
    { value: "role1", label: "Tank" },
    { value: "role2", label: "Assault" },
    { value: "role3", label: "Support" },
  ];

  // Handle File upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Handle text/dropdown changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validation Logic
  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) newErrors.username = "Username is required.";
    else if (form.username.length > 14)
      newErrors.username = "Max 14 characters.";

    if (!form.country) newErrors.country = "Select a country.";
    if (!form.role) newErrors.role = "Select a role.";

    if (form.bio.length > 300)
      newErrors.bio = "Bio must be 300 characters or less.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Profile created:", { ...form, preview });
    alert("Profile successfully created!");
    navigate("/homepage");
  };

  // Cancel Handler
  const handleCancel = () => {
    setForm({ username: "", country: "", role: "", bio: "" });
    setPreview(null);
    setErrors({});
    navigate(-1);
  };

  const _remainingBio = 300 - form.bio.length;

  return (
    <div className="auth-page centered">
      <div className="form-section">
        <Modal
          title={"Create your Profile"}
          buttons={[
            <Button
              text={"Cancel"}
              key={"cancel"}
              variant="secondary"
              onClick={handleCancel}
            />,
            <Button
              text={"Done"}
              key={"done"}
              variant="primary"
              onClick={handleSubmit}
            />,
          ]}
        >
          <h2>Complete the fields to create your profile</h2>
          <form>
            <Label>Upload a Profile Picture</Label>
            <div className="circular-picture-section">
              <div
                className="circular-picture-container"
                onClick={handleImageClick}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="circular-picture-preview"
                  />
                ) : (
                  <span className="upload-placeholder">+</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <Label required>Username</Label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="AwesomeGamerXx"
              className={errors.username ? "error-input" : ""}
              required
            />
            {errors.username && <p className="error">{errors.username}</p>}

            <Label required>Select your Country</Label>
            <Dropdown
              name="country"
              options={countries}
              value={form.country}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, country: value }))
              }
              required
              error={!!errors.country}
            />
            {errors.country && <p className="error">{errors.country}</p>}

            <Label required>Select your Role</Label>
            <Dropdown
              name="role"
              options={roles}
              value={form.role}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, role: value }))
              }
              required
              error={!!errors.role}
            />
            {errors.role && <p className="error">{errors.role}</p>}

            <Label>Biography</Label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Add your Bio..."
            />
            {errors.bio && <p className="error">{errors.bio}</p>}
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default CreateProfile;
