// components/QRCard.tsx
import * as React from "react";

export type QRCardProps = {
  img?: string;
  q?: string;         // string to encode
  qr?: string;        // direct QR image URL (overrides q)
  cta?: string;
  label?: string;
  href?: string;      // optional click-through
  layout?: "side" | "stack";
  w?: string | number;
  bg?: string;
  fg?: string;
  br?: number;
  pad?: string;
  border?: string;
  shadow?: string;
  qrSize?: number;
  qrMargin?: number;
};

export default function QRCard({
  img, q, qr, cta, label, href,
  layout = "side", w = 520,
  bg = "rgba(0,0,0,.40)", fg = "#fff",
  br = 18, pad = "12px",
  border = "1px solid rgba(255,255,255,.18)",
  shadow = "0 18px 50px rgba(0,0,0,.45)",
  qrSize = 220, qrMargin = 8,
}: QRCardProps) {
  const width = typeof w === "number" ? `${w}px` : w;
  const qrSrc =
    qr ||
    (q
      ? `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=${qrMargin}&data=${encodeURIComponent(
          q
        )}`
      : "");

  const card = (
    <div
      style={{
        width,
        padding: pad,
        background: bg,
        color: fg,
        borderRadius: br,
        border,
        boxShadow: shadow,
        display: "grid",
        gridTemplateColumns: layout === "side" ? "1fr auto" : "1fr",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {label ? <div style={{ fontSize: 12, opacity: 0.9, letterSpacing: 0.4 }}>{label}</div> : null}
        {img ? (
          <img
            src={img}
            alt=""
            style={{
              maxWidth: layout === "side" ? 180 : "100%",
              height: "auto",
              display: "block",
              borderRadius: Math.max(0, br - 8),
            }}
          />
        ) : null}
        {cta ? <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{cta}</div> : null}
      </div>

      {qrSrc ? (
        <img
          src={qrSrc}
          alt="QR"
          width={qrSize}
          height={qrSize}
          style={{ display: "block", background: "#fff", borderRadius: 8 }}
        />
      ) : null}
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      {card}
    </a>
  ) : (
    card
  );
}
