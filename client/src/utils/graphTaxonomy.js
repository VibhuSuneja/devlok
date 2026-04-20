export const NODE_COLORS = {
  deva: '#d4973a',
  devi: '#c45c8a',
  hero: '#5c8ac4',
  asura: '#c45c5c',
  sage: '#5cb88a',
  celestial: '#9a6ed4',
  avatar: '#ffab00',
  darshana: '#a0c4dc',
  concept: '#7fb8b2',
  text: '#d0b06f',
};

export const ESSENCE_TYPES = ['all', 'deva', 'devi', 'hero', 'asura', 'sage', 'celestial', 'avatar'];
export const KNOWLEDGE_TYPES = ['darshana', 'concept', 'text'];
export const LINK_TYPES = ['all', 'family', 'divine', 'conflict', 'guru', 'alliance', 'manifestation', 'darshana', 'conceptual', 'textual'];

export function getNodeColor(type) {
  return NODE_COLORS[type] || '#fff';
}
