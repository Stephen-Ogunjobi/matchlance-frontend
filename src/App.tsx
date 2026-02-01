import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./components/VerifyEmail";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import EditJob from "./pages/EditJob";
import FreelancerProfile from "./pages/FreelancerProfile";
import ViewFreelancerProfile from "./pages/ViewFreelancerProfile";
import MatchedJobDetail from "./pages/MatchedJobDetail";
import MyProposals from "./pages/MyProposals";
import EditProposal from "./pages/EditProposal";
import MyJobs from "./pages/MyJobs";
import Chat from "./pages/Chat";
import Contract from "./components/Contract";
import Navbar from "./components/Navbar";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { setUnauthenticatedCallback } from "./utils/api";
import apiClient from "./utils/api";

function AppContent() {
  const { user, setUser, isFreelancer } = useUser();
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
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar hasFreelancerProfile={hasFreelancerProfile} />
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
        <Route
          path="/view-profile/:userId"
          element={<ViewFreelancerProfile />}
        />
        <Route path="/matched-job/:jobId" element={<MatchedJobDetail />} />
        <Route path="/my-proposals" element={<MyProposals />} />
        <Route path="/edit-proposal/:proposalId" element={<EditProposal />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/contract/:contractId" element={<Contract />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
