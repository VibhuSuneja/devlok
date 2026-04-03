import express from 'express';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const CHARACTER_ALLOWED_FIELDS = new Set([
  'label',
  'sanskrit',
  'type',
  'size',
  'filter',
  'yuga',
  'epithets',
  'desc',
  'source'
]);

const NEW_CHARACTER_REQUIRED_FIELDS = ['id', 'label', 'type', 'filter', 'yuga'];
const NEW_RELATIONSHIP_REQUIRED_FIELDS = ['source', 'target', 'label', 'type'];

class ReviewValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReviewValidationError';
  }
}

const normalizeCharacterFieldValue = (field, value) => {
  if (field === 'size') {
    const num = Number(value);
    if (typeof value !== 'number' && isNaN(num)) {
      throw new ReviewValidationError('Character size must be a valid number.');
    }
    return num;
  }

  if (field === 'epithets') {
    if (!Array.isArray(value)) {
      // If it's a string, maybe it was sent as comma-separated? 
      // But let's assume strict array for now as per robust standards.
      throw new ReviewValidationError('Character epithets must be an array of strings.');
    }
    if (value.some((item) => typeof item !== 'string')) {
      throw new ReviewValidationError('All epithets must be strings.');
    }
  }

  return value;
};

const appendCitationToSource = (existingSource, citation) => {
  const sourceText = (existingSource || '').trim();
  const citationText = (citation || '').trim();
  if (!citationText) return sourceText;
  if (!sourceText) return citationText;
  if (sourceText.includes(citationText)) return sourceText;
  return `${sourceText} · ${citationText}`;
};

const applyCharacterCorrection = async (submission) => {
  if (!submission.targetId) {
    throw new ReviewValidationError('Correction submissions require a targetId.');
  }

  const character = await Character.findOne({ id: submission.targetId });
  if (!character) {
    throw new ReviewValidationError(`Character "${submission.targetId}" was not found.`);
  }

  if (!submission.data || typeof submission.data !== 'object') {
    throw new ReviewValidationError('Correction submission data must be an object.');
  }

  let changed = false;

  // Support both single field updates {field, newValue} and object updates
  if (submission.data.field) {
    const { field, newValue } = submission.data;
    if (!CHARACTER_ALLOWED_FIELDS.has(field)) {
      throw new ReviewValidationError(`Unsupported correction field: ${field}`);
    }
    character[field] = normalizeCharacterFieldValue(field, newValue);
    changed = true;
  } else {
    for (const [field, value] of Object.entries(submission.data)) {
      if (!CHARACTER_ALLOWED_FIELDS.has(field)) continue;
      character[field] = normalizeCharacterFieldValue(field, value);
      changed = true;
    }
  }

  if (!changed) {
    throw new ReviewValidationError('No valid character fields were provided for correction.');
  }

  character.source = appendCitationToSource(character.source, submission.sourceCitation);
  await character.save();
};

const createCharacterFromSubmission = async (submission) => {
  if (!submission.data || typeof submission.data !== 'object') {
    throw new ReviewValidationError('New character submission data must be an object.');
  }

  for (const field of NEW_CHARACTER_REQUIRED_FIELDS) {
    if (!submission.data[field]) {
      throw new ReviewValidationError(`Missing required character field: ${field}`);
    }
  }

  const existing = await Character.findOne({ id: submission.data.id });
  if (existing) {
    throw new ReviewValidationError(`Character id "${submission.data.id}" already exists.`);
  }

  const payload = {};
  for (const [field, value] of Object.entries(submission.data)) {
    if (!CHARACTER_ALLOWED_FIELDS.has(field) && field !== 'id') continue;
    payload[field] = field === 'id' ? value : normalizeCharacterFieldValue(field, value);
  }

  // Set initial source and creator
  payload.source = submission.sourceCitation;
  // createdBy is not in the Character schema yet, but good for tracking if added later
  // payload.createdBy = submission.user; 

  const newChar = new Character(payload);
  await newChar.save();
};

const createRelationshipFromSubmission = async (submission) => {
  if (!submission.data || typeof submission.data !== 'object') {
    throw new ReviewValidationError('New relationship submission data must be an object.');
  }

  for (const field of NEW_RELATIONSHIP_REQUIRED_FIELDS) {
    if (!submission.data[field]) {
      throw new ReviewValidationError(`Missing required relationship field: ${field}`);
    }
  }

  const newRel = new Relationship({
    source: submission.data.source,
    target: submission.data.target,
    label: submission.data.label,
    type: submission.data.type,
  });
  await newRel.save();
};

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

    if (status === 'approved') {
      // 1. Apply the data to the DB based on submission type
      if (submission.type === 'correction') {
        await applyCharacterCorrection(submission);
      } else if (submission.type === 'new_character') {
        await createCharacterFromSubmission(submission);
      } else if (submission.type === 'new_relationship') {
        await createRelationshipFromSubmission(submission);
      }

      // 2. Award +200 Shraddha to the author
      const author = await User.findById(submission.user);
      if (author) {
        author.shraddha = (author.shraddha || 0) + 200;
        await author.save();
      }
    }

    // Update submission record
    submission.status = status;
    submission.adminFeedback = adminFeedback || '';
    const updated = await submission.save();
    
    res.json(updated);

  } catch (err) {
    console.error('Submission review error:', err);
    if (err instanceof ReviewValidationError) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;

