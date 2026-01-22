import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface NavbarProps {
  hasFreelancerProfile: boolean | null;
}

export default function Navbar({ hasFreelancerProfile }: NavbarProps) {
  const { user, isFreelancer } = useUser();
  const isLoggedIn = !!user;

  return (
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
  );
}
