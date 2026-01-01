import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/api";

type Role = "freelancer" | "client" | null;

export default function Signup() {
  const [role, setRole] = useState<Role>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      console.log("signup response", res.data);

      // Show success message instead of redirecting
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Role Selection
  if (!role) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Sign up</h2>
        <p>Choose your account type:</p>
        <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
          <button
            onClick={() => setRole("freelancer")}
            style={{
              padding: "15px 20px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Sign up as Freelancer
          </button>
          <button
            onClick={() => setRole("client")}
            style={{
              padding: "15px 20px",
              backgroundColor: "#34a853",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Sign up as Client
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Signup Method Selection (Google OAuth or Email/Password)
  return (
    <div style={{ padding: 20 }}>
      <h2>Sign up as {role === "freelancer" ? "Freelancer" : "Client"}</h2>
      <button
        onClick={() => setRole(null)}
        style={{
          marginBottom: 20,
          padding: "5px 10px",
          backgroundColor: "transparent",
          border: "1px solid #ccc",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        ← Change role
      </button>

      {/* Google OAuth Signup */}
      <div style={{ maxWidth: 360, marginBottom: 20 }}>
        <a
          href={`http://localhost:3001/api/auth/google?role=${role}`}
          style={{
            display: "block",
            padding: "12px 20px",
            backgroundColor: "#4285f4",
            color: "white",
            textAlign: "center",
            textDecoration: "none",
            borderRadius: 4,
            fontWeight: 500
          }}
        >
          Continue with Google
        </a>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: 360, margin: "20px 0", textAlign: "center", color: "#666" }}>
        OR
      </div>

      {/* Email/Password Signup Form */}
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
            <h3 style={{ margin: "0 0 10px 0" }}>Account Created!</h3>
            <p style={{ margin: "0 0 10px 0" }}>
              Please check your email to verify your account before logging in.
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
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
            Go to Login
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 8, maxWidth: 360 }}
        >
          <label>
            First Name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label>
            Last Name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up with Email"}
          </button>
          {error && <div style={{ color: "crimson" }}>{error}</div>}
        </form>
      )}
    </div>
  );
}
