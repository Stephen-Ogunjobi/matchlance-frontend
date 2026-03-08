import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";

type Role = "freelancer" | "client" | null;

export default function Signup() {
  const [role, setRole] = useState<Role>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      setSuccess(true);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("An account with this email already exists. Try signing in instead.");
      } else {
        setError(err?.response?.data?.message || err.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Role Selection
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-bold text-2xl text-[var(--color-text-primary)]">
                MatchLance
              </span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] text-center mb-2">
              Create an account
            </h1>
            <p className="text-[var(--color-text-secondary)] text-center mb-8">
              Choose how you want to join MatchLance
            </p>

            <div className="grid gap-4">
              <button
                onClick={() => setRole("freelancer")}
                className="w-full flex items-center gap-4 px-5 py-4 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-500/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Join as a Freelancer</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Find work and grow your career</p>
                </div>
              </button>

              <button
                onClick={() => setRole("client")}
                className="w-full flex items-center gap-4 px-5 py-4 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-500/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Hire as a Client</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Post jobs and find top talent</p>
                </div>
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Signup Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-bold text-2xl text-[var(--color-text-primary)]">
              MatchLance
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setRole(null)}
              className="p-2 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                Create account
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Signing up as a <span className="text-indigo-500 font-medium capitalize">{role}</span>
              </p>
            </div>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <p className="font-semibold mb-1">Account created!</p>
                <p className="text-sm">Please check your email to verify your account before signing in.</p>
                <p className="text-sm mt-1 opacity-75">Didn't receive it? Check your spam folder.</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth Button */}
              <a
                href={`${apiClient.defaults.baseURL}/auth/google?role=${role}`}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-muted)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Continue with Google
              </a>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                <span className="text-sm text-[var(--color-text-tertiary)]">or</span>
                <div className="flex-1 h-px bg-[var(--color-border)]"></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="John"
                      className="w-full px-4 py-3 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 bg-[var(--color-input)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
