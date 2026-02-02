import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import JobDetailsCard from "../../components/JobDetailsCard";
import ProposalForm from "../../components/ProposalForm";

interface Budget {
  type: string;
  amount: number;
  currency: string;
}

interface Duration {
  type: "short" | "medium" | "long";
  estimatedHours?: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  category?: string;
  skills?: string[];
  budget: Budget;
  experienceLevel?: string;
  duration?: Duration;
  location?: string;
  status: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MatchedJobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/job/${jobId}`);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleProposalSuccess = () => {
    setSubmitSuccess(true);
    setShowProposalForm(false);
    setError("");
  };

  const handleProposalError = (message: string) => {
    setError(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-muted)] rounded-lg w-3/4"></div>
            <div className="h-5 bg-[var(--color-muted)] rounded w-48"></div>
            <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-[var(--color-muted)] rounded-xl"
                  ></div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-[var(--color-muted)] rounded w-full"></div>
                <div className="h-4 bg-[var(--color-muted)] rounded w-5/6"></div>
                <div className="h-4 bg-[var(--color-muted)] rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
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
              Failed to Load Job
            </h3>
            <p className="text-[var(--color-error)] mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
            <div className="flex items-center gap-3 text-[var(--color-success)]">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                Proposal submitted successfully!
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && job && (
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
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Job Details Card */}
        <JobDetailsCard
          job={job}
          onSendProposal={() => setShowProposalForm(true)}
          showProposalButton={!showProposalForm && !submitSuccess}
        />

        {/* Proposal Form */}
        {showProposalForm && jobId && (
          <div className="mt-6 p-8 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
            <ProposalForm
              jobId={jobId}
              onSuccess={handleProposalSuccess}
              onCancel={() => setShowProposalForm(false)}
              onError={handleProposalError}
            />
          </div>
        )}

        {/* Footer */}
        <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
          Last updated: {formatDate(job.updatedAt)}
        </p>
      </div>
    </div>
  );
}
