import express from 'express';
import Relationship from '../models/Relationship.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/relationships — public
router.get('/', async (req, res) => {
  try {
    const relationships = await Relationship.find({}).lean();
    res.json(relationships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/relationships/:id — public
router.get('/:id', async (req, res) => {
  try {
    const rel = await Relationship.findById(req.params.id).lean();
    if (!rel) return res.status(404).json({ message: 'Relationship not found' });
    res.json(rel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/relationships — admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const rel = await Relationship.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(rel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/relationships/:id — admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const rel = await Relationship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rel) return res.status(404).json({ message: 'Relationship not found' });
    res.json(rel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/relationships/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const rel = await Relationship.findByIdAndDelete(req.params.id);
    if (!rel) return res.status(404).json({ message: 'Relationship not found' });
    res.json({ message: 'Relationship removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
