import express from 'express';
import Character from '../models/Character.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/characters — public
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find({}).lean();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/characters/:id — public
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findOne({ id: req.params.id }).lean();
    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json(character);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/characters — admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const character = await Character.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(character);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/characters/:id — admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const character = await Character.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json(character);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/characters/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const character = await Character.findOneAndDelete({ id: req.params.id });
    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json({ message: 'Character removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
