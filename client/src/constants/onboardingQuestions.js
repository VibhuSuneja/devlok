// client/src/constants/onboardingQuestions.js
// Mirror of server/constants/onboardingQuestions.js — keep in sync

export const ONBOARDING_QUESTIONS = [
  {
    id: "Q1",
    text: "When something goes wrong in your life, what do you find yourself doing first?",
    options: [
      { id: "Q1A", text: "Analyzing what I did wrong" },
      { id: "Q1B", text: "Feeling it deeply before doing anything" },
      { id: "Q1C", text: "Taking action to fix it immediately" },
      { id: "Q1D", text: "Wondering if this was meant to happen" }
    ]
  },
  {
    id: "Q2",
    text: "What's the one thing you're most tired of explaining to people about yourself?",
    options: [
      { id: "Q2A", text: "That I'm more capable than I look" },
      { id: "Q2B", text: "That I care too much — it's not a weakness" },
      { id: "Q2C", text: "That I need space to think before I act" },
      { id: "Q2D", text: "That I'm not confused — I'm choosing deliberately" }
    ]
  },
  {
    id: "Q3",
    text: "In a group, you're most likely the one who:",
    options: [
      { id: "Q3A", text: "Quietly does the most work" },
      { id: "Q3B", text: "Asks the uncomfortable question no one else will" },
      { id: "Q3C", text: "Holds the emotional center together" },
      { id: "Q3D", text: "Pushes everyone toward a decision" }
    ]
  },
  {
    id: "Q4",
    text: "When you're at your lowest, what do you find yourself craving?",
    options: [
      { id: "Q4A", text: "Someone who just gets it without me explaining" },
      { id: "Q4B", text: "A clear direction — tell me what to do" },
      { id: "Q4C", text: "Solitude to figure it out on my own" },
      { id: "Q4D", text: "Evidence that this struggle means something" }
    ]
  },
  {
    id: "Q5",
    text: "Finish this: The version of me I'm most afraid of becoming is...",
    options: [
      { id: "Q5A", text: "Someone who stopped asking why" },
      { id: "Q5B", text: "Someone who gave up too early" },
      { id: "Q5C", text: "Someone who became cold to protect themselves" },
      { id: "Q5D", text: "Someone who chose the wrong life to please others" }
    ]
  }
];
