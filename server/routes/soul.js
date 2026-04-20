// server/routes/soul.js
// Soul Profile Engine — all 8 API endpoints
// Base route: /api/soul (registered in server/index.js)

import express from 'express';
import { protect, syncUserToClerk } from '../middleware/auth.js';
import SoulProfile from '../models/SoulProfile.js';
import Reflection from '../models/Reflection.js';
import User from '../models/User.js';
import { ARCHETYPES, computeArchetypeMatch } from '../constants/archetypes.js';
import { LIFE_PHASES } from '../constants/lifePhases.js';
import { ONBOARDING_QUESTIONS, computeDimensionsFromAnswers } from '../constants/onboardingQuestions.js';
import { REFLECTION_QUESTIONS, getNextQuestion } from '../constants/reflectionQuestions.js';
import { generateReflectionInterpretation } from '../utils/soulAI.js';

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if two dates are on the same calendar day (IST-aware via UTC offset)
 */
function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth() &&
    d1.getDate()     === d2.getDate()
  );
}

/**
 * Check if date is yesterday relative to today
 */
function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/**
 * Compute and award any newly unlocked milestones. Returns the first new one or null.
 */
function checkMilestones(soulProfile, reflectionCount) {
  const already = new Set(soulProfile.milestones.map(m => m.type));
  const streak = soulProfile.streak.current;
  const newMilestones = [];

  const candidates = [
    {
      type: 'first_reflection',
      condition: reflectionCount === 1,
      label: 'The First Step — Nachiketa asked his first question too.'
    },
    {
      type: 'streak_3',
      condition: streak === 3,
      label: 'Three Days of Truth — consistency is its own dharma.'
    },
    {
      type: 'streak_7',
      condition: streak === 7,
      label: 'Seven Days — your profile has grown roots.'
    },
    {
      type: 'streak_21',
      condition: streak === 21,
      label: '21 Days — you have formed a new samskara.'
    }
  ];

  for (const m of candidates) {
    if (m.condition && !already.has(m.type)) {
      soulProfile.milestones.push({ type: m.type, label: m.label, achievedAt: new Date() });
      newMilestones.push(m);
    }
  }

  return newMilestones[0] || null;
}

// ─── 8.1 POST /api/soul/onboard ──────────────────────────────────────────────
router.post('/onboard', protect, async (req, res) => {
  try {
    const { answers, lifePhase } = req.body;
    const userId = req.user._id;

    // Validate life phase
    if (!LIFE_PHASES[lifePhase]) {
      return res.status(400).json({ message: 'Invalid life phase key' });
    }

    // Validate answers — must be 5 answers, each with valid questionId + optionId
    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ message: 'Exactly 5 answers required' });
    }
    for (const a of answers) {
      const q = ONBOARDING_QUESTIONS.find(q => q.id === a.questionId);
      if (!q) return res.status(400).json({ message: `Invalid questionId: ${a.questionId}` });
      if (!q.options.find(o => o.id === a.optionId)) {
        return res.status(400).json({ message: `Invalid optionId: ${a.optionId}` });
      }
    }

    // Prevent double onboarding
    if (req.user.hasSoulProfile) {
      const existing = await SoulProfile.findById(req.user.soulProfileId);
      if (existing) {
        const archetypeData = ARCHETYPES[existing.primaryArchetype.name?.toUpperCase()];
        return res.status(200).json({
          soulProfile: existing,
          archetype: archetypeData,
          message: 'Soul Profile already exists'
        });
      }
    }

    // Compute dimension scores from answers
    const dimensions = computeDimensionsFromAnswers(answers);

    // Match archetype
    const { archetypeKey } = computeArchetypeMatch(dimensions);
    const archetype = ARCHETYPES[archetypeKey];
    const phase = LIFE_PHASES[lifePhase];

    // Create SoulProfile
    const now = new Date();
    const soulProfile = await SoulProfile.create({
      userId,
      primaryArchetype: {
        name:             archetype.name,
        assignedAt:       now,
        confidence:       30,
        mythText:         archetype.tagline,
        coreWound:        archetype.coreWound,
        emergingStrength: archetype.emergingStrength
      },
      currentPhase: {
        phaseKey:   phase.key,
        phaseLabel: phase.label,
        enteredAt:  now,
        isActive:   true
      },
      dimensions,
      streak: { current: 0, longest: 0, lastReflectedAt: null }
    });

    // Update User
    const updatedUser = await User.findByIdAndUpdate(userId, {
      hasSoulProfile:        true,
      soulProfileId:         soulProfile._id,
      onboardingCompletedAt: now
    }, { new: true });

    await syncUserToClerk(updatedUser);

    return res.status(201).json({
      soulProfile,
      archetype,
      message: `Your soul mirrors ${archetype.name}. Welcome to the journey.`
    });

  } catch (err) {
    console.error('[soul/onboard]', err);
    res.status(500).json({ message: 'Failed to create Soul Profile' });
  }
});

