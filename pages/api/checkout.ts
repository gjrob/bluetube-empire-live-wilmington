// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2025-08-27.basil" });

const PRICE_MAP: Record<string, string> = {
  "castle-legacy": "price_1S8smiGf1VrUr665eE9Rezbm",
  "empire-builder": "price_1S8soNGf1VrUr665n33Yn3z0",
  "recovery-champion": "price_1S8sqNGf1VrUr665ujMXkkgL",
  "founders-circle": "price_1S8ssWGf1VrUr665S9oSqCP0",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { badge } = req.query; // e.g., ?badge=castle-legacy
    const price = PRICE_MAP[String(badge)];
    if (!price) return res.status(400).json({ error: "Unknown badge" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sponsor-success?badge=${badge}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sponsorship`,
      metadata: { tier: "founder", badge: String(badge) },
      allow_promotion_codes: false,
    });

    res.status(200).json({ url: session.url });
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
}
