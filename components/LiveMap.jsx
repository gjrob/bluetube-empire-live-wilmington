/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SunCalc from "suncalc";

/* ---------- helpers ---------- */
function isNightAt(lat, lng, d = new Date()) {
  const t = SunCalc.getTimes(d, lat, lng);
  return d < t.sunrise || d > t.sunset;
}

async function getWeather(lat, lng) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph`;
  const r = await fetch(url);
  const j = await r.json();
  const c = j?.current ?? {};
  return {
    temp: typeof c.temperature_2m === "number" ? Math.round(c.temperature_2m) : null,
    wind: typeof c.wind_speed_10m === "number" ? Math.round(c.wind_speed_10m) : null,
    code: c.weather_code,
  };
}

function weatherEmoji(code) {
  if (code == null) return "•";
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "⛅️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "•";
}

// Accept many pin shapes
function coerceLatLng(p) {
  let lat = p.lat ?? p.latitude ?? p?.geo?.lat ?? p?.location?.lat;
  let lng = p.lng ?? p.longitude ?? p.lon ?? p.long ?? p?.geo?.lng ?? p?.geo?.lon ?? p?.location?.lng ?? p?.location?.lon;
  const arr = p.coords ?? p.coord ?? p.latlng ?? p.latLng ?? p.location?.coords;
  if ((lat == null || lng == null) && Array.isArray(arr) && arr.length >= 2) {
    let a = Number(arr[0]), b = Number(arr[1]);
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) { lat = a; lng = b; }
    else if (Math.abs(b) <= 90 && Math.abs(a) <= 180) { lat = b; lng = a; }
  }
  lat = Number(lat); lng = Number(lng);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return { lat, lng };
}

/* ---------- component ---------- */
export default function LiveMap({
  pins = [],
  collapsed = false,
  fabPos = { right: 12, top: 180 },
  mode = "overlay", // "overlay" | "fullscreen"
}) {
  const mapRef = useRef(null);
  const elRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(!!collapsed);
  const [wx, setWx] = useState({ temp: null, wind: null, code: null });
  const [night, setNight] = useState(false);

  // normalize pins
  const pts = useMemo(() => {
    return (pins || [])
      .map((p) => {
        const pair = coerceLatLng(p);
        if (!pair) return null;
        return {
          id: p.id || `${pair.lat},${pair.lng}`,
          name: p.name || p.title || "Location",
          address: p.address || "",
          lat: pair.lat,
          lng: pair.lng,
          phone: p.phone || p.tel || "",
          url: p.url || p.link || "",
        };
      })
      .filter(Boolean);
  }, [pins]);

  // open (if hidden), resize, and center
  const handleCenter = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;

    if (isCollapsed) setIsCollapsed(false);

    const centerNow = () => {
      m.invalidateSize();
      if (pts.length) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        for (const p of pts) {
          if (p.lat < minLat) minLat = p.lat;
          if (p.lat > maxLat) maxLat = p.lat;
          if (p.lng < minLng) minLng = p.lng;
          if (p.lng > maxLng) maxLng = p.lng;
        }
        m.fitBounds([[minLat, minLng], [maxLat, maxLng]], { animate: true, maxZoom: 16 });
      } else {
        m.setView([34.2257, -77.9447], 12, { animate: true });
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(centerNow));
  }, [pts, isCollapsed]);

  // show/hide shell and resize when opening
  const toggleMap = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (!next) {
        const m = mapRef.current;
        if (m) requestAnimationFrame(() =>
          requestAnimationFrame(() => m.invalidateSize())
        );
      }
      return next;
    });
  }, []);

  // layout style for overlay vs fullscreen
  const shellStyle =
    mode === "fullscreen"
      ? { position: "fixed", left: 0, right: 0, top: 56, bottom: 0, width: "auto", height: "auto", borderRadius: 0, zIndex: 60 }
      : { position: "fixed", left: 12, bottom: 148, width: "min(560px, 92vw)", height: 320, zIndex: 60, borderRadius: 16 };

  /* ---------- map effect ---------- */
  useEffect(() => {
    let L;
    let wxTimer = null;
    let timeTimer = null;

    (async () => {
      if (!elRef.current || mapRef.current) return;

      const leaf = await import("leaflet");
      await import("leaflet.markercluster");
      L = leaf.default || leaf;

      // marker icons
      const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
      const DefaultIcon = L.icon({
        iconUrl, iconRetinaUrl, shadowUrl,
        iconSize: [25,41], iconAnchor: [12,41],
        popupAnchor: [1,-34], shadowSize: [41,41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // map
      const map = L.map(elRef.current, {
        center: [34.2257, -77.9447],
        zoom: 12,
        minZoom: 3,
        maxZoom: 19,
        scrollWheelZoom: false,
        wheelDebounceTime: 400,
        worldCopyJump: true,
      });
      mapRef.current = map;

      // base layers
      const dayTiles = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap" }
      );
    const STADIA_KEY = "a70f4769-2148-4dea-a352-a6d62433558f";
     const nightTiles = L.tileLayer(
   "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
   `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`,

   {
     attribution: "&copy; Stadia Maps, OpenMapTiles, OpenStreetMap contributors &copy; CARTO",
     subdomains: "abcd",
     maxZoom: 20
   }
 );
      dayTiles.addTo(map);
 
      const updateBaseByTime = () => {
        const m = mapRef.current;
        if (!m) return;
        const c = m.getCenter();
        const n = isNightAt(c.lat, c.lng);
        setNight(n);
        if (n) {
          if (m.hasLayer(dayTiles)) m.removeLayer(dayTiles);
          if (!m.hasLayer(nightTiles)) nightTiles.addTo(m);
        } else {
          if (m.hasLayer(nightTiles)) m.removeLayer(nightTiles);
          if (!m.hasLayer(dayTiles)) dayTiles.addTo(m);
        }
      };
      nightTiles.on('tileerror', () => {
  const m = mapRef.current;
  if (!m) return;
  // fall back to a free dark layer
  const cartoDark = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { attribution: "© OSM contributors, © CARTO", subdomains: "abcd", maxZoom: 20 }
  );
  if (m.hasLayer(nightTiles)) m.removeLayer(nightTiles);
  cartoDark.addTo(m);
});
      // clusters + markers
      const cluster = L.markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        maxClusterRadius: 60,
        zoomToBoundsOnClick: true,
        spiderfyOnEveryZoom: false,
        iconCreateFunction: (c) =>
          L.divIcon({
            html: `<div class="mc-bubble"><span>${c.getChildCount()}</span></div>`,
            className: "mc-none",
            iconSize: [46, 46],
          }),
      });
      map.addLayer(cluster);

      const bounds = L.latLngBounds([]);
      pts.forEach((pt) => {
        const m = L.marker([pt.lat, pt.lng]);
        const phoneBtn = pt.phone ? `<a href="tel:${pt.phone.replace(/[^0-9+]/g, "")}" class="lm-btn">Call</a>` : "";
        const webBtn   = pt.url   ? `<a href="${pt.url}" target="_blank" rel="noreferrer" class="lm-btn">Website</a>` : "";
        const dirBtn   = `<a href="https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}&travelmode=driving" target="_blank" rel="noreferrer" class="lm-btn lm-primary">Directions ↗</a>`;
        m.bindPopup(`
          <div class="lm-pop">
            <div class="lm-title">${escapeHtml(pt.name)}</div>
            ${pt.address ? `<div class="lm-sub">${escapeHtml(pt.address)}</div>` : ""}
            <div class="lm-row">${dirBtn}${phoneBtn}${webBtn}</div>
          </div>
        `);
        cluster.addLayer(m);
        bounds.extend([pt.lat, pt.lng]);
      });
      if (pts.length) map.fitBounds(bounds.pad(0.2), { animate: true, maxZoom: 16 });

      // weather
      const updateWeather = async () => {
        const m = mapRef.current;
        if (!m) return;
        const c = m.getCenter();
        const w = await getWeather(c.lat, c.lng).catch(() => null);
        if (w) setWx(w);
      };

      updateBaseByTime();
      updateWeather();

      map.on("click", () => map.scrollWheelZoom.enable());
      map.on("moveend", updateBaseByTime);
      map.on("moveend", updateWeather);

      timeTimer = setInterval(updateBaseByTime, 10 * 60 * 1000);
      wxTimer   = setInterval(updateWeather,   5 * 60 * 1000);
    })();
    // choose layout based on mode + collapsed state
const isFull = mode === "fullscreen";
const shellStyle = {
  position: "fixed",
  left: isFull ? 0 : 12,
  right: isFull ? 0 : undefined,
  top: isFull ? 56 : undefined,     // leave room for a top bar on /map
  bottom: isFull ? 0 : 176,         // clears your tip buttons
  width: isFull ? "auto" : "min(560px, 92vw)",
  height: isCollapsed ? 0 : (isFull ? "auto" : 320),  // 🔑 collapses when hidden
  borderRadius: isFull ? 0 : 16,
  zIndex: 60,
  overflow: "hidden",
  // make it non-blocking when hidden
  pointerEvents: isCollapsed ? "none" : "auto",
  // pretty when visible; invisible when hidden
  border: isCollapsed ? 0 : "1px solid rgba(111,227,255,.25)",
  boxShadow: isCollapsed ? "none" : "0 12px 40px rgba(0,0,0,.35)",
  background: isCollapsed
    ? "transparent"
    : "radial-gradient(800px 400px at 20% 80%, rgba(111,227,255,.08), transparent 60%), rgba(7,19,46,.85)",
  backdropFilter: isCollapsed ? "none" : "blur(8px)",
  transition: "height .18s ease",
};

    return () => {
      try { if (mapRef.current) mapRef.current.remove(); } catch {}
      mapRef.current = null;
      try { /* timers may be null the first render */ } finally {}
    };
  }, [pts]);

  /* ---------- render ---------- */
  return (
    <>
      {/* Day/Night + Weather badge */}
      <div
        style={{
          position: "fixed",
          right: (fabPos?.right ?? 12),
          top: (fabPos?.top ?? 180) - 48,
          zIndex: 71,
          padding: "8px 10px",
          borderRadius: 12,
          border: "1px solid rgba(111,227,255,.35)",
          background: night
            ? "linear-gradient(180deg, rgba(6,12,28,.75), rgba(4,9,22,.55))"
            : "linear-gradient(180deg, rgba(240,248,255,.85), rgba(220,236,255,.75))",
          color: night ? "#dbe7ff" : "#052342",
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          backdropFilter: "blur(8px)",
        }}
        title="Auto switches tiles by sunrise/sunset at map center"
      >
        <span>{night ? "🌙 Night" : "🌞 Day"}</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span>{weatherEmoji(wx.code)}{wx.temp != null ? ` ${wx.temp}°` : ""}</span>
        {wx.wind != null && <span style={{ opacity: 0.8 }}>💨 {wx.wind} mph</span>}
      </div>

      {/* overlay controls (hidden in fullscreen) */}
      {mode === "overlay" && (
        <div style={{
          position: "fixed",
          right: (fabPos?.right ?? 12),
          top: (fabPos?.top ?? 180),
          zIndex: 72,
          display: "grid",
          gap: 8
        }}>
          <button
            onClick={handleCenter}
            style={{
              padding:"10px 12px", borderRadius:999,
              border:"1px solid rgba(111,227,255,.35)",
              background:"linear-gradient(180deg, rgba(11,25,64,.75), rgba(9,18,48,.55))",
              color:"#dbe7ff", fontWeight:800, boxShadow:"0 8px 24px rgba(0,0,0,.35)",
              backdropFilter:"blur(8px)", cursor:"pointer"
            }}
          >
            Map • Center
          </button>

          <button
            onClick={toggleMap}
            style={{
              padding:"8px 12px", borderRadius:999,
              border:"1px solid rgba(111,227,255,.35)",
              background:"linear-gradient(180deg, rgba(11,25,64,.55), rgba(9,18,48,.45))",
              color:"#dbe7ff", fontWeight:800, boxShadow:"0 6px 18px rgba(0,0,0,.30)",
              backdropFilter:"blur(8px)", cursor:"pointer"
            }}
          >
            {isCollapsed ? "Show Map" : "Hide Map"}
          </button>
        </div>
      )}

      {/* map shell */}
      <div className={`lm-wrap ${isCollapsed ? "lm-collapsed" : ""}`} style={shellStyle}>
        <div ref={elRef} className="lm-map" />
      </div>

      {/* styles */}
      <style jsx>{`
        .lm-wrap {
          position: fixed;
          left: 12px;
          bottom: 148px;
          width: min(560px, 92vw);
          height: 320px;
          z-index: 60;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(111,227,255,.25);
          box-shadow: 0 12px 40px rgba(0,0,0,.35);
          background:
            radial-gradient(800px 400px at 20% 80%, rgba(111,227,255,.08), transparent 60%),
            rgba(7,19,46,.85);
          backdrop-filter: blur(8px);
          transition: height .18s ease;
        }
        .lm-wrap.lm-collapsed {
          height: 0;
          pointer-events: none;
          border: 0;
          box-shadow: none;
        }
        .lm-map { width: 100%; height: 100%; }
      `}</style>

      <style jsx global>{`
        .lm-pop { min-width: 220px; max-width: 280px; }
        .lm-title { font-weight: 900; margin-bottom: 4px; color: #e6f2ff; }
        .lm-sub { opacity: .8; font-size: .9rem; margin-bottom: 8px; }
        .lm-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .lm-btn { padding: 6px 10px; border-radius: 10px; border: 1px solid rgba(111,227,255,.35); background: rgba(9,18,48,.45); color: #dbe7ff; font-weight: 800; text-decoration: none; }
        .lm-btn:hover { filter: brightness(1.1); }
        .lm-primary { background: linear-gradient(135deg,#1d4ed8,#2563eb); color: #fff; border: 0; }

        .mc-bubble{
          width:46px;height:46px;border-radius:999px;display:grid;place-items:center;
          background: radial-gradient(28px 28px at 50% 45%, rgba(111,227,255,.18), rgba(9,18,48,.85));
          border:2px solid rgba(111,227,255,.65);
          box-shadow:0 0 0 6px rgba(111,227,255,.12), 0 10px 26px rgba(0,0,0,.35), inset 0 0 32px rgba(111,227,255,.15);
          color:#e6f2ff;font-weight:900; user-select:none;
        }
        .mc-bubble span{ transform: translateY(1px); }
      `}</style>
    </>
  );
}

/* ---------- util ---------- */
function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