// ─── 8.2 GET /api/soul/profile ───────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const soulProfile = await SoulProfile.findOne({ userId: req.user._id });

    if (!soulProfile) {
      return res.status(404).json({ message: 'No Soul Profile found. Complete onboarding first.' });
    }

    const archetypeKey = soulProfile.primaryArchetype?.name?.toUpperCase();
    const archetype = ARCHETYPES[archetypeKey] || null;
    const phaseKey = soulProfile.currentPhase?.phaseKey;
    const currentPhaseDetails = LIFE_PHASES[phaseKey] || null;

    const daysActive = soulProfile.createdAt
      ? Math.floor((Date.now() - new Date(soulProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const reflectionCount = await Reflection.countDocuments({ soulProfileId: soulProfile._id });

    return res.json({
      soulProfile,
      archetype,
      currentPhaseDetails,
      daysActive,
      reflectionCount
    });

  } catch (err) {
    console.error('[soul/profile]', err);
    res.status(500).json({ message: 'Failed to fetch Soul Profile' });
  }
});

// ─── 8.3 GET /api/soul/question/today ────────────────────────────────────────
router.get('/question/today', protect, async (req, res) => {
  try {
    const soulProfile = await SoulProfile.findOne({ userId: req.user._id });

    if (!soulProfile) {
      return res.status(404).json({ message: 'No Soul Profile found' });
    }

    // Check if already reflected today (date-based, not 24h)
    const lastReflected = soulProfile.streak.lastReflectedAt;
    if (lastReflected && isSameDay(lastReflected, new Date())) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);

      return res.json({
        alreadyReflected: true,
        nextAt: tomorrow,
        streakInfo: {
          current: soulProfile.streak.current,
          longest: soulProfile.streak.longest
        }
      });
    }

    const phaseKey = soulProfile.currentPhase?.phaseKey;
    if (!phaseKey || !LIFE_PHASES[phaseKey]) {
      return res.status(400).json({ message: 'Invalid life phase on profile' });
    }

    // Get next question (rotating, non-repeating within cycle)
    const question = getNextQuestion(phaseKey, soulProfile.answeredQuestionIds || []);

    if (!question) {
      return res.status(500).json({ message: 'No questions available for this phase' });
    }

    return res.json({
      question,
      alreadyReflected: false,
      streakInfo: {
        current: soulProfile.streak.current,
        longest: soulProfile.streak.longest
      }
    });

  } catch (err) {
    console.error('[soul/question/today]', err);
    res.status(500).json({ message: 'Failed to get today\'s question' });
  }
});

