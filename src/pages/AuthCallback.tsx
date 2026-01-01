import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../utils/api";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "true") {
      // Verify authentication with the backend
      const verifyAuth = async () => {
        try {
          const res = await apiClient.get("/auth/verify");

          console.log("User verified:", res.data);

          // Store user data in localStorage
          if (res.data.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }

          // Redirect to home
          navigate("/");
        } catch (err: any) {
          console.error("Verification failed:", err);
          setError("Authentication verification failed. Please try logging in.");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      };

      verifyAuth();
    } else {
      setError("Authentication failed. Please try again.");
      setTimeout(() => {
        navigate("/signup");
      }, 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      {error ? (
        <div>
          <h2 style={{ color: "crimson" }}>{error}</h2>
          <p>Redirecting...</p>
        </div>
      ) : (
        <div>
          <h2>Authenticating...</h2>
          <p>Please wait while we verify your account.</p>
        </div>
      )}
    </div>
  );
}
