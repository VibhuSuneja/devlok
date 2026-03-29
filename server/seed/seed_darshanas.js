// server/seed/seed_darshanas.js
// ─────────────────────────────────────────────────────────────────────────────
// ADDITIVE seed — does NOT wipe existing data.
// Safely upserts 8 Darshana philosophical school nodes, 6 founding sage nodes,
// and their relationships into the existing Devlok graph.
//
// Run: node seed/seed_darshanas.js
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import mongoose from 'mongoose';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';

// ── 6 New Sage Nodes (Founders & Acharyas) ─────────────────────────────────
const NEW_SAGES = [
  {
    id: 'adi_shankara',
    label: 'Adi Shankaracharya',
    type: 'sage',
    size: 20,
    filter: 'philosophical',
    yuga: 'kali',
    sanskrit: 'आदि शंकराचार्य',
    epithets: ['Jagadguru', 'Propagator of Advaita', 'Bhashyakara'],
    desc: 'Born in Kaladi, Kerala around 788 CE, Adi Shankaracharya reformed Vedic thought at a time when Buddhism had displaced it across India. He toured the entire subcontinent debating opponents in philosophical discourse and was never defeated. He established four mathas at the four cardinal points of India — Sringeri, Puri, Dwaraka, and Joshimath — creating the institutional spine of Hindu intellectual tradition. He composed authoritative commentaries on the Brahma Sutras, Bhagavad Gita, and ten major Upanishads that still define how Vedanta is understood. He is widely regarded as the greatest philosopher India produced and one of the most formidable intellects in all of human history. He died at the age of 32.',
    source: 'Shankaradigvijaya · Brahma Sutra Bhāshya · Vivekachudamani',
  },
  {
    id: 'ramanuja',
    label: 'Ramanujacharya',
    type: 'sage',
    size: 18,
    filter: 'philosophical',
    yuga: 'kali',
    sanskrit: 'रामानुजाचार्य',
    epithets: ['Sri Bhashyakara', 'Embar', 'Yatiraja'],
    desc: 'Born in Sriperumbudur, Tamil Nadu around 1017 CE, Ramanujacharya built the systematic philosophical response to Shankaracharya\'s Advaita within the Vaishnava tradition. He argued that Brahman is not an impersonal absolute but a personal God — Vishnu — and that individual souls and the material world are real, constituting the "body" of God. His Sri Bhashya commentary on the Brahma Sutras is the definitive statement of Vishishtadvaita. He lived to 120, reorganized the Srivaishnava monastic tradition, and established the philosophical framework that would later inspire Bhakti movements across India.',
    source: 'Sri Bhāshya · Vedārthasangraha · Gita Bhāshya',
  },
  {
    id: 'madhva',
    label: 'Madhvacharya',
    type: 'sage',
    size: 18,
    filter: 'philosophical',
    yuga: 'kali',
    sanskrit: 'मध्वाचार्य',
    epithets: ['Anandatirtha', 'Purnaprajna', 'Founder of Dvaita'],
    desc: 'Born near Udupi, Karnataka around 1199 CE, Madhvacharya founded Dvaita Vedanta — the most philosophically radical departure from Shankaracharya. Against both Advaita and Vishishtadvaita, he insisted on five fundamental and eternal differences: between God and soul, God and matter, one soul and another, souls and matter, and distinct material objects. He established eight mathas in Udupi centred on the Krishna temple he founded, and composed 37 works that became the basis of Haridasa devotional poetry. His sharp insistence on God\'s absolute supremacy and the soul\'s eternal dependence made him the most theistically committed of the three Vedanta acharyas.',
    source: 'Brahma Sutra Bhāshya · Anuvyākhyāna · Mahābhārata Tātparya Nirnaya',
  },
  {
    id: 'patanjali',
    label: 'Patanjali',
    type: 'sage',
    size: 18,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'पतञ्जलि',
    epithets: ['Compiler of Yoga Sutras', 'Yogashastra Muni'],
    desc: 'The sage who compiled the 196 Yoga Sutras — the most precise and technical treatise on the mechanics of consciousness in human literature. Whether Patanjali was one person or a scholarly tradition remains debated, but the system he produced defines Yoga as a philosophical school entirely distinct from its modern popular use. He is also attributed with a major commentary on Panini\'s Sanskrit grammar. His definition of yoga — citta-vrtti-nirodha, the stilling of the fluctuations of mind — is still the most rigorous formulation of meditative practice and its goal in any tradition.',
    source: 'Yoga Sūtras of Patañjali · Mahābhāshya',
  },
  {
    id: 'kapila',
    label: 'Kapila',
    type: 'sage',
    size: 17,
    filter: 'philosophical',
    yuga: 'satya',
    sanskrit: 'कपिल',
    epithets: ['Founder of Samkhya', 'Avatar of Vishnu'],
    desc: 'The sage attributed with founding Samkhya — the oldest of the six classical darshanas. Born of Kardama Rishi and Devahuti, Kapila is considered a partial manifestation of Vishnu in the Bhagavata Purana, where his discourse to his mother Devahuti on cosmic evolution, soul, and liberation forms one of the text\'s philosophical summits. His Samkhyakarika — preserved in Ishvarakrishna\'s later text — identifies Purusha (pure consciousness) and Prakriti (primordial matter) as the two eternal principles whose interaction produces all creation. Its 25-tattva framework is the conceptual skeleton that much of later Indian philosophy, including the Gita, presupposes.',
    source: 'Bhāgavata Purāṇa · Sāmkhya Kārikā · Mahābhārata Shanti Parva',
  },
  {
    id: 'kanada',
    label: 'Kanada',
    type: 'sage',
    size: 16,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'कणाद',
    epithets: ['The Atom-Eater', 'Kashyapa', 'Founder of Vaisheshika'],
    desc: 'The sage whose real name was Kashyapa, called Kanada — "the Atom-Eater" — because he subsisted on grain atoms gathered from harvested fields. He founded the Vaisheshika school of natural philosophy, composing the Vaisheshika Sutras which argues that the physical world is composed of invisible, indestructible, eternal paramanus (atoms). His ontological system lists six (later seven) categories — padarthas — through which all of reality can be described: substance, quality, action, universal, particular, inherence, and non-existence. His atomic theory predates Democritus\'s formulation and his systematic ontology anticipates the analytical frameworks of modern scientific philosophy.',
    source: 'Vaisheshika Sūtras · Padārthadharmasangraha',
  },
];