// ─── 8.4 POST /api/soul/reflect ──────────────────────────────────────────────
router.post('/reflect', protect, async (req, res) => {
  try {
    const { questionId, answerText } = req.body;
    const userId = req.user._id;

    // Validate answer
    if (!answerText || typeof answerText !== 'string') {
      return res.status(400).json({ message: 'Answer text is required' });
    }
    const trimmed = answerText.trim();
    if (trimmed.length < 10) {
      return res.status(400).json({ message: 'Answer must be at least 10 characters' });
    }
    if (trimmed.length > 1000) {
      return res.status(400).json({ message: 'Answer must not exceed 1000 characters' });
    }

    // Resolve question
    const question = REFLECTION_QUESTIONS.find(q => q.id === questionId);
    if (!question) {
      return res.status(400).json({ message: `Invalid question ID: ${questionId}` });
    }

    const soulProfile = await SoulProfile.findOne({ userId });
    if (!soulProfile) {
      return res.status(404).json({ message: 'No Soul Profile found' });
    }

    // Prevent double submission on same day
    const lastReflected = soulProfile.streak.lastReflectedAt;
    if (lastReflected && isSameDay(lastReflected, new Date())) {
      return res.status(409).json({ message: 'Already reflected today. Come back tomorrow.' });
    }

    // Create reflection document immediately (interpretation filled async)
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const now = new Date();

    const reflection = await Reflection.create({
      userId,
      soulProfileId: soulProfile._id,
      question: {
        text:            question.text,
        archetypeRef:    question.archetypeRef,
        phaseRef:        question.phaseKey,
        dimensionTarget: question.dimensionTarget,
        mythContext:     question.mythContext
      },
      answer: {
        text:        trimmed,
        wordCount,
        submittedAt: now
      },
      reflectedAt: now
    });

    // Update streak (date-based)
    const streak = soulProfile.streak;
    if (lastReflected && isYesterday(lastReflected)) {
      // Consecutive day — extend streak
      streak.current = (streak.current || 0) + 1;
    } else {
      // Gap or first reflection — reset to 1
      streak.current = 1;
    }
    streak.longest  = Math.max(streak.longest || 0, streak.current);
    streak.lastReflectedAt = now;

    // Track answered question to avoid repetition
    if (!soulProfile.answeredQuestionIds.includes(questionId)) {
      soulProfile.answeredQuestionIds.push(questionId);
    }

    // Count total reflections for milestone check
    const reflectionCount = await Reflection.countDocuments({ soulProfileId: soulProfile._id });

    // Check milestones (secondary archetype unlock at 21-day streak)
    let milestoneUnlocked = checkMilestones(soulProfile, reflectionCount);
    if (streak.current === 21 && !soulProfile.secondaryArchetype?.name) {
      // Assign secondary archetype — the second-best match from original dimensions
      const { allScores } = computeArchetypeMatch(soulProfile.dimensions);
      const sorted = Object.entries(allScores).sort((a, b) => b[1] - a[1]);
      const primaryKey = soulProfile.primaryArchetype.name?.toUpperCase();
      const secondaryEntry = sorted.find(([k]) => k !== primaryKey);
      if (secondaryEntry) {
        const secArchetype = ARCHETYPES[secondaryEntry[0]];
        soulProfile.secondaryArchetype = {
          name:       secArchetype.name,
          unlockedAt: now,
          mythText:   secArchetype.tagline
        };
        if (!milestoneUnlocked) {
          const secMilestone = {
            type:       'secondary_unlocked',
            label:      'The Hidden Archetype — your second self has a name now.',
            achievedAt: now
          };
          soulProfile.milestones.push(secMilestone);
          milestoneUnlocked = secMilestone;
        }
      }
    }

    await soulProfile.save();

    // ASYNC — fire and forget AI interpretation (never block response)
    generateReflectionInterpretation(reflection._id, soulProfile, req.user)
      .catch(err => console.error('[soul/reflect async AI]', err.message));

    return res.status(201).json({
      reflectionId:      reflection._id,
      streak:            { current: streak.current, longest: streak.longest },
      milestoneUnlocked: milestoneUnlocked || null,
      message:           'Reflection recorded. Your mirror is being prepared.'
    });

  } catch (err) {
    console.error('[soul/reflect]', err);
    res.status(500).json({ message: 'Failed to submit reflection' });
  }
});

// ─── 8.5 GET /api/soul/reflect/:reflectionId/interpretation ──────────────────
router.get('/reflect/:reflectionId/interpretation', protect, async (req, res) => {
  try {
    const reflection = await Reflection.findOne({
      _id:    req.params.reflectionId,
      userId: req.user._id          // Security: only own reflections
    });

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    if (reflection.interpretation && reflection.interpretation.generatedAt) {
      return res.json({
        status: 'ready',
        interpretation: reflection.interpretation
      });
    }

    return res.json({
      status: 'processing',
      interpretation: null
    });

  } catch (err) {
    console.error('[soul/interpretation]', err);
    res.status(500).json({ message: 'Failed to fetch interpretation' });
  }
});

