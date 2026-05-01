// src/ThankYouPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import "./thankyou.css";

export default function ThankYouPage() {
  const { state } = useLocation();

  const message =
    state?.message ||
    "Your action was successful — thank you for using MOVE!";

  // ✅ OPTION 2 — robust resolver
  const ride =
    state?.ride ||
    state?.booking?.ride ||
    state?.booking ||
    null;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 1600);
      return () => clearTimeout(t);
    }
  }, [copied]);

  async function copyRideId() {
    if (!ride?.id) return;
    try {
      await navigator.clipboard.writeText(String(ride.id));
      setCopied(true);
    } catch {
      setCopied(true);
    }
  }

  return (
    <>
      <NavBar />

      <main className="ty2-root">
        <div className="ty2-stage">
          <div className="ty2-confetti" aria-hidden>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className={`ty2-c${(i % 7) + 1}`} />
            ))}
          </div>

          <article className="ty2-card" role="status">
            {/* LEFT */}
            <div className="ty2-card-left">
              <div className="ty2-badge">
                <svg viewBox="0 0 24 24" className="ty2-check">
                  <path d="M20.285 6.708l-11.4 11.4a1.2 1.2 0 0 1-1.697 0l-4.486-4.486 1.697-1.697 3.788 3.788 10.103-10.103z" />
                </svg>
              </div>

              <h1 className="ty2-title">Ride Published</h1>
              <p className="ty2-subtle">{message}</p>

              {ride ? (
                <div className="ty2-summary">
                  <div className="ty2-row">
                    <strong>Driver:</strong>
                    <span>{ride.driverName ?? "—"}</span>
                  </div>

                  <div className="ty2-row">
                    <strong>Route:</strong>
                    <span>
                      {ride.departureLocation ?? "—"} →{" "}
                      {ride.destinationLocation ?? "—"}
                    </span>
                  </div>

                  <div className="ty2-row id-row">
                    <strong>Ride ID:</strong>
                    <span className="ty2-id">{ride.id ?? "—"}</span>
                    <button
                      className="ty2-copy"
                      onClick={copyRideId}
                    >
                      {copied ? "Copied" : "Copy ID"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ty2-summary ty2-summary-empty">
                  <em>No ride details available</em>
                </div>
              )}

              <div className="ty2-actions">
                <Link to="/find-ride" className="ty2-btn primary">
                  Find Ride
                </Link>
                <Link to="/" className="ty2-btn ghost">
                  Home
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="ty2-card-right" aria-hidden>
              <h2 className="ty2-hero-text">
                Make <span className="ty2-hero-pill">your ride</span> Awesome
              </h2>
            </div>
          </article>

          <p className="ty2-note">
            Thanks for sharing — you’ve made someone’s day easier 🚗✨
          </p>
        </div>
      </main>
    </>
  );
}
