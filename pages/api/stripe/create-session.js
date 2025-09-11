import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  // never cache API responses
  res.setHeader("Cache-Control", "no-store");

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ ok: false, error: "MISSING_STRIPE_SECRET_KEY" });
  }

  const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

  try {
    const {
      // choose one path: a known tier (mapped to price IDs) OR a custom amount
      tier,                          // "standard" | "premium" | "marquee"
      amount,                        // number in USD dollars (e.g., 299 or 10)
      kind = "tip",                  // "tip" | "sponsor"
      sponsorId = "",                // your internal id (e.g., "creator-print-house")
      campaign = "showcase",
      priceId,                       // optional explicit price id (overrides tier)
      successUrl,
      cancelUrl,
    } = req.body || {};

    // 1) figure out line items
    let line_items;

    if (priceId) {
      line_items = [{ price: String(priceId), quantity: 1 }];
    } else if (tier) {
      const priceMap = {
        standard: process.env.STRIPE_PRICE_STANDARD,
        premium:  process.env.STRIPE_PRICE_PREMIUM,
        marquee:  process.env.STRIPE_PRICE_MARQUEE,
      };
      const price = priceMap[String(tier).toLowerCase()];
      if (!price) {
        return res.status(422).json({ ok: false, error: "INVALID_TIER" });
      }
      line_items = [{ price, quantity: 1 }];
    } else {
      // custom amount in dollars -> cents
      const dollars = Number(amount);
      const cents = Math.round(dollars * 100);
      // Stripe min is $0.50; cap at $100k to be safe
      if (!Number.isFinite(cents) || cents < 50 || cents > 10_000_000) {
        return res.status(422).json({ ok: false, error: "INVALID_AMOUNT" });
      }
      const label = kind === "sponsor" ? "Sponsor — BlueTubeTV" : "Tip — BlueTubeTV";
      line_items = [{
        price_data: {
          currency: "usd",
          product_data: { name: label },
          unit_amount: cents,
        },
        quantity: 1,
      }];
    }

    // 2) success/cancel URLs (origin-aware, safe fallback)
    const origin = (req.headers.origin && /^https?:\/\//.test(req.headers.origin))
      ? req.headers.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      allow_promotion_codes: true,
      // Apple/Google Pay are auto-enabled on Checkout
      success_url: successUrl || `${origin}/thanks?sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  cancelUrl  || `${origin}/live?canceled=1`,
      metadata: {
        kind,
        sponsorId,
        campaign,
        app: "BlueTubeTV Live",
      },
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (e) {
    console.error("stripe create-session error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "STRIPE_ERROR" });
  }
}
