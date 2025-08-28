// pages/index.js
import Head from "next/head";
import BrandTheme from "../components/BrandTheme";
import BrandLockup from "../components/BrandLockup";

export default function Home() {
  return (
    <>
      <Head>
        <title>BlueTubeTV Empire</title>
        <meta name="description" content="Stream, mint, and monetize — one signal, many revenue tides." />
        <meta property="og:title" content="BlueTubeTV Empire" />
        <meta property="og:image" content="/og-live.jpg" />
      </Head>

      <BrandTheme>
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 16px 48px" }}>
          <section style={{ textAlign: "center", padding: "48px 16px" }}>
            <BrandLockup size="lg" />
            <p style={{ margin: "18px auto 28px", color: "var(--muted)", maxWidth: 720 }}>
              Stream, mint, and monetize — one signal, many revenue tides.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn" href="/live">🎥 Go to Live</a>
              <a className="btn btn--ghost" href="/browse">Browse Content</a>
              <a className="btn btn--ghost" href="/pricing">Start Free Trial</a>
            </div>
          </section>

          {/* Optional: three quick value cards */}
          <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Tip-powered</h3>
              <p style={{ color: "var(--muted)" }}>Stripe + Crypto tips keep the cameras rolling.</p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Mint the Moment</h3>
              <p style={{ color: "var(--muted)" }}>Freeze iconic seconds into on-chain collectibles.</p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Sponsor Slots</h3>
              <p style={{ color: "var(--muted)" }}>Claim a spotlight segment during live shows.</p>
            </div>
          </section>
        </main>

        {/* Page-scoped styles only */}
        <style jsx>{`
          .btn {
            border: none;
            cursor: pointer;
            font-weight: 800;
            color: #02131f;
            padding: 12px 18px;
            border-radius: 999px;
            background: linear-gradient(90deg, var(--brand-1), var(--brand-2));
            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.25);
            text-decoration: none;
            display: inline-block;
          }
          .btn--ghost {
            background: transparent;
            color: var(--text);
            border: 1px solid var(--border);
            box-shadow: none;
          }
          .card {
            padding: 18px;
            border-radius: 16px;
            background: var(--glass);
            border: 1px solid var(--border);
            backdrop-filter: blur(6px);
          }
        `}</style>
      </BrandTheme>
    </>
  );
}
