import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

interface Budget {
  type: string;
  amount: number;
  currency: string;
}

interface MatchedJob {
  _id: string;
  title: string;
  description?: string;
  budget?: Budget;
  location?: string;
  matchScore?: number;
}

export default function FreelancerHome() {
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [fetchingMatchedJobs, setFetchingMatchedJobs] = useState(false);
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState<
    boolean | null
  >(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkFreelancerProfile = async () => {
      if (!user?._id) {
        return;
      }

      setCheckingProfile(true);
      try {
        const response = await apiClient.get(`/freelancer/profile/${user._id}`);
        setHasFreelancerProfile(!!response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setHasFreelancerProfile(false);
        } else {
          console.error("Error checking freelancer profile:", err);
          setHasFreelancerProfile(false);
        }
      } finally {
        setCheckingProfile(false);
      }
    };

    if (!userLoading) {
      checkFreelancerProfile();
    }
  }, [user?._id, userLoading]);

  useEffect(() => {
    const fetchMatchedJobs = async () => {
      if (!hasFreelancerProfile) {
        return;
      }

      setFetchingMatchedJobs(true);
      try {
        const response = await apiClient.get(
          "/freelancer/matched-jobs/693ba82e343039e76e86fecf"
        );
        setMatchedJobs(response.data.jobs);
      } catch (err: any) {
        console.error("Error fetching matched jobs:", err);
        setMatchedJobs([]);
      } finally {
        setFetchingMatchedJobs(false);
      }
    };

    if (!userLoading && hasFreelancerProfile !== null) {
      fetchMatchedJobs();
    }
  }, [hasFreelancerProfile, userLoading]);

  const handleCompleteProfile = () => {
    if (user?._id) {
      navigate(`/freelancer-profile/${user._id}`);
    }
  };

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
            Find jobs that match your skills and expertise
          </p>
        </div>

        {checkingProfile || fetchingMatchedJobs ? (
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
            {/* Complete Profile CTA */}
            {!hasFreelancerProfile && (
              <div className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-[var(--color-success)] to-emerald-600 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
                    <p className="text-white/80 mb-4">
                      Set up your freelancer profile to start seeing job opportunities that match your skills.
                    </p>
                    <button
                      onClick={handleCompleteProfile}
                      className="px-5 py-2.5 rounded-xl font-semibold bg-white text-emerald-600 hover:bg-white/90 transition-colors"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            

            {/* Matched Jobs List */}
            {hasFreelancerProfile && matchedJobs.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Available Jobs for You
                </h2>
                <div className="space-y-4">
                  {matchedJobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => navigate(`/matched-job/${job._id}`)}
                      className="p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-lg group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                            {job.title}
                          </h3>
                          {job.description && (
                            <p className="mt-2 text-[var(--color-text-secondary)] line-clamp-2">
                              {job.description.length > 150
                                ? job.description.substring(0, 150) + "..."
                                : job.description}
                            </p>
                          )}
                          <div className="mt-4 flex flex-wrap gap-3">
                            {job.budget && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-muted)] text-sm text-[var(--color-text-secondary)]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.budget.currency}{job.budget.amount}
                                <span className="text-[var(--color-text-tertiary)]">({job.budget.type})</span>
                              </span>
                            )}
                            {job.location && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-muted)] text-sm text-[var(--color-text-secondary)]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {job.matchScore && (
                          <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] text-sm font-semibold">
                            {job.matchScore}% Match
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {hasFreelancerProfile && matchedJobs.length === 0 && (
              <div className="p-10 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  No matched jobs yet
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)] max-w-md mx-auto">
                  We're working on finding the best jobs for your skills. Check back soon!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
