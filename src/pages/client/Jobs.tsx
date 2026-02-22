import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/api";

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
      setError(
        err.response?.data?.message || "Failed to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (budget: Budget) => {
    if (budget.type === "fixed") {
      return `$${budget.amount?.toLocaleString()}`;
    } else {
      return `$${budget.min}-$${budget.max}/hr`;
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
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-56 rounded-lg bg-[var(--color-muted)] animate-pulse" />
            <div className="mt-2 h-5 w-36 rounded-lg bg-[var(--color-muted)] animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] animate-pulse"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-64 rounded-lg bg-[var(--color-muted)]" />
                  <div className="h-6 w-16 rounded-full bg-[var(--color-muted)]" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full rounded bg-[var(--color-muted)]" />
                  <div className="h-4 w-3/4 rounded bg-[var(--color-muted)]" />
                </div>
                <div className="flex gap-2 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-7 w-20 rounded-lg bg-[var(--color-muted)]" />
                  ))}
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-48 rounded bg-[var(--color-muted)]" />
                  <div className="h-4 w-20 rounded bg-[var(--color-muted)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mb-6">
            Available Jobs
          </h1>
          <div className="rounded-2xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-10 h-10 shrink-0 rounded-xl bg-[var(--color-error)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--color-error)]">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Try Again
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Available Jobs
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Browse and find the perfect project for your team
            </p>
          </div>
          <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[var(--color-muted)] text-[var(--color-text-secondary)]">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        {jobs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              No jobs available yet
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Check back later for new opportunities!
            </p>
          </div>
        ) : (
          /* Job List */
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block group"
              >
                <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-200">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                      {job.title}
                    </h3>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                        job.status === "open"
                          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    {truncateDescription(job.description)}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {formatBudget(job.budget)}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-xs capitalize">
                        {job.experienceLevel}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-xs capitalize">
                        {job.category.replace("-", " ")}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
