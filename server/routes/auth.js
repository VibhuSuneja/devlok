// server/routes/auth.js
// FULL FILE — replaces existing server/routes/auth.js
// Change: gurukul field added to all user response objects

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getShraddhaRank } from './users.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Helper: consistent user shape across all auth endpoints
function userShape(user) {
  return {
    id:           user._id,
    name:         user.name,
    email:        user.email,
    role:         user.role,
    bookmarks:    user.bookmarks    || [],
    conceptsRead: user.conceptsRead || [],
    shraddha:     user.shraddha     || 0,
    shraddhaRank: getShraddhaRank(user.shraddha || 0),
    gurukul:      user.gurukul      || false,   // ← NEW
    gurkulPaidAt: user.gurkulPaidAt || null,     // ← NEW
    joinedAt:     user.joinedAt,
  };
}

// POST /api/auth/register — admin-only registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ token: signToken(user._id), user: userShape(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register-user — public signup
router.post('/register-user', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({ token: signToken(user._id), user: userShape(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: signToken(user._id), user: userShape(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json(userShape(req.user));
});

export default router;
