// server/routes/gurukul.js
// FULL FILE — replaces existing server/routes/gurukul.js
// Added: POST /api/gurukul/create-order and POST /api/gurukul/verify-payment

import express from 'express';
import crypto from 'crypto';
import GurkulWaitlist from '../models/GurkulWaitlist.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ── Razorpay client (lazy-initialised so missing key doesn't crash startup) ──
function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured on this server.');
  }

  // Razorpay doesn't have an official ESM package — we use the REST API directly
  // to avoid any CJS/ESM interop issues on Render.
  return { keyId, keySecret };
}

// ── Helper: call Razorpay REST API ────────────────────────────────────────────
async function razorpayRequest(path, body, { keyId, keySecret }) {
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.description || `Razorpay API error: ${res.status}`);
  }
  return data;
}


// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST ROUTES (unchanged from previous session)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/gurukul/waitlist — public
router.post('/waitlist', async (req, res) => {
  try {
    const { email, name, source, userId } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }

    const existing = await GurkulWaitlist.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        message: 'This email is already on the waitlist.',
        alreadyJoined: true,
      });
    }

    const entry = await GurkulWaitlist.create({
      email: email.toLowerCase().trim(),
      name:  name?.trim() || '',
      source: source || 'gurukul_page',
      userId: userId || null,
    });

    const totalCount = await GurkulWaitlist.countDocuments();

    res.status(201).json({
      message:  'You have been added to the Gurukul waitlist.',
      position: totalCount,
      entry:    { id: entry._id, email: entry.email, createdAt: entry.createdAt },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This email is already on the waitlist.', alreadyJoined: true });
    }
    console.error('Gurukul waitlist error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// GET /api/gurukul/waitlist/count — public
router.get('/waitlist/count', async (req, res) => {
  try {
    const count = await GurkulWaitlist.countDocuments();
    res.json({ count, milestone: 20, progress: Math.min(count, 20) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/gurukul/waitlist — admin only
router.get('/waitlist', protect, adminOnly, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      GurkulWaitlist.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      GurkulWaitlist.countDocuments(),
    ]);

    res.json({
      entries, total, page,
      pages:           Math.ceil(total / limit),
      milestone:       20,
      progress:        Math.min(total, 20),
      percentToLaunch: Math.round((Math.min(total, 20) / 20) * 100),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/gurukul/waitlist/:id — admin only
router.delete('/waitlist/:id', protect, adminOnly, async (req, res) => {
  try {
    await GurkulWaitlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT ROUTES — NEW
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/gurukul/create-order
// Protected: user must be logged in to purchase.
// Creates a Razorpay order for ₹999. Returns order_id + key_id to the client.
router.post('/create-order', protect, async (req, res) => {
  try {
    // Check: already purchased?
    if (req.user.gurukul) {
      return res.status(400).json({ message: 'You already have Gurukul access.' });
    }

    const rzp = getRazorpay();

    const order = await razorpayRequest('/orders', {
      amount:   99900,      // ₹999 in paise
      currency: 'INR',
      receipt:  `gk_${Date.now()}_${req.user._id.toString().slice(-6)}`,
      notes: {
        userId:    req.user._id.toString(),
        userEmail: req.user.email,
        product:   'Gurukul Cohort 1',
      },
    }, rzp);

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    rzp.keyId,           // safe to expose — public key only
      userName: req.user.name,
      userEmail: req.user.email,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ message: err.message || 'Could not create payment order.' });
  }
});


// POST /api/gurukul/verify-payment
// Protected: called after Razorpay checkout succeeds on the client.
// Verifies the payment signature server-side, then upgrades the user.
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    // ── Signature verification (HMAC SHA256) ──────────────────────────────
    // Razorpay signs: order_id + "|" + payment_id with key_secret
    const { keySecret } = getRazorpay();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn('Gurukul payment signature mismatch:', {
        userId: req.user._id,
        orderId: razorpay_order_id,
      });
      return res.status(400).json({ message: 'Payment verification failed. Please contact support.' });
    }

    // ── Idempotency: already processed this payment? ──────────────────────
    if (req.user.gurukul) {
      return res.json({
        success: true,
        message: 'Gurukul access already active.',
        user: buildUserResponse(req.user),
      });
    }

    // ── Upgrade user ──────────────────────────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          gurukul:         true,
          gurkulPaidAt:    new Date(),
          gurkulOrderId:   razorpay_order_id,
          gurkulPaymentId: razorpay_payment_id,
        },
        // Award 500 Shraddha as a founding-member bonus
        $inc: { shraddha: 500 },
      },
      { new: true }
    );

    // Mark as converted in waitlist (best-effort)
    GurkulWaitlist.findOneAndUpdate(
      { email: req.user.email },
      { $set: { converted: true, convertedAt: new Date() } }
    ).catch(() => {});

    console.log(`✅ Gurukul access granted: ${req.user.email} | order: ${razorpay_order_id}`);

    res.json({
      success: true,
      message: 'Payment verified. Welcome to Gurukul.',
      user:    buildUserResponse(updatedUser),
    });
  } catch (err) {
    console.error('Razorpay verify-payment error:', err);
    res.status(500).json({ message: 'Verification failed. Please contact support.' });
  }
});


// GET /api/gurukul/access — check if current user has Gurukul access
// Used by the week pages to gate content.
router.get('/access', protect, (req, res) => {
  res.json({
    hasAccess:   req.user.gurukul === true,
    gurkulPaidAt: req.user.gurkulPaidAt || null,
  });
});


// ── Helper ────────────────────────────────────────────────────────────────────
function buildUserResponse(user) {
  return {
    id:              user._id,
    name:            user.name,
    email:           user.email,
    role:            user.role,
    bookmarks:       user.bookmarks    || [],
    conceptsRead:    user.conceptsRead || [],
    shraddha:        user.shraddha     || 0,
    gurukul:         user.gurukul      || false,
    gurkulPaidAt:    user.gurkulPaidAt || null,
    joinedAt:        user.joinedAt,
  };
}

export default router;
