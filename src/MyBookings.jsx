import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "./DashboardNav";
import RideCard from "./RideCard";
import "./dashboard.css";
import { apiFetch, handleAuthError } from "./authClient";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/rides/my/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((err) => handleAuthError(err, navigate));
  }, [navigate]);

  return (
    <>
      <DashboardNav />

      <main className="dashboard-full">
        <div className="content-inner">
          <h1 className="dashboard-title">Your bookings</h1>

          {bookings.length === 0 ? (
            <p className="empty-text">You haven’t booked any rides yet.</p>
          ) : (
            <div className="cards-stack">
              {bookings.map((b) => {
                if (!b.ride) return null;

                return (
                  <RideCard
                    key={b.id}
                    variant="booking"
                    item={{
                      ...b.ride,
                      bookingId: b.id,
                      seatsBooked: b.seatsBooked,
                      finalPrice: b.finalPrice,
                      bookTime: b.bookTime,
                      status: b.status,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
