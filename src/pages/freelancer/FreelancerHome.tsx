import { useState, useEffect, useCallback } from "react";
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

interface SearchJob {
  _id: string;
  title: string;
  description?: string;
  budget?: Budget;
  location?: string;
  category?: string;
  experienceLevel?: string;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design" },
  { value: "writing", label: "Writing" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" },
  { value: "devops", label: "DevOps" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "All Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export default function FreelancerHome() {
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [fetchingMatchedJobs, setFetchingMatchedJobs] = useState(false);
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState<
    boolean | null
  >(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Search state
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [searchResults, setSearchResults] = useState<SearchJob[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const LIMIT = 10;

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
        setMatchedJobs([]);
      } finally {
        setFetchingMatchedJobs(false);
      }
    };

    if (!userLoading && hasFreelancerProfile !== null) {
      fetchMatchedJobs();
    }
  }, [hasFreelancerProfile, userLoading]);

  const searchJobs = useCallback(
    async (kw: string, cat: string, exp: string, page: number) => {
      const hasFilters = kw.trim() || cat || exp;
      if (!hasFilters) {
        setIsSearchMode(false);
        setSearchResults([]);
        setSearchTotal(0);
        return;
      }

      setIsSearchMode(true);
      setSearching(true);
      try {
        const params: Record<string, string | number> = { page, limit: LIMIT };
        if (kw.trim()) params.keyword = kw.trim();
        if (cat) params.category = cat;
        if (exp) params.experienceLevel = exp;

        const response = await apiClient.get("/freelancer/search-jobs", {
          params,
        });
        setSearchResults(response.data.jobs ?? response.data);
        setSearchTotal(response.data.total ?? 0);
      } catch {
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  // Debounce keyword changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchPage(1);
      searchJobs(keyword, category, experienceLevel, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword, category, experienceLevel, searchJobs]);

  // Re-fetch on page change
  useEffect(() => {
    if (searchPage > 1) {
      searchJobs(keyword, category, experienceLevel, searchPage);
    }
  }, [searchPage]);

  const handleClearSearch = () => {
    setKeyword("");
    setCategory("");
    setExperienceLevel("");
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchPage(1);
  };

  const handleCompleteProfile = () => {
    if (user?._id) {
      navigate(`/freelancer-profile/${user._id}`);
    }
  };

  const totalPages = Math.ceil(searchTotal / LIMIT);

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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            Find jobs that match your skills and expertise
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-3">
          {/* Keyword search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search jobs by keyword, skill, or title..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setSearchPage(1); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <select
              value={experienceLevel}
              onChange={(e) => { setExperienceLevel(e.target.value); setSearchPage(1); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            >
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>

            {isSearchMode && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] transition-colors text-sm font-medium whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>
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

            {/* Search Results */}
            {isSearchMode && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    Search Results
                    {searchTotal > 0 && (
                      <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
                        ({searchTotal} job{searchTotal !== 1 ? "s" : ""} found)
                      </span>
                    )}
                  </h2>
                </div>

                {searching ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
                        <div className="h-5 bg-[var(--color-muted)] rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-[var(--color-muted)] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {searchResults.map((job) => (
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
                                {job.category && (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium">
                                    {job.category}
                                  </span>
                                )}
                                {job.experienceLevel && (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--color-muted)] text-sm text-[var(--color-text-secondary)]">
                                    {job.experienceLevel}
                                  </span>
                                )}
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
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                          disabled={searchPage === 1}
                          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-[var(--color-text-secondary)] px-2">
                          Page {searchPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setSearchPage((p) => Math.min(totalPages, p + 1))}
                          disabled={searchPage === totalPages}
                          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-10 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      No jobs found
                    </h3>
                    <p className="mt-2 text-[var(--color-text-secondary)] max-w-md mx-auto">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Matched Jobs List (hidden when searching) */}
            {!isSearchMode && hasFreelancerProfile && matchedJobs.length > 0 && (
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

            {/* Empty State (only shown when not searching) */}
            {!isSearchMode && hasFreelancerProfile && matchedJobs.length === 0 && (
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
