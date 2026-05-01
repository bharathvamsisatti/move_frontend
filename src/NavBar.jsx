// src/components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";


export default function NavBar() {
  const loc = useLocation();

  return (
    <header className="np-navbar" role="banner" aria-label="Top navigation">
      <div className="np-container">
        <div className="brand">
          <Link to="/" className="brand-link" aria-label="MOVE home">
            {/* try video first, fall back to static img */}
            <div className="logo-visual" aria-hidden="true">
              <video
                className="np-logo-video"
                src="/logo.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
              {/* <img
                className="np-logo-fallback"
                src="/logo.png"
                alt="MOVE"
                decoding="async"
                width="56"
                height="56"
                style={{ display: "none" }}
              /> */}
            </div>
            {/* optional small brand text (keeps layout stable) */}
            <div className="brand-text" aria-hidden="true">
              <small style={{ color: "#666", display: "block", lineHeight: 1 }}></small>
            </div>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/" className={loc.pathname === "/" ? "active" : ""}>Back</Link>
          <Link to="/offer-ride" className={loc.pathname === "/offer-ride" ? "active" : ""}>Offer Ride</Link>
          <Link to="/find-ride" className={loc.pathname === "/find-ride" ? "active" : ""}>Find Ride</Link>
        </nav>

        {/* leave profile area empty for now */}
      </div>
    </header>
  );
}
