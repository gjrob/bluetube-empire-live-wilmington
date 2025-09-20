// ✅ CommonJS-friendly import to avoid express_1.default error
const express = require("express");

const app = express();
app.use(express.json());

// log unhandled errors so Cloud Run logs show them
process.on("unhandledRejection", (e) => console.error("[unhandledRejection]", e));
process.on("uncaughtException", (e) => { console.error("[uncaughtException]", e); process.exit(1); });

app.get("/", (_req, res) => res.type("text").send("MCP-lite up"));
app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`[MCP] listening on :${port}`));

// simple shared-key guard
const ALLOW_KEY = process.env.MCP_SHARED_KEY || "";
console.log(`[MCP] guard enabled: ${ALLOW_KEY ? "YES" : "NO"} (key len=${ALLOW_KEY.length})`);

function guard(req: any, res: any, next: any){
  if (!ALLOW_KEY) return next();
  if (req.get("X-Api-Key") === ALLOW_KEY) return next();
  return res.status(401).json({ error: "unauthorized" });
}

app.get("/", (_req: any, res: any) => res.type("text").send("MCP-lite up"));
app.get("/health", (_req: any, res: any) => res.json({ ok: true }));

app.post("/tools/get_quote", guard, async (req: any, res: any) => {
  try {
    const { symbol } = req.body || {};
    if (!symbol) return res.status(400).json({ error: "symbol required" });

    const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "";
    if (!POLYGON_API_KEY) return res.status(500).json({ error: "POLYGON_API_KEY missing" });

    const sym = String(symbol).toUpperCase().trim();

    // small helper
    async function fetchJSON(url: string) {
      const r = await fetch(url);
      const text = await r.text();
      if (!r.ok) return { ok:false, status:r.status, body:text } as const;
      try { return { ok:true, json: JSON.parse(text) } as const; }
      catch { return { ok:false, status:500, body:text } as const; }
    }

    // ---- CRYPTO PATH (BTCUSD, ETHUSD, or X:BTCUSD) ----
    if (sym.startsWith("X:") || /^[A-Z]{2,6}USD$/.test(sym)) {
      const c = sym.startsWith("X:") ? sym : `X:${sym}`;

      // 1) Snapshot (often allowed on basic crypto)
      let r = await fetchJSON(`https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${c}?apiKey=${POLYGON_API_KEY}`);
      if (r.ok) {
        const j: any = r.json;
        const price = j?.ticker?.lastTrade?.p ?? j?.ticker?.min?.p ?? null;
        if (price != null) return res.json({ symbol:c, price, ts: j?.ticker?.lastTrade?.t ?? null, src:"snapshot" });
      } else if (r.status !== 403) {
        return res.status(r.status).json({ error:`polygon ${r.status}`, body:r.body });
      }

      // 2) v1 last crypto (widely available)
      const [base] = c.replace(/^X:/,"").split("USD");
      r = await fetchJSON(`https://api.polygon.io/v1/last/crypto/${base}/USD?apiKey=${POLYGON_API_KEY}`);
      if (r.ok) {
        const j: any = r.json;
        const price = j?.last?.price ?? j?.last?.trade?.price ?? null;
        if (price != null) return res.json({ symbol:c, price, ts:j?.last?.timestamp ?? null, src:"v1-last-crypto" });
      } else if (r.status !== 403) {
        return res.status(r.status).json({ error:`polygon ${r.status}`, body:r.body });
      }

      // 3) Aggregates (last bar close)
      const today = new Date().toISOString().slice(0,10);
      r = await fetchJSON(`https://api.polygon.io/v2/aggs/ticker/${c}/range/1/minute/2024-01-01/${today}?adjusted=true&sort=desc&limit=1&apiKey=${POLYGON_API_KEY}`);
      if (r.ok) {
        const j:any = r.json;
        const bar = (j?.results || [])[0];
        if (bar) return res.json({ symbol:c, price: bar.c, ts: bar.t, src:"aggs-1m" });
      }
      return res.status(r.ok ? 404 : (r as any).status).json({ error: r.ok ? "no data" : `polygon ${(r as any).status}` });
    }

    // ---- FX PATH (EURUSD, GBPUSD via Currencies Basic) ----
    if (/^[A-Z]{3}USD$/.test(sym)) {
      const r = await fetchJSON(`https://api.polygon.io/v1/conversion/${sym.slice(0,3)}/USD?apiKey=${POLYGON_API_KEY}`);
      if (r.ok) {
        const j:any = r.json;
        const price = j?.converted ?? j?.initial ?? j?.last?.price ?? null;
        if (price != null) return res.json({ symbol:sym, price, ts: Date.now(), src:"fx-conversion" });
      } else if (r.status !== 403) {
        return res.status(r.status).json({ error:`polygon ${r.status}`, body:r.body });
      }
    }

    // ---- STOCKS PATH (use aggregates since /v2/last/trade often 403 on basic) ----
    {
      const today = new Date().toISOString().slice(0,10);
      const r = await fetchJSON(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(sym)}/range/1/minute/2024-01-01/${today}?adjusted=true&sort=desc&limit=1&apiKey=${POLYGON_API_KEY}`);
      if (r.ok) {
        const j:any = r.json;
        const bar = (j?.results || [])[0];
        if (bar) return res.json({ symbol:sym, price: bar.c, ts: bar.t, src:"stocks-aggs-1m" });
        return res.status(404).json({ error:"no data" });
      }
      return res.status((r as any).status).json({ error:`polygon ${(r as any).status}`, body:(r as any).body });
    }

  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});



