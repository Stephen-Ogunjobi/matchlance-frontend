import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

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

export default function MyJobs() {
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

      const response = await apiClient.get(`/chat/proposal/${proposalId}`);

      if (response.data && response.data.conversation) {
        navigate(`/chat/${response.data.conversation._id}`);
      } else {
        setChatError("Conversation not found");
      }
    } catch (err: any) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "active":
        return "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30";
      case "closed":
      case "completed":
        return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30";
      case "cancelled":
        return "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/30";
      default:
        return "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30";
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4 mb-8">
            <div className="h-10 bg-[var(--color-muted)] rounded-lg w-40"></div>
            <div className="h-5 bg-[var(--color-muted)] rounded w-64"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]"
              >
                <div className="h-6 bg-[var(--color-muted)] rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-[var(--color-muted)] rounded w-full mb-2"></div>
                <div className="h-4 bg-[var(--color-muted)] rounded w-2/3 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-10 bg-[var(--color-muted)] rounded-xl w-24"></div>
                  <div className="h-10 bg-[var(--color-muted)] rounded-xl w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="p-10 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-text-tertiary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Please Log In
            </h3>
            <p className="mt-2 text-[var(--color-text-secondary)] mb-6">
              You need to be logged in to view your jobs.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-error)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Error Loading Jobs
            </h3>
            <p className="text-[var(--color-error)]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            My Jobs
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            {jobs.length > 0
              ? `You have ${jobs.length} active job${jobs.length !== 1 ? "s" : ""}`
              : "View and manage your contracted jobs"}
          </p>
        </div>

        {/* Chat Error Alert */}
        {chatError && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30">
            <div className="flex items-center gap-3 text-[var(--color-error)]">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{chatError}</span>
              <button
                onClick={() => setChatError(null)}
                className="ml-auto text-[var(--color-error)] hover:text-[var(--color-error)]/80"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-text-tertiary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              No Jobs Yet
            </h3>
            <p className="mt-2 text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
              You don't have any active jobs yet. Browse available opportunities
              and submit proposals to get started!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)] hover:shadow-lg group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <button
                      onClick={() => navigate(`/matched-job/${job._id}`)}
                      className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors text-left"
                    >
                      {job.title}
                    </button>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Started {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusClasses(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                  {job.description.length > 150
                    ? job.description.substring(0, 150) + "..."
                    : job.description}
                </p>

                {/* Budget */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-muted)] text-sm text-[var(--color-text-secondary)]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {job.budget.currency}
                    {job.budget.amount}
                    <span className="text-[var(--color-text-tertiary)]">
                      ({job.budget.type})
                    </span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => navigate(`/matched-job/${job._id}`)}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleChatClick(job.proposalId)}
                    disabled={chatLoading === job.proposalId}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {chatLoading === job.proposalId ? "Opening..." : "Chat"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
