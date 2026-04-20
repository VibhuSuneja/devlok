// server/constants/onboardingQuestions.js
// 5 questions shown during onboarding — determines initial archetype assignment
// dimensionEffect values are ADDITIVE to base scores starting at 50

export const ONBOARDING_QUESTIONS = [
  {
    id: "Q1",
    text: "When something goes wrong in your life, what do you find yourself doing first?",
    options: [
      { id: "Q1A", text: "Analyzing what I did wrong",          dimensionEffect: { shadowAwareness: +15, dharmaClarity: +5 } },
      { id: "Q1B", text: "Feeling it deeply before doing anything", dimensionEffect: { emotionalDepth: +15, actionOrientation: -5 } },
      { id: "Q1C", text: "Taking action to fix it immediately",  dimensionEffect: { actionOrientation: +15, emotionalDepth: -5 } },
      { id: "Q1D", text: "Wondering if this was meant to happen", dimensionEffect: { dharmaClarity: +10, shadowAwareness: +5 } }
    ]
  },
  {
    id: "Q2",
    text: "What's the one thing you're most tired of explaining to people about yourself?",
    options: [
      { id: "Q2A", text: "That I'm more capable than I look",                  dimensionEffect: { shadowAwareness: +10, relationshipPattern: +10 } },
      { id: "Q2B", text: "That I care too much — it's not a weakness",          dimensionEffect: { emotionalDepth: +15, dharmaClarity: +5 } },
      { id: "Q2C", text: "That I need space to think before I act",             dimensionEffect: { dharmaClarity: +10, actionOrientation: -5 } },
      { id: "Q2D", text: "That I'm not confused — I'm choosing deliberately",   dimensionEffect: { dharmaClarity: +15, shadowAwareness: +5 } }
    ]
  },
  {
    id: "Q3",
    text: "In a group, you're most likely the one who:",
    options: [
      { id: "Q3A", text: "Quietly does the most work",                        dimensionEffect: { actionOrientation: +10, relationshipPattern: -5 } },
      { id: "Q3B", text: "Asks the uncomfortable question no one else will",   dimensionEffect: { shadowAwareness: +15, dharmaClarity: +5 } },
      { id: "Q3C", text: "Holds the emotional center together",                dimensionEffect: { emotionalDepth: +10, relationshipPattern: +10 } },
      { id: "Q3D", text: "Pushes everyone toward a decision",                  dimensionEffect: { actionOrientation: +15, dharmaClarity: +5 } }
    ]
  },
  {
    id: "Q4",
    text: "When you're at your lowest, what do you find yourself craving?",
    options: [
      { id: "Q4A", text: "Someone who just gets it without me explaining",   dimensionEffect: { emotionalDepth: +15, relationshipPattern: +5 } },
      { id: "Q4B", text: "A clear direction — tell me what to do",           dimensionEffect: { dharmaClarity: -10, actionOrientation: +10 } },
      { id: "Q4C", text: "Solitude to figure it out on my own",              dimensionEffect: { shadowAwareness: +10, relationshipPattern: -10 } },
      { id: "Q4D", text: "Evidence that this struggle means something",       dimensionEffect: { dharmaClarity: +15, emotionalDepth: +5 } }
    ]
  },
  {
    id: "Q5",
    text: "Finish this: The version of me I'm most afraid of becoming is...",
    options: [
      { id: "Q5A", text: "Someone who stopped asking why",                        dimensionEffect: { shadowAwareness: +15, dharmaClarity: +5 } },
      { id: "Q5B", text: "Someone who gave up too early",                         dimensionEffect: { actionOrientation: +10, emotionalDepth: +5 } },
      { id: "Q5C", text: "Someone who became cold to protect themselves",          dimensionEffect: { emotionalDepth: +15, relationshipPattern: -5 } },
      { id: "Q5D", text: "Someone who chose the wrong life to please others",      dimensionEffect: { dharmaClarity: +20 } }
    ]
  }
];

/**
 * Compute dimension scores from an array of selected options.
 * Base score for all dimensions is 50.
 * @param {Array<{ questionId: String, optionId: String }>} answers
 * @returns {{ dharmaClarity, emotionalDepth, shadowAwareness, actionOrientation, relationshipPattern }}
 */
export function computeDimensionsFromAnswers(answers) {
  const dimensions = {
    dharmaClarity:       50,
    emotionalDepth:      50,
    shadowAwareness:     50,
    actionOrientation:   50,
    relationshipPattern: 50
  };

  for (const { questionId, optionId } of answers) {
    const question = ONBOARDING_QUESTIONS.find(q => q.id === questionId);
    if (!question) continue;
    const option = question.options.find(o => o.id === optionId);
    if (!option) continue;

    for (const [dim, delta] of Object.entries(option.dimensionEffect)) {
      if (dim in dimensions) {
        dimensions[dim] = Math.min(100, Math.max(0, dimensions[dim] + delta));
      }
    }
  }

  return dimensions;
}
