// components/Offline.js
export default function Offline({ variant = "badge" }) {
  if (variant === "badge") {
    return (
      <>
        <div className="off-badge">
          <strong>Stream offline</strong>
          <span>We’ll be live at golden hour. Stay tuned 🌊</span>
        </div>
       

        <style jsx>{`
          .off-badge {
            position: absolute;
            left: 50%;
            bottom: 16px;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.82); /* light glass so it doesn't darken the poster */
            color: #0b1530;
            border: 1px solid rgba(59, 130, 246, 0.35);
            border-radius: 12px;
            padding: 10px 14px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            text-align: center;
            pointer-events: none;
          }
          .off-badge strong {
            display: block;
            font-size: 14px;
            line-height: 1.1;
          }
          .off-badge span {
            display: block;
            font-size: 12px;
            opacity: 0.9;
          }
          @media (min-width: 768px) {
            .off-badge {
              padding: 12px 18px;
            }
            .off-badge strong {
              font-size: 16px;
            }
          }
        `}</style>
      </>
    );
  }

  // (fallback) old centered style if you ever need it again
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(15,23,42,.8)",
          border: "1px solid #1f2937",
          padding: "16px 20px",
          borderRadius: 14,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <strong style={{ display: "block", fontSize: 18 }}>Stream offline</strong>
        <span style={{ opacity: 0.9 }}>We’ll be live at golden hour. Stay tuned 🌊</span>
      </div>
    </div>
  );
}

