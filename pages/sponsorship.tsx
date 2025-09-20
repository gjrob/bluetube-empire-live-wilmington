
// pages/sponsorship.tsx
import { useState } from "react";

type BadgeKey = "castle-legacy" | "empire-builder" | "recovery-champion" | "founders-circle";

const BADGES: Array<{
  key: BadgeKey;
  title: string;
  blurb: string;
  priceLabel: string;  // display only
}> = [
  { key: "castle-legacy",     title: "Castle Street Legacy Badge", blurb: "Founding sponsor of Castle Street.",    priceLabel: "$250" },
  { key: "empire-builder",    title: "Empire Builder Badge",       blurb: "Architects of BlueTubeTV.",            priceLabel: "$500" },
  { key: "recovery-champion", title: "Recovery Champion Badge",    blurb: "Fuel the message of recovery.",        priceLabel: "$2,000" },
  { key: "founders-circle",   title: "Founder’s Circle (1–10)",    blurb: "Numbered founder slot.",               priceLabel: "$10,000" },
];

export default function Sponsorship() {
  const [loading, setLoading] = useState<BadgeKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(badge: BadgeKey) {
    setError(null);
    setLoading(badge);
    try {
      // works with your current GET-style checkout; switch to POST when ready
      const r = await fetch(`/api/checkout?badge=${badge}`);
      const j = await r.json();
      if (!r.ok || !j?.url) throw new Error(j?.error || `Checkout error (${r.status})`);
      window.location.href = j.url;
    } catch (e:any) {
      setError(e?.message || "Could not start checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 text-slate-100">
      <h1 className="text-3xl font-bold mb-2">Sponsor • Badges</h1>
      <p className="mb-6 opacity-80">BlueTubeTV • Wilmington — help us grow the independent city signal.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 text-red-200 bg-red-900/20 px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {BADGES.map(b => (
          <div key={b.key} className="rounded-xl p-4 bg-white/5 border border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-lg">{b.title}</div>
                <div className="opacity-80 text-sm">{b.blurb}</div>
              </div>
              <button
                onClick={() => buy(b.key)}
                disabled={loading === b.key}
                className="px-4 py-2 rounded-lg font-semibold text-white
                           bg-gradient-to-r from-blue-600 to-blue-500 disabled:opacity-60"
                aria-label={`Buy ${b.title} for ${b.priceLabel}`}
              >
                {loading === b.key ? "Loading…" : `Sponsor — ${b.priceLabel}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm opacity-70">
        Payments are processed by Stripe. You’ll receive an email receipt. We’ll publish weekly “air-check” screenshots and KPI receipts.
      </p>
    </main>
  );
}

