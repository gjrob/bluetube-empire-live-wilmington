import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const toCents = v => Math.round(Number(v) * 100);

async function resolvePriceId(id, expectedAmountCents) {
  if (!id) return null;
  if (id.startsWith("price_")) return id;

  if (id.startsWith("prod_")) {
    // 1) Try default_price first
    const product = await stripe.products.retrieve(id);
    let def = product.default_price;
    if (typeof def === "object") def = def.id;
    if (def) return def;

    // 2) Otherwise find an active USD price (prefer matching amount if provided)
    const prices = await stripe.prices.list({ product: id, active: true, limit: 100 });
    let pick = prices.data.find(p => p.currency === "usd" && p.unit_amount === expectedAmountCents);
    if (!pick) pick = prices.data.find(p => p.currency === "usd");
    return pick?.id ?? null;
  }

  return null;
}

export default async function handler(req, res) {
  try {
    const { amount, sponsor } = req.body || {};
    const map = {
      "5": process.env.STRIPE_PRICE_TIP_5,
      "10": process.env.STRIPE_PRICE_TIP_10,
      "25": process.env.STRIPE_PRICE_TIP_25,
      sponsor: process.env.STRIPE_PRICE_SPONSOR,
    };

    const expected = sponsor ? Number(process.env.STRIPE_SPONSOR_AMOUNT || 50) : Number(amount || 0);
    const expectedCents = toCents(expected);

    let lineItem;
    const envId = sponsor ? map.sponsor : map[String(amount)];

    if (envId) {
      const priceId = await resolvePriceId(envId, expectedCents);
      if (!priceId) throw new Error("Configured product has no active price");
      lineItem = { price: priceId, quantity: 1 };
    } else {
      // Fallback: ad-hoc price if nothing configured
      lineItem = {
        price_data: {
          currency: "usd",
          unit_amount: expectedCents,
          product_data: { name: sponsor ? "Sponsor Slot" : `BlueTubeTV Tip $${expected}` },
        },
        quantity: 1,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/live`,
      allow_promotion_codes: true,
      metadata: { kind: sponsor ? "sponsor" : "tip", amount: sponsor ? String(expected) : String(amount || "") },
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
