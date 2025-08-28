import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    const sig = req.headers["stripe-signature"];
    const buf = await buffer(req);
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      await supabase.from("payments").insert({
        provider: "stripe",
        amount_cents: s.amount_total || 0,
        currency: s.currency || "usd",
        kind: s.metadata?.kind || "tip",
        payer_email: s.customer_details?.email || null,
      });
    }
    res.json({ received: true });
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
}
