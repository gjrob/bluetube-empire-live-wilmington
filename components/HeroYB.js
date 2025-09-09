// components/HeroYB.js
export default function HeroYB({
  date = "Oct 24",
  venue = "Lenovo Center",
  city = "Raleigh, NC",
  href = "/yb-raleigh",
}) {
  return (
    <section
      style={{
        padding: "56px 16px",
        background: "linear-gradient(180deg,#0a0e27,#0f172a)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            margin: "0 auto 12px",
            display: "inline-block",
            padding: "6px 12px",
            border: "1px solid #1f2937",
            borderRadius: 999,
            background: "#0b1220",
            color: "#a7f3d0",
            fontWeight: 700,
          }}
        >
          {date} • {venue} • {city}
        </div>

        <h1 style={{ fontSize: 40, margin: "8px 0 10px", fontWeight: 900 }}>
          NBA YoungBoy — Raleigh
        </h1>

        <p style={{ margin: "0 0 22px", color: "#94a3b8", fontSize: 18 }}>
          Presented on BlueTubeTV • Get tickets & join the hype
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={href}
            style={{
              background: "#22d3ee",
              color: "#06252b",
              padding: "14px 24px",
              borderRadius: 12,
              fontWeight: 800,
              textDecoration: "none",
              border: "1px solid #164e63",
              fontSize: 18,
            }}
          >
            Get Tickets →
          </a>
          <a
            href="/live"
            style={{
              border: "1px solid #334155",
              background: "transparent",
              color: "#e5e7eb",
              padding: "14px 24px",
              borderRadius: 12,
              fontWeight: 800,
              textDecoration: "none",
              fontSize: 18,
            }}
          >
            Watch Pre-Show →
          </a>
        </div>
      </div>
    </section>
  );
}
