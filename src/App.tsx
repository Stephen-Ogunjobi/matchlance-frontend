import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
// Auth pages
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import NewPassword from "./pages/auth/NewPassword";
import AuthCallback from "./pages/auth/AuthCallback";
import VerifyEmail from "./components/VerifyEmail";

// Shared pages
import Home from "./pages/shared/Home";
import Chat from "./pages/shared/Chat";

// Client pages
import PostJob from "./pages/client/PostJob";
import Jobs from "./pages/client/Jobs";
import JobDetail from "./pages/client/JobDetail";
import EditJob from "./pages/client/EditJob";

// Freelancer pages
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import ViewFreelancerProfile from "./pages/freelancer/ViewFreelancerProfile";
import MatchedJobDetail from "./pages/freelancer/MatchedJobDetail";
import MyProposals from "./pages/freelancer/MyProposals";
import EditProposal from "./pages/freelancer/EditProposal";
import MyJobs from "./pages/freelancer/MyJobs";

// Components
import Contract from "./components/Contract";
import Navbar from "./components/Navbar";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { setUnauthenticatedCallback } from "./utils/api";
import apiClient from "./utils/api";

// Routes where navbar should be hidden
const authRoutes = ["/login", "/signup", "/reset-password", "/new-password", "/verify-email", "/auth/callback"];

function AppContent() {
  const { user, setUser, isFreelancer } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState<
    boolean | null
  >(null);

  // Hide navbar on auth pages
  const hideNavbar = authRoutes.some((route) => location.pathname.startsWith(route));

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
          setHasFreelancerProfile(false);
        }
      }
    };

    checkFreelancerProfile();
  }, [isFreelancer, user?._id]);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {!hideNavbar && <Navbar hasFreelancerProfile={hasFreelancerProfile} />}
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
