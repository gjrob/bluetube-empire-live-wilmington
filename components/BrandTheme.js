// components/BrandTheme.js
export default function BrandTheme({ children }) {
  return (
    <div className="btv-theme">
      {children}
      <style jsx>{`
        .btv-theme{
          --bg-1:#0a0e27; --bg-2:#0f172a; --surface:#0b1220;
          --text:#e5e7eb; --muted:#94a3b8;
          --brand-1:#0ea5e9; --brand-2:#1d4ed8; --brand-3:#22d3ee; --ring:#22d3ee;
          --glass:rgba(2,6,23,.6); --border:#1f2937;

          min-height:100vh;
          color:var(--text);
          background:
            radial-gradient(80rem 60rem at 70% -10%, rgba(34,211,238,.08), transparent 50%),
            linear-gradient(180deg, var(--bg-1), var(--bg-2));
        }
      `}</style>
    </div>
  );
}
