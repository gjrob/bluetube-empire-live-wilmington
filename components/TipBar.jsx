export default function TipBar({ tipUrl }) {
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 0, padding: "10px 14px",
      background: "linear-gradient(180deg, rgba(12,28,66,.0), rgba(12,28,66,.75))",
      display: "flex", justifyContent: "center"
    }}>
      <a
        href={tipUrl || "https://buy.stripe.com/test_default"} target="_blank" rel="noreferrer"
        style={{
          padding: "10px 16px", borderRadius: 999, fontWeight: 800,
          background: "#00e5a8", color: "#042a22", border: "1px solid rgba(0,0,0,.15)",
          textDecoration: "none"
        }}>
        ⚡ Tip this Stream
      </a>
    </div>
  );
}
