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
      <div className="home-container">
        <h1>Welcome</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>Welcome</h1>
      <p>Welcome to MatchLance</p>

      {fetchingJobs || checkingProfile || fetchingMatchedJobs ? (
        <p>Loading...</p>
      ) : (
        <>
          {isClient && (
            <button onClick={handlePostJob} style={{ marginRight: "8px" }}>
              {postJobButtonText}
            </button>
          )}
          {isFreelancer && !hasFreelancerProfile && (
            <button
              onClick={handleCompleteProfile}
              style={{ marginRight: "8px" }}
            >
              Complete your profile to see available jobs
            </button>
          )}
          <button onClick={handleLogout} disabled={loading}>
            {loading ? "Logging out..." : "Logout"}
          </button>

          {isFreelancer && hasFreelancerProfile && matchedJobs.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h2>Available Jobs for You</h2>
              <div style={{ marginTop: "16px" }}>
                {matchedJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/matched-job/${job._id}`)}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "12px",
                      backgroundColor: "#f9f9f9",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                      e.currentTarget.style.borderColor = "#007bff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f9f9f9";
                      e.currentTarget.style.borderColor = "#ddd";
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px 0" }}>{job.title}</h3>
                    {job.description && (
                      <p style={{ margin: "0 0 8px 0", color: "#666" }}>
                        {job.description.length > 150
                          ? job.description.substring(0, 150) + "..."
                          : job.description}
                      </p>
                    )}
                    <div
                      style={{ display: "flex", gap: "16px", fontSize: "14px" }}
                    >
                      {job.budget && (
                        <span>
                          <strong>Budget:</strong> {job.budget.currency}
                          {job.budget.amount} ({job.budget.type})
                        </span>
                      )}
                      {job.location && (
                        <span>
                          <strong>Location:</strong> {job.location}
                        </span>
                      )}
                      {job.matchScore && (
                        <span>
                          <strong>Match:</strong> {job.matchScore}%
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
  );
}
