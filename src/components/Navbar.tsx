import { NavLink } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  hasFreelancerProfile: boolean | null;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-full font-medium text-sm transition-all duration-200 ${
    isActive
      ? "bg-indigo-500/10 text-indigo-500"
      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
  }`;

export default function Navbar({ hasFreelancerProfile }: NavbarProps) {
  const { user, isFreelancer } = useUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)] relative">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="font-bold text-lg text-[var(--color-text-primary)] hidden sm:block">
          MatchLance
        </span>
      </NavLink>

      {/* Navigation Links - Centered */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
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
            <NavLink to="/my-proposals" className={linkClasses}>
              My Proposals
            </NavLink>
            <NavLink to="/my-jobs" className={linkClasses}>
              My Jobs
            </NavLink>
          </>
        )}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {!isLoggedIn ? (
          <>
            <NavLink
              to="/login"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className="px-4 py-2 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm"
            >
              Sign up
            </NavLink>
          </>
        ) : (
          <NavLink
            to={isFreelancer && hasFreelancerProfile ? `/freelancer-profile/${user._id}` : "/"}
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {user.firstName || user.email}
          </NavLink>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
