import express from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';
import EmotionalMapping from '../models/EmotionalMapping.js';
import SoulProfile from '../models/SoulProfile.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ── Rate limiters (unchanged) ──────────────────────────────────────

const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Seeker, your guest allowance is exhausted. Please create an account to seek deeper wisdom.' },
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Your mind must rest. Please wait 15 minutes before seeking further wisdom.' },
});

const rishiLimiter = (req, res, next) => {
  if (req.user) {
    const isPremium = req.user.gurukul || ['Bhamashah', 'Vajra'].includes(req.user.danaTier);
    if (isPremium) return next();
    return userLimiter(req, res, next);
  }
  return guestLimiter(req, res, next);
};

// ── Keyword tokenizer (preserved as fallback) ──────────────────────

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function rankRelevantNodes(nodes, relationships, text) {
  const tokens = new Set(tokenize(text));
  const scores = new Map();

  nodes.forEach((node) => {
    let score = 0;
    const haystacks = [
      node.label,
      node.sanskrit,
      node.desc,
      ...(node.epithets || []),
    ].filter(Boolean).map((value) => value.toLowerCase());

    tokens.forEach((token) => {
      if (haystacks.some((value) => value.includes(token))) score += 3;
    });

    if (score > 0) scores.set(node.id, score);
  });

  const topNodes = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nodeId]) => nodes.find((node) => node.id === nodeId))
    .filter(Boolean);

  const topNodeIds = new Set(topNodes.map((node) => node.id));
  const relatedLinks = relationships
    .filter((rel) => topNodeIds.has(rel.source) || topNodeIds.has(rel.target))
    .slice(0, 8);

  return { topNodes, relatedLinks };
}

// ── Pass 1: Emotion extraction via Gemini Flash ────────────────────

