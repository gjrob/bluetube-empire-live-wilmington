
// components/LiveMap.jsx
// Drop‑in map + navigation for live.bluetubetv.live — Wilmington, NC default
//
// Now with a COMPACT TOGGLE so the map doesn't crowd the page.
// By default it renders a small "Navigate" button (collapsed mode).
// Tapping it opens a slide‑up sheet with the map + directions.
//
// 1) Install deps:  npm i leaflet
// 2) Usage in pages/live.js (Next.js, pages router):
//    import dynamic from "next/dynamic";
//    const LiveMap = dynamic(() => import("../components/LiveMap"), { ssr: false });
//    ... inside your page render ...
//    <LiveMap collapsed event={{ lat: 34.2257, lng: -77.9447, label: "Downtown Wilmington" }} />
//    // Or drive it from the URL, e.g.:
//    // https://live.bluetubetv.live/live?lat=34.2257&lng=-77.9447&label=Riverfront%20Park
//
// Notes:
// - Uses OpenStreetMap tiles (free) + OSRM demo router (fine for testing).
//   For production reliability at scale, we can swap to Mapbox Directions or your own OSRM.

import { useEffect, useRef, useState, useMemo } from "react";
import Head from "next/head";
import L from "leaflet";

// Shared button style (must be defined before any return that uses it)
const BTN = {
  appearance: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(29,78,216,.85)",
  color: "#fff",
  padding: "8px 10px",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function LiveMap({
  event = { lat: 34.2257, lng: -77.9447, label: "Downtown Wilmington" },
  height = "380px",
  collapsed = true, // NEW: start collapsed so the page stays clean
  sheetHeight = "68vh", // NEW: slide‑up sheet height
  fabLabel = "Navigate", // NEW: button label when collapsed
}) {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const [evt, setEvt] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [eta, setEta] = useState(null); // { distanceKm, durationMin }
  const [shareCopied, setShareCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(!collapsed); // NEW: controls sheet open/close

  // Compute deep links to native nav apps when evt is known
  const deepLinks = useMemo(() => {
    if (!evt) return null;
    const dest = `${evt.lat},${evt.lng}`;
    return {
      apple: `https://maps.apple.com/?daddr=${dest}&dirflg=d`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      waze: `https://waze.com/ul?ll=${dest}&navigate=yes`,
    };
  }, [evt]);

  // One-time init: choose event from props or URL query
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS once
    const linkId = "leaflet-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Make sure default marker icons load (Next bundlers often need this)
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const params = new URLSearchParams(window.location.search);
    const qLat = parseFloat(params.get("lat"));
    const qLng = parseFloat(params.get("lng"));
    const qLabel = params.get("label");

    if (!Number.isNaN(qLat) && !Number.isNaN(qLng)) {
      setEvt({ lat: qLat, lng: qLng, label: qLabel || event.label });
    } else {
      setEvt(event);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazily create the map only when the sheet is open (so it doesn't load while collapsed)
  useEffect(() => {
    if (!isOpen || !evt || !mapElRef.current) return;

    const map = L.map(mapElRef.current, { zoomControl: false }).setView([evt.lat, evt.lng], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    // Controls
    L.control.zoom({ position: "topright" }).addTo(map);

    // Event marker + popup
    const marker = L.marker([evt.lat, evt.lng]).addTo(map);
    marker.bindPopup(`<b>${(evt.label || "Event").replace(/</g, "&lt;")}</b><br>${evt.lat.toFixed(4)}, ${evt.lng.toFixed(4)}`).openPopup();
    // shared button style (define BEFORE any return that uses it)
const BTN = {
  appearance: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(29,78,216,.85)",
  color: "#fff",
  padding: "8px 10px",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

    return () => map.remove();
  }, [isOpen, evt]);

  // Geolocate user
  const locateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        const map = mapRef.current;
        if (!map) return;
        L.marker([latitude, longitude], { title: "You" })
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();
        map.flyTo([latitude, longitude], 14);
      },
      (err) => {
        alert("Could not get your location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // OPTIONAL helper: set event to current user location (quick pin drop at the venue)
  const setEventToMe = () => {
    if (!userLoc) {
      alert('Tap "Use my location" first.');
      return;
    }
    setEvt({ ...userLoc, label: evt?.label || "Pinned" });
    const map = mapRef.current;
    if (map) map.flyTo([userLoc.lat, userLoc.lng], 15);
  };

  // Fetch and draw driving route from user to event via OSRM
  const routeMe = async () => {
    const map = mapRef.current;
    if (!map || !evt) return;
    if (!userLoc) {
      alert('Tap "Use my location" first.');
      return;
    }

    // Clear old
    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }
    setEta(null);

    const url = `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${evt.lng},${evt.lat}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data || data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No route found");
      }
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const poly = L.polyline(coords, { weight: 6, opacity: 0.85 });
      poly.addTo(map);
      setRouteLayer(poly);
      map.fitBounds(poly.getBounds(), { padding: [24, 24] });
      setEta({ distanceKm: route.distance / 1000, durationMin: route.duration / 60 });
    } catch (e) {
      console.error(e);
      alert("Routing failed. We can switch to Mapbox/Google for production reliability.");
    }
  };

  const copyShare = async () => {
    if (!evt) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lat", String(evt.lat));
    url.searchParams.set("lng", String(evt.lng));
    if (evt.label) url.searchParams.set("label", evt.label);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      alert("Copy failed. You can manually share the URL shown in your address bar.");
    }
  };

  // Collapsed state → just show a floating action button
  if (!isOpen) {
    return (
        <button
  onClick={() => setIsOpen(true)}
  style={{
    position: "fixed",
    right: 12,
    bottom: 88,
    zIndex: 600,
    ...BTN,                    // ← was btnStyle
    padding: "12px 14px",
    borderRadius: 999,
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
  }}
>
  {fabLabel}
</button>
    );
  }

  // OPEN sheet with map + controls
  return (
    <div>
      <Head>
        {/* Leaflet CSS is injected dynamically as a fallback, but adding here is fine too */}
        <link rel="preload" as="style" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </Head>

      {/* backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 590,
        }}
      />

      {/* sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetHeight,
          background: "#0a0e27",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          boxShadow: "0 -12px 36px rgba(0,0,0,0.45)",
          zIndex: 600,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>{evt?.label || "Event"}</div>
        <button onClick={() => setIsOpen(false)} style={{ ...BTN, background: "rgba(255,255,255,0.1)" }}>Close</button>
        </div>

        {/* map */}
        <div ref={mapElRef} style={{ width: "100%", height: "100%" }} />

        {/* controls */}
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            background: "rgba(10, 14, 39, 0.70)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "10px 12px",
            backdropFilter: "blur(8px)",
            color: "#fff",
            zIndex: 650,
          }}
        >
         <button onClick={locateMe}  style={BTN}>Use my location</button>
<button onClick={routeMe}   style={BTN}>Route to event</button>
{userLoc && <button onClick={setEventToMe} style={BTN}>Set event to me</button>}
<a href={deepLinks?.apple}  target="_blank" rel="noreferrer" style={BTN}>Apple Maps</a>
<a href={deepLinks?.google} target="_blank" rel="noreferrer" style={BTN}>Google Maps</a>
<a href={deepLinks?.waze}   target="_blank" rel="noreferrer" style={BTN}>Waze</a>
<button onClick={copyShare}  style={BTN}>{shareCopied ? "Copied!" : "Share"}</button>
          {eta && (
            <span style={{
              alignSelf: "center",
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 13,
            }}>
              ~{eta.durationMin.toFixed(0)} min • {eta.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


