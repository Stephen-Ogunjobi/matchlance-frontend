import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../../utils/api";

interface Budget {
  type: "fixed" | "hourly";
  amount?: number;
  min?: number;
  max?: number;
  currency: string;
}

interface Duration {
  type: "short" | "medium" | "long";
  estimatedHours?: number;
}

interface ProposalBudget {
  min: number;
  max: number;
}

interface Proposal {
  _id: string;
  jobId: string;
  freelancerId: {
    _id: string;
    name: string;
    email: string;
  };
  coverLetter: string;
  proposedBudget: ProposalBudget;
  estimatedTime: string;
  availability: string;
  status: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: Budget;
  experienceLevel: string;
  duration: Duration;
  status: string;
  proposals?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showProposals, setShowProposals] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [updatingProposal, setUpdatingProposal] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`job/${jobId}`);
      setJob(response.data.job);
    } catch (err: any) {
      console.error("Error fetching job details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load job details. Please try again."
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

  const formatDuration = (duration: Duration) => {
    const durationMap = {
      short: "Less than 1 month",
      medium: "1-3 months",
      long: "More than 3 months",
    };
    return durationMap[duration.type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchProposals = async () => {
    if (!job?.proposals || job.proposals.length === 0) return;

    try {
      setLoadingProposals(true);

      // Fetch each proposal by its ID
      const proposalPromises = job.proposals.map((proposalId) =>
        apiClient.get(`/proposal/${proposalId}`)
      );

      const responses = await Promise.all(proposalPromises);
      const fetchedProposals = responses.map(
        (response) => response.data.proposal
      );

      setProposals(fetchedProposals);
      setShowProposals(true);
    } catch (err: any) {
      console.error("Error fetching proposals:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load proposals. Please try again."
      );
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleProposalStatusUpdate = async (
    proposalId: string,
    newStatus: "accepted" | "rejected"
  ) => {
    try {
      setUpdatingProposal(proposalId);

      // Use separate endpoints for accept and reject
      const endpoint =
        newStatus === "accepted"
          ? `/proposal/${proposalId}/accept`
          : `/proposal/${proposalId}/reject`;

      await apiClient.patch(endpoint);

      // Update the proposal in the local state
      setProposals((prevProposals) =>
        prevProposals.map((p) =>
          p._id === proposalId ? { ...p, status: newStatus } : p
        )
      );

      // Optionally refresh job details to update status
      await fetchJobDetail();
    } catch (err: any) {
      console.error("Error updating proposal:", err);
      setError(
        err.response?.data?.error ||
          `Failed to ${
            newStatus === "accepted" ? "accept" : "reject"
          } proposal. Please try again.`
      );
    } finally {
      setUpdatingProposal(null);
    }
  };

  const handleDelete = async () => {
    if (!jobId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/job/${jobId}`);
      navigate("/jobs");
    } catch (err: any) {
      console.error("Error deleting job:", err);
      setError(
        err.response?.data?.message || "Failed to delete job. Please try again."
      );
      setDeleting(false);
    }
  };

  const handleOpenChat = async (proposalId: string) => {
    try {
      setLoadingChat(proposalId);
      setChatError(null);

      const response = await apiClient.get(`/chat/proposal/${proposalId}`);
      const chatId = response.data.conversation?._id;

      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else {
        setChatError("Chat not found. Please try again later.");
      }
    } catch (err: any) {
      console.error("Error opening chat:", err);
      if (err.response?.status === 404) {
        setChatError(
          "Chat not available yet. The conversation may not have been created."
        );
      } else {
        setChatError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to open chat. Please try again."
        );
      }
    } finally {
      setLoadingChat(null);
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

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/jobs"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to Jobs
        </Link>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/jobs"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to Jobs
        </Link>
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
          {error || "Job not found"}
        </div>
        <button
          onClick={() => navigate("/jobs")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          View All Jobs
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <Link
        to="/jobs"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#007bff",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        &larr; Back to Jobs
      </Link>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "12px",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "28px" }}>{job.title}</h1>
            <span
              style={{
                padding: "6px 16px",
                backgroundColor: job.status === "open" ? "#d4edda" : "#f8d7da",
                color: job.status === "open" ? "#155724" : "#721c24",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {job.status}
            </span>
          </div>
          <p style={{ color: "#666", margin: 0 }}>
            Posted on {formatDate(job.createdAt)}
          </p>
        </div>

        {/* Budget and Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Budget
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              {formatBudget(job.budget)}
            </p>
            <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "12px" }}>
              {job.budget.type === "fixed" ? "Fixed Price" : "Hourly Rate"}
            </p>
          </div>

          <div>
            <p
              style={{
                margin: "0 0 4px 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Experience Level
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {job.experienceLevel}
            </p>
          </div>

          <div>
            <p
              style={{
                margin: "0 0 4px 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Project Duration
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              {formatDuration(job.duration)}
            </p>
            {job.duration.estimatedHours && (
              <p
                style={{ margin: "4px 0 0 0", color: "#666", fontSize: "12px" }}
              >
                Est. {job.duration.estimatedHours} hours
              </p>
            )}
          </div>

          <div>
            <p
              style={{
                margin: "0 0 4px 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Category
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {job.category.replace("-", " ")}
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Job Description
          </h2>
          <p
            style={{ lineHeight: "1.6", color: "#333", whiteSpace: "pre-wrap" }}
          >
            {job.description}
          </p>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Required Skills
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {job.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e7f3ff",
                  color: "#0066cc",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Proposals Section */}
        {job.proposals && job.proposals.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h2 style={{ fontSize: "20px", margin: 0 }}>
                Proposals ({job.proposals.length})
              </h2>
              {!showProposals && (
                <button
                  onClick={fetchProposals}
                  disabled={loadingProposals}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loadingProposals ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: loadingProposals ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingProposals) {
                      e.currentTarget.style.backgroundColor = "#218838";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingProposals) {
                      e.currentTarget.style.backgroundColor = "#28a745";
                    }
                  }}
                >
                  {loadingProposals ? "Loading..." : "View Proposals"}
                </button>
              )}
              {showProposals && (
                <button
                  onClick={() => setShowProposals(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#5a6268";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#6c757d";
                  }}
                >
                  Hide Proposals
                </button>
              )}
            </div>

            {showProposals && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {proposals.map((proposal) => {
                  const statusStyle = getStatusColor(proposal.status);
                  const isUpdating = updatingProposal === proposal._id;
                  return (
                    <div
                      key={proposal._id}
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "8px",
                        padding: "20px",
                      }}
                    >
                      {/* Proposal Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
                            {proposal.freelancerId.name}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            {proposal.freelancerId.email}
                          </p>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              fontSize: "12px",
                              color: "#999",
                            }}
                          >
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
                      </div>

                      {/* Cover Letter */}
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
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {proposal.coverLetter}
                        </p>
                      </div>

                      {/* Attachments */}
                      {proposal.attachments &&
                        proposal.attachments.length > 0 && (
                          <div style={{ marginBottom: "16px" }}>
                            <p
                              style={{
                                margin: "0 0 8px 0",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              Attachments
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              {proposal.attachments.map((attachment, index) => {
                                const fileName =
                                  attachment.split("/").pop() ||
                                  `attachment-${index + 1}`;
                                const fileExtension = fileName
                                  .split(".")
                                  .pop()
                                  ?.toLowerCase();
                                const isImage = [
                                  "jpg",
                                  "jpeg",
                                  "png",
                                  "gif",
                                  "webp",
                                  "svg",
                                ].includes(fileExtension || "");

                                // Ensure the attachment URL is absolute
                                const fileUrl = attachment.startsWith("http")
                                  ? attachment
                                  : `http://localhost:3001${
                                      attachment.startsWith("/") ? "" : "/"
                                    }${attachment}`;

                                return (
                                  <div key={index}>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: "8px 12px",
                                          backgroundColor: "#007bff",
                                          color: "white",
                                          textDecoration: "none",
                                          borderRadius: "4px",
                                          fontSize: "13px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "6px",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            "#0056b3";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            "#007bff";
                                        }}
                                      >
                                        <span>📎</span>
                                        {fileName}
                                      </a>
                                      <a
                                        href={fileUrl}
                                        download={fileName}
                                        style={{
                                          padding: "8px 12px",
                                          backgroundColor: "#28a745",
                                          color: "white",
                                          textDecoration: "none",
                                          borderRadius: "4px",
                                          fontSize: "13px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "6px",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            "#218838";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            "#28a745";
                                        }}
                                      >
                                        <span>⬇</span>
                                        Download
                                      </a>
                                    </div>
                                    {isImage && (
                                      <div style={{ marginTop: "8px" }}>
                                        <img
                                          src={fileUrl}
                                          alt={fileName}
                                          style={{
                                            maxWidth: "100%",
                                            maxHeight: "300px",
                                            borderRadius: "4px",
                                            border: "1px solid #dee2e6",
                                          }}
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* Action Buttons */}
                      {proposal.status === "pending" && (
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button
                            onClick={() =>
                              handleProposalStatusUpdate(
                                proposal._id,
                                "accepted"
                              )
                            }
                            disabled={isUpdating}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              opacity: isUpdating ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isUpdating) {
                                e.currentTarget.style.backgroundColor =
                                  "#218838";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isUpdating) {
                                e.currentTarget.style.backgroundColor =
                                  "#28a745";
                              }
                            }}
                          >
                            {isUpdating ? "Updating..." : "Accept"}
                          </button>
                          <button
                            onClick={() =>
                              handleProposalStatusUpdate(
                                proposal._id,
                                "rejected"
                              )
                            }
                            disabled={isUpdating}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              opacity: isUpdating ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isUpdating) {
                                e.currentTarget.style.backgroundColor =
                                  "#c82333";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isUpdating) {
                                e.currentTarget.style.backgroundColor =
                                  "#dc3545";
                              }
                            }}
                          >
                            {isUpdating ? "Updating..." : "Reject"}
                          </button>
                        </div>
                      )}

                      {/* Chat Button for Accepted Proposals */}
                      {proposal.status === "accepted" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleOpenChat(proposal._id)}
                            disabled={loadingChat === proposal._id}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#17a2b8",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor:
                                loadingChat === proposal._id
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              opacity: loadingChat === proposal._id ? 0.6 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "fit-content",
                            }}
                            onMouseEnter={(e) => {
                              if (loadingChat !== proposal._id) {
                                e.currentTarget.style.backgroundColor =
                                  "#138496";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (loadingChat !== proposal._id) {
                                e.currentTarget.style.backgroundColor =
                                  "#17a2b8";
                              }
                            }}
                          >
                            <span>💬</span>
                            {loadingChat === proposal._id
                              ? "Opening Chat..."
                              : "Open Chat"}
                          </button>
                          {chatError && loadingChat === null && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                color: "#dc3545",
                                padding: "8px 12px",
                                backgroundColor: "#f8d7da",
                                borderRadius: "4px",
                                border: "1px solid #f5c6cb",
                              }}
                            >
                              {chatError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Edit and Delete Buttons */}
        {job.status === "open" && (
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #ddd",
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              onClick={() => navigate(`/edit-job/${job._id}`)}
              style={{
                padding: "12px 32px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0056b3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#007bff";
              }}
            >
              Edit Job
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: "12px 32px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = "#c82333";
                }
              }}
              onMouseLeave={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete Job"}
            </button>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
        <p>Last updated: {formatDate(job.updatedAt)}</p>
      </div>
    </div>
  );
}
