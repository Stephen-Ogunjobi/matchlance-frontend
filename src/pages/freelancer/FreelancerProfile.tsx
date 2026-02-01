import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

type Category =
  | "web-development"
  | "mobile-development"
  | "design"
  | "writing"
  | "marketing"
  | "data-science"
  | "other";

type ExperienceLevel = "entry" | "intermediate" | "expert";

type AvailabilityStatus = "available" | "busy" | "not-available";

type LanguageProficiency = "basic" | "conversational" | "fluent" | "native";

interface Language {
  language: string;
  proficiency: LanguageProficiency;
}

interface ProfileFormData {
  bio: string;
  title: string;
  skills: string[];
  categories: string[];
  experienceLevel: ExperienceLevel | "";
  hourlyRateMin: string;
  hourlyRateMax: string;
  availabilityStatus: AvailabilityStatus;
  hoursPerWeek: string;
  country: string;
  city: string;
  timezone: string;
  languages: Language[];
  profilePicture?: string;
}

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, isFreelancer, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [profileExists, setProfileExists] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [categoryInput, setCategoryInput] = useState<Category | "">("");
  const [languageInput, setLanguageInput] = useState("");
  const [languageProficiency, setLanguageProficiency] =
    useState<LanguageProficiency>("conversational");
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureError, setPictureError] = useState<string>("");

  const [formData, setFormData] = useState<ProfileFormData>({
    bio: "",
    title: "",
    skills: [],
    categories: [],
    experienceLevel: "",
    hourlyRateMin: "",
    hourlyRateMax: "",
    availabilityStatus: "available",
    hoursPerWeek: "",
    country: "",
    city: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: [],
    profilePicture: "",
  });

  // Check if the current user is viewing their own profile
  const isOwnProfile = user?._id === userId;

  // Redirect if not authorized to edit - ONLY after user has loaded
  useEffect(() => {
    // Wait for user to load before checking authorization
    if (userLoading) return;

    if (!isOwnProfile || !isFreelancer) {
      // Redirect to home if not viewing own profile or not a freelancer
      navigate("/");
    }
  }, [isOwnProfile, isFreelancer, navigate, userLoading]);

  // Fetch existing profile if available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const response = await apiClient.get(`/freelancer/profile/${userId}`);
        const profile = response.data.freelancerProfile;

        setProfileExists(true);
        setFormData({
          bio: profile.bio || "",
          title: profile.title || "",
          skills: profile.skills || [],
          categories: profile.categories || [],
          experienceLevel: profile.experienceLevel || "",
          hourlyRateMin: profile.hourlyRate?.min?.toString() || "",
          hourlyRateMax: profile.hourlyRate?.max?.toString() || "",
          availabilityStatus: profile.availability?.status || "available",
          hoursPerWeek: profile.availability?.hoursPerWeek?.toString() || "",
          country: profile.location?.country || "",
          city: profile.location?.city || "",
          timezone:
            profile.location?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          languages: profile.languages || [],
          profilePicture: profile.profilePicture || "",
        });
      } catch (err: any) {
        // Profile doesn't exist yet, that's okay
        if (err.response?.status === 404) {
          setProfileExists(false);
        } else {
          console.error("Error fetching profile:", err);
        }
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && formData.skills.length < 20) {
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }));
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAddCategory = () => {
    if (categoryInput && formData.categories.length < 5) {
      if (!formData.categories.includes(categoryInput)) {
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, categoryInput],
        }));
        setCategoryInput("");
      }
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && formData.languages.length < 10) {
      const languageExists = formData.languages.some(
        (lang) =>
          lang.language.toLowerCase() === languageInput.trim().toLowerCase()
      );
      if (!languageExists) {
        setFormData((prev) => ({
          ...prev,
          languages: [
            ...prev.languages,
            {
              language: languageInput.trim(),
              proficiency: languageProficiency,
            },
          ],
        }));
        setLanguageInput("");
        setLanguageProficiency("conversational");
      }
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(
        (lang) => lang.language !== languageToRemove
      ),
    }));
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPictureError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPictureError("Image size must be less than 5MB");
      return;
    }

    setPictureError("");
    setUploadingPicture(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("profilePicture", file);

      const response = await apiClient.post(
        `/freelancer/profile/${userId}/upload-picture`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the profile picture in form data
      if (response.data.profilePicture) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
      }
    } catch (err: any) {
      console.error("Error uploading profile picture:", err);
      setPictureError(
        err.response?.data?.message ||
          "Failed to upload profile picture. Please try again."
      );
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title || formData.title.length < 10) {
      setError("Professional title must be at least 10 characters");
      return;
    }

    if (!formData.bio || formData.bio.length < 100) {
      setError("Bio must be at least 100 characters");
      return;
    }

    if (formData.skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    if (formData.categories.length === 0) {
      setError("Please add at least one category");
      return;
    }

    if (!formData.experienceLevel) {
      setError("Please select an experience level");
      return;
    }

    if (!formData.hourlyRateMin || !formData.hourlyRateMax) {
      setError("Please enter both minimum and maximum hourly rates");
      return;
    }

    if (
      parseFloat(formData.hourlyRateMax) < parseFloat(formData.hourlyRateMin)
    ) {
      setError("Maximum rate cannot be less than minimum rate");
      return;
    }

    if (!formData.hoursPerWeek || parseFloat(formData.hoursPerWeek) <= 0) {
      setError("Please enter available hours per week");
      return;
    }

    if (!formData.country) {
      setError("Please enter your country");
      return;
    }

    if (formData.languages.length === 0) {
      setError("Please add at least one language");
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        bio: formData.bio,
        title: formData.title,
        skills: formData.skills,
        categories: formData.categories,
        experienceLevel: formData.experienceLevel,
        hourlyRate: {
          min: parseFloat(formData.hourlyRateMin),
          max: parseFloat(formData.hourlyRateMax),
          currency: "USD",
        },
        availability: {
          status: formData.availabilityStatus,
          hoursPerWeek: parseFloat(formData.hoursPerWeek),
        },
        location: {
          country: formData.country,
          city: formData.city,
          timezone: formData.timezone,
        },
        languages: formData.languages,
      };

      if (profileExists) {
        await apiClient.patch(`/freelancer/profile/${userId}`, profileData);
      } else {
        await apiClient.post("/freelancer/profile", profileData);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions: { value: Category; label: string }[] = [
    { value: "web-development", label: "Web Development" },
    { value: "mobile-development", label: "Mobile Development" },
    { value: "design", label: "Design" },
    { value: "writing", label: "Writing" },
    { value: "marketing", label: "Marketing" },
    { value: "data-science", label: "Data Science" },
    { value: "other", label: "Other" },
  ];

  // Show loading state while user data is loading
  if (userLoading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Loading...</h1>
        <p>Please wait while we load your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>Complete Your Freelancer Profile</h1>

      {error && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            borderRadius: "4px",
            color: "#c33",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Picture Display */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          {formData.profilePicture && formData.profilePicture.trim() !== "" ? (
            <img
              src={
                formData.profilePicture.startsWith("http")
                  ? formData.profilePicture
                  : `http://localhost:3001${formData.profilePicture}`
              }
              alt="Profile"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #007bff",
                marginBottom: "10px",
              }}
              onError={(e) => {
                console.error("Image failed to load:", formData.profilePicture);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                fontSize: "48px",
                color: "#999",
              }}
            >
              👤
            </div>
          )}

          <div>
            <input
              type="file"
              id="profilePictureInput"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="profilePictureInput"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "4px",
                cursor: uploadingPicture ? "not-allowed" : "pointer",
                fontSize: "14px",
                opacity: uploadingPicture ? 0.6 : 1,
              }}
            >
              {uploadingPicture
                ? "Uploading..."
                : formData.profilePicture
                ? "Change Picture"
                : "Upload Picture"}
            </label>
          </div>

          {pictureError && (
            <p style={{ color: "#c33", fontSize: "14px", marginTop: "8px" }}>
              {pictureError}
            </p>
          )}

          <p style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>
            Max size: 5MB. Accepted formats: JPG, PNG, GIF
          </p>
        </div>

        {/* Professional Title */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="title"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Professional Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Full-Stack Developer | UI/UX Designer | Content Writer"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            minLength={10}
            maxLength={100}
            required
          />
          <small style={{ color: "#666" }}>
            {formData.title.length}/100 characters (min 10)
          </small>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="bio"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Professional Bio *
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell potential clients about your experience, expertise, and what makes you unique..."
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              minHeight: "150px",
            }}
            minLength={100}
            maxLength={2000}
            required
          />
          <small style={{ color: "#666" }}>
            {formData.bio.length}/2000 characters (min 100)
          </small>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="skillInput"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Skills * (1-20 skills)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g., React, Node.js, TypeScript"
              style={{ flex: 1, padding: "8px", fontSize: "14px" }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={formData.skills.length >= 20}
              style={{ padding: "8px 16px" }}
            >
              Add
            </button>
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {formData.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <small style={{ color: "#666" }}>
            {formData.skills.length}/20 skills
          </small>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="categoryInput"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Categories * (1-5 categories)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              id="categoryInput"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value as Category)}
              style={{ flex: 1, padding: "8px", fontSize: "14px" }}
            >
              <option value="">Select a category</option>
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={formData.categories.length >= 5 || !categoryInput}
              style={{ padding: "8px 16px" }}
            >
              Add
            </button>
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {formData.categories.map((category) => (
              <span
                key={category}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#d0e0ff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {categoryOptions.find((c) => c.value === category)?.label ||
                  category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <small style={{ color: "#666" }}>
            {formData.categories.length}/5 categories
          </small>
        </div>

        {/* Experience Level */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="experienceLevel"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Experience Level *
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            required
          >
            <option value="">Select experience level</option>
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Hourly Rate */}
        <div
          style={{
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              htmlFor="hourlyRateMin"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Min Hourly Rate (USD) *
            </label>
            <input
              type="number"
              id="hourlyRateMin"
              name="hourlyRateMin"
              value={formData.hourlyRateMin}
              onChange={handleInputChange}
              placeholder="e.g., 25"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label
              htmlFor="hourlyRateMax"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Max Hourly Rate (USD) *
            </label>
            <input
              type="number"
              id="hourlyRateMax"
              name="hourlyRateMax"
              value={formData.hourlyRateMax}
              onChange={handleInputChange}
              placeholder="e.g., 75"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Availability Status */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="availabilityStatus"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Availability Status *
          </label>
          <select
            id="availabilityStatus"
            name="availabilityStatus"
            value={formData.availabilityStatus}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            required
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="not-available">Not Available</option>
          </select>
        </div>

        {/* Hours Per Week */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="hoursPerWeek"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Available Hours Per Week *
          </label>
          <input
            type="number"
            id="hoursPerWeek"
            name="hoursPerWeek"
            value={formData.hoursPerWeek}
            onChange={handleInputChange}
            placeholder="e.g., 30"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            min="1"
            max="168"
            required
          />
          <small style={{ color: "#666" }}>Maximum 168 hours per week</small>
        </div>

        {/* Location - Country */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="country"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="e.g., United States"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            required
          />
        </div>

        {/* Location - City */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="city"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            City (Optional)
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="e.g., New York"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
          />
        </div>

        {/* Timezone */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="timezone"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Timezone *
          </label>
          <input
            type="text"
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            placeholder="e.g., America/New_York"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            required
          />
          <small style={{ color: "#666" }}>
            Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </small>
        </div>

        {/* Languages */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Languages * (1-10 languages)
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
              placeholder="e.g., English, Spanish"
              style={{ flex: 1, padding: "8px", fontSize: "14px" }}
            />
            <select
              value={languageProficiency}
              onChange={(e) =>
                setLanguageProficiency(e.target.value as LanguageProficiency)
              }
              style={{ padding: "8px", fontSize: "14px" }}
            >
              <option value="basic">Basic</option>
              <option value="conversational">Conversational</option>
              <option value="fluent">Fluent</option>
              <option value="native">Native</option>
            </select>
            <button
              type="button"
              onClick={handleAddLanguage}
              disabled={formData.languages.length >= 10}
              style={{ padding: "8px 16px" }}
            >
              Add
            </button>
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {formData.languages.map((lang) => (
              <span
                key={lang.language}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#ffe0b0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {lang.language} ({lang.proficiency})
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(lang.language)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <small style={{ color: "#666" }}>
            {formData.languages.length}/10 languages
          </small>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Saving..."
              : profileExists
              ? "Update Profile"
              : "Save Profile"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
