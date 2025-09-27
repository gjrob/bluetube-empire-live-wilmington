// components/QRCard.js
export default function QRCard({ img, q, qr, cta, href, layout="side", w="480" }) {
  const qrSrc = qr || (q
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(q)}`
    : "");

  return (
    <div style={{
      width: /^\d+$/.test(w) ? `${w}px` : w,
      padding: "12px",
      background: "rgba(0,0,0,.40)",
      borderRadius: "18px",
      color: "#fff",
      display: "grid",
      gridTemplateColumns: layout === "side" ? "1fr auto" : "1fr",
      gap: "12px"
    }}>
      <div>
        {img && <img src={img} alt="" style={{ maxWidth: layout==="side" ? "180px" : "100%" }} />}
        {cta && <div style={{ fontSize: 20, fontWeight: 700 }}>{cta}</div>}
      </div>
      {qrSrc && <img src={qrSrc} alt="QR" style={{ width: 220, height: 220, background:"#fff", borderRadius:8 }} />}
    </div>
  );
}
