import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function resetPassword() {
    if (!otp || !password) {
      setError("Please enter OTP and new password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword: password,
        }),
      });

      const msg = await res.text();

      if (!res.ok) {
        setError(msg || "Invalid OTP");
        return;
      }

      alert("Password reset successful");
      navigate("/login");
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rs-reset-page">
      {/* 🔝 Navbar */}
      <nav className="rs-navbar">
        <div className="rs-nav-left" onClick={() => navigate("/")}>
          <video
            src="/logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="rs-logo-video"
          />
          <span>MOVE</span>
        </div>
        <button className="rs-nav-btn" onClick={() => navigate("/")}>
          Home
        </button>
      </nav>

      {/* 🔐 Card */}
      <div className="rs-reset-card">
        <h1>Reset Password</h1>
        <p className="rs-subtitle">
          Enter the OTP sent to your email and set a new password
        </p>

        <label>OTP</label>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
        />

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="rs-error">{error}</div>}

        <button
          className="rs-primary-btn"
          onClick={resetPassword}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="rs-bottom-text">
          Back to{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
