export default function BrandLockup({ size="lg", inline=false }) {
  const fs = size==="lg" ? 48 : size==="md" ? 28 : 20;
  const gap = size==="lg" ? 14 : 10;

  return (
    <div style={{ display:inline ? "inline-flex" : "flex", alignItems:"center", gap }}>
      <span style={{ fontWeight:900, fontSize:fs, letterSpacing:.2 }}>BlueTube</span>
      <Cube size={size}/>
      <span className="text-gradient" style={{ fontWeight:900, fontSize:fs, letterSpacing:.2 }}>
        TV&nbsp;Empire
      </span>
    </div>
  );
}

function Cube({ size }) {
  const px = size==="lg" ? 36 : size==="md" ? 24 : 18;
  return (
    <svg width={px} height={px} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0ea5e9"/><stop offset="1" stopColor="#1d4ed8"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect x="10" y="10" width="44" height="44" rx="6" fill="#081226" stroke="url(#g1)" strokeWidth="2" filter="url(#glow)"/>
      <path d="M10 32h44" stroke="url(#g1)" strokeWidth="1.5" opacity=".5"/>
      <path d="M32 10v44" stroke="url(#g1)" strokeWidth="1.5" opacity=".5"/>
    </svg>
  );
}
