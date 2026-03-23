import express from 'express';
import Character from '../models/Character.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Shraddha rank labels ──────────────────────────────────────────────────────
const RANKS = [
  { min: 0,    label: 'Curious Seeker' },
  { min: 100,  label: 'Student of the Epics' },
  { min: 300,  label: 'Devoted Reader' },
  { min: 600,  label: 'Dharma Scholar' },
  { min: 1000, label: 'Mahapandit' },
  { min: 2000, label: 'Chiranjivi' },
];

export function getShraddhaRank(points) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (points >= r.min) rank = r;
  }
  return rank.label;
}

// ── GET /api/users/me ─────────────────────────────────────────────────────────
// Returns own profile with bookmarks + shraddha rank
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id:           user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      bookmarks:    user.bookmarks,
      conceptsRead: user.conceptsRead,
      shraddha:     user.shraddha,
      shraddhaRank: getShraddhaRank(user.shraddha),
      joinedAt:     user.joinedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/bookmarks ──────────────────────────────────────────────────
// Returns full character objects for all bookmarked IDs
router.get('/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('bookmarks');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.bookmarks.length) return res.json([]);
    const characters = await Character.find({ id: { $in: user.bookmarks } }).lean();
    // Return in the same order as bookmarks array
    const ordered = user.bookmarks
      .map(bId => characters.find(c => c.id === bId))
      .filter(Boolean);
    res.json(ordered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/bookmarks ──────────────────────────────────────────────────
// Body: { characterId: 'karna', action: 'add' | 'remove' }
// Awards +5 Shraddha on 'add'
router.put('/bookmarks', protect, async (req, res) => {
  try {
    const { characterId, action } = req.body;
    if (!characterId || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'characterId and action (add|remove) required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'add') {
      if (!user.bookmarks.includes(characterId)) {
        user.bookmarks.push(characterId);
        user.shraddha = (user.shraddha || 0) + 5;
      }
    } else {
      if (user.bookmarks.includes(characterId)) {
        user.bookmarks = user.bookmarks.filter(b => b !== characterId);
        user.shraddha = Math.max(0, (user.shraddha || 0) - 5);
      }
    }

    await user.save();
    res.json({
      bookmarks: user.bookmarks,
      shraddha:  user.shraddha,
      shraddhaRank: getShraddhaRank(user.shraddha),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/concepts-read ──────────────────────────────────────────────
// Body: { conceptId: 5 }   (number — the date_index of the concept)
// Awards +10 Shraddha on first read
router.put('/concepts-read', protect, async (req, res) => {
  try {
    const { conceptId } = req.body;
    if (conceptId === undefined || conceptId === null) {
      return res.status(400).json({ message: 'conceptId required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let awarded = 0;
    if (!user.conceptsRead.includes(conceptId)) {
      user.conceptsRead.push(conceptId);
      user.shraddha = (user.shraddha || 0) + 10;
      awarded = 10;
    }

    await user.save();
    res.json({
      conceptsRead: user.conceptsRead,
      shraddha:     user.shraddha,
      shraddhaRank: getShraddhaRank(user.shraddha),
      awarded,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
