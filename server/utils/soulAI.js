// server/utils/soulAI.js
// AI interpretation utility for daily reflections
// Uses Gemini 2.5 Flash — ALWAYS called async, NEVER blocks API response
// Pattern matches existing rishi.js Gemini integration

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ARCHETYPES } from '../constants/archetypes.js';
import { LIFE_PHASES } from '../constants/lifePhases.js';
import Reflection from '../models/Reflection.js';
import SoulProfile from '../models/SoulProfile.js';

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generates a mythological interpretation for a user's reflection.
 * This is FIRE AND FORGET — call without await from the route handler.
 *
 * @param {String} reflectionId - Mongoose ObjectId of the Reflection document
 * @param {Object} soulProfile  - SoulProfile document (mongoose)
 * @param {Object} user         - User document (mongoose)
 */
export async function generateReflectionInterpretation(reflectionId, soulProfile, user) {
  if (!genAI) {
    console.warn('[soulAI] Gemini not initialized — GEMINI_API_KEY missing');
    return;
  }

  try {
    const reflection = await Reflection.findById(reflectionId);
    if (!reflection) return;

    // Resolve archetype and phase from constants (not DB)
    const archetypeKey = soulProfile.primaryArchetype?.name?.toUpperCase();
    const archetype = ARCHETYPES[archetypeKey];
    const phase = LIFE_PHASES[soulProfile.currentPhase?.phaseKey];

    if (!archetype || !phase) {
      console.warn('[soulAI] Could not resolve archetype or phase from constants');
      return;
    }

    const prompt = `You are the voice of ancient Indian wisdom — thoughtful, precise, and deeply human.
You are NOT a chatbot. You do NOT ask follow-up questions. You provide one clear interpretation.

USER CONTEXT:
- Current archetype: ${archetype.name} — ${archetype.tagline}
- Current life phase: ${phase.label} — ${phase.description}
- Core wound being worked on: ${archetype.coreWound}

QUESTION ASKED:
"${reflection.question.text}"

MYTHOLOGICAL CONTEXT OF THIS QUESTION:
${reflection.question.mythContext || '(no additional context)'}

USER'S ANSWER:
"${reflection.answer.text}"

YOUR TASK:
Generate a JSON interpretation with these exact fields:
{
  "mythologicalMirror": "One sentence connecting their answer to a specific moment in Indian mythology",
  "insight": "One sentence insight — honest, not flattering, genuinely useful",
  "dimensionDeltas": {
    "dharmaClarity": <integer -10 to +15>,
    "emotionalDepth": <integer -10 to +15>,
    "shadowAwareness": <integer -10 to +15>,
    "actionOrientation": <integer -10 to +15>,
    "relationshipPattern": <integer -10 to +15>
  }
}

RULES:
- mythologicalMirror must reference a specific story, character, or moment — not generic "ancient wisdom"
- insight must be direct — avoid spiritual bypassing, avoid toxic positivity
- dimensionDeltas should reflect what this specific answer reveals — most deltas should be 0 or small
- Return ONLY valid JSON. No preamble. No explanation. No markdown code blocks.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Parse JSON — strip any accidental markdown fences
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate minimum structure
    const { mythologicalMirror, insight, dimensionDeltas } = parsed;
    if (!mythologicalMirror || !insight || !dimensionDeltas) {
      throw new Error('Incomplete AI response structure');
    }

    // Clamp all deltas to [-10, +15]
    const clamp = (val) => Math.min(15, Math.max(-10, Number(val) || 0));
    const safeDeltals = {
      dharmaClarity:       clamp(dimensionDeltas.dharmaClarity),
      emotionalDepth:      clamp(dimensionDeltas.emotionalDepth),
      shadowAwareness:     clamp(dimensionDeltas.shadowAwareness),
      actionOrientation:   clamp(dimensionDeltas.actionOrientation),
      relationshipPattern: clamp(dimensionDeltas.relationshipPattern)
    };

    // Update reflection with interpretation
    reflection.interpretation = {
      mythologicalMirror,
      insight,
      dimensionDeltas: safeDeltals,
      generatedAt: new Date(),
      model: 'gemini-2.5-flash'
    };
    reflection.triggeredProfileUpdate = true;
    await reflection.save();

    // Apply dimension deltas to SoulProfile (clamp 0–100)
    const dims = soulProfile.dimensions;
    for (const [key, delta] of Object.entries(safeDeltals)) {
      if (key in dims) {
        dims[key] = Math.min(100, Math.max(0, (dims[key] || 50) + delta));
      }
    }

    // Increase archetype confidence with each reflection (max 100)
    const newConfidence = Math.min(100, (soulProfile.primaryArchetype.confidence || 30) + 2);
    soulProfile.primaryArchetype.confidence = newConfidence;

    // Check if card should regenerate (every 7 days of reflections — by card version milestone)
    const totalReflections = await Reflection.countDocuments({ soulProfileId: soulProfile._id });
    if (totalReflections > 0 && totalReflections % 7 === 0) {
      soulProfile.lastCardGeneratedAt = new Date();
      soulProfile.cardVersion = (soulProfile.cardVersion || 0) + 1;
    }

    await soulProfile.save();

  } catch (err) {
    // Never let AI errors propagate — log and continue
    console.error('[soulAI] Interpretation generation failed:', err.message);
  }
}
