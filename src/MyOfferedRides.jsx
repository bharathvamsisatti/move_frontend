import React, { useEffect, useState } from "react";
import { apiFetch, handleAuthError } from "./authClient";
import { useNavigate } from "react-router-dom";
import DashboardNav from "./DashboardNav";
import RideCard from "./RideCard";
import "./dashboard.css";


export default function MyOfferedRides() {
  const [rides, setRides] = useState([]);
  const navigate = useNavigate();

 useEffect(() => {
  apiFetch("/api/rides/my/offered")
    .then(res => res.json())
    .then(data => setRides(Array.isArray(data) ? data : []))
    .catch(err => handleAuthError(err, navigate));
}, [navigate]);



  return (
    <>
      <DashboardNav />

      <main className="dashboard-full">
        <div className="content-inner">
          <h1 className="dashboard-title">Your rides</h1>

          {rides.length === 0 ? (
            <p className="empty-text">You haven’t offered any rides yet.</p>
          ) : (
            <div className="cards-stack">
              {rides.map(r => (
                <RideCard key={r.id} item={r} variant="ride" />
              ))}
              <div className="archive-link">Archived rides →</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}