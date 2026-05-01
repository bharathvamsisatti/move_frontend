import React from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "./authClient";
import "./dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL;


// 🌱 constants
const CO2_PER_KM_GRAMS = 120;

export default function RideCard({ item, variant = "ride" }) {
  const navigate = useNavigate();
  const isBooking = variant === "booking";

  // --------- Booking status ---------
  const bookingStatus = item.status || "CONFIRMED";
  const isCancelled = bookingStatus === "CANCELLED";

  // --------- Field mapping ---------
  const date = item.departureDate || "";
  const startTime = item.departureTime || "";
  const from = item.departureLocation || "";
  const to = item.destinationLocation || "";
  const price = item.finalPrice ?? item.pricePerSeat;
  const seatsBooked = item.seatsBooked || 1;
  const distanceKm = item.distanceKm || 0;
  const name = item.driverName || "You";
  const phone = item.phoneNumber || "";

  // --------- ⏱ Cancel allowed? ---------
  let rideStarted = false;
  if (date && startTime) {
    const rideDateTime = new Date(`${date}T${startTime}`);
    rideStarted = new Date() >= rideDateTime;
  }

  // --------- 🌱 CO₂ savings ---------
  const co2SavedKg = isBooking
    ? ((distanceKm * CO2_PER_KM_GRAMS * seatsBooked) / 1000).toFixed(1)
    : null;

  async function cancelBooking() {
    if (!window.confirm("Cancel this booking?")) return;

    await fetch(
      `${API_BASE}/api/rides/booking/${item.bookingId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    window.location.reload();
  }

  return (
    <article
      className="ticket-card"
      style={{
        opacity: isCancelled ? 0.55 : 1,
        background: isBooking ? "#f8fbff" : undefined,
      }}
    >
      {/* STATUS BADGE */}
      {isBooking && (
        <div
          className="ticket-badge"
          style={{
            background: isCancelled ? "#fee2e2" : "#ecfeff",
            color: isCancelled ? "#b91c1c" : "#0f766e",
          }}
        >
          {isCancelled ? "❌ Cancelled" : "✅ Confirmed"}
        </div>
      )}

      <div className="ticket-body">
        {/* ---------- LEFT ---------- */}
        <div className="ticket-left">
          <div className="ticket-day">
            <strong>Date:</strong> {date}
          </div>
          <div className="time">
            <strong>Time:</strong> {startTime}
          </div>
        </div>

        {/* ---------- CENTER ---------- */}
        <div className="ticket-center">
          <div style={{ fontWeight: 700 }}>📍 {from}</div>
          <div style={{ margin: "6px 0", color: "#64748b" }}>↓</div>
          <div style={{ fontWeight: 700 }}>🎯 {to}</div>

          {/* 🌱 CO₂ */}
          {isBooking && distanceKm > 0 && (
            <div
              style={{
                marginTop: 8,
                fontSize: "12px",
                color: "#15803d",
                fontWeight: 700,
              }}
            >
              🌱 CO₂ saved ~ {co2SavedKg} kg
            </div>
          )}
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className="ticket-right">
          <div className="ticket-price">₹{price}</div>
          <div className="ticket-seats">
            <strong>Seats:</strong>{" "}
            {isBooking
              ? `${seatsBooked} seat(s)`
              : `${item.availableSeats}/${item.totalSeats}`}
          </div>

          <div className="ticket-meta">
            <div className="avatar">{name[0]}</div>
            <div className="meta-text">
              <div className="meta-name">
                <strong>Rider:</strong> {name}
              </div>
              {phone && (
                <div className="meta-phone">
                  <strong>Phone:</strong> {phone}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              className="fr-btn ghost"
              onClick={() => navigate(`/ride/${item.id}`)}
            >
              View ride →
            </button>

            {/* ⏱ Cancel logic */}
            {isBooking && !isCancelled && !rideStarted && (
              <button
                onClick={cancelBooking}
                style={{
                  border: "1px solid #ef4444",
                  background: "#fff",
                  color: "#ef4444",
                  borderRadius: "999px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}

            {isBooking && rideStarted && !isCancelled && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#f59e0b",
                }}
              >
                ⏱ Ride started
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
