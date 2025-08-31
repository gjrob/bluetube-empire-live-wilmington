import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ ok:false, error:"Missing STRIPE_SECRET_KEY" });

  const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

  try {
    const { amount, kind = "tip", handle } = req.body || {};
    const cents = Number(amount);
    if (!Number.isFinite(cents) || cents <= 0) return res.status(422).json({ ok:false, error:"INVALID_AMOUNT" });

    const origin = req.headers.origin || "http://localhost:3000";
    const label  = kind === "sponsor" ? "Sponsor — BlueTubeTV" : "Tip — BlueTubeTV";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: { currency: "usd", product_data: { name: label }, unit_amount: cents },
        quantity: 1
      }],
      metadata: { kind, handle: handle || "", app: "BlueTubeTV Live" },
      success_url: `${origin}/live?paid=1`,
      cancel_url:  `${origin}/live?canceled=1`,
    });

    return res.status(200).json({ ok:true, url: session.url });
  } catch (e) {
    console.error("stripe session error:", e);
    return res.status(500).json({ ok:false, error: e.message || "STRIPE_ERROR" });
  }
}
