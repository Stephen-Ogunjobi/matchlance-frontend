import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

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
  status: string;
  budget: Budget;
  createdAt: string;
  proposals?: string[];
}

export default function ClientHome() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoading) {
      setFetchingJobs(true);
      apiClient
        .get("/job/jobs")
        .then((res) => setJobs(res.data.userJobs ?? []))
        .catch(() => setJobs([]))
        .finally(() => setFetchingJobs(false));
    }
  }, [userLoading]);

  const formatBudget = (budget: Budget) => {
    if (budget.type === "fixed") return `$${budget.amount?.toLocaleString()}`;
    return `$${budget.min}–$${budget.max}/hr`;
  };

  const formatDate = (dateString: string) => {
    const diffDays = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 86400000
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const activeJobs = jobs.filter((j) => j.status === "open");
  const totalProposals = jobs.reduce(
    (sum, j) => sum + (j.proposals?.length ?? 0),
    0
  );
  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-10 bg-[var(--color-muted)] rounded-lg w-64" />
          <div className="h-5 bg-[var(--color-muted)] rounded w-96" />
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
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            Here's what's happening with your jobs
          </p>
        </div>

        {fetchingJobs ? (
          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] h-36"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-10">
              {/* Post a job — primary CTA */}
              <button
                onClick={() => navigate("/post-job")}
                className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-left transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {jobs.length > 0 ? "Post New Job" : "Post Your First Job"}
                </h3>
                <p className="text-sm text-white/80">
                  Create a listing and find talent
                </p>
              </button>

              {/* Active jobs */}
              <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[var(--color-success)]"
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
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                  Active jobs
                </p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                  {activeJobs.length}
                </p>
              </div>

              {/* Total proposals */}
              <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                  Total proposals
                </p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                  {totalProposals}
                </p>
              </div>
            </div>

            {/* Recent jobs list */}
            {recentJobs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    Recent Jobs
                  </h2>
                  <Link
                    to="/jobs"
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  {recentJobs.map((job) => (
                    <Link
                      key={job._id}
                      to={`/jobs/${job._id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-muted)] transition-colors first:rounded-t-2xl last:rounded-b-2xl group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                          {job.title}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                          {formatBudget(job.budget)} · {formatDate(job.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        {job.proposals !== undefined && (
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {job.proposals.length}{" "}
                            {job.proposals.length === 1
                              ? "proposal"
                              : "proposals"}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            job.status === "open"
                              ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                              : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
                          }`}
                        >
                          {job.status}
                        </span>
                        <svg
                          className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
