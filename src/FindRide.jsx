import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "./NavBar";
import "./findride.css";
import LocationPickerModal from "./LocationPickerModal";
import RouteMap from "./RouteMap";
import { apiFetch, handleAuthError, getToken } from "./authClient";

function toDDMMYYYY(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

// used only for display
function niceDateForDisplay(isoDate) {
  if (!isoDate) return "";
  if (isoDate.includes("-")) {
    const parts = isoDate.split("-");
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoDate;
  }
  return isoDate;
}

// 👇 helper: use only first part before comma for searching
function cleanLocationForSearch(raw) {
  if (!raw) return "";
  return raw.split(",")[0].trim(); // "Hyderabad, Telangana..." -> "Hyderabad"
}

// Parse a date string which may be "YYYY-MM-DD" or "DD-MM-YYYY" into { y, m, d } numbers
function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  let y, m, d;
  if (parts[0].length === 4) {
    // YYYY-MM-DD
    y = Number(parts[0]);
    m = Number(parts[1]);
    d = Number(parts[2]);
  } else {
    // assume DD-MM-YYYY
    d = Number(parts[0]);
    m = Number(parts[1]);
    y = Number(parts[2]);
  }
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Build a JS Date from ride's departureDate and optional departureTime.
// Returns a Date object or null on failure.
function buildRideDateTime(ride) {
  if (!ride || !ride.departureDate) return null;
  const parts = parseDateParts(ride.departureDate);
  if (!parts) return null;
  const hhmm = ride.departureTime || "00:00";
  const [hhRaw, mmRaw] = hhmm.split(":");
  const hh = pad2(Number(hhRaw) || 0);
  const mm = pad2(Number(mmRaw) || 0);
  // Construct ISO string: YYYY-MM-DDTHH:MM:00
  const iso = `${parts.y}-${pad2(parts.m)}-${pad2(parts.d)}T${hh}:${mm}:00`;
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.32 },
  }),
};

