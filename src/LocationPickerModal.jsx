import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LocationPickerModal({
  initialPosition = { lat: 17.385, lng: 78.4867 }, // fallback: Hyderabad
  onConfirm,
  onCancel,
  title = "Select location"
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix marker icon paths in bundlers
    const markerIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    const map = L.map(mapContainerRef.current).setView(
      [initialPosition.lat, initialPosition.lng],
      15
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const marker = L.marker([initialPosition.lat, initialPosition.lng], {
      draggable: true,
      icon: markerIcon
    }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const p = marker.getLatLng();
      setPosition({ lat: p.lat, lng: p.lng });
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
    };
  }, [initialPosition.lat, initialPosition.lng]);

  async function handleConfirm() {
    const { lat, lng } = position;
    let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        address = data.display_name;
      }
    } catch {
      // ignore, fallback to lat/lng string
    }

    onConfirm({ lat, lng, address });
  }

  return (
    <div className="loc-modal-backdrop">
      <div className="loc-modal">
        <h3 className="loc-modal-title">{title}</h3>
        <div ref={mapContainerRef} className="loc-map" />
        <div className="loc-modal-actions">
          <button className="fr-btn primary" type="button" onClick={handleConfirm}>
            Use this location
          </button>
          <button className="fr-btn ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