// ── 8 Darshana Nodes (Philosophical Schools) ──────────────────────────────
const DARSHANA_NODES = [
  {
    id: 'advaita',
    label: 'Advaita Vedanta',
    type: 'darshana',
    size: 26,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'अद्वैत वेदान्त',
    epithets: ['Non-Dualism', 'Kevalādvaita', 'Jnana Marga', 'Shankara School'],
    desc: 'The school of pure non-dualism — the most influential philosophical system in Indian intellectual history. Its core teaching: Brahman alone is real; the world as a separate entity is maya (not illusion but misapprehension of what is); and the individual Atman is identical to Brahman. The famous mahavakyas — "Aham Brahmasmi" (I am Brahman), "Tat tvam asi" (That thou art) — are its condensed formulae. Systematized by Adi Shankaracharya in the 8th century CE through commentaries on the Prasthanatrayi (Brahma Sutras, Bhagavad Gita, and 10 principal Upanishads). Moksha is not a future event but the direct recognition that the self was never separate from the infinite.',
    source: 'Brahma Sūtra Bhāshya · Vivekachudamani · Upadesha Sahāsri · Mandukya Kārikā',
  },
  {
    id: 'vishishtadvaita',
    label: 'Vishishtadvaita',
    type: 'darshana',
    size: 22,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'विशिष्टाद्वैत',
    epithets: ['Qualified Non-Dualism', 'Ramanuja School', 'Bhakti Vedanta'],
    desc: 'Qualified non-dualism — the philosophical synthesis that reconciles Advaita with theistic devotion. It agrees that Brahman is the ultimate reality, but insists that individual souls (chit) and matter (achit) are real, not mere appearances — they constitute the "body" of Ishvara (personal God, understood as Vishnu). Liberation is not the disappearance of the self into an impersonal Absolute but the soul\'s entry into the divine presence where it retains its individuality in worship. Bhakti (devotion) is the primary path, giving this school enormous influence on the Bhakti movement traditions of South India.',
    source: 'Sri Bhāshya · Vedārthasangraha · Bhagavad Gita Bhāshya · Divya Prabandham',
  },
  {
    id: 'dvaita',
    label: 'Dvaita Vedanta',
    type: 'darshana',
    size: 22,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'द्वैत वेदान्त',
    epithets: ['Strict Dualism', 'Madhva School', 'Tattva-vada'],
    desc: 'Strict dualism — the most theologically uncompromising of the three Vedanta schools. While Advaita says Atman = Brahman, and Vishishtadvaita says they are related as body and soul, Dvaita insists they are eternally and fundamentally distinct. Madhva proposed five kinds of eternal difference (panchabhedas) that can never be dissolved: God and soul, God and matter, one soul and another, souls and matter, distinct material objects. Liberation is not merger but eternal proximity to Vishnu in devoted service. Madhva also introduced the radical idea of preordained salvation — that some souls are destined for liberation, some for eternal bondage, and some for eternal damnation — a position unique in Vedantic thought.',
    source: 'Brahma Sūtra Bhāshya (Madhva) · Anuvyākhyāna · Mahābhārata Tātparya Nirnaya',
  },
  {
    id: 'samkhya',
    label: 'Sāmkhya',
    type: 'darshana',
    size: 24,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'सांख्य',
    epithets: ['The Oldest Darshana', 'Purusha-Prakriti School', 'Enumeration Philosophy'],
    desc: 'The oldest of the six classical schools — a purely dualistic framework that provides the metaphysical vocabulary most of Indian philosophy, including the Bhagavad Gita, uses without attribution. Its two eternal principles: Purusha (pure consciousness — multiple, passive, witnessing) and Prakriti (primordial matter — one, active, constituted of three qualities: sattva, rajas, tamas). Creation is not divine act but the interaction of consciousness with matter. The 25 tattvas (cosmic principles) — from Prakriti through mahat, ahamkara, the five tanmatras, five gross elements, and eleven sense organs — are its map of cosmic evolution. Its influence on Hindu philosophy is as foundational as Aristotle\'s categories on Western thought.',
    source: 'Sāmkhya Kārikā (Ishvarakrishna) · Bhāgavata Purāṇa III · Mahabharata Shanti Parva',
  },
  {
    id: 'yoga_darshana',
    label: 'Yoga Darśana',
    type: 'darshana',
    size: 24,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'योग दर्शन',
    epithets: ['Ashtanga Yoga', 'Patanjali School', 'Citta-vrtti-nirodha'],
    desc: 'The philosophical systematization of Yoga as a complete school of thought — entirely distinct from modern usage of the word. It accepts the Samkhya metaphysical framework (Purusha and Prakriti) but adds a practical programme for separating pure consciousness from matter. Its goal is defined with surgical precision: citta-vrtti-nirodha — the stilling of all fluctuations of the mind. The eight limbs of Ashtanga Yoga (Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, Samadhi) are its structured path, each more internal than the last, culminating in samadhi — the direct experience of Purusha in its pure state. The Yoga Sutras\' 196 aphorisms remain the most technically precise treatment of consciousness in human literature.',
    source: 'Yoga Sūtras of Patañjali · Yoga Bhāshya (Vyāsabhāshya) · Bhagavad Gīta VI',
  },
  {
    id: 'nyaya',
    label: 'Nyāya',
    type: 'darshana',
    size: 20,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'न्याय',
    epithets: ['Logic School', 'Aksapada Gautama School', 'Pramana Philosophy'],
    desc: 'The classical school of logic and epistemology — India\'s most rigorous inquiry into how knowledge is valid. Founded by Aksapada Gautama, Nyaya developed a sophisticated theory of four pramanas (valid means of knowledge): pratyaksha (direct perception), anumana (inference), upamana (analogy/comparison), and shabda (verbal testimony from reliable sources). It constructed the classical Indian syllogism (five-membered) and built precise methods for philosophical debate. Its epistemological questions — what constitutes valid inference, what makes testimony reliable, how universal propositions are established — are questions Western philosophy would not seriously address until Hume and Kant, two millennia later.',
    source: 'Nyāya Sūtras (Aksapada Gautama) · Nyāya Bhāshya · Navya-Nyāya texts',
  },
  {
    id: 'vaisheshika',
    label: 'Vaiśeṣika',
    type: 'darshana',
    size: 20,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'वैशेषिक',
    epithets: ['Atomic Theory School', 'Kanada School', 'Natural Philosophy'],
    desc: 'India\'s classical school of natural philosophy and the world\'s first systematic atomic theory. Founded by Kanada, Vaisheshika proposes that reality is constituted by eternal, indestructible, indivisible paramanus (atoms) — and that combinations of atoms explain all matter in the universe. Its seven ontological categories (padarthas) — substance, quality, action, universal, particular, inherence, non-existence — provide a framework for systematically describing all of reality. Its atomic theory predates Democritus\'s formulation, and the structural parallels between Kanada\'s paramanus and modern quantum field theory\'s fundamental particles remain a subject of serious philosophical interest. The school later merged with Nyaya.',
    source: 'Vaisheshika Sūtras · Padārthadharmasangraha (Prashastapada)',
  },
  {
    id: 'mimamsa',
    label: 'Mīmāṃsā',
    type: 'darshana',
    size: 20,
    filter: 'philosophical',
    yuga: 'eternal',
    sanskrit: 'मीमांसा',
    epithets: ['Vedic Hermeneutics', 'Jaimini School', 'Dharma Science'],
    desc: 'The school devoted to the interpretation of Vedic injunctions — the most textualist and ritual-focused of the six darshanas. Founded by Jaimini, Mimamsa addresses a practical philosophical crisis: the Vedic texts contain thousands of ritual injunctions, many of which appear to contradict each other. How do you know which takes precedence? Mimamsa developed elaborate rules of textual interpretation (hermeneutics) to systematically resolve such conflicts. Its central claim: the Vedas are eternal, authorless, and self-validating — they are not "revealed" to sages but are eternal cosmic sound. While theology and metaphysics concerned other schools, Mimamsa focused entirely on dharma — what action is Vedically enjoined and why. Its interpretive methods became foundational to all of Sanskrit jurisprudence.',
    source: 'Mimamsa Sūtras (Jaimini) · Mimamsa Darshanam · Shabara Bhāshya',
  },
];

