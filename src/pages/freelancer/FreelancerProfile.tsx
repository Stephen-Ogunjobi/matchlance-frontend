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
        }
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
          lang.language.toLowerCase() === languageInput.trim().toLowerCase(),
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
        (lang) => lang.language !== languageToRemove,
      ),
    }));
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
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
        },
      );

      // Update the profile picture in form data
      if (response.data.profilePicture) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
      }
    } catch (err: any) {
      setPictureError(
        err.response?.data?.message ||
          "Failed to upload profile picture. Please try again.",
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
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please try again.",
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
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-[var(--color-muted)]" />
              <div className="h-6 w-48 rounded-lg bg-[var(--color-muted)]" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-32 rounded-lg bg-[var(--color-muted)]" />
                <div className="h-12 rounded-xl bg-[var(--color-muted)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            {profileExists ? "Edit Your Profile" : "Create Your Profile"}
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {profileExists
              ? "Update your profile to attract the right clients."
              : "Set up your freelancer profile to start getting matched with jobs."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
            <p className="text-sm font-medium text-[var(--color-error)]">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
              Profile Photo
            </h2>
            <div className="flex flex-col items-center gap-4">
              {formData.profilePicture &&
              formData.profilePicture.trim() !== "" ? (
                <img
                  src={
                    formData.profilePicture.startsWith("http")
                      ? formData.profilePicture
                      : `http://localhost:3001${formData.profilePicture}`
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[var(--color-muted)] border-4 border-[var(--color-border)] flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[var(--color-text-tertiary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  id="profilePictureInput"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePictureInput"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    uploadingPicture
                      ? "bg-[var(--color-muted)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                      : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md"
                  }`}
                >
                  {uploadingPicture ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : formData.profilePicture ? (
                    "Change Photo"
                  ) : (
                    "Upload Photo"
                  )}
                </label>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  Max 5MB — JPG, PNG, GIF
                </span>
              </div>

              {pictureError && (
                <p className="text-sm text-[var(--color-error)]">
                  {pictureError}
                </p>
              )}
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Basic Information
            </h2>

            {/* Professional Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Professional Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Full-Stack Developer | UI/UX Designer"
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                minLength={10}
                maxLength={100}
                required
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                {formData.title.length}/100 characters (min 10)
              </p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Professional Bio *
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell potential clients about your experience, expertise, and what makes you unique..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-y min-h-[160px]"
                minLength={100}
                maxLength={2000}
                required
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                {formData.bio.length}/2000 characters (min 100)
              </p>
            </div>
          </div>

          {/* Skills & Categories Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Skills & Expertise
            </h2>

            {/* Skills */}
            <div>
              <label
                htmlFor="skillInput"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Skills * (1-20)
              </label>
              <div className="flex gap-2">
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
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={formData.skills.length >= 20}
                  className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-[var(--color-primary)]/20 rounded-full w-5 h-5 inline-flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {formData.skills.length}/20 skills
              </p>
            </div>

            {/* Categories */}
            <div>
              <label
                htmlFor="categoryInput"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Categories * (1-5)
              </label>
              <div className="flex gap-2">
                <select
                  id="categoryInput"
                  value={categoryInput}
                  onChange={(e) =>
                    setCategoryInput(e.target.value as Category)
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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
                  className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] text-sm font-medium"
                    >
                      {categoryOptions.find((c) => c.value === category)
                        ?.label || category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="hover:bg-[var(--color-success)]/20 rounded-full w-5 h-5 inline-flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {formData.categories.length}/5 categories
              </p>
            </div>

            {/* Experience Level */}
            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Experience Level *
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Rate & Availability Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Rate & Availability
            </h2>

            {/* Hourly Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hourlyRateMin"
                  className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                >
                  Min Hourly Rate (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    id="hourlyRateMin"
                    name="hourlyRateMin"
                    value={formData.hourlyRateMin}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="hourlyRateMax"
                  className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                >
                  Max Hourly Rate (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    id="hourlyRateMax"
                    name="hourlyRateMax"
                    value={formData.hourlyRateMax}
                    onChange={handleInputChange}
                    placeholder="75"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div>
              <label
                htmlFor="availabilityStatus"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Availability Status *
              </label>
              <select
                id="availabilityStatus"
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>

            {/* Hours Per Week */}
            <div>
              <label
                htmlFor="hoursPerWeek"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
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
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                min="1"
                max="168"
                required
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                Maximum 168 hours per week
              </p>
            </div>
          </div>

          {/* Location Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
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
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., New York"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
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
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>
          </div>

          {/* Languages Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Languages
            </h2>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Languages * (1-10)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
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
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
                <select
                  value={languageProficiency}
                  onChange={(e) =>
                    setLanguageProficiency(
                      e.target.value as LanguageProficiency,
                    )
                  }
                  className="px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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
                  className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.languages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.languages.map((lang) => (
                    <span
                      key={lang.language}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm font-medium"
                    >
                      {lang.language}
                      <span className="opacity-70">
                        ({lang.proficiency})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang.language)}
                        className="hover:bg-[var(--color-warning)]/20 rounded-full w-5 h-5 inline-flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {formData.languages.length}/10 languages
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/25"
            >
              {loading
                ? "Saving..."
                : profileExists
                  ? "Update Profile"
                  : "Create Profile"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-8 py-3.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-border)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
