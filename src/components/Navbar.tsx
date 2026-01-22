import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface NavbarProps {
  hasFreelancerProfile: boolean | null;
}

export default function Navbar({ hasFreelancerProfile }: NavbarProps) {
  const { user, isFreelancer } = useUser();
  const isLoggedIn = !!user;

  return (
    <header className="flex items-center gap-6 px-6 py-4 mb-4 bg-white shadow-sm border-b border-gray-200">
      <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
        Home
      </Link>
      {!isFreelancer && (
        <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Jobs
        </Link>
      )}
      {isFreelancer && hasFreelancerProfile && user?._id && (
        <>
          <Link to={`/freelancer-profile/${user._id}`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Profile
          </Link>
          <Link to="/my-proposals" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            My Proposals
          </Link>
          <Link to="/my-jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            My Jobs
          </Link>
        </>
      )}
      <div className="ml-auto flex items-center gap-4">
        {!isLoggedIn && (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Sign up
            </Link>
            <Link to="/reset-password" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              Reset Password
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