// ── All new relationships ──────────────────────────────────────────────────
// label convention for darshana links:
// 'Founded', 'Systematized', 'Expounds', 'Taught', 'Practices', 'Metaphysical basis'
const DARSHANA_RELS = [
  // ── Acharyas → Their Schools ──
  { source: 'adi_shankara',  target: 'advaita',          label: 'Founded',              type: 'darshana' },
  { source: 'ramanuja',      target: 'vishishtadvaita',   label: 'Founded',              type: 'darshana' },
  { source: 'madhva',        target: 'dvaita',            label: 'Founded',              type: 'darshana' },
  { source: 'patanjali',     target: 'yoga_darshana',     label: 'Systematized',         type: 'darshana' },
  { source: 'kapila',        target: 'samkhya',           label: 'Founded',              type: 'darshana' },
  { source: 'kanada',        target: 'vaisheshika',       label: 'Founded',              type: 'darshana' },

  // ── Samkhya underpins Yoga ──
  { source: 'samkhya',       target: 'yoga_darshana',     label: 'Metaphysical basis of', type: 'darshana' },

  // ── Vyasa — his Brahma Sutras are the shared canon all three Vedanta schools comment on ──
  { source: 'vyasa',         target: 'advaita',           label: 'Brahma Sutras canonised', type: 'darshana' },
  { source: 'vyasa',         target: 'vishishtadvaita',   label: 'Brahma Sutras canonised', type: 'darshana' },
  { source: 'vyasa',         target: 'dvaita',            label: 'Brahma Sutras canonised', type: 'darshana' },

  // ── Krishna — the Bhagavad Gita engages with both Advaita and Yoga ──
  { source: 'krishna',       target: 'advaita',           label: 'Gita expounds',        type: 'darshana' },
  { source: 'krishna',       target: 'yoga_darshana',     label: 'Karma Yoga doctrine',  type: 'darshana' },
  { source: 'krishna',       target: 'samkhya',           label: 'Gita invokes',         type: 'darshana' },

  // ── Arjuna — receives teaching on Gita battlefield ──
  { source: 'arjuna',        target: 'advaita',           label: 'Received teaching',    type: 'darshana' },
  { source: 'arjuna',        target: 'yoga_darshana',     label: 'Practiced',            type: 'darshana' },

  // ── Vasishtha — the Yoga Vasishtha is the most comprehensive Advaita philosophical text ──
  { source: 'vasishtha',     target: 'advaita',           label: 'Yoga Vasishtha expounds', type: 'darshana' },

  // ── Rama — subject of Yoga Vasishtha, receives Advaita teaching ──
  { source: 'rama',          target: 'advaita',           label: 'Yoga Vasishtha teaches', type: 'darshana' },

  // ── Shuka — the enlightened son of Vyasa who embodies non-dual realization ──
  { source: 'shuka',         target: 'advaita',           label: 'Embodied realization', type: 'darshana' },

  // ── Narada — the paradigm guru of the Bhakti path that informs Vishishtadvaita ──
  { source: 'narada',        target: 'vishishtadvaita',   label: 'Bhakti transmission',  type: 'darshana' },

  // ── Prahlada — embodies Bhakti devotion; the personal God relationship is Vishishtadvaita's core ──
  { source: 'prahlada',      target: 'vishishtadvaita',   label: 'Exemplifies devotion', type: 'darshana' },

  // ── Samkhya's Kapila teaches his mother Devahuti in the Bhagavatam ──
  // (Devahuti not in graph — we connect via the school itself)

  // ── Patanjali → Vyasa (Vyasa wrote the Yoga Bhashya commentary) ──
  { source: 'vyasa',         target: 'yoga_darshana',     label: 'Yoga Bhashya commentary', type: 'darshana' },

  // ── Vedanta school rivalries (all three debate Brahma Sutras) ──
  { source: 'advaita',       target: 'vishishtadvaita',   label: 'Philosophical debate', type: 'divine' },
  { source: 'advaita',       target: 'dvaita',            label: 'Philosophical debate', type: 'divine' },
  { source: 'vishishtadvaita', target: 'dvaita',          label: 'Philosophical debate', type: 'divine' },

  // ── Nyaya + Vaisheshika merging ──
  { source: 'nyaya',         target: 'vaisheshika',       label: 'Allied school',        type: 'alliance' },

  // ── Adi Shankara and Ramanuja — the great philosophical succession ──
  { source: 'adi_shankara',  target: 'ramanuja',          label: 'Philosophical successor', type: 'divine' },
  { source: 'ramanuja',      target: 'madhva',            label: 'Philosophical successor', type: 'divine' },

  // ── Parashurama — trained Bhishma and Karna; also trained Adi Shankara in lore of martial traditions ──
  // (not adding this — too speculative)

  // ── Markandeya — embodies the witness consciousness (Samkhya's Purusha) ──
  { source: 'markandeya',    target: 'samkhya',           label: 'Embodies Purusha principle', type: 'darshana' },
];

