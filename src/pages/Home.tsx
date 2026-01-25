import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { useUser } from "../contexts/UserContext";

interface JobPost {
  id: string;
  title: string;
}

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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [fetchingMatchedJobs, setFetchingMatchedJobs] = useState(false);
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState<
    boolean | null
  >(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const {
    user,
    isClient,
    isFreelancer,
    setUser,
    loading: userLoading,
  } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobPosts = async () => {
      if (!isClient) {
        return;
      }

      setFetchingJobs(true);
      try {
        const response = await apiClient.get("/job/jobs");
        setJobPosts(response.data.userJobs);
      } catch (err: any) {
        console.error("Error fetching job posts:", err);
        setJobPosts([]);
      } finally {
        setFetchingJobs(false);
      }
    };

    if (!userLoading) {
      fetchJobPosts();
    }
  }, [isClient, userLoading]);

  useEffect(() => {
    const checkFreelancerProfile = async () => {
      if (!isFreelancer || !user?._id) {
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
  }, [isFreelancer, user?._id, userLoading]);

  useEffect(() => {
    const fetchMatchedJobs = async () => {
      if (!isFreelancer || !hasFreelancerProfile) {
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
  }, [isFreelancer, hasFreelancerProfile, userLoading]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err: any) {
      console.error("Logout error:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = () => {
    navigate("/post-job");
  };

  const handleCompleteProfile = () => {
    if (user?._id) {
      navigate(`/freelancer-profile/${user._id}`);
    }
  };

  const hasJobPosts = jobPosts.length > 0;
  const postJobButtonText = hasJobPosts
    ? "Post New Job"
    : "Post Your First Job";

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
        <p className="mt-2 text-gray-600">Welcome to MatchLance</p>

        {fetchingJobs || checkingProfile || fetchingMatchedJobs ? (
          <p className="mt-4 text-gray-600">Loading...</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              {isClient && (
                <button
                  onClick={handlePostJob}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {postJobButtonText}
                </button>
              )}
              {isFreelancer && !hasFreelancerProfile && (
                <button
                  onClick={handleCompleteProfile}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Complete your profile to see available jobs
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>

            {isFreelancer && hasFreelancerProfile && matchedJobs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Available Jobs for You
                </h2>
                <div className="mt-6 space-y-4">
                  {matchedJobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => navigate(`/matched-job/${job._id}`)}
                      className="border border-gray-200 rounded-xl p-5 bg-white cursor-pointer transition-all hover:border-blue-500 hover:shadow-md"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.description && (
                        <p className="mt-2 text-gray-600">
                          {job.description.length > 150
                            ? job.description.substring(0, 150) + "..."
                            : job.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
                        {job.budget && (
                          <span>
                            <span className="font-medium">Budget:</span>{" "}
                            {job.budget.currency}
                            {job.budget.amount} ({job.budget.type})
                          </span>
                        )}
                        {job.location && (
                          <span>
                            <span className="font-medium">Location:</span>{" "}
                            {job.location}
                          </span>
                        )}
                        {job.matchScore && (
                          <span className="text-green-600 font-medium">
                            {job.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>
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
