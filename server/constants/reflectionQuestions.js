// server/constants/reflectionQuestions.js
// Daily reflection question bank — minimum 40 questions (5 per phase × 8 phases)
// Questions are served based on user's active life phase, cycling without repeat

export const REFLECTION_QUESTIONS = [

  // ─── IDENTITY_CRISIS (5 questions) ───────────────────────────────────────
  {
    id: "R_IC_001",
    phaseKey: "IDENTITY_CRISIS",
    archetypeRef: "ARJUNA",
    dimensionTarget: "dharmaClarity",
    text: "Arjuna saw his enemies and froze. What did you avoid looking at today?",
    mythContext: "Arjuna's paralysis at Kurukshetra before Krishna's Gita teaching"
  },
  {
    id: "R_IC_002",
    phaseKey: "IDENTITY_CRISIS",
    archetypeRef: "NACHIKETA",
    dimensionTarget: "shadowAwareness",
    text: "Nachiketa asked Yama the one question everyone else was afraid to ask. What question are you avoiding?",
    mythContext: "Nachiketa's persistence in seeking truth from the god of death"
  },
  {
    id: "R_IC_003",
    phaseKey: "IDENTITY_CRISIS",
    archetypeRef: "RAM",
    dimensionTarget: "emotionalDepth",
    text: "Ram walked into exile without knowing when — or if — he would return. What part of your old self are you being asked to leave behind?",
    mythContext: "Ram accepting the fourteen-year exile ordered by Kaikeyi"
  },
  {
    id: "R_IC_004",
    phaseKey: "IDENTITY_CRISIS",
    archetypeRef: "ARJUNA",
    dimensionTarget: "actionOrientation",
    text: "Krishna told Arjuna: your only right is to action, never to the fruits of action. What action have you been postponing because the outcome isn't guaranteed?",
    mythContext: "The Bhagavad Gita's teaching on nishkama karma — desireless action"
  },
  {
    id: "R_IC_005",
    phaseKey: "IDENTITY_CRISIS",
    archetypeRef: "NACHIKETA",
    dimensionTarget: "relationshipPattern",
    text: "Nachiketa's father sent him away in a moment of anger. How has someone you trusted recently shown you who they truly are?",
    mythContext: "Nachiketa's father rashly giving his son to death (Yama)"
  },

  // ─── HEARTBREAK_LOSS (5 questions) ───────────────────────────────────────
  {
    id: "R_HL_001",
    phaseKey: "HEARTBREAK_LOSS",
    archetypeRef: "RAM",
    dimensionTarget: "emotionalDepth",
    text: "Ram chose to walk into the forest with dignity, not bitterness. What would walking away with dignity look like for you right now?",
    mythContext: "Ram accepting exile without resentment"
  },
  {
    id: "R_HL_002",
    phaseKey: "HEARTBREAK_LOSS",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "shadowAwareness",
    text: "Draupadi was publicly humiliated and still did not break. What part of you remained intact through your worst moment?",
    mythContext: "Draupadi's vastraharana in the Kaurava court"
  },
  {
    id: "R_HL_003",
    phaseKey: "HEARTBREAK_LOSS",
    archetypeRef: "RAM",
    dimensionTarget: "dharmaClarity",
    text: "Ram never stopped being Ram even in exile. What part of your core identity has grief not been able to touch?",
    mythContext: "Ram maintaining his character and duties throughout the vanvas"
  },
  {
    id: "R_HL_004",
    phaseKey: "HEARTBREAK_LOSS",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "relationshipPattern",
    text: "Draupadi had five husbands and still felt alone in her most critical moment. Where in your life do you have people but still feel unseen?",
    mythContext: "Draupadi calling out when none of the Pandavas defended her"
  },
  {
    id: "R_HL_005",
    phaseKey: "HEARTBREAK_LOSS",
    archetypeRef: "RAM",
    dimensionTarget: "actionOrientation",
    text: "Ram did not stay in grief — he built an army and crossed an ocean. What is the first real step you could take today, even a small one?",
    mythContext: "Ram organizing the Vanara Sena to rescue Sita from Lanka"
  },

  // ─── BURNOUT (5 questions) ────────────────────────────────────────────────
  {
    id: "R_BO_001",
    phaseKey: "BURNOUT",
    archetypeRef: "HANUMAN",
    dimensionTarget: "actionOrientation",
    text: "Hanuman forgot he could fly until someone reminded him. Who reminded you of your strength recently?",
    mythContext: "Jamwant reminding Hanuman of his powers before the Lanka leap"
  },
  {
    id: "R_BO_002",
    phaseKey: "BURNOUT",
    archetypeRef: "HANUMAN",
    dimensionTarget: "dharmaClarity",
    text: "Hanuman crossed an ocean not for himself, but for Ram. What cause — beyond yourself — still makes you want to get up?",
    mythContext: "Hanuman's complete devotion to Ram as his source of strength"
  },
  {
    id: "R_BO_003",
    phaseKey: "BURNOUT",
    archetypeRef: "EKLAVYA",
    dimensionTarget: "shadowAwareness",
    text: "Eklavya trained alone in the forest long before anyone cared. What have you been building quietly that you've stopped acknowledging?",
    mythContext: "Eklavya practicing archery in isolation using Drona's clay idol"
  },
  {
    id: "R_BO_004",
    phaseKey: "BURNOUT",
    archetypeRef: "HANUMAN",
    dimensionTarget: "emotionalDepth",
    text: "Even Hanuman needed to be reminded. What if the forgetting is not failure — what if it is just the rest before the leap?",
    mythContext: "Hanuman lying dormant before Jamwant's words awakened his power"
  },
  {
    id: "R_BO_005",
    phaseKey: "BURNOUT",
    archetypeRef: "HANUMAN",
    dimensionTarget: "relationshipPattern",
    text: "Hanuman's strength was inseparable from devotion — he was powered by love, not ego. What relationship or purpose used to power you that you've disconnected from?",
    mythContext: "Hanuman's shakti flowing from his unconditional love for Ram"
  },

  // ─── CAREER_CONFUSION (5 questions) ──────────────────────────────────────
  {
    id: "R_CC_001",
    phaseKey: "CAREER_CONFUSION",
    archetypeRef: "KARNA",
    dimensionTarget: "dharmaClarity",
    text: "Karna knew the truth but stayed loyal to the wrong side. Where are you doing the same?",
    mythContext: "Karna's awareness of Duryodhana's wrongdoing yet continued loyalty"
  },
  {
    id: "R_CC_002",
    phaseKey: "CAREER_CONFUSION",
    archetypeRef: "KARNA",
    dimensionTarget: "shadowAwareness",
    text: "Karna was denied by Drona for his birth — not his skill. What gatekeeping are you letting stop you that has nothing to do with your actual ability?",
    mythContext: "Drona refusing to teach Karna because of his low-caste origin"
  },
  {
    id: "R_CC_003",
    phaseKey: "CAREER_CONFUSION",
    archetypeRef: "ABHIMANYU",
    dimensionTarget: "actionOrientation",
    text: "Abhimanyu entered the Chakravyuha knowing he only knew half the way. Are you waiting for full certainty before you begin?",
    mythContext: "Abhimanyu entering the spiral formation with partial knowledge"
  },
  {
    id: "R_CC_004",
    phaseKey: "CAREER_CONFUSION",
    archetypeRef: "KARNA",
    dimensionTarget: "emotionalDepth",
    text: "Karna's greatest gift and greatest wound were the same thing — his loyalty. What strength of yours is currently hurting you?",
    mythContext: "Karna's unwavering loyalty being both his greatest virtue and fatal flaw"
  },
  {
    id: "R_CC_005",
    phaseKey: "CAREER_CONFUSION",
    archetypeRef: "KARNA",
    dimensionTarget: "relationshipPattern",
    text: "Karna gave away everything — his kavach, his kundal, even his life — to those who asked. Who are you giving too much to right now?",
    mythContext: "Karna's legendary charity, including giving away his divine armour"
  },

  // ─── NEW_BEGINNING (5 questions) ─────────────────────────────────────────
  {
    id: "R_NB_001",
    phaseKey: "NEW_BEGINNING",
    archetypeRef: "ABHIMANYU",
    dimensionTarget: "shadowAwareness",
    text: "Abhimanyu entered the Chakravyuha knowing he only knew half the way. What are you entering without complete knowledge — and going in anyway?",
    mythContext: "Abhimanyu's partial knowledge of the spiral formation"
  },
  {
    id: "R_NB_002",
    phaseKey: "NEW_BEGINNING",
    archetypeRef: "ABHIMANYU",
    dimensionTarget: "actionOrientation",
    text: "Abhimanyu did not wait for Arjuna to teach him the full formation. What would you do today if you stopped waiting to be completely ready?",
    mythContext: "Abhimanyu's fearless self-reliance entering the Chakravyuha alone"
  },
  {
    id: "R_NB_003",
    phaseKey: "NEW_BEGINNING",
    archetypeRef: "ABHIMANYU",
    dimensionTarget: "dharmaClarity",
    text: "Abhimanyu's courage was real — but he needed a way out he didn't have. What skills or knowledge are you missing that you need to seek right now?",
    mythContext: "Abhimanyu knowing how to enter but not exit the Chakravyuha"
  },
  {
    id: "R_NB_004",
    phaseKey: "NEW_BEGINNING",
    archetypeRef: "HANUMAN",
    dimensionTarget: "emotionalDepth",
    text: "Before Hanuman leapt to Lanka, he sat. He centered himself. What would it look like to pause and center before your next big leap?",
    mythContext: "Hanuman meditating and gathering himself before the massive leap across the ocean"
  },
  {
    id: "R_NB_005",
    phaseKey: "NEW_BEGINNING",
    archetypeRef: "ABHIMANYU",
    dimensionTarget: "relationshipPattern",
    text: "Abhimanyu entered because he wanted to prove himself — partly for his father's pride. Who are you actually doing this new thing for?",
    mythContext: "Abhimanyu's complex motivations around proving himself worthy of the Pandava name"
  },

  // ─── FEELING_UNSEEN (5 questions) ────────────────────────────────────────
  {
    id: "R_FU_001",
    phaseKey: "FEELING_UNSEEN",
    archetypeRef: "EKLAVYA",
    dimensionTarget: "actionOrientation",
    text: "Eklavya built mastery without a guru, without applause. What are you building that no one is watching yet?",
    mythContext: "Eklavya's self-taught archery in the forest"
  },
  {
    id: "R_FU_002",
    phaseKey: "FEELING_UNSEEN",
    archetypeRef: "EKLAVYA",
    dimensionTarget: "dharmaClarity",
    text: "Eklavya's devotion was so complete he needed no external validation to continue. What would you keep doing even if no one ever acknowledged it?",
    mythContext: "Eklavya worshipping Drona's idol and practicing in complete solitude"
  },
  {
    id: "R_FU_003",
    phaseKey: "FEELING_UNSEEN",
    archetypeRef: "KARNA",
    dimensionTarget: "shadowAwareness",
    text: "Karna performed at the archery tournament and was disqualified for being a sutaputra — not for his skill. What system or person has been dismissing you by category, not by capability?",
    mythContext: "Karna being rejected from competing in the Kaurava tournament due to his caste"
  },
  {
    id: "R_FU_004",
    phaseKey: "FEELING_UNSEEN",
    archetypeRef: "EKLAVYA",
    dimensionTarget: "emotionalDepth",
    text: "Eklavya gave Drona his thumb — the greatest price anyone paid for not being chosen. What have you given up for belonging that cost you more than you realized?",
    mythContext: "Eklavya's grunadhakshina — cutting off his right thumb for Drona"
  },
  {
    id: "R_FU_005",
    phaseKey: "FEELING_UNSEEN",
    archetypeRef: "HANUMAN",
    dimensionTarget: "relationshipPattern",
    text: "Hanuman's greatness was invisible to others until the moment it wasn't. Who in your life is still waiting to see you — and do you actually need them to?",
    mythContext: "Hanuman's power being unknown until his massive leap across the ocean"
  },

  // ─── SEEKING_PURPOSE (5 questions) ───────────────────────────────────────
  {
    id: "R_SP_001",
    phaseKey: "SEEKING_PURPOSE",
    archetypeRef: "NACHIKETA",
    dimensionTarget: "dharmaClarity",
    text: "Nachiketa refused gifts of wealth and pleasure — he wanted only truth. What are you refusing right now in search of something real?",
    mythContext: "Nachiketa rejecting Yama's offered riches to seek knowledge of death"
  },
  {
    id: "R_SP_002",
    phaseKey: "SEEKING_PURPOSE",
    archetypeRef: "NACHIKETA",
    dimensionTarget: "shadowAwareness",
    text: "Nachiketa sat at Yama's door for three days without food or water, waiting. What are you willing to wait for without compromise?",
    mythContext: "Nachiketa's three-day fast at Yama's door demanding his promised boon"
  },
  {
    id: "R_SP_003",
    phaseKey: "SEEKING_PURPOSE",
    archetypeRef: "NACHIKETA",
    dimensionTarget: "emotionalDepth",
    text: "Yama told Nachiketa: even the gods are not certain about death. What uncertainty are you feeling most afraid to sit with right now?",
    mythContext: "Yama confessing that even devas debate the nature of death and the soul"
  },
  {
    id: "R_SP_004",
    phaseKey: "SEEKING_PURPOSE",
    archetypeRef: "ARJUNA",
    dimensionTarget: "actionOrientation",
    text: "Arjuna had every skill — but needed purpose to use it. What is one thing you are genuinely good at that currently has no meaningful outlet?",
    mythContext: "Arjuna's skills lying dormant without a worthy cause before the Mahabharata war"
  },
  {
    id: "R_SP_005",
    phaseKey: "SEEKING_PURPOSE",
    archetypeRef: "NACHIKETA",
    dimensionTarget: "relationshipPattern",
    text: "Nachiketa's father sent him away — and it led him to the greatest teacher. What rejection or loss has accidentally sent you toward something better?",
    mythContext: "Nachiketa's father's anger triggering the boy's journey to Yama's realm"
  },

  // ─── TOXIC_PATTERN (5 questions) ─────────────────────────────────────────
  {
    id: "R_TP_001",
    phaseKey: "TOXIC_PATTERN",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "relationshipPattern",
    text: "Draupadi was not rescued by Krishna — she called out, and then acted. What are you still waiting for someone else to fix?",
    mythContext: "Draupadi's vastraharana and her eventual agency in her own story"
  },
  {
    id: "R_TP_002",
    phaseKey: "TOXIC_PATTERN",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "shadowAwareness",
    text: "Draupadi never forgot what was done to her — and she never pretended it was fine. What truth about a person or situation are you downplaying to keep the peace?",
    mythContext: "Draupadi's oath to leave her hair unbound until she could wash it with Dushasana's blood"
  },
  {
    id: "R_TP_003",
    phaseKey: "TOXIC_PATTERN",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "dharmaClarity",
    text: "Draupadi questioned the Pandavas directly: 'Who had the right to stake me?' She did not accept unjust dharma quietly. What rule or norm are you following that you've stopped questioning?",
    mythContext: "Draupadi's powerful questioning of the dice game's legitimacy in the hall"
  },
  {
    id: "R_TP_004",
    phaseKey: "TOXIC_PATTERN",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "emotionalDepth",
    text: "Draupadi carried the weight of five husbands' failures and still rose. What weight are you carrying right now that was never yours to carry?",
    mythContext: "Draupadi supporting the Pandavas through their exile and shame"
  },
  {
    id: "R_TP_005",
    phaseKey: "TOXIC_PATTERN",
    archetypeRef: "DRAUPADI",
    dimensionTarget: "actionOrientation",
    text: "After the war, Draupadi did not rebuild out of vengeance — she rebuilt. What would rebuilding look like for you, right now, without bitterness?",
    mythContext: "Draupadi's life after Kurukshetra — choosing continuation over collapse"
  }

];

/**
 * Get a question for the user's active phase that they haven't answered yet.
 * Rotates through all phase questions before repeating.
 * @param {String} phaseKey - Active life phase key
 * @param {String[]} answeredIds - Array of question IDs already answered
 * @returns {Object|null} - Question object or null if none available
 */
export function getNextQuestion(phaseKey, answeredIds = []) {
  const phaseQuestions = REFLECTION_QUESTIONS.filter(q => q.phaseKey === phaseKey);
  const unanswered = phaseQuestions.filter(q => !answeredIds.includes(q.id));
  // If all answered, reset cycle — never repeat within the same round
  const pool = unanswered.length > 0 ? unanswered : phaseQuestions;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || null;
}
