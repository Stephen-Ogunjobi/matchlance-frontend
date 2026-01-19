import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../utils/api";

interface Freelancer {
  _id: string;
  firstName?: string;
  lastName: string;
  email: string;
}

interface Client {
  _id: string;
  firstName?: string;
  lastName: string;
  email: string;
}

interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  skills: string[];
}

interface Budget {
  type: "fixed" | "hourly";
  amount?: number;
  min?: number;
  max?: number;
  currency: string;
}

interface Duration {
  startDate: string;
  estimatedDuration: number;
}

interface Dispute {
  isDisputed: boolean;
  reason?: string;
}

interface Contract {
  _id: string;
  jobId: string;
  clientId: Client;
  freelancerId: Freelancer;
  proposalId: string;
  conversationId: string;
  projectDetails: ProjectDetails;
  budget: Budget;
  duration: Duration;
  status: string;
  deliverables: string[];
  dispute: Dispute;
  createdAt: string;
  updatedAt: string;
}

export default function Contract() {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/contract/id/${contractId}`);
      if (response.data.success || response.data.contract) {
        setContract(response.data.contract);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching contract:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load contract details"
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

  const formatBudget = (budget: Budget) => {
    if (budget.type === "fixed") {
      return `$${budget.amount?.toLocaleString()} ${budget.currency}`;
    } else {
      return `$${budget.min}-$${budget.max}/hr ${budget.currency}`;
    }
  };

  const formatCategory = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return { bg: "#d4edda", color: "#155724", border: "#28a745" };
      case "completed":
        return { bg: "#cce5ff", color: "#004085", border: "#007bff" };
      case "cancelled":
        return { bg: "#f8d7da", color: "#721c24", border: "#dc3545" };
      case "pending":
        return { bg: "#fff3cd", color: "#856404", border: "#ffc107" };
      default:
        return { bg: "#e7f3ff", color: "#004085", border: "#007bff" };
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/my-jobs"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to My Jobs
        </Link>
        <p>Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/my-jobs"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to My Jobs
        </Link>
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            borderRadius: "4px",
            color: "#c33",
          }}
        >
          {error || "Contract not found"}
        </div>
      </div>
    );
  }

  const statusStyle = getStatusColor(contract.status);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <Link
        to="/my-jobs"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#007bff",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        &larr; Back to My Jobs
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "24px",
            paddingBottom: "20px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>
              {contract.projectDetails.title}
            </h1>
            <p style={{ color: "#666", margin: 0 }}>
              Contract started on {formatDate(contract.duration.startDate)}
            </p>
          </div>
          <span
            style={{
              padding: "8px 20px",
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {contract.status}
          </span>
        </div>

        {/* Budget and Duration Info */}
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
              {formatBudget(contract.budget)}
            </p>
            <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "12px" }}>
              {contract.budget.type === "fixed" ? "Fixed Price" : "Hourly Rate"}
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
              Estimated Duration
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              {contract.duration.estimatedDuration} hours
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
              Category
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              {formatCategory(contract.projectDetails.category)}
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
              Start Date
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              {formatDate(contract.duration.startDate)}
            </p>
          </div>
        </div>

        {/* Project Description */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Project Description
          </h2>
          <p
            style={{
              margin: 0,
              color: "#333",
              fontSize: "14px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {contract.projectDetails.description}
          </p>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Required Skills
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {contract.projectDetails.skills.map((skill) => (
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

        {/* Parties */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Contract Parties
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Client Info */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Client
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#007bff",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {contract.clientId?.firstName?.[0] ||
                    contract.clientId?.lastName?.[0] ||
                    "C"}
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
                    {contract.clientId?.firstName || ""}{" "}
                    {contract.clientId?.lastName || "Client"}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    {contract.clientId?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Freelancer Info */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Freelancer
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#28a745",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {contract.freelancerId?.firstName?.[0] ||
                    contract.freelancerId?.lastName?.[0] ||
                    "F"}
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
                    {contract.freelancerId?.firstName || ""}{" "}
                    {contract.freelancerId?.lastName || "Freelancer"}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    {contract.freelancerId?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dispute Warning */}
        {contract.dispute.isDisputed && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                color: "#721c24",
              }}
            >
              Dispute Active
            </h3>
            {contract.dispute.reason && (
              <p style={{ margin: 0, color: "#721c24", fontSize: "14px" }}>
                Reason: {contract.dispute.reason}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #ddd",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to={`/chat/${contract.conversationId}`}
            style={{
              padding: "12px 24px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#138496";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#17a2b8";
            }}
          >
            Open Chat
          </Link>
        </div>

        {/* Footer Info */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#999",
          }}
        >
          <span>Contract ID: {contract._id}</span>
          <span>Last updated: {formatDate(contract.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
