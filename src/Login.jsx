import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./auth.css";
import { saveToken, getToken } from "./authClient";

const API_BASE = import.meta.env.VITE_API_URL;



console.log("MODE:", import.meta.env.MODE);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);


export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: localStorage.getItem("rememberEmail") || "",
    password: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem("rememberEmail"));
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (getToken()) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setError("Your session expired. Please login again.");
    }
  }, [searchParams]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCaps(e) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const token = await res.text();
      if (!res.ok) {
        setError(token || "Invalid credentials");
        return;
      }

      saveToken(token);

      remember
        ? localStorage.setItem("rememberEmail", form.email)
        : localStorage.removeItem("rememberEmail");

      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch {
      setError("Server error. Try again.");
    }
  }

  function handleGoogleLogin() {
  window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
}


  return (
    <div className="auth-page">
      {/* 🎥 Background video */}
      <video
        className="auth-bg-video"
        src="/background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="auth-bg-overlay" />

      {/* 🔝 Navbar */}
      <nav className="auth-topbar">
        <div className="logo" onClick={() => navigate("/")}>
          <video
            className="logo-video"
            src="/logo.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <span></span>
        </div>
        <div>
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* 💳 Login Card */}
      <div className={`auth-card ${success ? "success" : ""}`}>
        <h1>Welcome back</h1>
        <p className="subtitle">Login to continue to MOVE</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              onKeyUp={handleCaps}
              required
            />
            <button
              type="button"
              className="password-eye"
              onClick={() => setShowPwd(!showPwd)}
              aria-label="Toggle password visibility"
            >
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {capsLock && <div className="caps-warning">⚠ Caps Lock is ON</div>}

          {/* 🔐 Forgot Password */}
          <div
            style={{
              marginTop: "6px",
              textAlign: "right",
              fontSize: "13px",
              color: "#2563eb",
              cursor: "pointer",
            }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </div>

          <div className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <span>Remember me</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-btn" type="submit">
            {success ? "✓ Logged in" : "Login"}
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="/gicon.jpg" className="google-icon" alt="Google" />
          <span>Continue with Google</span>
        </button>

        <p className="bottom-text">
          Don’t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