// ─── 8.6 PUT /api/soul/phase ─────────────────────────────────────────────────
router.put('/phase', protect, async (req, res) => {
  try {
    const { newPhaseKey, resolvedPrevious } = req.body;

    if (!LIFE_PHASES[newPhaseKey]) {
      return res.status(400).json({ message: 'Invalid life phase key' });
    }

    const soulProfile = await SoulProfile.findOne({ userId: req.user._id });
    if (!soulProfile) {
      return res.status(404).json({ message: 'No Soul Profile found' });
    }

    const now = new Date();

    // Resolve previous phase if requested
    if (resolvedPrevious && soulProfile.currentPhase?.phaseKey) {
      const prevPhase = soulProfile.currentPhase;
      prevPhase.isActive   = false;
      prevPhase.resolvedAt = now;

      // Count reflections for this specific session of the phase
      const phaseReflectionCount = await Reflection.countDocuments({
        soulProfileId: soulProfile._id,
        reflectedAt: { $gte: prevPhase.enteredAt || soulProfile.createdAt, $lte: now }
      });

      soulProfile.phaseHistory.push({
        phaseKey:         prevPhase.phaseKey,
        phaseLabel:       prevPhase.phaseLabel,
        enteredAt:        prevPhase.enteredAt || soulProfile.createdAt,
        resolvedAt:       now,
        reflectionCount:  phaseReflectionCount
      });

      // Award phase_resolved milestone (only first time)
      const alreadyResolved = soulProfile.milestones.some(m => m.type === 'phase_resolved');
      if (!alreadyResolved) {
        soulProfile.milestones.push({
          type:       'phase_resolved',
          label:      'The Exile Ends — you walked through it and came out.',
          achievedAt: now
        });
      }
    }

    // Set new phase
    const newPhase = LIFE_PHASES[newPhaseKey];
    soulProfile.currentPhase = {
      phaseKey:   newPhase.key,
      phaseLabel: newPhase.label,
      enteredAt:  now,
      isActive:   true,
      resolvedAt: null
    };

    await soulProfile.save();

    return res.json({
      soulProfile,
      message: `Life phase updated to: ${newPhase.label}`
    });

  } catch (err) {
    console.error('[soul/phase]', err);
    res.status(500).json({ message: 'Failed to update life phase' });
  }
});

// ─── 8.7 GET /api/soul/card ──────────────────────────────────────────────────
router.get('/card', protect, async (req, res) => {
  try {
    const soulProfile = await SoulProfile.findOne({ userId: req.user._id });
    if (!soulProfile) {
      return res.status(404).json({ message: 'No Soul Profile found' });
    }

    const archetypeKey = soulProfile.primaryArchetype?.name?.toUpperCase();
    const archetype = ARCHETYPES[archetypeKey] || {};
    const phaseKey = soulProfile.currentPhase?.phaseKey;
    const phase = LIFE_PHASES[phaseKey] || {};

    const reflectionCount = await Reflection.countDocuments({ soulProfileId: soulProfile._id });
    const daysSinceStart = soulProfile.createdAt
      ? Math.floor((Date.now() - new Date(soulProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return res.json({
      cardData: {
        userName:          req.user.name || 'Seeker',
        primaryArchetype:  { ...soulProfile.primaryArchetype.toObject(), ...archetype },
        currentPhase:      { ...soulProfile.currentPhase.toObject(), ...phase },
        daysSinceStart,
        reflectionCount,
        streak:            soulProfile.streak,
        cardVersion:       soulProfile.cardVersion || 0,
        generatedAt:       soulProfile.lastCardGeneratedAt || soulProfile.createdAt
      }
    });

  } catch (err) {
    console.error('[soul/card]', err);
    res.status(500).json({ message: 'Failed to fetch card data' });
  }
});

// ─── 8.8 GET /api/soul/reflections?page=1&limit=10 ───────────────────────────
router.get('/reflections', protect, async (req, res) => {
  try {
    const soulProfile = await SoulProfile.findOne({ userId: req.user._id });
    if (!soulProfile) {
      return res.status(404).json({ message: 'No Soul Profile found' });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [reflections, total] = await Promise.all([
      Reflection.find({ soulProfileId: soulProfile._id })
        .sort({ reflectedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reflection.countDocuments({ soulProfileId: soulProfile._id })
    ]);

    return res.json({ reflections, total, page });

  } catch (err) {
    console.error('[soul/reflections]', err);
    res.status(500).json({ message: 'Failed to fetch reflections' });
  }
});

export default router;
