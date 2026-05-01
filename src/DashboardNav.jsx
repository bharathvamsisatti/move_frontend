// src/components/DashboardNav.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function DashboardNav() {
  const navigate = useNavigate();

  return (
    <header className="dashboard-navbar">
      <div className="nav-inner">
        {/* LEFT: Logo */}
        <div className="nav-left" onClick={() => navigate("/")}>
          <video
            src="/logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="nav-logo-video"
          />
          <span className="nav-title"></span>
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    </header>
  );
}
