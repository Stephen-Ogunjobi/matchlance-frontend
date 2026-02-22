import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

interface JobPost {
  id: string;
  title: string;
}

export default function ClientHome() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobPosts = async () => {
      setFetchingJobs(true);
      try {
        const response = await apiClient.get("/job/jobs");
        setJobPosts(response.data.userJobs);
      } catch (err: any) {
        setJobPosts([]);
      } finally {
        setFetchingJobs(false);
      }
    };

    if (!userLoading) {
      fetchJobPosts();
    }
  }, [userLoading]);

  const handlePostJob = () => {
    navigate("/post-job");
  };

  const hasJobPosts = jobPosts.length > 0;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[var(--color-muted)] rounded-lg w-64"></div>
            <div className="h-5 bg-[var(--color-muted)] rounded w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            Manage your job posts and find the perfect freelancer
          </p>
        </div>

        {fetchingJobs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                <div className="h-5 bg-[var(--color-muted)] rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-[var(--color-muted)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
              <button
                onClick={handlePostJob}
                className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-left transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {hasJobPosts ? "Post New Job" : "Post Your First Job"}
                </h3>
                <p className="text-sm text-white/80">
                  Create a job listing and find talent
                </p>
              </button>

              <button
                onClick={() => navigate("/jobs")}
                className="group p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-left transition-all hover:border-[var(--color-primary)] hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-muted)] flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 transition-colors">
                  <svg className="w-6 h-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">View All Jobs</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Browse and manage your listings
                </p>
              </button>

              {hasJobPosts && (
                <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Active Jobs</h3>
                  <p className="text-3xl font-bold text-[var(--color-primary)]">{jobPosts.length}</p>
                </div>
              )}
            </div>

            {/* Recent Jobs Section */}
            {hasJobPosts && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Your Recent Job Posts
                </h2>
                <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                  <p className="text-[var(--color-text-secondary)]">
                    You have {jobPosts.length} job{jobPosts.length !== 1 ? "s" : ""} posted.{" "}
                    <button
                      onClick={() => navigate("/jobs")}
                      className="text-[var(--color-primary)] hover:underline font-medium"
                    >
                      View all
                    </button>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
