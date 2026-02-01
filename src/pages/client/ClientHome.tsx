import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

interface JobPost {
  id: string;
  title: string;
}

export default function ClientHome() {
  const [loading, setLoading] = useState(false);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const { user, setUser, loading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobPosts = async () => {
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
  }, [userLoading]);

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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your job posts and find the perfect freelancer
        </p>

        {fetchingJobs ? (
          <p className="mt-4 text-gray-600">Loading...</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handlePostJob}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {postJobButtonText}
              </button>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                View All Jobs
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>

            {hasJobPosts && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Your Recent Job Posts
                </h2>
                <p className="mt-2 text-gray-600">
                  You have {jobPosts.length} job{jobPosts.length !== 1 ? "s" : ""} posted
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
