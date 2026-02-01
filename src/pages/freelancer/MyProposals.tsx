import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { isFreelancer } = useUser();
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

      const response = await apiClient.get(`/proposal/my-proposals`);
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

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30";
      case "accepted":
        return "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30";
      case "rejected":
        return "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/30";
      default:
        return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30";
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
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4 mb-8">
            <div className="h-10 bg-[var(--color-muted)] rounded-lg w-48"></div>
            <div className="h-5 bg-[var(--color-muted)] rounded w-64"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                <div className="h-6 bg-[var(--color-muted)] rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-[var(--color-muted)] rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="h-12 bg-[var(--color-muted)] rounded"></div>
                  <div className="h-12 bg-[var(--color-muted)] rounded"></div>
                  <div className="h-12 bg-[var(--color-muted)] rounded"></div>
                  <div className="h-12 bg-[var(--color-muted)] rounded"></div>
                </div>
              </div>
            ))}
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
            My Proposals
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            {proposals.length > 0
              ? `You have sent ${proposals.length} proposal${proposals.length !== 1 ? "s" : ""}`
              : "Track your submitted proposals"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)]">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {proposals.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              No Proposals Yet
            </h3>
            <p className="mt-2 text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
              You haven't sent any proposals yet. Browse available jobs and start applying!
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
            {proposals.map((proposal) => (
              <div
                key={proposal._id}
                className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)] hover:shadow-lg group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                      {proposal.jobId.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Submitted on {formatDate(proposal.createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusClasses(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </div>

                {/* Job Description Preview */}
                {proposal.jobId.description && (
                  <div className="mb-4 p-4 rounded-xl bg-[var(--color-muted)]">
                    <p className="text-sm text-[var(--color-text-secondary)] italic line-clamp-2">
                      {proposal.jobId.description.length > 200
                        ? proposal.jobId.description.substring(0, 200) + "..."
                        : proposal.jobId.description}
                    </p>
                  </div>
                )}

                {/* Proposal Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-[var(--color-muted)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
                      Proposed Budget
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      ${proposal.proposedBudget.min} - ${proposal.proposedBudget.max}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-muted)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
                      Estimated Time
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatEstimatedTime(proposal.estimatedTime)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-muted)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
                      Availability
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatAvailability(proposal.availability)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-muted)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
                      Job Status
                    </p>
                    <p className={`text-sm font-semibold capitalize ${proposal.jobId.status === "open" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
                      {proposal.jobId.status}
                    </p>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Cover Letter
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                    {proposal.coverLetter.length > 300
                      ? proposal.coverLetter.substring(0, 300) + "..."
                      : proposal.coverLetter}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => navigate(`/matched-job/${proposal.jobId._id}`)}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    View Job Details
                  </button>

                  {proposal.status === "pending" && (
                    <button
                      onClick={() => navigate(`/edit-proposal/${proposal._id}`)}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
                    >
                      Edit Proposal
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
