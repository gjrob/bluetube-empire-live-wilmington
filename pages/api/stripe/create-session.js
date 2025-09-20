// pages/api/stripe/create-session.js
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }
  res.setHeader("Cache-Control", "no-store");

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ ok: false, error: "MISSING_STRIPE_SECRET_KEY" });
  }

  const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

  try {
    const {
      // choose one path: a known tier (mapped to price IDs) OR a custom amount
      tier,                          // "standard" | "premium" | "marquee"  (optional)
      amount,                        // number in dollars for custom amount (optional)
      sponsorId = "",                // metadata passthrough
      campaign = "showcase",         // metadata passthrough
      priceId,                       // explicit Stripe price id (optional)
      setupAmount,                   // optional dollars; only used when mode becomes "subscription"
      successUrl,
      cancelUrl,
    } = req.body || {};

    let line_items = [];
    let mode = "payment"; // default (custom amounts)

    const origin =
      (req.headers.origin && /^https?:\/\//.test(req.headers.origin))
        ? req.headers.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

    if (priceId) {
      // explicit price id path
      const p = await stripe.prices.retrieve(String(priceId));
      mode = p.recurring ? "subscription" : "payment";
      line_items = [{ price: p.id, quantity: 1 }];
    } else if (tier) {
      // map tier -> env price id
      const map = {
        // use *_RECUR if you set subscription prices; fallback to one-time IDs if that’s what you have
        standard: process.env.STRIPE_PRICE_STANDARD_RECUR || process.env.STRIPE_PRICE_STANDARD,
        premium:  process.env.STRIPE_PRICE_PREMIUM_RECUR  || process.env.STRIPE_PRICE_PREMIUM,
        marquee:  process.env.STRIPE_PRICE_MARQUEE_RECUR  || process.env.STRIPE_PRICE_MARQUEE,
      };
      const id = map[String(tier).toLowerCase()];
      if (!id) return res.status(422).json({ ok: false, error: "INVALID_TIER" });

      const p = await stripe.prices.retrieve(id);
      mode = p.recurring ? "subscription" : "payment";
      line_items = [{ price: p.id, quantity: 1 }];
    } else {
      // custom amount (one-time)
      const dollars = Number(amount);
      const cents = Math.round(dollars * 100);
      if (!Number.isFinite(cents) || cents < 50) {
        return res.status(422).json({ ok: false, error: "INVALID_AMOUNT" });
      }
      line_items = [{
        price_data: {
          currency: "usd",
          product_data: { name: "BlueTubeTV • One-time payment" },
          unit_amount: cents,
        },
        quantity: 1,
      }];
      mode = "payment";
    }

    // Metadata (optionally carry a setup fee for the webhook if this is a subscription)
    const metadata = { sponsorId, campaign, app: "BlueTubeTV Live" };
    const setupCents = Math.round(Number(setupAmount || 0) * 100);
    if (mode === "subscription" && Number.isFinite(setupCents) && setupCents > 0) {
      metadata.setup_cents = String(setupCents);
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items,
      allow_promotion_codes: true,
      success_url: successUrl || `${origin}/thanks?sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  cancelUrl  || `${origin}/sponsor?canceled=1`,
      metadata,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (e) {
    console.error("stripe create-session error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "STRIPE_ERROR" });
  }
}


