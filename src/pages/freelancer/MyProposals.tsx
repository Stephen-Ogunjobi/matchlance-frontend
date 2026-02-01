import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

interface Budget {
  min: number;
  max: number;
}

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description?: string;
    status: string;
  };
  freelancerId: string;
  coverLetter: string;
  proposedBudget: Budget;
  estimatedTime: string;
  availability: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyProposals() {
  const { user, isFreelancer } = useUser();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isFreelancer) {
      navigate("/");
      return;
    }

    fetchMyProposals();
  }, [isFreelancer]);

  const fetchMyProposals = async () => {
    try {
      setLoading(true);
      setError("");

      // First, get all proposals for this freelancer
      const response = await apiClient.get(`/proposal/my-proposals`);

      // The response should contain proposals with populated job data
      setProposals(response.data.proposals || []);
    } catch (err: any) {
      console.error("Error fetching proposals:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load proposals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { bg: "#fff3cd", color: "#856404", border: "#ffc107" };
      case "accepted":
        return { bg: "#d4edda", color: "#155724", border: "#28a745" };
      case "rejected":
        return { bg: "#f8d7da", color: "#721c24", border: "#dc3545" };
      default:
        return { bg: "#e7f3ff", color: "#004085", border: "#007bff" };
    }
  };

  const formatEstimatedTime = (time: string) => {
    const timeMap: Record<string, string> = {
      "less-than-month": "Less than 1 month",
      "1-month": "1 month",
      "2-months": "2 months",
      "3-months": "3 months",
      "more-than-3-months": "More than 3 months",
    };
    return timeMap[time] || time;
  };

  const formatAvailability = (availability: string) => {
    const availabilityMap: Record<string, string> = {
      immediately: "Immediately",
      "few-days": "In a few days",
      "1-week": "In 1 week",
      "2-weeks": "In 2 weeks",
    };
    return availabilityMap[availability] || availability;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <h1>My Proposals</h1>
        <p>Loading your proposals...</p>
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
          marginBottom: "24px",
        }}
      >
        <h1 style={{ margin: 0 }}>My Proposals</h1>
        <Link
          to="/"
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          Back to Home
        </Link>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
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

      {proposals.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h2>No Proposals Yet</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            You haven't sent any proposals yet. Browse available jobs and start
            applying!
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            You have sent {proposals.length} proposal
            {proposals.length !== 1 ? "s" : ""}
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {proposals.map((proposal) => {
              const statusStyle = getStatusColor(proposal.status);
              return (
                <div
                  key={proposal._id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    transition: "box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "20px" }}>
                        {proposal.jobId.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                        Submitted on {formatDate(proposal.createdAt)}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "6px 16px",
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        borderRadius: "16px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  {/* Job Description Preview */}
                  {proposal.jobId.description && (
                    <div
                      style={{
                        marginBottom: "16px",
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#666",
                          fontStyle: "italic",
                        }}
                      >
                        {proposal.jobId.description.length > 200
                          ? proposal.jobId.description.substring(0, 200) + "..."
                          : proposal.jobId.description}
                      </p>
                    </div>
                  )}

                  {/* Proposal Details Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        Proposed Budget
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        ${proposal.proposedBudget.min} - $
                        {proposal.proposedBudget.max}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        Estimated Time
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatEstimatedTime(proposal.estimatedTime)}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        Availability
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatAvailability(proposal.availability)}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        Job Status
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                          color:
                            proposal.jobId.status === "open"
                              ? "#28a745"
                              : "#dc3545",
                        }}
                      >
                        {proposal.jobId.status}
                      </p>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div style={{ marginBottom: "16px" }}>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Cover Letter
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "#333",
                      }}
                    >
                      {proposal.coverLetter.length > 300
                        ? proposal.coverLetter.substring(0, 300) + "..."
                        : proposal.coverLetter}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "16px" }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/matched-job/${proposal.jobId._id}`)
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0056b3";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#007bff";
                      }}
                    >
                      View Job Details
                    </button>

                    {/* Only show edit button for pending proposals */}
                    {proposal.status === "pending" && (
                      <button
                        onClick={() =>
                          navigate(`/edit-proposal/${proposal._id}`)
                        }
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#ffc107",
                          color: "#000",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#e0a800";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#ffc107";
                        }}
                      >
                        Edit Proposal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
