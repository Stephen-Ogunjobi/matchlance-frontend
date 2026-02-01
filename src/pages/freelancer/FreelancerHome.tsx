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
  const [loading, setLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [fetchingMatchedJobs, setFetchingMatchedJobs] = useState(false);
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState<
    boolean | null
  >(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const { user, setUser, loading: userLoading } = useUser();
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

  const handleCompleteProfile = () => {
    if (user?._id) {
      navigate(`/freelancer-profile/${user._id}`);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-gray-600">
          Find jobs that match your skills and expertise
        </p>

        {checkingProfile || fetchingMatchedJobs ? (
          <p className="mt-4 text-gray-600">Loading...</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              {!hasFreelancerProfile && (
                <button
                  onClick={handleCompleteProfile}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Complete your profile to see available jobs
                </button>
              )}
              {hasFreelancerProfile && (
                <>
                  <button
                    onClick={() => navigate("/my-proposals")}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    My Proposals
                  </button>
                  <button
                    onClick={() => navigate("/my-jobs")}
                    className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    My Jobs
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>

            {hasFreelancerProfile && matchedJobs.length > 0 && (
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

            {hasFreelancerProfile && matchedJobs.length === 0 && (
              <div className="mt-10 p-8 bg-white rounded-xl border border-gray-200 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  No matched jobs yet
                </h3>
                <p className="mt-2 text-gray-600">
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
