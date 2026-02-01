import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../utils/api";

export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.post("/auth/new-password", {
        token,
        newPassword,
        confirmPassword,
      });
      console.log("new password response", res.data);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || err.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Set New Password</h2>
      {!token ? (
        <div
          style={{
            maxWidth: 360,
            padding: "20px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          <p style={{ margin: 0 }}>
            Invalid or missing reset token. Please request a new password reset link.
          </p>
        </div>
      ) : success ? (
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
            <h3 style={{ margin: "0 0 10px 0" }}>Password Reset Successful!</h3>
            <p style={{ margin: 0 }}>
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 8, maxWidth: 360 }}
        >
          <label>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Setting password..." : "Set Password"}
          </button>
          {error && <div style={{ color: "crimson" }}>{error}</div>}
        </form>
      )}
    </div>
  );
}
