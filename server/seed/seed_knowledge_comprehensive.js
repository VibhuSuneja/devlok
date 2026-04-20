import mongoose from 'mongoose';
import 'dotenv/config';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';

const characters = [
  {
    id: 'krishna',
    label: 'Lord Krishna',
    sanskrit: 'कृष्ण',
    type: 'avatar',
    filter: 'mahabharata',
    yuga: 'dvapara',
    epithets: ['Vasudeva', 'Govinda', 'Yogeshwara'],
    desc: 'The eighth avatar of Vishnu, central figure of the Mahabharata, and speaker of the Bhagavad Gita.',
    source: 'Mahabharata, Puranas',
    premium: true
  },
  {
    id: 'karna',
    label: 'Karna',
    sanskrit: 'कर्ण',
    type: 'hero',
    filter: 'mahabharata',
    yuga: 'dvapara',
    epithets: ['Radheya', 'Angaraja', 'Danaveera'],
    desc: 'The tragic hero of Mahabharata, son of Surya and Kunti, known for his unmatched generosity and loyalty.',
    source: 'Mahabharata',
    premium: true
  },
  {
    id: 'arjuna',
    label: 'Arjuna',
    sanskrit: 'अर्जुन',
    type: 'hero',
    filter: 'mahabharata',
    yuga: 'dvapara',
    epithets: ['Partha', 'Dhananjaya', 'Gudakesha'],
    desc: 'The master archer among the Pandavas, recipient of the Gita from Krishna.',
    source: 'Mahabharata',
    premium: true
  },
  {
    id: 'rama',
    label: 'Lord Rama',
    sanskrit: 'राम',
    type: 'avatar',
    filter: 'ramayana',
    yuga: 'treta',
    epithets: ['Maryada Purushottama', 'Raghava'],
    desc: 'The seventh avatar of Vishnu, the ideal king and embodiment of Dharma.',
    source: 'Ramayana',
    premium: true
  },
  {
    id: 'hanuman',
    label: 'Hanuman',
    sanskrit: 'हनुमान्',
    type: 'deva',
    filter: 'ramayana',
    yuga: 'treta',
    epithets: ['Anjaneya', 'Pavanaputra', 'Bajrangbali'],
    desc: 'The vanara devotee of Rama, symbol of strength and pure devotion (Bhakti).',
    source: 'Ramayana',
    premium: true
  },
  {
    id: 'vyasa',
    label: 'Veda Vyasa',
    sanskrit: 'व्यास',
    type: 'sage',
    filter: 'philosophical',
    yuga: 'eternal',
    epithets: ['Badarayana', 'Krishna Dvaipayana'],
    desc: 'The legendary sage who classified the Vedas and authored the Mahabharata.',
    source: 'Mahabharata, Puranas'
  },
  {
    id: 'nachiketa',
    label: 'Nachiketa',
    sanskrit: 'नचिकेता',
    type: 'hero',
    filter: 'philosophical',
    yuga: 'eternal',
    desc: 'The young boy who journeyed to the abode of Yama to ask about the nature of Death and the Soul.',
    source: 'Katha Upanishad'
  }
];

const concepts = [
  {
    id: 'dharma',
    label: 'Dharma',
    sanskrit: 'धर्म',
    type: 'concept',
    filter: 'conceptual',
    yuga: 'eternal',
    desc: 'The cosmic law underlying right behavior and social order; righteousness and duty.',
    entityKind: 'concept'
  },
  {
    id: 'atman',
    label: 'Atman',
    sanskrit: 'आत्मन्',
    type: 'concept',
    filter: 'conceptual',
    yuga: 'eternal',
    desc: 'The eternal, true self that is distinct from the physical body and ego; the soul.',
    entityKind: 'concept'
  },
  {
    id: 'karma',
    label: 'Karma',
    sanskrit: 'कर्म',
    type: 'concept',
    filter: 'conceptual',
    yuga: 'eternal',
    desc: 'The law of cause and effect; every action has a corresponding consequence across births.',
    entityKind: 'concept'
  },
  {
    id: 'moksha',
    label: 'Moksha',
    sanskrit: 'मोक्ष',
    type: 'concept',
    filter: 'conceptual',
    yuga: 'eternal',
    desc: 'Liberation from the cycle of birth and death (Samsara).',
    entityKind: 'concept'
  },
  {
    id: 'bhakti',
    label: 'Bhakti',
    sanskrit: 'भक्ति',
    type: 'concept',
    filter: 'conceptual',
    yuga: 'eternal',
    desc: 'Devotional service and love for the Divine.',
    entityKind: 'concept'
  },
  {
    id: 'rajadharma',
    label: 'Rajadharma',
    sanskrit: 'राजधर्म',
    type: 'concept',
    filter: 'conceptual',
    yuga: 'eternal',
    desc: 'The specific duties and ethics of a ruler or king.',
    entityKind: 'concept'
  }
];

const relationships = [
  { source: 'krishna', target: 'arjuna', label: 'guides / teaches', type: 'guru' },
  { source: 'krishna', target: 'karma', label: 'explains', type: 'conceptual' },
  { source: 'krishna', target: 'atman', label: 'reveals', type: 'conceptual' },
  { source: 'rama', target: 'dharma', label: 'embodies', type: 'conceptual' },
  { source: 'rama', target: 'rajadharma', label: 'exemplifies', type: 'conceptual' },
  { source: 'hanuman', target: 'rama', label: 'devotee of', type: 'divine' },
  { source: 'hanuman', target: 'bhakti', label: 'paragon of', type: 'conceptual' },
  { source: 'vyasa', target: 'dharma', label: 'chronicler of', type: 'conceptual' },
  { source: 'nachiketa', target: 'atman', label: 'seeker of', type: 'conceptual' },
  { source: 'karna', target: 'dharma', label: 'tragic struggle with', type: 'conflict' }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing');
    
    await mongoose.connect(mongoUri);
    console.log('Connected to Shunya DB...');

    // Upsert Characters & Concepts
    const allNodes = [...characters, ...concepts];
    for (const node of allNodes) {
      await Character.findOneAndUpdate({ id: node.id }, node, { upsert: true, new: true });
      console.log(`Synced node: ${node.id}`);
    }

    // Upsert Relationships
    for (const rel of relationships) {
      await Relationship.findOneAndUpdate(
        { source: rel.source, target: rel.target, type: rel.type },
        rel,
        { upsert: true, new: true }
      );
      console.log(`Synced relationship: ${rel.source} -> ${rel.target}`);
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
