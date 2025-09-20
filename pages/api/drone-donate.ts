import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-08-27.basil' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { amount, campaign = 'drone_fund' } = req.body || {};
  const usd = Math.max(1, Math.floor(Number(amount || 0)));
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Drone Fund Donation', metadata: { campaign } },
          unit_amount: usd * 100,
        },
        quantity: 1
      }],
      metadata: { campaign },
      success_url: `${req.headers.origin}/drone-fund?thanks=1`,
      cancel_url: `${req.headers.origin}/drone-fund?canceled=1`,
      allow_promotion_codes: false,
    });
    res.json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Stripe error' });
  }
}
