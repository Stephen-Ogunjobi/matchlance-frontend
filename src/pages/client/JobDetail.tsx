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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      const endpoint =
        newStatus === "accepted"
          ? `/proposal/${proposalId}/accept`
          : `/proposal/${proposalId}/reject`;

      await apiClient.patch(endpoint);

      setProposals((prevProposals) =>
        prevProposals.map((p) =>
          p._id === proposalId ? { ...p, status: newStatus } : p
        )
      );

      await fetchJobDetail();
    } catch (err: any) {
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

    try {
      setDeleting(true);
      await apiClient.delete(`/job/${jobId}`);
      setShowDeleteModal(false);
      navigate("/jobs");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to delete job. Please try again."
      );
      setShowDeleteModal(false);
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

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
      case "accepted":
        return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
      case "rejected":
        return "bg-[var(--color-error)]/10 text-[var(--color-error)]";
      default:
        return "bg-[var(--color-primary)]/10 text-[var(--color-primary)]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-5 w-28 rounded-lg bg-[var(--color-muted)] animate-pulse mb-8" />
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 animate-pulse space-y-6">
            <div className="flex justify-between items-start">
              <div className="h-8 w-80 rounded-lg bg-[var(--color-muted)]" />
              <div className="h-7 w-20 rounded-full bg-[var(--color-muted)]" />
            </div>
            <div className="h-4 w-40 rounded bg-[var(--color-muted)]" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 rounded-xl bg-[var(--color-muted)] h-20" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-[var(--color-muted)]" />
              <div className="h-4 w-full rounded bg-[var(--color-muted)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--color-muted)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Jobs
          </Link>
          <div className="rounded-2xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-10 h-10 shrink-0 rounded-xl bg-[var(--color-error)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--color-error)]">
                  {error || "Job not found"}
                </p>
                <button
                  onClick={() => navigate("/jobs")}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  View All Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Jobs
        </Link>

        {/* Main Card */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                {job.title}
              </h1>
              <span
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  job.status === "open"
                    ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                    : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
                }`}
              >
                {job.status}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Posted on {formatDate(job.createdAt)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-[var(--color-muted)]">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                Budget
              </p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">
                {formatBudget(job.budget)}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {job.budget.type === "fixed" ? "Fixed Price" : "Hourly Rate"}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--color-muted)]">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                Experience Level
              </p>
              <p className="text-lg font-bold text-[var(--color-text-primary)] capitalize">
                {job.experienceLevel}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--color-muted)]">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                Project Duration
              </p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">
                {formatDuration(job.duration)}
              </p>
              {job.duration.estimatedHours && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Est. {job.duration.estimatedHours} hours
                </p>
              )}
            </div>

            <div className="p-5 rounded-xl bg-[var(--color-muted)]">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                Category
              </p>
              <p className="text-lg font-bold text-[var(--color-text-primary)] capitalize">
                {job.category.replace("-", " ")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Job Description
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Proposals Section */}
          {job.proposals && job.proposals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Proposals ({job.proposals.length})
                </h2>
                {!showProposals ? (
                  <button
                    onClick={fetchProposals}
                    disabled={loadingProposals}
                    className="px-5 py-2.5 rounded-xl bg-[var(--color-success)] text-white text-sm font-medium hover:bg-[var(--color-success-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingProposals ? "Loading..." : "View Proposals"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowProposals(false)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
                  >
                    Hide Proposals
                  </button>
                )}
              </div>

              {showProposals && (
                <div className="space-y-4">
                  {proposals.map((proposal) => {
                    const isUpdating = updatingProposal === proposal._id;
                    return (
                      <div
                        key={proposal._id}
                        className="rounded-xl bg-[var(--color-muted)] border border-[var(--color-border)] p-6"
                      >
                        {/* Proposal Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                              {proposal.freelancerId.name}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {proposal.freelancerId.email}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                              Submitted on {formatDate(proposal.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusClasses(proposal.status)}`}
                          >
                            {proposal.status}
                          </span>
                        </div>

                        {/* Proposal Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-[var(--color-card)]">
                            <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-0.5">
                              Proposed Budget
                            </p>
                            <p className="text-sm font-bold text-[var(--color-text-primary)]">
                              ${proposal.proposedBudget.min} - ${proposal.proposedBudget.max}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--color-card)]">
                            <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-0.5">
                              Estimated Time
                            </p>
                            <p className="text-sm font-bold text-[var(--color-text-primary)]">
                              {formatEstimatedTime(proposal.estimatedTime)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--color-card)]">
                            <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-0.5">
                              Availability
                            </p>
                            <p className="text-sm font-bold text-[var(--color-text-primary)]">
                              {formatAvailability(proposal.availability)}
                            </p>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                            Cover Letter
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {proposal.coverLetter}
                          </p>
                        </div>

                        {/* Attachments */}
                        {proposal.attachments && proposal.attachments.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                              Attachments
                            </p>
                            <div className="space-y-3">
                              {proposal.attachments.map((attachment, index) => {
                                const fileName =
                                  attachment.split("/").pop() ||
                                  `attachment-${index + 1}`;
                                const fileExtension = fileName
                                  .split(".")
                                  .pop()
                                  ?.toLowerCase();
                                const isImage = [
                                  "jpg", "jpeg", "png", "gif", "webp", "svg",
                                ].includes(fileExtension || "");

                                const fileUrl = attachment.startsWith("http")
                                  ? attachment
                                  : `http://localhost:3001${
                                      attachment.startsWith("/") ? "" : "/"
                                    }${attachment}`;

                                return (
                                  <div key={index}>
                                    <div className="flex gap-2 items-center">
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                        </svg>
                                        {fileName}
                                      </a>
                                      <a
                                        href={fileUrl}
                                        download={fileName}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--color-success)] text-white text-xs font-medium hover:bg-[var(--color-success-hover)] transition-colors"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Download
                                      </a>
                                    </div>
                                    {isImage && (
                                      <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="mt-2 max-w-full max-h-[300px] rounded-lg border border-[var(--color-border)]"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons - Pending */}
                        {proposal.status === "pending" && (
                          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                            <button
                              onClick={() =>
                                handleProposalStatusUpdate(proposal._id, "accepted")
                              }
                              disabled={isUpdating}
                              className="px-5 py-2.5 rounded-xl bg-[var(--color-success)] text-white text-sm font-medium hover:bg-[var(--color-success-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isUpdating ? "Updating..." : "Accept"}
                            </button>
                            <button
                              onClick={() =>
                                handleProposalStatusUpdate(proposal._id, "rejected")
                              }
                              disabled={isUpdating}
                              className="px-5 py-2.5 rounded-xl bg-[var(--color-error)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isUpdating ? "Updating..." : "Reject"}
                            </button>
                          </div>
                        )}

                        {/* Chat Button - Accepted */}
                        {proposal.status === "accepted" && (
                          <div className="pt-4 border-t border-[var(--color-border)]">
                            <button
                              onClick={() => handleOpenChat(proposal._id)}
                              disabled={loadingChat === proposal._id}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                              </svg>
                              {loadingChat === proposal._id
                                ? "Opening Chat..."
                                : "Open Chat"}
                            </button>
                            {chatError && loadingChat === null && (
                              <p className="mt-2 text-sm text-[var(--color-error)] p-3 rounded-lg bg-[var(--color-error)]/10">
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
            <div className="flex gap-3 pt-6 border-t border-[var(--color-border)]">
              <button
                onClick={() => navigate(`/edit-job/${job._id}`)}
                className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/25"
              >
                Edit Job
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 rounded-xl bg-[var(--color-error)] text-white font-semibold hover:opacity-90 transition-all"
              >
                Delete Job
              </button>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
          Last updated: {formatDate(job.updatedAt)}
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[var(--color-error)]/10 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[var(--color-error)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] text-center">
              Delete this job?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-center">
              This action cannot be undone. All proposals associated with this job will also be removed.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-error)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
