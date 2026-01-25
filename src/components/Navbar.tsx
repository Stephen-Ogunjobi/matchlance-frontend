import { NavLink } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface NavbarProps {
  hasFreelancerProfile: boolean | null;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `font-medium transition-colors ${
    isActive
      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
      : "text-gray-700 hover:text-blue-600"
  }`;

export default function Navbar({ hasFreelancerProfile }: NavbarProps) {
  const { user, isFreelancer } = useUser();
  const isLoggedIn = !!user;

  return (
    <header className="flex items-center gap-6 px-6 py-4 mb-4 bg-white shadow-sm border-b border-gray-200">
      <NavLink to="/" className={linkClasses} end>
        Home
      </NavLink>
      {!isFreelancer && (
        <NavLink to="/jobs" className={linkClasses}>
          Jobs
        </NavLink>
      )}
      {isFreelancer && hasFreelancerProfile && user?._id && (
        <>
          <NavLink to={`/freelancer-profile/${user._id}`} className={linkClasses}>
            Profile
          </NavLink>
          <NavLink to="/my-proposals" className={linkClasses}>
            My Proposals
          </NavLink>
          <NavLink to="/my-jobs" className={linkClasses}>
            My Jobs
          </NavLink>
        </>
      )}
      <div className="ml-auto flex items-center gap-4">
        {!isLoggedIn && (
          <>
            <NavLink to="/login" className={linkClasses}>
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`
              }
            >
              Sign up
            </NavLink>
            <NavLink
              to="/reset-password"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Reset Password
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
