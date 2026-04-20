// d:\mythology\devlok\server\scratch\logic_test.js
import { computeDimensionsFromAnswers } from '../constants/onboardingQuestions.js';
import { computeArchetypeMatch, ARCHETYPES } from '../constants/archetypes.js';
import { getNextQuestion } from '../constants/reflectionQuestions.js';
import { LIFE_PHASE_KEYS } from '../constants/lifePhases.js';

console.log("🕉️ Starting Devlok Soul Engine Logic Validation...");

// 1. Test Onboarding Dimension Calculation
console.log("\n--- Testing Dimension Calculation ---");
const mockAnswers = [
  { questionId: "Q1", optionId: "Q1A" }, // shadowAwareness: +15, dharmaClarity: +5
  { questionId: "Q2", optionId: "Q2B" }, // emotionalDepth: +15, dharmaClarity: +5
  { questionId: "Q3", optionId: "Q3C" }, // emotionalDepth: +10, relationshipPattern: +10
  { questionId: "Q4", optionId: "Q4D" }, // dharmaClarity: +15, emotionalDepth: +5
  { questionId: "Q5", optionId: "Q5A" }  // shadowAwareness: +15, dharmaClarity: +5
];

const dimensions = computeDimensionsFromAnswers(mockAnswers);
console.log("Calculated Dimensions (Expect specific skews):", dimensions);

// 2. Test Archetype Matching
console.log("\n--- Testing Archetype Matching ---");
// Simulate someone with high Action and low Dharma (Abhimanyu range)
const seekerDimensions = {
  dharmaClarity: 25,
  emotionalDepth: 55,
  shadowAwareness: 40,
  actionOrientation: 95,
  relationshipPattern: 60
};
const matchResult = computeArchetypeMatch(seekerDimensions);
const match = ARCHETYPES[matchResult.archetypeKey];
console.log(`Matched Archetype: ${match.name} (${match.key})`);
console.log("Match Score:", matchResult.matchScore);
console.log("Tagline:", match.tagline);

// 3. Test Reflection Question Rotation
console.log("\n--- Testing Question Rotation ---");
const phase = "IDENTITY_CRISIS";
const previousIds = [1, 3]; // Simulate having answered questions 1 and 3 before
const nextQ = getNextQuestion(phase, previousIds);
console.log(`Next Question for ${phase} (Should not be 1 or 3):`, nextQ.id, "-", nextQ.text);

console.log("\n✅ Logic validation complete.");
