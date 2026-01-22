import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../utils/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No verification token found in URL.");
        return;
      }

      try {
        const res = await apiClient.get("/auth/verify-email", { params: { token } });
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err?.response?.data?.error ||
            err.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h2>Email Verification</h2>

      {status === "loading" && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <p>Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            color: "#155724",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Success!</h3>
          <p style={{ margin: 0 }}>{message}</p>
          <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
            Redirecting to dashboard...
          </p>
        </div>
      )}

      {status === "error" && (
        <div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              color: "#721c24",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>Verification Failed</h3>
            <p style={{ margin: 0 }}>{message}</p>
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
      )}
    </div>
  );
}
