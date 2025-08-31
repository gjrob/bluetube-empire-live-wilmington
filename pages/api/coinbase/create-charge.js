// Server route: creates a Coinbase Commerce charge and returns hosted_url
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });

  const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
  if (!apiKey) return res.status(500).json({ ok:false, error:"MISCONFIGURED: COINBASE_COMMERCE_API_KEY missing" });

  try {
    const { amount, currency = "USD", name = "BlueTubeTV Tip", description = "Tip for the stream", metadata = {}, cancel_url, redirect_url } = req.body || {};
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(422).json({ ok:false, error:"INVALID_AMOUNT" });

    const payload = {
      name,
      description,
      pricing_type: "fixed_price",
      local_price: { amount: amt.toFixed(2), currency },
      ...(cancel_url ? { cancel_url } : {}),
      ...(redirect_url ? { redirect_url } : {}),
      metadata: { app: "BlueTubeTV Live", ...metadata },
    };

    const resp = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": apiKey,
        "X-CC-Version": "2018-03-22", // avoids HTTP 412
      },
      body: JSON.stringify(payload),
    });

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(resp.status).json({ ok:false, error: json?.error || json?.message || "COINBASE_ERROR", detail: json, status: resp.status });
    }

    const hosted_url = json?.data?.hosted_url || json?.hosted_url;
    const code       = json?.data?.code || json?.code;
    if (!hosted_url) return res.status(502).json({ ok:false, error:"NO_HOSTED_URL", detail: json });

    return res.status(200).json({ ok:true, hosted_url, code });
  } catch (e) {
    console.error("coinbase route error:", e);
    return res.status(500).json({ ok:false, error:"SERVER_ERROR" });
  }
}

