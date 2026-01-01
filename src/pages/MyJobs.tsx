import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { useUser } from "../contexts/UserContext";

interface Budget {
  type: string;
  amount: number;
  currency: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  budget: Budget;
  status: string;
  createdAt: string;
  proposalId: string;
}

function MyJobs() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyJobs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await apiClient.get("/freelancer/my-jobs");
        setJobs(response.data.jobs);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching my jobs:", err);
        setError(err.response?.data?.message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchMyJobs();
    }
  }, [user, userLoading]);

  const handleChatClick = async (proposalId: string) => {
    try {
      setChatLoading(proposalId);
      setChatError(null);

      console.log(proposalId);

      const response = await apiClient.get(`/chat/proposal/${proposalId}`);

      if (response.data && response.data.conversation) {
        // Navigate to chat page with the conversation ID
        navigate(`/chat/${response.data.conversation._id}`);
      } else {
        setChatError("Conversation not found");
      }
    } catch (err: any) {
      console.error("Error fetching chat:", err);
      if (err.response?.status === 404) {
        setChatError("No conversation found for this proposal");
      } else {
        setChatError(
          err.response?.data?.message ||
            "Failed to open chat. Please try again."
        );
      }
    } finally {
      setChatLoading(null);
    }
  };

  if (userLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your jobs.</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (jobs.length === 0) {
    return <div>No jobs found.</div>;
  }

  return (
    <div>
      <h1>My Jobs</h1>

      {chatError && (
        <div
          style={{
            color: "red",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "12px",
          }}
        >
          {chatError}
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {jobs.map((job) => (
          <li
            key={job._id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              marginBottom: 12,
              borderRadius: 8,
            }}
          >
            <h3>
              <Link to={`/matched-job/${job._id}`}>{job.title}</Link>
            </h3>
            <p>{job.description}</p>
            <p>
              <strong>Budget:</strong> {job.budget.amount} {job.budget.currency}{" "}
              ({job.budget.type})
            </p>
            <p>
              <strong>Status:</strong> {job.status}
            </p>
            <p>
              <small>
                Created: {new Date(job.createdAt).toLocaleDateString()}
              </small>
            </p>

            <button
              onClick={() => handleChatClick(job.proposalId)}
              disabled={chatLoading === job.proposalId}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  chatLoading === job.proposalId ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor:
                  chatLoading === job.proposalId ? "not-allowed" : "pointer",
                fontSize: "14px",
                marginTop: "8px",
              }}
            >
              {chatLoading === job.proposalId ? "Loading..." : "Chat"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyJobs;
