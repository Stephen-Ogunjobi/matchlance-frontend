import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import EditJob from "./pages/EditJob";
import FreelancerProfile from "./pages/FreelancerProfile";
import MatchedJobDetail from "./pages/MatchedJobDetail";
import MyProposals from "./pages/MyProposals";
import EditProposal from "./pages/EditProposal";
import MyJobs from "./pages/MyJobs";
import Chat from "./pages/Chat";
import { UserProvider, useUser } from "./contexts/UserContext";
import { setUnauthenticatedCallback } from "./utils/api";
import apiClient from "./utils/api";

function AppContent() {
  const { user, setUser, isFreelancer } = useUser();
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState<
    boolean | null
  >(null);

  // Set up unauthenticated callback for axios interceptor
  useEffect(() => {
    setUnauthenticatedCallback(() => {
      setUser(null);
      navigate("/login");
    });
  }, [navigate, setUser]);

  // Check if freelancer has a profile
  useEffect(() => {
    const checkFreelancerProfile = async () => {
      if (!isFreelancer || !user?._id) {
        setHasFreelancerProfile(null);
        return;
      }

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
      }
    };

    checkFreelancerProfile();
  }, [isFreelancer, user?._id]);

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link to="/">Home</Link>
        {!isFreelancer && <Link to="/jobs">Jobs</Link>}
        {isFreelancer && hasFreelancerProfile && user?._id && (
          <>
            <Link to={`/freelancer-profile/${user._id}`}>Profile</Link>
            <Link to="/my-proposals">My Proposals</Link>
            <Link to="/my-jobs">My Jobs</Link>
          </>
        )}
        {!isLoggedIn && (
          <>
            <Link to="/signup">Sign up</Link>
            <Link to="/login">Log in</Link>
            <Link to="/reset-password">Reset Password</Link>
          </>
        )}
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId" element={<JobDetail />} />
        <Route path="/edit-job/:jobId" element={<EditJob />} />
        <Route
          path="/freelancer-profile/:userId"
          element={<FreelancerProfile />}
        />
        <Route path="/matched-job/:jobId" element={<MatchedJobDetail />} />
        <Route path="/my-proposals" element={<MyProposals />} />
        <Route path="/edit-proposal/:proposalId" element={<EditProposal />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
