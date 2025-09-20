import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-08-27.basil' });

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const it = await stripe.paymentIntents.search({
      query: 'metadata["campaign"]:"drone_fund" AND status:"succeeded"',
      limit: 100,
    });
    let total = 0;
    for (const pi of it.data) total += (pi.amount_received || 0);
    // NOTE: if >100 donations, iterate with next_page on .search() as needed
    res.json({ total: Math.round(total / 100) });
  } catch (e: any) {
    res.status(200).json({ total: 0, note: 'progress offline', error: e.message });
  }
}
