import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

// Stripe + Supabase clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,   // use the Project URL from Supabase
  process.env.SUPABASE_SERVICE_ROLE       // service role key, server-only
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const sig = req.headers["stripe-signature"];
    const buf = await buffer(req);
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // metadata from Checkout Link or API
      const md = session.metadata || {};
      const handle = md.handle || null;
      const kind = md.kind === "sponsor" ? "sponsor" : "tip";

      // optional: look up creator id by handle
      let creatorId = null;
      if (handle) {
        const { data: c } = await supabase
          .from("creator_profiles")
          .select("id")
          .eq("handle", handle)
          .maybeSingle();
        creatorId = c?.id || null;
      }

      await supabase.from("ledger").insert({
        kind,
        source: "stripe",
        gross_cents: session.amount_total || 0,
        fee_cents: 0, // can fetch Stripe fees later if needed
        currency: session.currency || "usd",
        creator_id: creatorId,
        handle,
        ext_ref: session.id,
        notes: md.note || null
      });

      // bump daily stats if we know creator
      if (creatorId) {
        await supabase.rpc("increment_daily_stats", {
          p_creator_id: creatorId,
          p_tips_count: 1,
          p_tips_cents: session.amount_total || 0
        }).catch(() => {});
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error("Webhook error", e);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
}

