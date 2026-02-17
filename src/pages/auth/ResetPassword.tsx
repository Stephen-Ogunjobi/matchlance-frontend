import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiClient.post("/auth/reset-password", {
        email,
      });
      console.log("reset password response", res.data);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Reset password request failed"
      );
    } finally {
      setLoading(false);
    }
  };

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
          {success ? (
            <>
              {/* Success State */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[var(--color-success)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  Check your email
                </h1>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  We've sent a password reset link to your email address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 mb-6">
                <p className="text-sm text-[var(--color-success)]">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
              >
                Send Another Link
              </button>
            </>
          ) : (
            <>
              {/* Form State */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[var(--color-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  Reset password
                </h1>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                  >
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
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <p className="text-center mt-6 text-[var(--color-text-secondary)]">
          Remember your password?{" "}
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
