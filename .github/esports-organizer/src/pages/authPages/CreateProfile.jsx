import { useState, useRef } from "react";
import Button from "../../components/shared/Button";
import Dropdown from "../../components/shared/DropDown";
import Modal from "../../components/shared/Modal";
import "./AuthPages.css";
import Label from "../../components/shared/Label";
import { useNavigate } from "react-router-dom";
import { updatePlayerProfile } from "../../services/profile-service.js";
import { assignUserRole } from "../../Roles/assignUserRole";


function CreateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    country: "",
    role: "", // <-- change GameRole to role
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const countries = [
    { value: "Puerto Rico", label: "Puerto Rico" },
    { value: "United States", label: "United States" },
    { value: "Spain", label: "Spain" },
  ];

  const roles = [
    { value: "Tank", label: "Tank" },
    { value: "Assault", label: "Assault" },
    { value: "Support", label: "Support" },
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
    if (!form.role) newErrors.role = "Select a role."; // <-- update role validation

    if (form.bio.length > 300)
      newErrors.bio = "Bio must be 300 characters or less.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const uid = localStorage.getItem("uid");

    if (!uid) {
      alert("Error Fetching uid");
      return;
    }

    const updateData = {
      Username: form.username,
      country: form.country,
      role: form.role, // <-- use role here
      bio: form.bio,
      // Optionally add photoUrl if you handle image upload
    };

    try {
      const result = await updatePlayerProfile(uid, updateData);
      if (result.success) {
        alert("Profile successfully created!");
        await assignUserRole(uid,"Player",{
          viewTournaments:true,
          createCommunities: true,
          canCreatePrivateTournaments: true,
          canCreatePublicTournaments:true,
          joinTournament:true,
          joinCommunities:true,
          canEditUserProfile:true,
          requestToJoinTeam:true,
          editUserEvent:true,
          createUserEvent:true,
          removeUserEvent:true,
        })
        navigate("/homepage");
      } else {
        alert(result.error || "Error updating profile.");
      }
    } catch {
      alert("Error updating profile.");
    }
  };

  // Cancel Handler
  const handleCancel = () => {
    setForm({ username: "", country: "", role: "", bio: "" });
    setPreview(null);
    setErrors({});
    navigate(-1);
  };

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
