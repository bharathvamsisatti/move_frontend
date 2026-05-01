// src/AfterLogin.jsx - STRUCTURALLY CORRECTED CODE
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import { getToken, clearToken, apiFetch } from "./authClient";

export default function AfterLogin() {
  const navigate = useNavigate();

  const [userLabel, setUserLabel] = useState("MOVE User");
  const [userUuid, setUserUuid] = useState(null);

  const [offeredUpcoming, setOfferedUpcoming] = useState([]);
  const [offeredPast, setOfferedPast] = useState([]);
  const [bookings, setBookings] = useState([]); // bookings made by this user

  const [loadingCancelRide, setLoadingCancelRide] = useState(null); // rideId
  const [loadingCancelBooking, setLoadingCancelBooking] = useState(null); // bookingId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login?expired=true");
      return;
    }

    (async () => {
      setLoading(true);

      // 1) Load user info
      try {
        // This relies on the fixed JwtFilter and the implemented /api/auth/me endpoint
        const res = await apiFetch("/api/auth/me");
        if (res.status === 401) {
          clearToken();
          navigate("/login?expired=true");
          return;
        }
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          const label = json.userName || json.user_name || json.name || json.email;
          if (label) setUserLabel(label);
          if (json.userUuid) setUserUuid(json.userUuid);
        } else {
          const txt = await res.text();
          if (txt) setUserLabel(txt);
        }
      } catch (err) {
        console.error("Could not load /api/auth/me:", err);
        // keep default username
      }

      // 2) Offered upcoming (owner-specific)
      try {
        const res = await apiFetch("/api/rides/upcoming");
        if (res.status === 401) {
          clearToken();
          navigate("/login?expired=true");
          return;
        }
        const data = await res.json();
        setOfferedUpcoming(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load offered upcoming rides:", err);
        setOfferedUpcoming([]);
      }

      // 3) Offered past
      try {
        const res = await apiFetch("/api/rides/past");
        if (res.status === 401) {
          clearToken();
          navigate("/login?expired=true");
          return;
        }
        const data = await res.json();
        setOfferedPast(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load offered past rides:", err);
        setOfferedPast([]);
      }

      // 4) Bookings made by this user
      try {
        const res = await apiFetch("/api/rides/my/bookings");
        if (res.status === 401) {
          clearToken();
          navigate("/login?expired=true");
          return;
        }
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load user's bookings:", err);
        setBookings([]);
      }

      setLoading(false);
    })();
  }, [navigate]);

  function handleLogout(e) {
    e.preventDefault();
    clearToken();
    navigate("/login");
  }

  function getFromTo(tripOrBooking) {
    const r = tripOrBooking.ride ? tripOrBooking.ride : tripOrBooking;
    const from = r.departureLocation || r.from || r.source || "Unknown";
    const to = r.destinationLocation || r.to || r.destination || "Unknown";
    return { from, to };
  }

  function formatDateTime(obj) {
    const date = (obj.ride ? obj.ride.departureDate : obj.departureDate) || obj.date || "";
    const time = (obj.ride ? obj.ride.departureTime : obj.departureTime) || obj.time || "";
    return `${date} ${time}`.trim();
  }

  // Owner: cancel offered ride
  async function handleCancelRide(e, rideId) {
    e.stopPropagation();
    if (!rideId) return;
    if (!window.confirm("Cancel this offered ride? This action cannot be undone.")) return;

    try {
      setLoadingCancelRide(rideId);
      const res = await apiFetch(`/api/rides/${rideId}`, { method: "DELETE" });

      if (res.status === 401) {
        clearToken();
        navigate("/login?expired=true");
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        alert(`Could not cancel ride: ${txt || res.statusText}`);
        return;
      }

      // remove from offeredUpcoming state
      setOfferedUpcoming((prev) => prev.filter((r) => String(r.id) !== String(rideId)));
      // optionally also remove from offeredPast if present
      setOfferedPast((prev) => prev.filter((r) => String(r.id) !== String(rideId)));
    } catch (err) {
      console.error("Cancel ride failed:", err);
      alert("Failed to cancel ride. See console for details.");
    } finally {
      setLoadingCancelRide(null);
    }
  }

  // Passenger: cancel their booking
  async function handleCancelBooking(e, bookingId) {
    e.stopPropagation();
    if (!bookingId) return;
    if (!window.confirm("Cancel this booking? Seats will be returned to the ride.")) return;

    try {
      setLoadingCancelBooking(bookingId);
      // NOTE: This endpoint requires implementation in the backend (DELETE /api/bookings/{id})
      const res = await apiFetch(`/api/bookings/${bookingId}`, { method: "DELETE" }); 

      if (res.status === 401) {
        clearToken();
        navigate("/login?expired=true");
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        alert(`Could not cancel booking: ${txt || res.statusText}`);
        return;
      }

      // Optimistically remove booking from UI
      setBookings((prev) => prev.filter((b) => String(b.id) !== String(bookingId)));

      // Refresh offeredUpcoming to reflect updated seat counts (simple approach)
      try {
        const upRes = await apiFetch("/api/rides/upcoming");
        if (upRes.ok) {
          const upData = await upRes.json();
          setOfferedUpcoming(Array.isArray(upData) ? upData : []);
        }
      } catch (err) {
        console.warn("Could not refresh offeredUpcoming after booking cancel:", err);
      }
    } catch (err) {
      console.error("Cancel booking failed:", err);
      alert("Failed to cancel booking. See console for details.");
    } finally {
      setLoadingCancelBooking(null);
    }
  }

  // UI loading quick guard
  if (loading) {
    return (
      <div className="profile-container">
        <main className="profile-main">
          <div style={{ padding: 20 }}>Loading your dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <a href="#" className="profile-logo" onClick={(e) => { e.preventDefault(); navigate("/AfterLogin"); }}>
        <video loop autoPlay muted playsInline src="/logo.mp4" className="profile-logo-video" />
      </a>

      <input className="profile-menu-toggle" type="checkbox" id="profile-menu-toggle" />
      <label htmlFor="profile-menu-toggle" className="profile-menu-label" />
      <nav className="profile-nav">
        <ul className="profile-nav-list">
          <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/profile"); }}>Profile</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/offer-ride"); }}>Offer Ride</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/find-ride"); }}>Find Ride</a></li>
          <li><a href="#" onClick={handleLogout}>Logout</a></li>
        </ul>
      </nav>

      <main className="profile-main">
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar"><span>{(userLabel || "M").charAt(0)}</span></div>
            <div className="profile-info">
              <h1 className="profile-heading">Your Profile</h1>
              <h2 className="profile-name">{userLabel}</h2>
              <p className="profile-text"><b>"Welcome to MOVE. Manage your journeys."</b></p>
              <div className="profile-actions">
                <button onClick={() => navigate("/offer-ride")}>Offer a ride</button>
                <button onClick={() => navigate("/find-ride")}>Find a ride</button>
              </div>
            </div>
          </div>

          {/* Offered - Upcoming */}
          <section className="trip-section">
            <h2>Offered — Upcoming</h2>
            {offeredUpcoming.length === 0 ? <p>No upcoming offered rides.</p> : (
              <div className="trip-list">
                {offeredUpcoming.map((ride) => {
                  const { from, to } = getFromTo(ride);
                  return (
                    <div key={ride.id} className="trip-card" onClick={() => ride.id && navigate(`/rides/${ride.id}`)}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
                        <div>
                          <span className="trip-main">{from} → {to}</span>
                          <div className="trip-meta">{formatDateTime(ride)} &nbsp;|&nbsp; Seats: {ride.availableSeats ?? "-"}</div>
                        </div>
                        <div style={{display:"flex", gap:8}}>
                          <button
                            onClick={(e) => handleCancelRide(e, ride.id)}
                            disabled={loadingCancelRide === ride.id}
                            title="Cancel (delete) this ride"
                          >
                            {loadingCancelRide === ride.id ? "Cancelling..." : "Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Offered - Past */}
          <section className="trip-section">
            <h2>Offered — Past</h2>
            {offeredPast.length === 0 ? <p>No past offered rides.</p> : (
              <div className="trip-list">
                {offeredPast.map((ride) => {
                  const { from, to } = getFromTo(ride);
                  return (
                    <div key={ride.id} className="trip-card past" onClick={() => ride.id && navigate(`/rides/${ride.id}`)}>
                      <span className="trip-main">{from} → {to}</span>
                      <span className="trip-meta">{formatDateTime(ride)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bookings (Found rides) */}
          <section className="trip-section">
            <h2>Your Bookings (Found Rides)</h2>
            {bookings.length === 0 ? <p>No bookings found.</p> : (
              <div className="trip-list">
                {bookings.map((b, i) => {
                  const ride = b.ride || {};
                  const { from, to } = getFromTo(b);
                  return (
                    <div key={b.id ?? i} className="trip-card" onClick={() => ride.id && navigate(`/rides/${ride.id}`)}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
                        <div>
                          <span className="trip-main">{from} → {to}</span>
                          <div className="trip-meta">Booked: {b.bookTime ? b.bookTime : formatDateTime(b)} &nbsp;|&nbsp; Seats: {b.seatsBooked}</div>
                        </div>
                        <div>
                          <button
                            onClick={(e) => handleCancelBooking(e, b.id)}
                            disabled={loadingCancelBooking === b.id}
                            title="Cancel this booking"
                          >
                            {loadingCancelBooking === b.id ? "Cancelling..." : "Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}