// ── Execute Additive Seed ─────────────────────────────────────────────────
async function seedDarshanas() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI not defined in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected for Darshanas seed...\n');

  const allNodes = [...NEW_SAGES, ...DARSHANA_NODES];
  let charUpserted = 0;
  let charSkipped  = 0;

  for (const char of allNodes) {
    const result = await Character.updateOne(
      { id: char.id },
      { $set: char },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      console.log(`  ➕ Created: [${char.type.toUpperCase()}] ${char.label}`);
      charUpserted++;
    } else {
      console.log(`  ↩  Exists:  [${char.type.toUpperCase()}] ${char.label}`);
      charSkipped++;
    }
  }

  console.log(`\n📦 Characters: ${charUpserted} created, ${charSkipped} already existed\n`);

  let relCreated = 0;
  let relSkipped = 0;

  for (const rel of DARSHANA_RELS) {
    const result = await Relationship.updateOne(
      { source: rel.source, target: rel.target, label: rel.label },
      { $set: rel },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      console.log(`  ➕ Link: ${rel.source} —[${rel.label}]→ ${rel.target}`);
      relCreated++;
    } else {
      console.log(`  ↩  Link exists: ${rel.source} → ${rel.target}`);
      relSkipped++;
    }
  }

  console.log(`\n🔗 Relationships: ${relCreated} created, ${relSkipped} already existed`);
  console.log(`\n✨ Darshanas seed complete.`);
  console.log(`   ${charUpserted + relCreated} new nodes and links added to the knowledge graph.\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seedDarshanas().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
