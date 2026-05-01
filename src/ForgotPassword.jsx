import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const API_BASE = import.meta.env.VITE_API_URL;


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function sendOtp() {
    if (!email.trim()) {
      setError("Please enter your registered email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const msg = await res.text();

      if (!res.ok) {
        setError(msg || "User not registered");
        return;
      }

      navigate("/reset-password", { state: { email } });
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rs-auth-page">
      {/*  Navbar */}
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
          <span></span>
        </div>
        <button className="rs-nav-btn" onClick={() => navigate("/")}>
          Home
        </button>
      </nav>

      {/*  Bigger Card */}
      <div className="rs-auth-card rs-auth-card-lg">
        <h1>Forgot Password</h1>
        <p className="rs-subtitle">
          We’ll send a <strong>6-digit OTP</strong> to your registered email
        </p>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        {error && <div className="rs-error">{error}</div>}

        <button
          className="rs-primary-btn"
          disabled={loading}
          onClick={sendOtp}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <p className="rs-bottom-text">
          Remember your password?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
