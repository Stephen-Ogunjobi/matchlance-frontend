import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";
import type { ProfileFormData } from "./freelancer-profile.types";
import ProfilePhotoSection from "./ProfilePhotoSection";
import BasicInfoSection from "./BasicInfoSection";
import SkillsExpertiseSection from "./SkillsExpertiseSection";
import RateAvailabilitySection from "./RateAvailabilitySection";
import LocationSection from "./LocationSection";
import LanguagesSection from "./LanguagesSection";
import ProfileFormActions from "./ProfileFormActions";

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, isFreelancer, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [profileExists, setProfileExists] = useState(false);

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
          <ProfilePhotoSection
            formData={formData}
            setFormData={setFormData}
            userId={userId!}
          />
          <BasicInfoSection formData={formData} onChange={handleInputChange} />
          <SkillsExpertiseSection
            formData={formData}
            setFormData={setFormData}
            onChange={handleInputChange}
          />
          <RateAvailabilitySection
            formData={formData}
            onChange={handleInputChange}
          />
          <LocationSection formData={formData} onChange={handleInputChange} />
          <LanguagesSection formData={formData} setFormData={setFormData} />
          <ProfileFormActions loading={loading} profileExists={profileExists} />
        </form>
      </div>
    </div>
  );
}
