import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2025-08-27.basil" });

function buffer(req: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    req.on("data", (chunk: any) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);

  let evt: Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err:any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (evt.type === "checkout.session.completed") {
    const s = evt.data.object as Stripe.Checkout.Session;
    const badge = s.metadata?.badge;
    const name  = s.customer_details?.name || "Founder";

    // Here you could hit your Broker to:
    // - write to ledger
    // - append a founder badge overlay entry
    // fetch("https://api.bluetubetv.live/sponsors/founder", { method:"POST", body: JSON.stringify({ badge, name }) })
  }

  res.json({ received: true });
}
