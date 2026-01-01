import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/api";

interface Budget {
  type: "fixed" | "hourly";
  amount?: number;
  min?: number;
  max?: number;
  currency: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: Budget;
  experienceLevel: string;
  status: string;
  createdAt: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/job/jobs");
      setJobs(response.data.userJobs);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(
        err.response?.data?.message || "Failed to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (budget: Budget) => {
    if (budget.type === "fixed") {
      return `$${budget.amount?.toLocaleString()} ${budget.currency}`;
    } else {
      return `$${budget.min}-$${budget.max}/hr ${budget.currency}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <h1>Available Jobs</h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <h1>Available Jobs</h1>
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
        <button
          onClick={fetchJobs}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Available Jobs</h1>
        <p style={{ color: "#666" }}>
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"} available
        </p>
      </div>

      {jobs.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3>No jobs available yet</h3>
          <p style={{ color: "#666" }}>
            Check back later for new opportunities!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#007bff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ddd";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "12px",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#007bff" }}>{job.title}</h3>
                  <span
                    style={{
                      padding: "4px 12px",
                      backgroundColor:
                        job.status === "open" ? "#d4edda" : "#f8d7da",
                      color: job.status === "open" ? "#155724" : "#721c24",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    {job.status}
                  </span>
                </div>

                <p
                  style={{
                    margin: "0 0 12px 0",
                    color: "#666",
                    lineHeight: "1.5",
                  }}
                >
                  {truncateDescription(job.description)}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {job.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#e7f3ff",
                        color: "#0066cc",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span
                      style={{
                        padding: "4px 8px",
                        color: "#666",
                        fontSize: "12px",
                      }}
                    >
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    <span>
                      <strong>{formatBudget(job.budget)}</strong>
                    </span>
                    <span style={{ textTransform: "capitalize" }}>
                      {job.experienceLevel} Level
                    </span>
                    <span style={{ textTransform: "capitalize" }}>
                      {job.category.replace("-", " ")}
                    </span>
                  </div>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
