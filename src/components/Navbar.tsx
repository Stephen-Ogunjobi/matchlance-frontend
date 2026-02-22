import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import ThemeToggle from "./ThemeToggle";
import apiClient from "../utils/api";

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
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, setUser, isFreelancer } = useUser();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
      setShowLogoutModal(false);
      navigate("/login");
    } catch (err: any) {
      setShowLogoutModal(false);
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
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
          <>
            <NavLink
              to={isFreelancer && hasFreelancerProfile ? `/freelancer-profile/${user._id}` : "/"}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {user.firstName || user.email}
            </NavLink>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
            >
              Logout
            </button>
          </>
        )}
        <ThemeToggle />
      </div>
    </header>

    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={() => !loggingOut && setShowLogoutModal(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div
          className="relative w-full max-w-sm mx-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[var(--color-error)]/10 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[var(--color-error)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] text-center">
            Log out?
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-center">
            Are you sure you want to log out of your account?
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              disabled={loggingOut}
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-error)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
