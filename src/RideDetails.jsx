// src/RideDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./profile.css";
import { getToken, clearToken } from "./authClient";

const API_BASE = import.meta.env.VITE_API_URL;


export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // if no token, force login
      navigate("/login");
      return;
    }

    async function load() {
      try {
        // --- fetch ride ---
        const rideRes = await fetch(`${API_BASE}/api/rides/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (rideRes.status === 401 || rideRes.status === 403) {
          clearToken();
          navigate("/login");
          return;
        }

        if (!rideRes.ok) {
          setErrorMsg("Ride not found.");
          setRide(null);
          setBookings([]);
          return;
        }

        const rideJson = await rideRes.json();
        setRide(rideJson);

        // --- fetch bookings ---
        const bookingRes = await fetch(`${API_BASE}/api/rides/${id}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (bookingRes.ok) {
          const bookingsJson = await bookingRes.json();
          setBookings(Array.isArray(bookingsJson) ? bookingsJson : []);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Error loading ride details:", err);
        setErrorMsg("Something went wrong while loading this ride.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, navigate]);

  const totalBookedSeats = bookings.reduce(
    (sum, b) => sum + (b.seatsBooked || 0),
    0
  );

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!ride) {
    return (
      <div className="profile-container">
        <p
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#ffeba7",
            fontWeight: 500,
          }}
        >
          {errorMsg || "Ride not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Logo → back to dashboard */}
      <a
        href="#"
        className="profile-logo"
        onClick={(e) => {
          e.preventDefault();
          navigate("/my-bookings");
        }}
      >
        <video
          loop
          autoPlay
          muted
          playsInline
          src="/logo.mp4"
          className="profile-logo-video"
        />
      </a>

      <main className="profile-main">
        <div className="profile-content">
          {/* Ride summary */}
          <div className="profile-card">
            <div className="profile-info">
              <h1 className="profile-heading">
                {ride.departureLocation} → {ride.destinationLocation}
              </h1>
              <h2 className="profile-name">
                {ride.departureDate} at {ride.departureTime}
              </h2>

              <p className="profile-text">
                Driver: {ride.driverName} ({ride.phoneNumber}) <br />
                Vehicle: {ride.vehicleNumber}
              </p>

              <p className="profile-text">
                Total seats: {ride.totalSeats} &nbsp; | &nbsp; Available:{" "}
                {ride.availableSeats} &nbsp; | &nbsp; Booked seats:{" "}
                {totalBookedSeats}
              </p>

              <div className="profile-actions">
                <button onClick={() => navigate("/my-bookings")}>
                  Back to dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Passengers list */}
          <section className="trip-section">
            <h2>Passengers ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              <div className="trip-list">
                {bookings.map((b) => (
                  <div key={b.id} className="trip-card">
                    <span className="trip-main">{b.passengerName}</span>
                    <span className="trip-meta">
                      Phone: {b.phoneNumber} <br />
                      Seats booked: {b.seatsBooked} <br />
                      Booked at: {b.bookTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
