// client/src/constants/archetypes.js
// Mirror of server/constants/archetypes.js — keep in sync manually

export const ARCHETYPES = {
  ARJUNA: {
    key: "ARJUNA",
    name: "Arjuna",
    tagline: "Gifted but paralyzed. The warrior who needed permission to act.",
    coreWound: "Afraid of the consequences of your own power",
    emergingStrength: "Learning that action itself is the answer",
    associatedPhases: ["IDENTITY_CRISIS", "CAREER_CONFUSION"],
    dimensionProfile: {
      dharmaClarity:       [20, 50],
      emotionalDepth:      [60, 90],
      shadowAwareness:     [30, 60],
      actionOrientation:   [20, 50],
      relationshipPattern: [50, 80]
    }
  },
  KARNA: {
    key: "KARNA",
    name: "Karna",
    tagline: "Capable beyond measure, loyal beyond reason.",
    coreWound: "Seeking validation from those who will never give it",
    emergingStrength: "Recognizing your own legitimacy without needing their approval",
    associatedPhases: ["CAREER_CONFUSION", "FEELING_UNSEEN"],
    dimensionProfile: {
      dharmaClarity:       [30, 60],
      emotionalDepth:      [70, 95],
      shadowAwareness:     [20, 50],
      actionOrientation:   [60, 85],
      relationshipPattern: [40, 70]
    }
  },
  DRAUPADI: {
    key: "DRAUPADI",
    name: "Draupadi",
    tagline: "Tested by fire, never consumed by it.",
    coreWound: "Absorbing others' chaos as your responsibility",
    emergingStrength: "Understanding that your dignity is non-negotiable",
    associatedPhases: ["TOXIC_PATTERN", "HEARTBREAK_LOSS"],
    dimensionProfile: {
      dharmaClarity:       [50, 80],
      emotionalDepth:      [80, 100],
      shadowAwareness:     [50, 80],
      actionOrientation:   [40, 70],
      relationshipPattern: [60, 90]
    }
  },
  HANUMAN: {
    key: "HANUMAN",
    name: "Hanuman",
    tagline: "The one who forgot his own strength.",
    coreWound: "Dismissing yourself before others get the chance to",
    emergingStrength: "Remembering that your capacity is limitless when in service of something real",
    associatedPhases: ["BURNOUT", "FEELING_UNSEEN"],
    dimensionProfile: {
      dharmaClarity:       [60, 90],
      emotionalDepth:      [50, 75],
      shadowAwareness:     [30, 60],
      actionOrientation:   [70, 95],
      relationshipPattern: [70, 90]
    }
  },
  RAM: {
    key: "RAM",
    name: "Ram",
    tagline: "The one who chose dharma when it cost everything.",
    coreWound: "Carrying everyone else's expectations as your own truth",
    emergingStrength: "Learning that your dharma is yours alone to define",
    associatedPhases: ["HEARTBREAK_LOSS", "IDENTITY_CRISIS"],
    dimensionProfile: {
      dharmaClarity:       [70, 95],
      emotionalDepth:      [50, 75],
      shadowAwareness:     [40, 65],
      actionOrientation:   [60, 85],
      relationshipPattern: [60, 85]
    }
  },
  EKLAVYA: {
    key: "EKLAVYA",
    name: "Eklavya",
    tagline: "Devoted to mastery without needing an audience.",
    coreWound: "Building in silence while others perform on stage",
    emergingStrength: "Understanding that the work itself is the teacher",
    associatedPhases: ["FEELING_UNSEEN", "SEEKING_PURPOSE"],
    dimensionProfile: {
      dharmaClarity:       [60, 85],
      emotionalDepth:      [40, 65],
      shadowAwareness:     [50, 75],
      actionOrientation:   [75, 95],
      relationshipPattern: [30, 55]
    }
  },
  NACHIKETA: {
    key: "NACHIKETA",
    name: "Nachiketa",
    tagline: "The one brave enough to ask the question everyone fears.",
    coreWound: "Drowning in questions with no one willing to go deep enough",
    emergingStrength: "The question itself is the path — keep asking",
    associatedPhases: ["SEEKING_PURPOSE", "IDENTITY_CRISIS"],
    dimensionProfile: {
      dharmaClarity:       [50, 80],
      emotionalDepth:      [65, 90],
      shadowAwareness:     [70, 95],
      actionOrientation:   [30, 55],
      relationshipPattern: [40, 65]
    }
  },
  ABHIMANYU: {
    key: "ABHIMANYU",
    name: "Abhimanyu",
    tagline: "Fearless enough to enter. Still learning how to exit.",
    coreWound: "Rushing into battles without complete knowledge",
    emergingStrength: "Courage is valid — wisdom will catch up",
    associatedPhases: ["NEW_BEGINNING", "CAREER_CONFUSION"],
    dimensionProfile: {
      dharmaClarity:       [40, 65],
      emotionalDepth:      [50, 75],
      shadowAwareness:     [30, 55],
      actionOrientation:   [80, 100],
      relationshipPattern: [50, 75]
    }
  }
};

export const ARCHETYPE_KEYS = Object.keys(ARCHETYPES);
export const ARCHETYPE_LIST = Object.values(ARCHETYPES);
