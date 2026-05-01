// src/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import "./auth.css";

const API_BASE = import.meta.env.VITE_API_URL;


export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* 🔐 Password rules */
  const rules = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  function passwordStrength() {
    const score = Object.values(rules).filter(Boolean).length;
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength() === "weak") {
      setError("Please choose a stronger password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.userName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const msg = await res.text();
      if (!res.ok) {
        setError(msg || "Registration failed");
        return;
      }

      // ✅ Do NOT auto-login
      navigate("/?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  function handleGoogleLogin() {
  window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
}

  return (
    <div className="auth-page">
      <video
        className="auth-bg-video"
        src="/registeration backgroud.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="auth-bg-overlay" />

      <nav className="auth-topbar">
        <div className="logo" onClick={() => navigate("/")}>
          <video src="/logo.mp4" autoPlay loop muted className="logo-video" />
          <span>MOVE</span>
        </div>
        <div>
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </nav>

      <div className="auth-card">
        <h1>Create account</h1>
        <p className="subtitle">Share wheels, share smiles 🚗</p>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="userName" value={form.userName} onChange={handleChange} required />

          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="button" className="password-eye" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {form.password && (
            <div className={`password-strength ${passwordStrength()}`}>
              Password strength: <b>{passwordStrength()}</b>
            </div>
          )}

          {form.password && (
            <ul className="password-rules">
              <li className={rules.length ? "ok" : ""}>{rules.length ? <Check /> : <X />} 8+ characters</li>
              <li className={rules.upper ? "ok" : ""}>{rules.upper ? <Check /> : <X />} Uppercase</li>
              <li className={rules.number ? "ok" : ""}>{rules.number ? <Check /> : <X />} Number</li>
              <li className={rules.special ? "ok" : ""}>{rules.special ? <Check /> : <X />} Special char</li>
            </ul>
          )}

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              name="confirmPassword"
              type={showConfirmPwd ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button type="button" className="password-eye" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
              {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-btn">Create account</button>
        </form>

        <div className="divider">OR</div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="/gicon.jpg" className="google-icon" alt="Google" />
             Continue with Google
                 </button>


        <p className="bottom-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
