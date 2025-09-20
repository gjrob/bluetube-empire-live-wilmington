import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

// ---- clients ----
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE;
const supabase = hasSupabase
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
  : null;

// ---- helpers ----
async function ledgerUpsert(row) {
  if (!supabase) return;
  try {
    await supabase
      .from("ledger")
      .upsert(row, { onConflict: "ext_ref", ignoreDuplicates: false });
  } catch (e) {
    console.error("ledger upsert error:", e);
  }
}

async function findCreatorIdByHandle(handle) {
  if (!supabase || !handle) return null;
  try {
    const { data } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("handle", handle)
      .maybeSingle();
    return data?.id || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let event;
  try {
    const sig = req.headers["stripe-signature"];
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Webhook signature error:", e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    // ---------------------------
    // checkout.session.completed
    // ---------------------------
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const md = s.metadata || {};
      const handle = md.handle || null;
      const kind = md.kind === "sponsor" ? "sponsor" : "tip";
      const sponsorId = md.sponsorId || null;
      const campaign = md.campaign || null;
      const setupCents = Number(md.setup_cents || 0);
      const customer = s.customer; // string

      const creatorId = await findCreatorIdByHandle(handle);

      // If this was a subscription Checkout and we were asked to add a setup fee,
      // create a one-time invoice for the setup immediately after checkout.
      if (s.mode === "subscription" && customer && Number.isFinite(setupCents) && setupCents > 0) {
        try {
          await stripe.invoiceItems.create({
            customer,
            currency: "usd",
            unit_amount: setupCents,
            quantity: 1,
            description: "Website Setup Fee",
          });
          const inv = await stripe.invoices.create({
            customer,
            auto_advance: true,
            metadata: {
              kind: "setup",
              session_id: s.id,
              sponsorId: sponsorId || "",
              campaign: campaign || "",
            },
          });
          await stripe.invoices.finalizeInvoice(inv.id);
          console.log("Setup invoice finalized:", inv.id);
        } catch (e) {
          console.error("setup-invoice error:", e);
        }
      }

      // Record the checkout session itself (amount_total may be null for subscriptions)
      await ledgerUpsert({
        kind,                        // "tip" | "sponsor"
        source: "stripe",
        gross_cents: s.amount_total || 0,
        fee_cents: 0,
        currency: s.currency || "usd",
        creator_id: creatorId,
        handle,
        ext_ref: s.id,
        notes: sponsorId || campaign ? JSON.stringify({ sponsorId, campaign }) : null,
      });
    }

    // ---------------------------
    // invoice.payment_succeeded
    //  - fires for subscription renewals
    //  - also for the one-time "setup" invoice we created above
    // ---------------------------
    if (event.type === "invoice.payment_succeeded") {
      const inv = event.data.object;
      const amount = inv.amount_paid || 0;
      const currency = inv.currency || "usd";
      const customer = inv.customer;
      const kindMeta = inv.metadata?.kind || ""; // "setup" if we created it
      const sponsorId = inv.metadata?.sponsorId || null;
      const campaign = inv.metadata?.campaign || null;

      // Try to recover handle from the most recent paid checkout session for this customer
      let handle = null;
      let creatorId = null;
      try {
        // Not strictly necessary—if you store customer->handle mapping, use that instead.
        // Here we look back via the session id if present.
        const sessionId = inv.metadata?.session_id;
        if (sessionId) {
          const cs = await stripe.checkout.sessions.retrieve(sessionId);
          handle = cs?.metadata?.handle || null;
        }
      } catch {}

      creatorId = await findCreatorIdByHandle(handle);

      await ledgerUpsert({
        kind: kindMeta === "setup" ? "setup_fee" : "subscription",
        source: "stripe",
        gross_cents: amount,
        fee_cents: 0,
        currency,
        creator_id: creatorId,
        handle,
        ext_ref: inv.id, // invoice id
        notes: sponsorId || campaign ? JSON.stringify({ sponsorId, campaign }) : null,
      });
    }

    res.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    // Acknowledge to prevent Stripe from retrying forever; log above for review.
    res.json({ received: true, note: "handled-with-warnings" });
  }
}
