import express from 'express';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';

const router = express.Router();

// GET /api/graph — public — the main graph data endpoint
router.get('/', async (req, res) => {
  try {
    const [nodes, links] = await Promise.all([
      Character.find({}).lean(),
      Relationship.find({}).lean(),
    ]);
    res.json({ nodes, links });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
