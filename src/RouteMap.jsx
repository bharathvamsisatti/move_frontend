// RouteMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// simple haversine as fallback if OSRM route fails
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Shows markers (and a driving route) between departure & destination.
 * Calls onDistanceChange(km) when distance is known.
 */
export default function RouteMap({
  departure,
  destination,
  containerClass,
  mapClass,
  onDistanceChange, // 🔹 NEW
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Marker icon fix
    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    const map = L.map(mapContainerRef.current).setView(
      [20.5937, 78.9629], // India
      5
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }, []);

  // Update markers + route whenever addresses change
  useEffect(() => {
    async function updateRoute() {
      const map = mapRef.current;
      if (!map) return;

      // reset distance
      if (onDistanceChange) onDistanceChange(null);

      // Clear old markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      // Clear old route
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (!departure && !destination) return;

      async function geocode(query) {
        if (!query || !query.trim()) return null;
        try {
          // bias to India
          const res = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(
              query
            )}&limit=1&lat=20.5937&lon=78.9629`
          );
          const data = await res.json();
          const feature = data.features && data.features[0];
          if (!feature) return null;
          const [lng, lat] = feature.geometry.coordinates;
          return { lat, lng };
        } catch {
          return null;
        }
      }

      const dep = departure ? await geocode(departure) : null;
      const dest = destination ? await geocode(destination) : null;

      const points = [];

      if (dep) {
        const m = L.marker([dep.lat, dep.lng]).addTo(map);
        markersRef.current.push(m);
        points.push([dep.lat, dep.lng]);
      }

      if (dest) {
        const m = L.marker([dest.lat, dest.lng]).addTo(map);
        markersRef.current.push(m);
        points.push([dest.lat, dest.lng]);
      }

      if (!points.length) return;

      // Fit to markers
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });

      // If both points exist, try OSRM first
      if (dep && dest) {
        let distanceKm = null;

        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${dep.lng},${dep.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);

          if (res.ok) {
            const data = await res.json();
            const route = data.routes && data.routes[0];
            if (route && route.geometry) {
              const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
              const line = L.polyline(coords, { weight: 4, color: "#2563eb" });
              line.addTo(map);
              routeLayerRef.current = line;

              if (typeof route.distance === "number") {
                distanceKm = route.distance / 1000; // meters -> km
              }
            }
          }
        } catch {
          // ignore error, we'll use haversine
        }

        // Fallback: straight-line distance
        if (distanceKm == null) {
          distanceKm = haversineKm(dep.lat, dep.lng, dest.lat, dest.lng);
        }

        if (onDistanceChange && distanceKm != null && !Number.isNaN(distanceKm)) {
          onDistanceChange(Number(distanceKm.toFixed(1))); // round 1 decimal
        }
      }
    }

    updateRoute();
  }, [departure, destination, onDistanceChange]);

  return (
    <div className={containerClass || "route-map-container"}>
      <div
        ref={mapContainerRef}
        className={mapClass || "route-map"}
        style={{ width: "100%", height: "260px" }}
      />
    </div>
  );
}
