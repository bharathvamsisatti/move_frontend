import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./offerride.css";
import NavBar from "./NavBar";
import LocationPickerModal from "./LocationPickerModal";
import RouteMap from "./RouteMap";
import { apiFetch, handleAuthError } from "./authClient"; // ✅ FIXED import path

// Lazy-load lottie-react (production safe)
const Lottie = lazy(() => import("lottie-react"));

const initialForm = {
  driverName: "",
  phoneNumber: "",
  vehicleNumber: "",
  totalSeats: "",
  availableSeats: "",
  pricePerSeat: "",
  departureLocation: "",
  destinationLocation: "",
  departureDate: "",
  departureTime: "",
};

function todayIsoDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toBackendDate(isoDate) {
  if (!isoDate) return "";
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.25 } },
};

export default function OfferRide() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  const [plateImage, setPlateImage] = useState(null);

  const [depSuggestions, setDepSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const depDebounceRef = useRef(null);
  const destDebounceRef = useRef(null);

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerField, setLocationPickerField] = useState(null);
  const [gpsPosition, setGpsPosition] = useState({ lat: 17.385, lng: 78.4867 });

  const [routeDistanceKm, setRouteDistanceKm] = useState(null);

  const navigate = useNavigate();

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function onPlateImageChange(e) {
    const file = e.target.files && e.target.files[0];
    setPlateImage(file || null);
  }

  function validate() {
    const err = {};

    if (!form.driverName.trim()) err.driverName = "Driver name required";
    if (!form.phoneNumber.trim()) err.phoneNumber = "Phone number required";

    if (!form.vehicleNumber.trim()) err.vehicleNumber = "Vehicle number is required";

    if (!form.totalSeats) err.totalSeats = "Total seats required";
    if (!form.availableSeats) err.availableSeats = "Available seats required";

    if (form.totalSeats && form.availableSeats) {
      const total = Number(form.totalSeats);
      const avail = Number(form.availableSeats);
      if (!Number.isInteger(total) || total <= 0) err.totalSeats = "Total seats must be an integer ≥ 1";
      if (!Number.isInteger(avail) || avail < 0) err.availableSeats = "Available seats must be an integer ≥ 0";
      if (avail > total) err.availableSeats = "Available seats cannot exceed total seats";
    }

    if (form.pricePerSeat !== "" && (isNaN(Number(form.pricePerSeat)) || Number(form.pricePerSeat) < 0)) {
      err.pricePerSeat = "Price must be a non-negative number";
    }

    if (!form.departureLocation.trim()) err.departureLocation = "Departure location required";
    if (!form.destinationLocation.trim()) err.destinationLocation = "Destination required";

    if (!form.departureDate) err.departureDate = "Date required";
    if (form.departureDate) {
      const selected = new Date(form.departureDate + "T00:00:00");
      const today = new Date(todayIsoDate() + "T00:00:00");
      if (selected < today) err.departureDate = "Departure date must be today or future";
    }

    if (!form.departureTime) err.departureTime = "Time required";

    return err;
  }

  // === IMPORTANT: updated submit flow ===
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    const ridePayload = {
      driverName: form.driverName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      totalSeats: Number(form.totalSeats),
      availableSeats: Number(form.availableSeats),
      pricePerSeat: form.pricePerSeat === "" ? 0 : Number(form.pricePerSeat),
      departureLocation: form.departureLocation.trim(),
      destinationLocation: form.destinationLocation.trim(),
      departureDate: toBackendDate(form.departureDate),
      departureTime: form.departureTime,
      distanceKm: routeDistanceKm,
    };

    setLoading(true);

    try {
      let res;

      if (plateImage) {
        const formData = new FormData();
        formData.append(
          "ride",
          new Blob([JSON.stringify(ridePayload)], {
            type: "application/json",
          })
        );
        formData.append("image", plateImage);

        // ✅ USE apiFetch
        res = await apiFetch("/api/rides/add-with-image", {
          method: "POST",
          body: formData,
        });
      } else {
        // ✅ USE apiFetch
        res = await apiFetch("/api/rides/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ridePayload),
        });
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to publish ride");
      }

      await res.json();

      setMessage({
        type: "success",
        text: "Ride published successfully! Redirecting…",
      });

      setForm(initialForm);
      setRouteDistanceKm(null);
      setPlateImage(null);
      setCountdown(4);
    } catch (err) {
      console.error("Offer ride error:", err);

      // ✅ CENTRALIZED AUTH HANDLING
      handleAuthError(err, navigate);

      setMessage({
        type: "error",
        text: err.message || "Failed to publish ride",
      });
    } finally {
      setLoading(false);
    }
  }

  // === end submit flow changes ===

  // redirect timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    countdownRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, navigate]);

  // Photon autocomplete – departure
  useEffect(() => {
    const query = form.departureLocation.trim();
    if (depDebounceRef.current) clearTimeout(depDebounceRef.current);

    if (!query || query.length < 2) {
      setDepSuggestions([]);
      return;
    }

    depDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=20.5937&lon=78.9629`
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
  }, [form.departureLocation]);

  // Photon autocomplete – destination
  useEffect(() => {
    const query = form.destinationLocation.trim();
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);

    if (!query || query.length < 2) {
      setDestSuggestions([]);
      return;
    }

    destDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=20.5937&lon=78.9629`
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
  }, [form.destinationLocation]);

  function selectDepartureSuggestion(s) {
    setForm((f) => ({ ...f, departureLocation: s }));
    setDepSuggestions([]);
  }

  function selectDestinationSuggestion(s) {
    setForm((f) => ({ ...f, destinationLocation: s }));
    setDestSuggestions([]);
  }

  function openGpsPicker(whichField) {
    setLocationPickerField(whichField);

    if (!navigator.geolocation) {
      setShowLocationPicker(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setShowLocationPicker(true);
      },
      () => {
        setShowLocationPicker(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleLocationPicked(result) {
    const { address } = result;
    if (locationPickerField === "departure") {
      setForm((f) => ({ ...f, departureLocation: address }));
    } else if (locationPickerField === "destination") {
      setForm((f) => ({ ...f, destinationLocation: address }));
    }
    setShowLocationPicker(false);
  }

  function closeLocationPicker() {
    setShowLocationPicker(false);
  }

  return (
    <>
      <NavBar />

      <main className="offr-page">
        <div className="offr-layout">
          {/* ========== LEFT SIDE (NEW) ========== */}
          <motion.aside
            className="offr-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<div style={{ height: 300 }} />}>
              <Lottie
                path="/lottie/car-animation.json"
                loop
                autoplay
                className="offr-lottie"
              />
            </Suspense>

            <blockquote className="offr-quote">
              “Let your vacant seats be a destination for someone.”
            </blockquote>

            <p className="offr-quote-sub">
              Share rides · Save fuel · Build connections
            </p>
          </motion.aside>

          {/* ========== RIGHT SIDE (EXISTING FORM) ========== */}
          <AnimatePresence mode="wait">
            <motion.section
              key="offr-card"
              className="offr-card"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={cardVariants}
              role="region"
              aria-labelledby="offer-ride-heading"
            >
              <h2 id="offer-ride-heading">Offer a Ride</h2>
              <p>Fill details and publish your ride.</p>

              <form onSubmit={handleSubmit} noValidate>
                {/* driver / phone / vehicle / plate image / seats / price */}
                <div className="offr-input">
                  <label>Driver Name</label>
                  <input type="text" name="driverName" value={form.driverName} onChange={onChange} />
                  {errors.driverName && <small className="offr-err">{errors.driverName}</small>}
                </div>

                <div className="offr-input">
                  <label>Phone Number</label>
                  <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={onChange} />
                  {errors.phoneNumber && <small className="offr-err">{errors.phoneNumber}</small>}
                </div>

                <div className="offr-input">
                  <label>Vehicle Number</label>
                  <input type="text" name="vehicleNumber" value={form.vehicleNumber} onChange={onChange} placeholder="TS09AB1234" />
                  {errors.vehicleNumber && <small className="offr-err">{errors.vehicleNumber}</small>}
                </div>

                <div className="offr-input">
                  <label>Number Plate Photo <span style={{fontSize:"0.8rem"}}>(optional)</span></label>
                  <input type="file" accept="image/*" onChange={onPlateImageChange} />
                  {plateImage && <small style={{ color: "#4f46e5" }}>Selected: {plateImage.name}</small>}
                </div>

                <div className="offr-row">
                  <div className="offr-col-half offr-input">
                    <label>Total Seats</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="totalSeats"
                      value={form.totalSeats}
                      onChange={onChange}
                      placeholder="e.g. 4"
                    />

                    {errors.totalSeats && <small className="offr-err">{errors.totalSeats}</small>}
                  </div>

                  <div className="offr-col-half offr-input">
                    <label>Available Seats(exclude driver)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="availableSeats"
                      value={form.availableSeats}
                      onChange={onChange}
                      placeholder="e.g. 3"
                    />

                    {errors.availableSeats && <small className="offr-err">{errors.availableSeats}</small>}
                  </div>
                </div>

                <div className="offr-input">
                  <label>Price Per Seat (₹)</label>
                  <input type="number" min="0" name="pricePerSeat" value={form.pricePerSeat} onChange={onChange} />
                  {errors.pricePerSeat && <small className="offr-err">{errors.pricePerSeat}</small>}
                </div>

                {/* departure + destination with suggestions */}
                <div className="offr-input">
                  <label>Departure Location</label>
                  <div style={{ position: "relative" }}>
                    <input type="text" name="departureLocation" value={form.departureLocation} onChange={onChange} onBlur={() => setTimeout(() => setDepSuggestions([]), 150)} />
                    <button type="button" className="offr-gps-btn" onClick={() => openGpsPicker("departure")}>📍 Use my location</button>
                    {depSuggestions.length > 0 && (
                      <ul className="location-suggestions">
                        {depSuggestions.map((s, i) => (
                          <li key={i} className="location-suggestion-item" onMouseDown={() => selectDepartureSuggestion(s)}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {errors.departureLocation && <small className="offr-err">{errors.departureLocation}</small>}
                </div>

                <div className="offr-input">
                  <label>Destination Location</label>
                  <div style={{ position: "relative" }}>
                    <input type="text" name="destinationLocation" value={form.destinationLocation} onChange={onChange} onBlur={() => setTimeout(() => setDestSuggestions([]), 150)} />
                    <button type="button" className="offr-gps-btn" onClick={() => openGpsPicker("destination")}>📍 Use my location</button>
                    {destSuggestions.length > 0 && (
                      <ul className="location-suggestions">
                        {destSuggestions.map((s, i) => (
                          <li key={i} className="location-suggestion-item" onMouseDown={() => selectDestinationSuggestion(s)}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {errors.destinationLocation && <small className="offr-err">{errors.destinationLocation}</small>}
                </div>

                <RouteMap
                  departure={form.departureLocation}
                  destination={form.destinationLocation}
                  containerClass="offr-route-map-container"
                  mapClass="offr-route-map"
                  onDistanceChange={setRouteDistanceKm}
                />

                {form.departureLocation && form.destinationLocation && (
                  <div className="offr-distance">
                    Approx distance: {routeDistanceKm != null ? `${routeDistanceKm} km` : "calculating…"}
                  </div>
                )}

                <div className="offr-row">
                  <div className="offr-col-half offr-input">
                    <label>Date</label>
                    <input type="date" name="departureDate" value={form.departureDate} onChange={onChange} min={todayIsoDate()} />
                    {errors.departureDate && <small className="offr-err">{errors.departureDate}</small>}
                  </div>

                  <div className="offr-col-half offr-input">
                    <label>Time</label>
                    <input type="time" name="departureTime" value={form.departureTime} onChange={onChange} />
                    {errors.departureTime && <small className="offr-err">{errors.departureTime}</small>}
                  </div>
                </div>

                <motion.button type="submit" className="offr-btn" whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }} disabled={loading} aria-busy={loading}>
                  {loading ? "Publishing…" : "Confirm & Publish"}
                </motion.button>

                {message && (
                  <div className={`offr-message ${message.type}`}>
                    {message.text}
                    {countdown !== null && <div>Redirecting in {countdown}s…</div>}
                  </div>
                )}
              </form>
            </motion.section>
          </AnimatePresence>
        </div>
      </main>

      {/* ======= MANDATORY: mount the modal when requested ======= */}
      {showLocationPicker && (
        <LocationPickerModal
          initialPosition={gpsPosition}
          onConfirm={handleLocationPicked}
          onCancel={closeLocationPicker}
          title="Select location"
        />
      )}
    </>
  );
}