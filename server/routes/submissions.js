import express from 'express';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/submissions ───────────────────────────────────────────────────
// Admin only: List submissions (can filter by status)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const statusFilter = req.query.status || 'pending';
    const submissions = await Submission.find({ status: statusFilter })
      .populate('user', 'name email shraddha')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/submissions/me ───────────────────────────────────────────────
// User only: List their own submissions
router.get('/me', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/submissions ─────────────────────────────────────────────────
// Submit a correction or new entry. Award +50 Shraddha.
router.post('/', protect, async (req, res) => {
  try {
    const { type, targetId, data, sourceCitation } = req.body;

    if (!sourceCitation || sourceCitation.trim().length < 5) {
      return res.status(400).json({ message: 'A specific scriptural source citation is required.' });
    }

    const submission = new Submission({
      user: req.user.id,
      type,
      targetId,
      data,
      sourceCitation
    });
    const saved = await submission.save();

    // Award initial submission points
    const user = await User.findById(req.user.id);
    if (user) {
      user.shraddha = (user.shraddha || 0) + 50;
      await user.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/submissions/:id/review ───────────────────────────────────────
// Admin only: Approve or reject. Apply data if approved. Award +200 Shraddha.
router.put('/:id/review', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminFeedback } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.status !== 'pending') return res.status(400).json({ message: 'Already reviewed' });

    submission.status = status;
    submission.adminFeedback = adminFeedback || '';

    if (status === 'approved') {
      // 1. Apply the data to the DB
      if (submission.type === 'correction') {
        const char = await Character.findOne({ id: submission.targetId });
        if (char) {
          const { field, newValue } = submission.data;
          // Deep merge or set depending on field structure, simple set for now
          // Assuming data is { desc: 'new text' } style mappings
          // For safety, allow only certain fields or just trust admin approval
          if (submission.data.field) {
            char[submission.data.field] = submission.data.newValue;
          } else {
             // fallback object merge
             Object.assign(char, submission.data);
          }
          // ensure source citation gets appended or recorded? 
          // (Usually we require them to append to the content directly, or we can update the source field)
          if (char.source && !char.source.includes(submission.sourceCitation)) {
             char.source = char.source + ' \u00B7 ' + submission.sourceCitation;
          }
          await char.save();
        }
      } else if (submission.type === 'new_character') {
        const newChar = new Character({
           ...submission.data,
           source: submission.sourceCitation
        });
        await newChar.save();
      } else if (submission.type === 'new_relationship') {
        const newRel = new Relationship(submission.data);
        await newRel.save();
      }

      // 2. Award +200 Shraddha to the author
      const author = await User.findById(submission.user);
      if (author) {
        author.shraddha = (author.shraddha || 0) + 200;
        await author.save();
      }
    }

    const updated = await submission.save();
    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
