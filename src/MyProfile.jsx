import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "./DashboardNav";
import { apiFetch, handleAuthError } from "./authClient";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setLoading(true);

    apiFetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        handleAuthError(err, navigate); // ✅ IMPORTANT FIX
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const initials =
    user?.name
      ? user.name
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

  return (
    <>
      <DashboardNav />

      <div className="container py-5">
        {/* Tabs */}
        <ul className="nav nav-pills justify-content-center mb-4">
          <li className="nav-item">
            <button className="nav-link active">Profile</button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => navigate("/my-bookings")}
            >
              My Bookings
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => navigate("/my-rides")}
            >
              My Rides
            </button>
          </li>
        </ul>

        <div className="row justify-content-center">
          {/* LEFT CARD */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card shadow-sm text-center">
              <div className="card-body">
                {loading ? (
                  <div className="spinner-border text-secondary" />
                ) : (
                  <>
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: 120, height: 120, fontSize: 36 }}
                    >
                      {initials}
                    </div>

                    <h5 className="mb-1">{user?.name}</h5>
                    <p className="text-muted mb-2">{user?.email}</p>

                    <span className="badge bg-light text-dark">
                      {user?.provider}
                    </span>

                    <div className="d-grid gap-2 mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate("/edit-profile")}
                      >
                        Edit Profile
                      </button>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowRaw((v) => !v)}
                      >
                        {showRaw ? "Hide raw JSON" : "Show raw JSON"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="col-lg-7 col-md-10">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Profile Details</h5>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-secondary" />
                  </div>
                ) : user ? (
                  <>
                    <ProfileRow label="Name" value={user.name} />
                    <ProfileRow label="Email" value={user.email} />
                    <ProfileRow label="Provider" value={user.provider} />
                    <ProfileRow
                      label="Verified"
                      value={user.verified ? "Yes" : "No"}
                    />
                    <ProfileRow label="User UUID" value={user.userUuid} />

                    <hr />

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-success"
                        onClick={() => navigate("/offer-ride")}
                      >
                        Offer Ride
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate("/find-ride")}
                      >
                        Find Ride
                      </button>
                    </div>

                    {showRaw && (
                      <>
                        <hr />
                        <pre className="bg-dark text-light p-3 rounded">
                          {JSON.stringify(user, null, 2)}
                        </pre>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No profile data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="row mb-2">
      <div className="col-sm-4 text-muted">{label}</div>
      <div className="col-sm-8">{value || "—"}</div>
    </div>
  );
}
