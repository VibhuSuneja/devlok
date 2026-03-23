import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getShraddhaRank } from './users.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Admin-only registration (unchanged) ──────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Public user registration ─────────────────────────────────────────────────
// POST /api/auth/register-user
router.post('/register-user', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    // Role always 'user' — never admin via this route
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({
      token: signToken(user._id),
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        bookmarks:    user.bookmarks,
        conceptsRead: user.conceptsRead,
        shraddha:     user.shraddha,
        shraddhaRank: getShraddhaRank(user.shraddha),
        joinedAt:     user.joinedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login (works for both admin and user) ────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({
      token: signToken(user._id),
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        bookmarks:    user.bookmarks    || [],
        conceptsRead: user.conceptsRead || [],
        shraddha:     user.shraddha     || 0,
        shraddhaRank: getShraddhaRank(user.shraddha || 0),
        joinedAt:     user.joinedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  const u = req.user;
  res.json({
    id:           u._id,
    name:         u.name,
    email:        u.email,
    role:         u.role,
    bookmarks:    u.bookmarks    || [],
    conceptsRead: u.conceptsRead || [],
    shraddha:     u.shraddha     || 0,
    shraddhaRank: getShraddhaRank(u.shraddha || 0),
    joinedAt:     u.joinedAt,
  });
});

export default router;