async function extractEmotions(question) {
  if (!genAI) return [];

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an emotion classifier for a spiritual guidance system.
Given a user's question or statement, identify 1 to 3 dominant emotional states from this list ONLY:
Grief, Anger, Confusion, Fear, Hopelessness, Guilt, Laziness, Pride, Loneliness, Lust, Envy, Inner Peace, Mental Unrest, Demotivation, Greed, Purpose, Attachment, Death, Discrimination, Temptation.

Rules:
- Return ONLY a JSON array of strings, e.g. ["Grief", "Confusion"]
- Maximum 3 emotions
- If the question is purely factual with no emotional content, return []
- Do NOT add any explanation, just the JSON array`,
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the JSON array from the response
    const match = text.match(/\[.*\]/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3).filter((e) => typeof e === 'string');
      }
    }
    return [];
  } catch (error) {
    console.error('Emotion extraction failed (falling back):', error.message);
    return [];
  }
}

// ── Pass 2: Graph-grounded emotional retrieval ─────────────────────

async function retrieveEmotionalContext(emotions) {
  if (!emotions.length) return { mappings: [], characters: [] };

  const mappings = await EmotionalMapping.find({
    emotion: { $in: emotions },
  }).lean();

  // Collect all character IDs referenced across matched mappings
  const charIds = new Set();
  mappings.forEach((m) => {
    (m.characterRefs || []).forEach((id) => charIds.add(id));
    (m.conceptRefs || []).forEach((id) => charIds.add(id));
  });

  // Fetch referenced characters for context enrichment
  const characters = charIds.size
    ? await Character.find({ id: { $in: [...charIds] } }).lean()
    : [];

  return { mappings, characters };
}

// ── Build the sensing message (Option A — visible to user) ─────────

function buildSensingMessage(emotions) {
  if (!emotions.length) return null;

  const emotionStr = emotions
    .map((e) => `**${e}**`)
    .join(emotions.length > 2 ? ', ' : ' and ');

  const openings = [
    `The Rishi senses that you carry the weight of ${emotionStr}...`,
    `O Seeker, the vibrations of ${emotionStr} ripple through your words...`,
    `Before wisdom speaks, the Rishi perceives ${emotionStr} within your heart...`,
    `The cosmic mirror reflects ${emotionStr} in the currents of your seeking...`,
  ];

  return openings[Math.floor(Math.random() * openings.length)];
}

// ── Soul Profile context builder ───────────────────────────────────

function buildSoulContext(soulProfile) {
  if (!soulProfile) return '';

  const parts = [];

  if (soulProfile.primaryArchetype?.name) {
    parts.push(`Primary Archetype: ${soulProfile.primaryArchetype.name} (confidence: ${soulProfile.primaryArchetype.confidence || 'unknown'}%)`);
    if (soulProfile.primaryArchetype.coreWound) {
      parts.push(`Core Wound: ${soulProfile.primaryArchetype.coreWound}`);
    }
    if (soulProfile.primaryArchetype.emergingStrength) {
      parts.push(`Emerging Strength: ${soulProfile.primaryArchetype.emergingStrength}`);
    }
  }

  if (soulProfile.currentPhase?.phaseLabel) {
    parts.push(`Current Life Phase: ${soulProfile.currentPhase.phaseLabel}`);
  }

  if (soulProfile.dimensions) {
    const d = soulProfile.dimensions;
    parts.push(`Soul Dimensions — Dharma Clarity: ${d.dharmaClarity}, Emotional Depth: ${d.emotionalDepth}, Shadow Awareness: ${d.shadowAwareness}, Action Orientation: ${d.actionOrientation}, Relationship Pattern: ${d.relationshipPattern}`);
  }

  if (soulProfile.lastDetectedEmotions?.length) {
    parts.push(`Previous emotional states: ${soulProfile.lastDetectedEmotions.join(', ')}`);
  }

  if (!parts.length) return '';
  return `\n\n[SEEKER_SOUL_PROFILE]\n${parts.join('\n')}`;
}

// ── Main route: POST /ask ──────────────────────────────────────────

router.post('/ask', optionalAuth, rishiLimiter, async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length < 3) {
    return res.status(400).json({ message: 'A meaningful question is required.' });
  }

  if (!genAI) {
    return res.status(503).json({ message: 'The Rishi is currently meditating (SDK missing)' });
  }

  try {
    // ── Pass 1: Extract emotions ─────────────────────────────────
    const detectedEmotions = await extractEmotions(question.trim());

    // ── Pass 2: Retrieve grounded context ────────────────────────
    const [
      { mappings: emotionalMappings, characters: emotionChars },
      allCharacters,
      allRelationships,
    ] = await Promise.all([
      retrieveEmotionalContext(detectedEmotions),
      Character.find({}).lean(),
      Relationship.find({}).lean(),
    ]);

    // Fetch soul profile if user is authenticated
    let soulProfile = null;
    if (req.user?._id) {
      soulProfile = await SoulProfile.findOne({ userId: req.user._id }).lean();
    }

    // ── Build focused context ────────────────────────────────────
    let contextBlock = '';
    let retrivalMode = 'keyword-fallback';

    if (emotionalMappings.length > 0) {
      // Emotional Graph-RAG path — tight, focused context
      retrivalMode = 'emotional-graph-rag';

      const shlokaContext = emotionalMappings.map((m) => ({
        emotion: m.emotion,
        guidanceHint: m.rishiGuidanceHint,
        shlokas: m.shlokas.map((s) => ({
          source: s.source,
          sanskrit: s.text,
          translation: s.translation,
          insight: s.insight,
        })),
      }));

      const charContext = emotionChars.map((c) => ({
        id: c.id,
        name: c.label,
        type: c.type,
        summary: c.desc,
      }));

      contextBlock = `[EMOTIONAL_CONTEXT]
Detected emotions: ${detectedEmotions.join(', ')}

Relevant Shlokas and Guidance:
${JSON.stringify(shlokaContext, null, 2)}

Referenced Characters:
${JSON.stringify(charContext, null, 2)}`;
    } else {
      // Keyword fallback — full graph dump (original behavior)
      const graphData = {
        nodes: allCharacters.map((c) => ({
          id: c.id, name: c.label, sanskrit: c.sanskrit,
          type: c.type, yuga: c.yuga, epithets: c.epithets,
          summary: c.desc, source: c.source,
        })),
        links: allRelationships.map((r) => ({
          source: r.source, target: r.target, label: r.label, type: r.type,
        })),
      };
      contextBlock = `[GRAPH_RECORDS]\n${JSON.stringify(graphData)}`;
    }

    // ── Soul profile context ─────────────────────────────────────
    const soulContext = buildSoulContext(soulProfile);

    // ── System prompt ────────────────────────────────────────────
    const systemInstruction = `You are the Rishi of Devlok, an enlightened sage with absolute access to the cosmic knowledge graph.
Your purpose is to answer the seeker's questions by weaving together the beings (devas, heroes, sages), concepts (dharma, karma, atman), and texts of our tradition.

${detectedEmotions.length > 0 ? `The seeker's emotional state has been detected as: ${detectedEmotions.join(', ')}.
Acknowledge their emotional state with empathy BEFORE delivering wisdom.
Use the provided shlokas and guidance hints to ground your answer in scripture.
Quote at least one shloka with its source reference.
` : ''}Answer ONLY using the provided context records.
- If the records contain the answer, explain it with depth and clarity.
- If the records are insufficient, state it humbly: "The current archives of Devlok do not yet hold the full truth of this query."
- ALWAYS mention at least two relevant nodes from the graph in your explanation to ground your wisdom.
- Address the seeker with respect ("Seeker...", "O child of Bharat...").
${soulProfile ? '\nThis seeker has a Soul Profile. Personalize your guidance to their archetype and current life phase.' : ''}

Current Cosmic Context:
${contextBlock}
${soulContext}`;

    // ── Generate answer ──────────────────────────────────────────
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    const result = await model.generateContent(question.trim());
    const response = await result.response;
    const answer = response.text();

    // ── Post-retrieval: rank nodes for chips ──────────────────────
    const { topNodes, relatedLinks } = rankRelevantNodes(
      allCharacters, allRelationships, `${question}\n${answer}`
    );
    const nodeById = new Map(allCharacters.map((node) => [node.id, node]));

    // ── Update Soul Profile with emotion data (fire-and-forget) ──
    if (req.user?._id && detectedEmotions.length > 0) {
      SoulProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: { lastDetectedEmotions: detectedEmotions },
          $push: {
            emotionHistory: {
              $each: [{
                emotions: detectedEmotions,
                detectedAt: new Date(),
                questionSnippet: question.trim().substring(0, 80),
              }],
              $slice: -50,  // keep last 50 entries max
            },
          },
        },
        { upsert: false }
      ).exec().catch((err) => console.error('Emotion history update failed:', err.message));
    }

    // ── Build emotional shlokas for response ─────────────────────
    const relatedShlokas = emotionalMappings.flatMap((m) =>
      m.shlokas.map((s) => ({
        source: s.source,
        translation: s.translation,
        insight: s.insight,
        emotion: m.emotion,
      }))
    );

    // ── Sensing message (Option A — visible to user) ─────────────
    const sensingMessage = buildSensingMessage(detectedEmotions);

    // ── Response ─────────────────────────────────────────────────
    res.json({
      answer,
      sensingMessage,
      detectedEmotions,
      retrievalMode: retrivalMode,
      coverage: topNodes.length ? 'graph-grounded' : 'limited',
      relatedShlokas,
      relatedNodes: topNodes.map((node) => ({
        id: node.id,
        label: node.label,
        type: node.type,
      })),
      relatedLinks: relatedLinks.map((rel) => ({
        source: nodeById.get(rel.source)?.label || rel.source,
        target: nodeById.get(rel.target)?.label || rel.target,
        label: rel.label,
        type: rel.type,
      })),
    });
  } catch (error) {
    console.error('Rishi error detailing:', error);
    res.status(500).json({ message: 'The Rishi encountered a disturbance in the ether.' });
  }
});

export default router;
