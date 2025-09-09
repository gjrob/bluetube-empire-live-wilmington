import Head from "next/head";
import { useMemo } from "react";
import dynamic from "next/dynamic";                 // ✅ import dynamic
import MailchimpForm from "../components/MailchimpForm";

const Countdown = dynamic(() => import("../components/CountdownChip"), { ssr: false });

// Optional: set once and use in OG tags
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://live.bluetubetv.live";  // set in prod
const OG_IMG = `${SITE_URL}/og-yb-large.png`;                          // file in /public

const EVENT = {
  title: "NBA YoungBoy — Raleigh",
  venue: "Lenovo Center",
  city: "Raleigh, NC",
  // Oct 24, 2025 7:30 PM ET
  isoStart: "2025-10-24T19:30:00-04:00",
};
// TEMP: point to a search page until you have the exact TM link
const TICKETS_URL =
  process.env.NEXT_PUBLIC_YB_TICKETS_URL ||
  "https://www.ticketmaster.com/search?q=NBA%20YoungBoy%20Raleigh";

export default function YBRaleigh() {
  const start = useMemo(() => new Date(EVENT.isoStart), []);
  const prettyDate = start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <>
      <Head>
        <title>NBA YoungBoy — Raleigh • Oct 24 | BlueTubeTV</title>
       <link rel="canonical" href={`${SITE_URL}/yb-raleigh`} />
<meta property="og:url" content={`${SITE_URL}/yb-raleigh`} />
<meta property="og:type" content="website" />
<meta property="og:title" content="NBA YoungBoy — Raleigh • Oct 24" />
<meta property="og:description" content="Get tickets now and join the pre-show stream on BlueTubeTV." />
<meta property="og:image" content={`${SITE_URL}/og-yb-large.png`} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="BlueTubeTV" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="NBA YoungBoy — Raleigh • Oct 24" />
<meta name="twitter:description" content="Get tickets now and join the pre-show stream on BlueTubeTV." />
<meta name="twitter:image" content={`${SITE_URL}/og-yb-large.png`} />

      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#0a0e27,#0f172a)",
          color: "#e5e7eb",
          fontFamily: "system-ui,Segoe UI,Roboto,Arial,sans-serif",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 96px" }}>
          {/* HERO */}
          <section style={{ textAlign: "center", padding: "28px 12px" }}>
          {/* Clickable flyer → keeps aspect ratio, responsive */}
<a href="/yb-raleigh" aria-label="NBA YoungBoy Raleigh – details">
  <img
    src="/og-yb-large.png"                // file lives in /public
    alt="NBA YoungBoy — Raleigh • Oct 24 — Lenovo Center"
    style={{
      width: "100%",
      maxWidth: 960,
      height: "auto",
      borderRadius: 14,
      border: "1px solid #1f2937",
      boxShadow: "0 10px 30px rgba(0,0,0,.35)",
      margin: "12px auto 16px",
      display: "block"
    }}
  />
</a>

            <div
              style={{
                margin: "0 auto 14px",
                display: "inline-block",
                padding: "6px 12px",
                border: "1px solid #1f2937",
                borderRadius: 999,
                background: "#0b1220",
                color: "#a7f3d0",
                fontWeight: 700,
              }}
            >
              Oct 24 • {EVENT.venue} • {EVENT.city}
            </div>
            <h1 style={{ fontSize: 36, margin: "8px 0 8px", fontWeight: 900 }}>
              NBA YoungBoy — LIVE in Raleigh
            </h1>
            <p style={{ margin: "0 0 18px", color: "#94a3b8" }}>
              Presented on BlueTubeTV • {prettyDate}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a
                href={TICKETS_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#22d3ee",
                  color: "#06252b",
                  padding: "14px 22px",
                  borderRadius: 12,
                  fontWeight: 800,
                  textDecoration: "none",
                  border: "1px solid #164e63",
                }}
              >
                Get Tickets →
              </a>
              <button onClick={() => downloadICS(EVENT)} style={ghostBtn}>
                Add to Calendar
              </button>
            </div>
          </section>
      
          {/* Email capture */}
          <section style={{ marginTop: 32 }}>
            <MailchimpForm />
          </section>

          {/* COUNTDOWN (client-only) */}
          <section style={{ marginTop: 24, display: "grid", placeItems: "center" }}>
            <Countdown targetISO={EVENT.isoStart} />
          </section>

          {/* Sponsors etc... */}
        </div>
      </main>
    </>
  );
}

const ghostBtn = {
  border: "1px solid #334155",
  background: "transparent",
  color: "#e5e7eb",
  padding: "14px 22px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
};

function downloadICS(evt) {
  const dtStart = new Date(evt.isoStart);
  const dtEnd = new Date(dtStart.getTime() + 2 * 60 * 60 * 1000);
  const toICS = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BlueTubeTV//YB Raleigh//EN",
    "BEGIN:VEVENT",
    `UID:${cryptoRandom()}`,
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(dtStart)}`,
    `DTEND:${toICS(dtEnd)}`,
    `SUMMARY:${evt.title}`,
    `LOCATION:${evt.venue}, ${evt.city}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([body], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yb-raleigh.ics";
  a.click();
  URL.revokeObjectURL(url);
}
function cryptoRandom() {
  try {
    return crypto.randomUUID();
  } catch {
    return "yb-" + Math.random().toString(36).slice(2);
  }
}
