// server/routes/gurukul.js
import express from 'express';
import GurkulWaitlist from '../models/GurkulWaitlist.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ── POST /api/gurukul/waitlist ────────────────────────────────────────────────
// Public: Join the Gurukul waitlist
router.post('/waitlist', async (req, res) => {
  try {
    const { email, name, source, userId } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }

    // Check for duplicate
    const existing = await GurkulWaitlist.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        message: 'This email is already on the waitlist.',
        alreadyJoined: true,
      });
    }

    const entry = await GurkulWaitlist.create({
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      source: source || 'gurukul_page',
      userId: userId || null,
    });

    // Get current count for the response (exciting for social proof)
    const totalCount = await GurkulWaitlist.countDocuments();

    res.status(201).json({
      message: 'You have been added to the Gurukul waitlist.',
      position: totalCount,
      entry: { id: entry._id, email: entry.email, createdAt: entry.createdAt },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'This email is already on the waitlist.',
        alreadyJoined: true,
      });
    }
    console.error('Gurukul waitlist error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/gurukul/waitlist/count ───────────────────────────────────────────
// Public: Get the current waitlist count (for social proof on the page)
router.get('/waitlist/count', async (req, res) => {
  try {
    const count = await GurkulWaitlist.countDocuments();
    // Don't reveal exact count until we have traction — show "X+ seekers"
    res.json({ count, milestone: 20, progress: Math.min(count, 20) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/gurukul/waitlist ─────────────────────────────────────────────────
// Admin only: Get full waitlist with pagination
router.get('/waitlist', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      GurkulWaitlist.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GurkulWaitlist.countDocuments(),
    ]);

    res.json({
      entries,
      total,
      page,
      pages: Math.ceil(total / limit),
      milestone: 20,
      progress: Math.min(total, 20),
      percentToLaunch: Math.round((Math.min(total, 20) / 20) * 100),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/gurukul/waitlist/:id ─────────────────────────────────────────
// Admin only: Remove an entry
router.delete('/waitlist/:id', protect, adminOnly, async (req, res) => {
  try {
    await GurkulWaitlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
