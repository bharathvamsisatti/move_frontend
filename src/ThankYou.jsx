// src/ThankYouPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "./thankyou.css";

const API_BASE = import.meta.env.VITE_API_URL;

function niceDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts[0] && parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
}

export default function ThankYouPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Debug: show what the route state contains
  useEffect(() => {
    console.debug("ThankYou location.state:", state);
  }, [state]);

  // Try multiple places for booking + ride
  const payload = state?.payload ?? null;
  const directBooking = state?.booking ?? null;
  const directRide = state?.ride ?? null;

  // booking may be:
  // - direct booking object (state.booking)
  // - payload.booking (state.payload.booking)
  // - the payload itself (state.payload === booking)
  const initialBooking =
    directBooking ||
    (payload && payload.booking) ||
    (payload && !payload.booking && payload.booking !== undefined ? payload : null) ||
    null;

  const initialRide =
    directRide ||
    (payload && payload.ride) ||
    (initialBooking && initialBooking.ride) ||
    null;

  const [booking, setBooking] = useState(initialBooking);
  const [ride, setRide] = useState(initialRide);
  const [loadingRide, setLoadingRide] = useState(false);
  const [rideError, setRideError] = useState(null);

  // accessibility focus
  useEffect(() => {
    const el = document.getElementById("thanks-title");
    if (el) el.focus();
  }, []);

  // If we don't have a ride object, but we can find an id, fetch it.
  useEffect(() => {
    // If ride already present, nothing to do
    if (ride) {
      console.debug("Using ride from state/booking:", ride);
      return;
    }

    // Try possible ride id locations
    const rideIdCandidates = [
      // booking may be { ride: { id: ... } } or { rideId } etc.
      booking?.ride?.id,
      booking?.rideId,
      booking?.ride_id,
      payload?.ride?.id,
      payload?.rideId,
      state?.rideId,
      state?.ride_id
    ].filter(Boolean);

    const rideId = rideIdCandidates.length ? rideIdCandidates[0] : null;

    if (rideId) {
      fetchRideById(rideId);
    } else {
      console.debug("No ride object or ride id found in location.state");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, state, payload, ride]);

  // If booking is missing but payload is booking-like, pick it up.
  useEffect(() => {
    if (!booking && payload) {
      if (payload.booking) {
        setBooking(payload.booking);
      } else {
        // payload might itself be the booking object
        // Heuristic: booking usually has passengerName or seatsBooked
        if (payload.passengerName || payload.seatsBooked || payload.finalPrice) {
          setBooking(payload);
        }
      }
    }
  }, [booking, payload]);

  async function fetchRideById(id) {
    setLoadingRide(true);
    setRideError(null);
    try {
      console.debug("Fetching ride by id:", id);
      const res = await fetch(`${API_BASE}/api/rides/${id}`);
      if (!res.ok) throw new Error(`Failed to load ride (${res.status})`);
      const data = await res.json();
      setRide(data);
    } catch (err) {
      setRideError(err.message || "Failed to load ride details");
    } finally {
      setLoadingRide(false);
    }
  }

  const message =
    state?.message ||
    (booking ? "Booking confirmed!" : "Thank you — Your ride was published!");

  function goFind() {
    navigate("/find-ride");
  }

  function goHome() {
    navigate("/AfterLogin");
  }

  // debug print of resolved booking/ride
  useEffect(() => {
    console.debug("Resolved booking:", booking);
    console.debug("Resolved ride:", ride);
  }, [booking, ride]);

  return (
    <>
      <NavBar />

      <main className="ty-main">
        <section className="thankyou-panel animate pop delay-1" aria-labelledby="thanks-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 420px" }}>
              <h2 id="thanks-title" tabIndex="-1">
                {booking ? "Booking confirmed!" : "Thank you — Your ride was published!"}
              </h2>

              <p className="ty-sub">{message}</p>

              {/* Booking summary */}
              {booking ? (
                <div className="ty-ride" aria-live="polite">
                  <strong>Booking summary</strong>
                  <div>Passenger: {booking.passengerName ?? "—"}</div>
                  <div>Seats booked: {booking.seatsBooked ?? "—"}</div>
                  <div>Total charged: ₹{booking.finalPrice ?? "—"}</div>
                  {booking.id && <div>Booking ID: {booking.id}</div>}
                </div>
              ) : null}

              {/* Ride summary */}
              <div style={{ marginTop: 12 }}>
                <div style={{
                  marginTop: 12,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid #eee",
                  background: "#fafafa",
                  color: "#333"
                }}>
                  <strong>Ride details</strong>

                  {loadingRide ? (
                    <div style={{ marginTop: 8 }}>Loading ride details…</div>
                  ) : rideError ? (
                    <div style={{ marginTop: 8, color: "crimson" }}>{rideError}</div>
                  ) : ride ? (
                    <div style={{ marginTop: 8 }}>
                      <div><strong>Driver:</strong> {ride.driverName ?? "—"}</div>
                      <div><strong>Contact:</strong> <a href={`tel:${ride.phoneNumber}`}>{ride.phoneNumber ?? "—"}</a></div>
                      <div><strong>Route:</strong> {ride.departureLocation ?? "—"} → {ride.destinationLocation ?? "—"}</div>
                      <div><strong>Date & Time:</strong> {niceDate(ride.departureDate)} • {ride.departureTime}</div>
                      <div><strong>Seats:</strong> {ride.availableSeats ?? 0} available / {ride.totalSeats ?? "—"} total</div>
                      <div><strong>Price per seat:</strong> ₹{ride.pricePerSeat ?? "—"}</div>

                      {/* If booking exists show relation */}
                      {booking && (
                        <div style={{ marginTop: 8 }}>
                          <strong>Booking reference:</strong> {booking.id ?? "—"} <br />
                          <strong>Amount paid:</strong> ₹{booking.finalPrice ?? "—"}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, color: "#666" }}>No ride details available</div>
                  )}
                </div>
              </div>

              <div className="thankyou-actions" style={{ marginTop: 18 }}>
                <button className="btn primary" onClick={goFind}>Find Ride</button>
                <button className="btn ghost" onClick={goHome} style={{ marginLeft: 8 }}>Go Home</button>
              </div>
            </div>

            <div style={{ minWidth: 260, textAlign: "center" }}>
              <div id="container" aria-hidden="true">
                Make
                <div id="flip" aria-hidden="true">
                  <div><div>wOrK</div></div>
                  <div><div>lifeStyle</div></div>
                  <div><div>Everything</div></div>
                </div>
                AweSoMe!
              </div>
            </div>
          </div>
        </section>

        {/* preserved sections */}
        <section className="code-wrap animate pop delay-2" aria-label="Secret code demo">
          <p>Glide To Reveal Secret Code</p>
          <ul className="code" role="list">
            <li tabIndex="0" className="digit" role="listitem"><span>0</span></li>
            <li tabIndex="0" className="digit" role="listitem"><span>3</span></li>
            <li tabIndex="0" className="digit" role="listitem"><span>4</span></li>
            <li tabIndex="0" className="digit" role="listitem"><span>8</span></li>
            <li tabIndex="0" className="digit" role="listitem"><span>7</span></li>
            <li tabIndex="0" className="digit" role="listitem"><span>2</span></li>
          </ul>
        </section>

        <section className="wrap animate pop delay-3" aria-label="Trees example">
          <div className="overlay">
            <div className="overlay-content animate slide-left delay-2">
              <h1 className="animate slide-left pop delay-4">Trees</h1>
              <p className="animate slide-left pop delay-5" style={{ color: "white", marginBottom: "2.5rem" }}>
                Kingdom: <em>Plantae</em>
              </p>
            </div>
            <div className="image-content animate slide delay-5" role="img" aria-label="Forest illustration" />
            <div className="dots animate">
              <div className="dot animate slide-up delay-6" aria-hidden="true" />
              <div className="dot animate slide-up delay-7" aria-hidden="true" />
              <div className="dot animate slide-up delay-8" aria-hidden="true" />
            </div>
          </div>

          <div className="text">
            <p>
              <img className="inset" src="https://assets.codepen.io/4787486/oak_1.jpg" alt="" />
              Trees are woody perennial plants that are a member of the kingdom <em>Plantae</em>.
            </p>
            <p>
              Apart from providing oxygen for the planet and beauty when they bloom or turn color, trees are very useful.
            </p>
            <img className="tree" src="https://assets.codepen.io/4787486/tree+clipart.jpeg" alt="Tree clipart" />
          </div>
        </section>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){
            const handler = (ev) => {
              if (ev.key === 'ArrowRight') ev.target.nextElementSibling?.focus();
              if (ev.key === 'ArrowLeft') ev.target.previousElementSibling?.focus();
            };
            document.querySelectorAll && document.querySelectorAll('.digit').forEach(el => {
              el.addEventListener('keydown', handler);
            });
          })();
      `}} />
    </>
  );
}
