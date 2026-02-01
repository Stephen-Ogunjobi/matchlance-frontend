import React, { useState } from "react";
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
    <div style={{ padding: 20 }}>
      <h2>Reset Password</h2>
      {success ? (
        <div style={{ maxWidth: 360 }}>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              color: "#155724",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>Reset Link Sent!</h3>
            <p style={{ margin: "0 0 10px 0" }}>
              Check your email for a password reset link.
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Send Another Link
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 8, maxWidth: 360 }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          {error && <div style={{ color: "crimson" }}>{error}</div>}
        </form>
      )}
    </div>
  );
}