export default function FindRide() {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    passengerName: "",
    phoneNumber: "",
    seatsBooked: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [selectedRideDetails, setSelectedRideDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const navigate = useNavigate();

  // Defensive token check — non-blocking so public users can still search.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.debug("FindRide: no JWT found in storage (user may be anonymous)");
    }
  }, []);

  // Photon suggestions state
  const [depSuggestions, setDepSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const depDebounceRef = useRef(null);
  const destDebounceRef = useRef(null);

  // GPS picker state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [gpsPosition, setGpsPosition] = useState({ lat: 17.385, lng: 78.4867 });

  // Distance from RouteMap (km)
  const [searchDistanceKm, setSearchDistanceKm] = useState(null);

  // 🔍 Search rides
  async function handleSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setRides([]);

    try {
      const cleanedDeparture = cleanLocationForSearch(departure);
      const cleanedDestination = cleanLocationForSearch(destination);

      const qDate = date
        ? `&departureDate=${encodeURIComponent(toDDMMYYYY(date))}`
        : "";

      const url = `/api/rides/search?departure=${encodeURIComponent(
        cleanedDeparture
      )}&destination=${encodeURIComponent(cleanedDestination)}${qDate}`;

      const res = await apiFetch(url);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || res.statusText || "Search failed");
      }

      const data = await res.json();

      // FILTER OUT PAST RIDES (by date). Keep rides whose departureDate >= today.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingRides = Array.isArray(data)
        ? data.filter((ride) => {
            if (!ride?.departureDate) return false;
            const parts = parseDateParts(ride.departureDate);
            if (!parts) return false;
            const rideDate = new Date(`${parts.y}-${pad2(parts.m)}-${pad2(parts.d)}T00:00:00`);
            rideDate.setHours(0, 0, 0, 0);
            return rideDate >= today;
          })
        : [];

      setRides(upcomingRides);
      setSelectedRideDetails(null);
      setDetailsError(null);
    } catch (err) {
      handleAuthError(err, navigate);
      setError(err.message || "Failed to search rides");
    } finally {
      setLoading(false);
    }
  }

  function openBooking(ride) {
    // Prevent opening booking modal for past rides (safety)
    const dt = buildRideDateTime(ride);
    if (dt && new Date() >= dt) {
      setBookingError("Cannot book a past/expired ride");
      return;
    }

    setSelectedRide(ride);
    setBookingForm({ passengerName: "", phoneNumber: "", seatsBooked: 1 });
    setBookingError(null);
    setShowModal(true);
  }

  function closeBooking() {
    setShowModal(false);
    setSelectedRide(null);
  }

  function onBookingChange(e) {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  }

  // 🧾 Book ride with Razorpay Payment Integration
  async function submitBooking(e) {
    e.preventDefault();

    if (!selectedRide) return;
    setBookingError(null);

    const seats = Number(bookingForm.seatsBooked);

    // Validation
    if (!bookingForm.passengerName.trim())
      return setBookingError("Passenger name required");

    if (!bookingForm.phoneNumber.trim())
      return setBookingError("Phone number required");

    if (!seats || seats < 1)
      return setBookingError("Enter valid seat count");

    if (seats > selectedRide.availableSeats)
      return setBookingError("Not enough seats available");

    // Require login before booking
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Extra safety: re-check ride time before sending request
    const dt = buildRideDateTime(selectedRide);
    if (dt && new Date() >= dt) {
      setBookingError("Cannot book a past/expired ride");
      return;
    }

    try {
      setBookingLoading(true);

      // ✅ STEP 1: CREATE BOOKING FIRST (before Razorpay)
      const payload = {
        passengerName: bookingForm.passengerName.trim(),
        phoneNumber: bookingForm.phoneNumber.trim(),
        seatsBooked: seats,
      };

      const bookingRes = await apiFetch(`/api/rides/book/${selectedRide.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!bookingRes.ok) {
        const body = await bookingRes.json().catch(() => null);
        throw new Error(body?.message || "Booking creation failed");
      }

      const bookingData = await bookingRes.json();
      const bookingId = bookingData.id; // ✅ GET REAL BOOKING ID

      // ✅ STEP 2: Create Razorpay Order via Backend
      const totalAmount = selectedRide.pricePerSeat * seats;

      const orderRes = await apiFetch(
        `/api/payment/create-order?amount=${totalAmount * 100}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => null);
        throw new Error(body?.message || "Failed to create payment order");
      }

      const order = await orderRes.json();

      // Razorpay Payment Configuration
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_xxxxx",
        amount: totalAmount * 100, // Amount in paise
        currency: "INR",
        name: "MOVE Carpooling",
        description: `Ride Booking - ${selectedRide.departureLocation} to ${selectedRide.destinationLocation}`,
        order_id: order.id,
        prefill: {
          name: bookingForm.passengerName,
          contact: bookingForm.phoneNumber,
        },

        handler: async function (response) {
          try {
            // ✅ STEP 3: Verify Payment Signature with Backend (using real bookingId)
            const verifyRes = await apiFetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: totalAmount,
                bookingId: bookingId, // ✅ USING REAL BOOKING ID HERE!
              }),
            });

            if (!verifyRes.ok) {
              const body = await verifyRes.json().catch(() => null);
              throw new Error(body?.message || "Payment verification failed");
            }

            // ✅ STEP 4: Success - Navigate to Thank You Page
            navigate("/BookingSuccess", {
              state: {
                message: "Payment Successful & Booking Confirmed!",
                booking: bookingData,
              },
            });

            closeBooking();
          } catch (err) {
            handleAuthError(err, navigate);
            setBookingError(
              err.message ||
                "Payment verification failed. Please contact support."
            );
            setBookingLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setBookingLoading(false);
            setBookingError("Payment cancelled. Please try again.");
          },
        },

        theme: {
          color: "#3399cc",
        },
      };

      // Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      handleAuthError(err, navigate);
      setBookingError(err.message || "Failed to initiate payment");
      setBookingLoading(false);
    }
  }

  // 📄 View ride details
  async function viewDetails(ride) {
    if (!ride || !ride.id) return;
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedRideDetails(null);

    try {
      const res = await apiFetch(`/api/rides/${ride.id}`);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message || res.statusText || "Failed to load ride details"
        );
      }

      const data = await res.json();

      // If backend returns a past ride here (edge case), protect UI similarly
      setSelectedRideDetails(data);
      setSelectedRide(data);
    } catch (err) {
      handleAuthError(err, navigate);
      setDetailsError(err.message || "Failed to load ride details");
    } finally {
      setDetailsLoading(false);
      setTimeout(() => {
        const el = document.getElementById("ride-details-panel");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  // Photon autocomplete – "From"
  useEffect(() => {
    const query = departure.trim();
    if (depDebounceRef.current) clearTimeout(depDebounceRef.current);

    if (!query || query.length < 2) {
      setDepSuggestions([]);
      return;
    }

    depDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            query
          )}&limit=5&lat=20.5937&lon=78.9629`
        );
        const data = await res.json();
        const suggestions =
          data.features?.map((f) => {
            const p = f.properties || {};
            const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
            return parts.join(", ");
          }) || [];
        setDepSuggestions(suggestions);
      } catch {
        setDepSuggestions([]);
      }
    }, 300);

    return () => {
      if (depDebounceRef.current) clearTimeout(depDebounceRef.current);
    };
  }, [departure]);

  // Photon autocomplete – "To"
  useEffect(() => {
    const query = destination.trim();
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);

    if (!query || query.length < 2) {
      setDestSuggestions([]);
      return;
    }

    destDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            query
          )}&limit=5&lat=20.5937&lon=78.9629`
        );
        const data = await res.json();
        const suggestions =
          data.features?.map((f) => {
            const p = f.properties || {};
            const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
            return parts.join(", ");
          }) || [];
        setDestSuggestions(suggestions);
      } catch {
        setDestSuggestions([]);
      }
    }, 300);

    return () => {
      if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    };
  }, [destination]);

  function selectDepartureSuggestion(s) {
    setDeparture(s);
    setDepSuggestions([]);
  }

  function selectDestinationSuggestion(s) {
    setDestination(s);
    setDestSuggestions([]);
  }

  // GPS picker for "From"
  function openGpsPicker() {
    if (!navigator.geolocation) {
      setShowLocationPicker(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setShowLocationPicker(true);
      },
      () => {
        setShowLocationPicker(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleLocationPicked(result) {
    setDeparture(result.address);
    setShowLocationPicker(false);
  }

  function closeLocationPicker() {
    setShowLocationPicker(false);
  }

  return (
    <>
      <NavBar />
      <main className="fr-root">
        <div className="fr-container">
          <motion.section
            className="fr-search-card fr-search"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h2>Find a Ride</h2>
            <form className="fr-form" onSubmit={handleSearch}>
              <div className="fr-row">
                <label className="fr-col">
                  <span className="fr-label">From</span>
                  <div style={{ position: "relative" }}>
                    <input
                      className="fr-field"
                      placeholder="eg. Hyderabad"
                      required
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      onBlur={() =>
                        setTimeout(() => setDepSuggestions([]), 150)
                      }
                    />
                    <button
                      type="button"
                      className="fr-gps-btn"
                      onClick={openGpsPicker}
                    >
                      📍 Use my location
                    </button>
                    {depSuggestions.length > 0 && (
                      <ul className="location-suggestions">
                        {depSuggestions.map((s, i) => (
                          <li
                            key={i}
                            className="location-suggestion-item"
                            onMouseDown={() => selectDepartureSuggestion(s)}
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>

                <label className="fr-col">
                  <span className="fr-label">To</span>
                  <div style={{ position: "relative" }}>
                    <input
                      className="fr-field"
                      placeholder="eg. Bangalore"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onBlur={() =>
                        setTimeout(() => setDestSuggestions([]), 150)
                      }
                    />
                    {destSuggestions.length > 0 && (
                      <ul className="location-suggestions">
                        {destSuggestions.map((s, i) => (
                          <li
                            key={i}
                            className="location-suggestion-item"
                            onMouseDown={() => selectDestinationSuggestion(s)}
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>

                <label className="fr-col">
                  <span className="fr-label">Date (optional)</span>
                  <input
                    className="fr-field"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>

                <div className="fr-col fr-actions-col">
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <motion.button
                      type="submit"
                      className="fr-btn primary"
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? "Searching…" : "Search"}
                    </motion.button>
                    <motion.button
                      type="button"
                      className="fr-btn ghost"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setDeparture("");
                        setDestination("");
                        setDate("");
                        setRides([]);
                        setSelectedRideDetails(null);
                        setDepSuggestions([]);
                        setDestSuggestions([]);
                        setSearchDistanceKm(null);
                        setError(null);
                      }}
                    >
                      Reset
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>
            {error && <div className="fr-error">{error}</div>}
          </motion.section>

          {/* Map showing route between From & To */}
          <RouteMap
            departure={departure}
            destination={destination}
            containerClass="fr-route-map-container"
            mapClass="fr-route-map"
            onDistanceChange={setSearchDistanceKm}
          />

          {/* Distance display */}
          {departure && destination && (
            <div className="fr-distance">
              Approx distance:{" "}
              {searchDistanceKm != null
                ? `${searchDistanceKm} km`
                : "calculating…"}
            </div>
          )}

          <section className="fr-results">
            <AnimatePresence>
              {!loading && rides.length === 0 && (
                <motion.div
                  className="fr-empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="fr-empty-card">
                    <div>No rides found. Try broadening your search.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ul className="fr-list">
              {rides.map((ride, idx) => {
                const dt = buildRideDateTime(ride);
                const isPastRide = dt ? new Date() >= dt : false;

                return (
                  <motion.li
                    key={ride.id}
                    className="fr-card"
                    onClick={() => viewDetails(ride)}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    layout
                    style={{ cursor: "pointer" }}
                  >
                    <div className="fr-card-top">
                      <div>
                        <div className="fr-driver">{ride.driverName}</div>
                        <div className="fr-route">
                          {ride.departureLocation} → {ride.destinationLocation}
                        </div>
                        <div className="fr-datetime">
                          {niceDateForDisplay(ride.departureDate)} •{" "}
                          {ride.departureTime}
                        </div>
                      </div>
                      <div className="fr-price">
                        ₹
                        {ride.pricePerSeat?.toFixed
                          ? ride.pricePerSeat.toFixed(0)
                          : ride.pricePerSeat}
                      </div>
                    </div>

                    <div className="fr-card-body">
                      <div>
                        Available seats: <strong>{ride.availableSeats}</strong> /{" "}
                        {ride.totalSeats}
                      </div>
                      <div>
                        Phone:{" "}
                        <a
                          href={`tel:${ride.phoneNumber}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ride.phoneNumber}
                        </a>
                      </div>
                    </div>

                    <div
                      className="fr-card-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.button
                        className="fr-btn primary"
                        whileTap={{ scale: 0.98 }}
                        disabled={ride.availableSeats <= 0 || isPastRide}
                        onClick={() => openBooking(ride)}
                      >
                        {isPastRide
                          ? "Expired"
                          : ride.availableSeats > 0
                          ? "Book Seat"
                          : "Full"}
                      </motion.button>
                      <motion.button
                        className="fr-btn ghost"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => viewDetails(ride)}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </section>

          {selectedRideDetails && (
            <section id="ride-details-panel" className="fr-details">
              <motion.div
                className="fr-details-card"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32 }}
              >
                <div className="fr-details-header">
                  <h3>Ride details</h3>
                  <button
                    className="fr-btn ghost"
                    onClick={() => setSelectedRideDetails(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="fr-details-body">
                  {detailsLoading ? (
                    <div className="fr-info">Loading details…</div>
                  ) : detailsError ? (
                    <div className="fr-error">{detailsError}</div>
                  ) : (
                    <>
                      <div>
                        <strong>Driver:</strong> {selectedRideDetails.driverName}
                      </div>
                      <div>
                        <strong>Contact:</strong>{" "}
                        <a href={`tel:${selectedRideDetails.phoneNumber}`}>
                          {selectedRideDetails.phoneNumber}
                        </a>
                      </div>
                      <div>
                        <strong>Route:</strong>{" "}
                        {selectedRideDetails.departureLocation} →{" "}
                        {selectedRideDetails.destinationLocation}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {niceDateForDisplay(selectedRideDetails.departureDate)}
                      </div>
                      <div>
                        <strong>Time:</strong> {selectedRideDetails.departureTime}
                      </div>
                      <div>
                        <strong>Seats:</strong>{" "}
                        {selectedRideDetails.availableSeats} available /{" "}
                        {selectedRideDetails.totalSeats} total
                      </div>
                      <div>
                        <strong>Price per seat:</strong> ₹
                        {selectedRideDetails.pricePerSeat}
                      </div>

                      <div className="fr-details-actions">
                        {(() => {
                          const dt = buildRideDateTime(selectedRideDetails);
                          const isPast = dt ? new Date() >= dt : false;
                          return (
                            <>
                              <button
                                className="fr-btn primary"
                                disabled={
                                  selectedRideDetails.availableSeats <= 0 || isPast
                                }
                                onClick={() =>
                                  openBooking(selectedRideDetails)
                                }
                              >
                                {isPast
                                  ? "Expired"
                                  : selectedRideDetails.availableSeats > 0
                                  ? "Book Now"
                                  : "Full"}
                              </button>
                              <a
                                className="fr-link"
                                href={`tel:${selectedRideDetails.phoneNumber}`}
                              >
                                Call Driver
                              </a>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </section>
          )}

          <AnimatePresence>
            {showModal && selectedRide && (
              <motion.div
                className="fr-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2000,
                }}
              >
                <motion.div
                  className="fr-modal"
                  initial={{ y: 12, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 6, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.28 }}
                >
                  <h3>Book ride with {selectedRide.driverName}</h3>
                  <div className="fr-modal-sub">
                    Route: {selectedRide.departureLocation} →{" "}
                    {selectedRide.destinationLocation}
                  </div>

                  <form onSubmit={submitBooking} className="fr-book-form">
                    <label>
                      Passenger name
                      <input
                        name="passengerName"
                        value={bookingForm.passengerName}
                        onChange={onBookingChange}
                        required
                      />
                    </label>

                    <label>
                      Phone number
                      <input
                        name="phoneNumber"
                        value={bookingForm.phoneNumber}
                        onChange={onBookingChange}
                        required
                      />
                    </label>

                    <label>
                      Seats
                      <input
                        name="seatsBooked"
                        type="number"
                        min="1"
                        max={selectedRide.availableSeats}
                        value={bookingForm.seatsBooked}
                        onChange={onBookingChange}
                        required
                      />
                    </label>

                    {bookingError && (
                      <div className="fr-error">{bookingError}</div>
                    )}

                    <div className="fr-modal-actions">
                      <button
                        type="submit"
                        className="fr-btn primary"
                        disabled={bookingLoading}
                      >
                        {bookingLoading
                          ? "Processing…"
                          : `Pay ₹${(
                              selectedRide.pricePerSeat * bookingForm.seatsBooked
                            ).toFixed(0)} & Book`}
                      </button>
                      <button
                        type="button"
                        className="fr-btn ghost"
                        onClick={closeBooking}
                        disabled={bookingLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location picker modal */}
          {showLocationPicker && (
            <LocationPickerModal
              initialPosition={gpsPosition}
              title="Pick your starting point"
              onConfirm={handleLocationPicked}
              onCancel={closeLocationPicker}
            />
          )}
        </div>
      </main>
    </>
  );
}