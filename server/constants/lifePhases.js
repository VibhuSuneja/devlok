// server/constants/lifePhases.js
// Source of truth for all 8 life phases — DO NOT store definitions in DB

export const LIFE_PHASES = {
  IDENTITY_CRISIS: {
    key: "IDENTITY_CRISIS",
    label: "The Crossroads",
    description: "Questioning who you are and what you stand for",
    mythMirror: "Arjuna at Kurukshetra — capable, but paralyzed by the weight of choices",
    icon: "⚔️",
    color: "#6C63FF"
  },
  HEARTBREAK_LOSS: {
    key: "HEARTBREAK_LOSS",
    label: "The Exile",
    description: "Processing grief, loss, or heartbreak",
    mythMirror: "Ram in Vanvas — walking away from everything you loved",
    icon: "🌙",
    color: "#4A90D9"
  },
  BURNOUT: {
    key: "BURNOUT",
    label: "The Forgetting",
    description: "Exhausted, empty, running on nothing",
    mythMirror: "Hanuman forgetting his own powers — strength exists, but feels unreachable",
    icon: "🔥",
    color: "#E8704A"
  },
  CAREER_CONFUSION: {
    key: "CAREER_CONFUSION",
    label: "The Dharma War",
    description: "Torn between paths, unsure of your true calling",
    mythMirror: "Karna's conflict — gifted beyond measure, but on the wrong battlefield",
    icon: "🏹",
    color: "#F5A623"
  },
  NEW_BEGINNING: {
    key: "NEW_BEGINNING",
    label: "The Chakravyuha",
    description: "Stepping into something big, exciting but unknown",
    mythMirror: "Abhimanyu entering the maze — brave enough to go in, still learning the way out",
    icon: "🌅",
    color: "#7ED321"
  },
  FEELING_UNSEEN: {
    key: "FEELING_UNSEEN",
    label: "The Silent Guru",
    description: "Your effort goes unrecognized. You feel invisible",
    mythMirror: "Eklavya — devoted, disciplined, but denied the stage he deserved",
    icon: "🌿",
    color: "#50E3C2"
  },
  SEEKING_PURPOSE: {
    key: "SEEKING_PURPOSE",
    label: "The Question",
    description: "Searching for the deeper meaning behind everything",
    mythMirror: "Nachiketa facing Yama — bold enough to ask what others are afraid to",
    icon: "🪔",
    color: "#BD10E0"
  },
  TOXIC_PATTERN: {
    key: "TOXIC_PATTERN",
    label: "The Fire",
    description: "Setting boundaries, breaking cycles, reclaiming self",
    mythMirror: "Draupadi's fire — tested beyond reason, but not broken",
    icon: "💎",
    color: "#D0021B"
  }
};

export const LIFE_PHASE_KEYS = Object.keys(LIFE_PHASES);
