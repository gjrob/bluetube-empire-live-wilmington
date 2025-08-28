export default async function handler(req, res) {
  const hls = process.env.NEXT_PUBLIC_LIVEPEER_HLS || "";
  const haveStripe = !!process.env.STRIPE_SECRET_KEY;
  const havePrices = !!(process.env.STRIPE_PRICE_TIP_5 || process.env.STRIPE_PRICE_TIP_10 || process.env.STRIPE_PRICE_TIP_25);
  const haveSponsor = !!process.env.STRIPE_PRICE_SPONSOR || !!process.env.STRIPE_SPONSOR_AMOUNT;

  // Optional: ping HLS head (allow failure silently)
  let hlsOk = !!hls;
  try {
    if (hls) {
      const r = await fetch(hls, { method: "HEAD" });
      hlsOk = r.ok;
    }
  } catch {}

  res.json({
    ok: hlsOk && haveStripe && (havePrices || haveSponsor),
    hlsOk, haveStripe, havePrices, haveSponsor,
    domain: req.headers.host,
    ts: new Date().toISOString()
  });
}
