import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { protect } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_key'
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// @desc    Create a Checkout Session for a Divine Offering (Donation)
// @route   POST /api/payments/offering
// @access  Protected
router.post('/offering', protect, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Krishna is currently not accepting digital offerings. (Stripe not configured)' });
  }

  const { amount, currency = 'inr' } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Divine Offering — Support the Devlok Archivist',
              description: 'Your offering helps maintain the cosmic knowledge matrix.',
            },
            unit_amount: amount * 100, // amount in paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/offering/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/offering/cancel`,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('🕉️ Stripe Session Error:', err);
    res.status(500).json({ message: 'The offering was interrupted by cosmic interference.' });
  }
});

export default router;
