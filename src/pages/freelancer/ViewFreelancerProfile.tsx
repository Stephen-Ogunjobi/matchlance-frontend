import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

interface Language {
  language: string;
  proficiency: string;
}

interface FreelancerProfile {
  bio: string;
  title: string;
  skills: string[];
  categories: string[];
  experienceLevel: string;
  hourlyRate: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    status: string;
    hoursPerWeek: number;
  };
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  languages: Language[];
  profilePicture?: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName: string;
    email: string;
  };
}

export default function ViewFreelancerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Redirect if user is not a client
  useEffect(() => {
    if (userLoading) return;

    if (!user || user.role !== "client") {
      setError("Only clients can view freelancer profiles");
      setLoading(false);
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      if (!user || user.role !== "client") return;

      try {
        setLoading(true);
        const response = await apiClient.get(`/freelancer/profile/${userId}`);

        if (response.data.success || response.data.freelancerProfile) {
          setProfile(response.data.freelancerProfile);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(
          err.response?.data?.message || "Failed to load freelancer profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user]);

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Loading...</h1>
        <p>Please wait while we load the profile.</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Profile Not Found</h1>
        <p style={{ color: "#c33" }}>{error || "Profile does not exist"}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            fontSize: "16px",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "#007bff",
          cursor: "pointer",
          fontSize: "16px",
          padding: 0,
          marginBottom: "20px",
          textDecoration: "underline",
        }}
      >
        &larr; Back
      </button>

      {/* Profile Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        {profile.profilePicture && profile.profilePicture.trim() !== "" ? (
          <img
            src={
              profile.profilePicture.startsWith("http")
                ? profile.profilePicture
                : `http://localhost:3001${profile.profilePicture}`
            }
            alt="Profile"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #007bff",
              marginBottom: "15px",
            }}
            onError={(e) => {
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
              margin: "0 auto 15px",
              fontSize: "48px",
              color: "#999",
            }}
          >
            👤
          </div>
        )}

        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
          {profile.userId?.firstName || ""} {profile.userId?.lastName}
        </h1>
        <h2
          style={{
            fontSize: "20px",
            color: "#666",
            fontWeight: "normal",
            marginBottom: "8px",
          }}
        >
          {profile.title}
        </h2>
        <p style={{ color: "#999", fontSize: "14px" }}>
          {profile.location.city && `${profile.location.city}, `}
          {profile.location.country}
        </p>
      </div>

      {/* Bio Section */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>About</h3>
        <p style={{ lineHeight: "1.6", color: "#333" }}>{profile.bio}</p>
      </div>

      {/* Hourly Rate & Availability */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "15px" }}>
          Rate & Availability
        </h3>
        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <div>
            <strong style={{ display: "block", marginBottom: "5px" }}>
              Hourly Rate:
            </strong>
            <span style={{ fontSize: "18px", color: "#007bff" }}>
              ${profile.hourlyRate.min} - ${profile.hourlyRate.max}{" "}
              {profile.hourlyRate.currency}
            </span>
          </div>
          <div>
            <strong style={{ display: "block", marginBottom: "5px" }}>
              Availability:
            </strong>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                backgroundColor:
                  profile.availability.status === "available"
                    ? "#d4edda"
                    : profile.availability.status === "busy"
                    ? "#fff3cd"
                    : "#f8d7da",
                color:
                  profile.availability.status === "available"
                    ? "#155724"
                    : profile.availability.status === "busy"
                    ? "#856404"
                    : "#721c24",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {profile.availability.status === "available"
                ? "Available"
                : profile.availability.status === "busy"
                ? "Busy"
                : "Not Available"}
            </span>
          </div>
          <div>
            <strong style={{ display: "block", marginBottom: "5px" }}>
              Hours per Week:
            </strong>
            <span>{profile.availability.hoursPerWeek} hours</span>
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>
          Experience Level
        </h3>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "500",
            textTransform: "capitalize",
          }}
        >
          {profile.experienceLevel}
        </span>
      </div>

      {/* Skills */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>Skills</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              style={{
                padding: "6px 12px",
                backgroundColor: "#e9ecef",
                borderRadius: "4px",
                fontSize: "14px",
                color: "#333",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>Categories</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {profile.categories.map((category, index) => (
            <span
              key={index}
              style={{
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "4px",
                fontSize: "14px",
                textTransform: "capitalize",
              }}
            >
              {category.replace("-", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>Languages</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {profile.languages.map((lang, index) => (
            <div key={index} style={{ display: "flex", gap: "10px" }}>
              <strong style={{ minWidth: "120px" }}>{lang.language}:</strong>
              <span style={{ textTransform: "capitalize" }}>
                {lang.proficiency}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Location & Timezone */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>Location</h3>
        <p style={{ marginBottom: "8px" }}>
          <strong>City:</strong> {profile.location.city || "Not specified"}
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Country:</strong> {profile.location.country}
        </p>
        <p>
          <strong>Timezone:</strong> {profile.location.timezone}
        </p>
      </div>
    </div>
  );
}
