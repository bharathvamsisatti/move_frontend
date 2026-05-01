// src/BookingSuccess.jsx

import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import NavBar from "./NavBar";
import Lottie from "lottie-react";
import taxiAnimation from "./assets/taxi booking.json";
import "./bookingSuccess.css";

export default function BookingSuccess() {
  const { state } = useLocation();

  const booking = state?.booking;

  // redirect if page opened directly
  if (!booking) {
    return <Navigate to="/find-ride" replace />;
  }

  const ride = booking?.ride || {};

  return (
    <>
      <NavBar />

      <main className="bs-root">
        <section className="bs-card">
          {/* LEFT SIDE */}
          <div className="bs-left">
            <div className="bs-badge">🎉</div>

            <h1 className="bs-title">Booking Confirmed</h1>

            <p className="bs-subtitle">
              Payment Successful & Seat Reserved
            </p>

            <div className="bs-details">
              <div className="bs-row">
                <span>Booking ID</span>
                <strong>{booking.id}</strong>
              </div>

              <div className="bs-row">
                <span>Passenger</span>
                <strong>{booking.passengerName}</strong>
              </div>

              <div className="bs-row">
                <span>Phone</span>
                <strong>{booking.phoneNumber}</strong>
              </div>

              <div className="bs-row">
                <span>Seats</span>
                <strong>{booking.seatsBooked}</strong>
              </div>

              <div className="bs-row">
                <span>Amount Paid</span>
                <strong>₹{booking.finalPrice}</strong>
              </div>

              <div className="bs-row">
                <span>Status</span>
                <strong className="success">
                  {booking.status}
                </strong>
              </div>

              {/* UPDATED ROUTE SECTION */}
              <div className="bs-route-card">
                <h3>🛣 Ride Route</h3>

                <div className="route-point">
                  <span className="dot start"></span>

                  <div>
                    <small>Pickup</small>
                    <p>{ride.departureLocation}</p>
                  </div>
                </div>

                <div className="route-line"></div>

                <div className="route-point">
                  <span className="dot end"></span>

                  <div>
                    <small>Drop</small>
                    <p>{ride.destinationLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bs-actions">
              <Link to="/find-ride" className="bs-btn primary">
                Book Another Ride
              </Link>

              <Link to="/" className="bs-btn secondary">
                Home
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bs-right">
            <div className="bs-lottie-wrap">
              <Lottie
                animationData={taxiAnimation}
                loop={true}
                className="bs-lottie"
              />
            </div>

            <h2 className="bs-journey-text">
              Enjoy Your Journey 🚗
            </h2>
          </div>
        </section>
      </main>
    </>
  );
}