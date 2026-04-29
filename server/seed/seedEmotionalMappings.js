// server/seed/seedEmotionalMappings.js
// Run once: node --experimental-modules seed/seedEmotionalMappings.js
// Seeds 20 emotional states with curated Gita shlokas

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import EmotionalMapping from '../models/EmotionalMapping.js';

const MAPPINGS = [
  {
    emotion: 'Grief',
    synonyms: ['sadness', 'sorrow', 'loss', 'mourning', 'crying', 'tears', 'heartbreak'],
    characterRefs: ['arjuna', 'krishna', 'yama'],
    conceptRefs: ['atman', 'dharma'],
    rishiGuidanceHint: 'Emphasize the eternal nature of the atman and the impermanence of the physical body.',
    shlokas: [
      {
        text: 'देहिनोऽस्मिन्यथा देहे कौमारं यौवनं जरा। तथा देहान्तरप्राप्तिर्धीरस्तत्र न मुह्यति॥',
        translation: 'As the embodied soul continuously passes from childhood to youth to old age, the soul similarly passes into another body at death. A sober person is not bewildered by such a change.',
        source: 'Bhagavad Gita 2:13',
        insight: 'Death is a transition, not an end. The soul you grieve for has not perished.',
      },
      {
        text: 'न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः।',
        translation: 'For the soul there is neither birth nor death at any time. It does not come into being, nor will it cease to exist.',
        source: 'Bhagavad Gita 2:20',
        insight: 'What you love in them is eternal. It was never born and can never die.',
      },
      {
        text: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि।',
        translation: 'As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones.',
        source: 'Bhagavad Gita 2:22',
        insight: 'The body is a garment. Your loved one has simply changed theirs.',
      },
    ],
  },
  {
    emotion: 'Anger',
    synonyms: ['rage', 'fury', 'irritation', 'frustration', 'wrath', 'resentment', 'annoyance'],
    characterRefs: ['duryodhana', 'bhima', 'shiva'],
    conceptRefs: ['karma'],
    rishiGuidanceHint: 'Explain the chain: desire → anger → delusion → destruction. Guide the seeker toward equanimity.',
    shlokas: [
      {
        text: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥',
        translation: 'While contemplating sense objects, a person develops attachment. From attachment, desire is born. From desire, anger arises.',
        source: 'Bhagavad Gita 2:62',
        insight: 'Anger is not the root — it is the fruit. Trace it back to the attachment beneath it.',
      },
      {
        text: 'क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः।',
        translation: 'From anger, delusion arises, and from delusion, bewilderment of memory. When memory is bewildered, intelligence is lost.',
        source: 'Bhagavad Gita 2:63',
        insight: 'Unchecked anger clouds your judgment and leads to ruin.',
      },
    ],
  },
  {
    emotion: 'Confusion',
    synonyms: ['doubt', 'uncertainty', 'indecision', 'lost', 'bewildered', 'conflicted', 'dilemma'],
    characterRefs: ['arjuna', 'krishna', 'vyasa'],
    conceptRefs: ['dharma', 'karma'],
    rishiGuidanceHint: 'Acknowledge the nobility of questioning. Guide toward surrender to dharma over paralysis.',
    shlokas: [
      {
        text: 'कार्पण्यदोषोपहतस्वभावः पृच्छामि त्वां धर्मसम्मूढचेताः।',
        translation: 'Now I am confused about my duty and have lost all composure. I am asking You to tell me what is best for me.',
        source: 'Bhagavad Gita 2:7',
        insight: 'Even Arjuna, the greatest warrior, admitted his confusion. There is no shame in seeking guidance.',
      },
      {
        text: 'ईश्वरः सर्वभूतानां हृद्देशेऽर्जुन तिष्ठति।',
        translation: 'The Supreme Lord is situated in everyone\'s heart, O Arjuna, and is directing the wanderings of all living entities.',
        source: 'Bhagavad Gita 18:61',
        insight: 'When you feel lost, remember — the guide is already within you.',
      },
    ],
  },
  {
    emotion: 'Fear',
    synonyms: ['anxiety', 'worry', 'dread', 'panic', 'nervous', 'scared', 'terrified', 'phobia'],
    characterRefs: ['arjuna', 'hanuman'],
    conceptRefs: ['atman', 'bhakti'],
    rishiGuidanceHint: 'Ground the seeker in the knowledge that the atman is indestructible. Fear dissolves in devotion.',
    shlokas: [
      {
        text: 'वीतरागभयक्रोधा मन्मया मामुपाश्रिताः।',
        translation: 'Being freed from attachment, fear, and anger, being fully absorbed in Me and taking refuge in Me, many persons have become purified by knowledge of Me.',
        source: 'Bhagavad Gita 4:10',
        insight: 'Fear is the shadow of attachment. Release what you cling to, and fear loses its power.',
      },
    ],
  },
  {
    emotion: 'Hopelessness',
    synonyms: ['despair', 'desperation', 'helpless', 'pointless', 'giving up', 'surrender', 'nihilism'],
    characterRefs: ['arjuna', 'draupadi', 'krishna'],
    conceptRefs: ['bhakti', 'karma'],
    rishiGuidanceHint: 'Remind the seeker that even at the darkest hour, divine grace is available.',
    shlokas: [
      {
        text: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
        translation: 'Abandon all varieties of dharma and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.',
        source: 'Bhagavad Gita 18:66',
        insight: 'When all paths seem closed, one remains — complete surrender to the divine. This is not weakness; it is the highest courage.',
      },
      {
        text: 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः। तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥',
        translation: 'Wherever there is Krishna, the master of yoga, and wherever there is Arjuna, the supreme archer — there will also certainly be opulence, victory, extraordinary power, and morality.',
        source: 'Bhagavad Gita 18:78',
        insight: 'Where effort meets grace, victory is certain. Do not despair.',
      },
    ],
  },
  {
    emotion: 'Guilt',
    synonyms: ['shame', 'regret', 'remorse', 'sinful', 'unworthy', 'mistake', 'wrongdoing'],
    characterRefs: ['arjuna', 'yudhishthira'],
    conceptRefs: ['karma', 'dharma'],
    rishiGuidanceHint: 'Distinguish between healthy remorse and destructive self-punishment. Guide toward redemption through action.',
    shlokas: [
      {
        text: 'अपि चेदसि पापेभ्यः सर्वेभ्यः पापकृत्तमः। सर्वं ज्ञानप्लवेनैव वृजिनं सन्तरिष्यसि॥',
        translation: 'Even if you are the most sinful of all sinners, you shall cross over all sin by the boat of transcendental knowledge.',
        source: 'Bhagavad Gita 4:36',
        insight: 'No sin is permanent. Knowledge and sincere effort can redeem any past.',
      },
      {
        text: 'अपि चेत्सुदुराचारो भजते मामनन्यभाक्। साधुरेव स मन्तव्यः सम्यग्व्यवसितो हि सः॥',
        translation: 'Even if one commits the most abominable action, if he is engaged in devotional service he is to be considered saintly.',
        source: 'Bhagavad Gita 9:30',
        insight: 'Your worst moment does not define you. What you choose next does.',
      },
    ],
  },
  {
    emotion: 'Laziness',
    synonyms: ['procrastination', 'inaction', 'sloth', 'unmotivated', 'passive', 'idle', 'apathy'],
    characterRefs: ['arjuna', 'karna'],
    conceptRefs: ['karma'],
    rishiGuidanceHint: 'Action is the antidote. Even imperfect action is superior to inaction.',
    shlokas: [
      {
        text: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।',
        translation: 'Perform your prescribed duty, for action is better than inaction. A person cannot even maintain the physical body without work.',
        source: 'Bhagavad Gita 3:8',
        insight: 'Inaction is itself a choice — and a harmful one. Begin, even imperfectly.',
      },
    ],
  },
  {
    emotion: 'Pride',
    synonyms: ['ego', 'arrogance', 'vanity', 'hubris', 'self-importance', 'narcissism', 'boastful'],
    characterRefs: ['ravana', 'duryodhana'],
    conceptRefs: ['dharma', 'maya'],
    rishiGuidanceHint: 'Use the examples of Ravana and Duryodhana to show how unchecked pride leads to downfall.',
    shlokas: [
      {
        text: 'दम्भो दर्पोऽभिमानश्च क्रोधः पारुष्यमेव च।',
        translation: 'Pride, arrogance, conceit, anger, harshness, and ignorance — these qualities belong to those of demoniac nature.',
        source: 'Bhagavad Gita 16:4',
        insight: 'Pride masquerades as strength but is actually a barrier to true wisdom.',
      },
    ],
  },
  {
    emotion: 'Loneliness',
    synonyms: ['isolated', 'alone', 'abandoned', 'disconnected', 'friendless', 'rejected'],
    characterRefs: ['arjuna', 'draupadi'],
    conceptRefs: ['bhakti', 'atman'],
    rishiGuidanceHint: 'Remind the seeker that the divine is never absent. Connection is always available within.',
    shlokas: [
      {
        text: 'यो मां पश्यति सर्वत्र सर्वं च मयि पश्यति। तस्याहं न प्रणश्यामि स च मे न प्रणश्यति॥',
        translation: 'For one who sees Me everywhere and sees everything in Me, I am never lost, nor is he ever lost to Me.',
        source: 'Bhagavad Gita 6:30',
        insight: 'You are never truly alone. The divine presence pervades everything around you and within you.',
      },
      {
        text: 'समोऽहं सर्वभूतेषु न मे द्वेष्योऽस्ति न प्रियः।',
        translation: 'I envy no one, nor am I partial to anyone. I am equal to all. But whoever renders service unto Me in devotion is a friend — is in Me — and I am also a friend to him.',
        source: 'Bhagavad Gita 9:29',
        insight: 'The divine does not choose favorites, but it does respond to sincere seeking.',
      },
    ],
  },
  {
    emotion: 'Lust',
    synonyms: ['desire', 'craving', 'obsession', 'temptation', 'sensual', 'infatuation', 'addiction'],
    characterRefs: ['arjuna', 'vishwamitra'],
    conceptRefs: ['karma', 'maya'],
    rishiGuidanceHint: 'Identify desire as the eternal enemy of the wise and guide toward mastery of the senses.',
    shlokas: [
      {
        text: 'काम एष क्रोध एष रजोगुणसमुद्भवः। महाशनो महापाप्मा विद्ध्येनमिह वैरिणम्॥',
        translation: 'It is lust only, Arjuna, which is born of contact with the mode of passion, and later transformed into wrath. Know this as the all-devouring sinful enemy in this world.',
        source: 'Bhagavad Gita 3:37',
        insight: 'Desire is not your nature — it is a force that clouds your nature.',
      },
    ],
  },
  {
    emotion: 'Envy',
    synonyms: ['jealousy', 'resentment', 'comparison', 'covet', 'bitter'],
    characterRefs: ['duryodhana', 'shakuni'],
    conceptRefs: ['dharma'],
    rishiGuidanceHint: 'Show how envy consumed Duryodhana and destroyed an entire dynasty.',
    shlokas: [
      {
        text: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।',
        translation: 'One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor, and is free from false ego — he is very dear to Me.',
        source: 'Bhagavad Gita 12:13',
        insight: 'Envy compares your inner world to someone else\'s outer world. It is always a distortion.',
      },
    ],
  },
  {
    emotion: 'Inner Peace',
    synonyms: ['calm', 'serenity', 'tranquility', 'stillness', 'contentment', 'equanimity', 'peace'],
    characterRefs: ['krishna', 'rama'],
    conceptRefs: ['moksha', 'atman'],
    rishiGuidanceHint: 'Affirm the seeker\'s progress. Guide them deeper into the practice of equanimity.',
    shlokas: [
      {
        text: 'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्। उपैति शान्तरजसं ब्रह्मभूतमकल्मषम्॥',
        translation: 'The yogi whose mind is fixed on Me verily attains the highest perfection of transcendental happiness.',
        source: 'Bhagavad Gita 6:27',
        insight: 'Peace is not the absence of struggle — it is the presence of inner alignment.',
      },
      {
        text: 'सुहृन्मित्रार्युदासीनमध्यस्थद्वेष्यबन्धुषु। साधुष्वपि च पापेषु समबुद्धिर्विशिष्यते॥',
        translation: 'A person who is equal to friends and enemies, who is equipoised in honor and dishonor — such a person is very dear to Me.',
        source: 'Bhagavad Gita 6:9',
        insight: 'True peace comes from treating all experiences with the same equanimity.',
      },
    ],
  },
  {
    emotion: 'Mental Unrest',
    synonyms: ['restless', 'overthinking', 'anxious mind', 'scattered', 'distracted', 'racing thoughts'],
    characterRefs: ['arjuna', 'krishna'],
    conceptRefs: ['dhyana'],
    rishiGuidanceHint: 'Acknowledge that the restless mind is universal. Guide toward gradual practice, not force.',
    shlokas: [
      {
        text: 'असंशयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥',
        translation: 'O mighty-armed son of Kunti, it is undoubtedly very difficult to curb the restless mind, but it is possible by constant practice and by detachment.',
        source: 'Bhagavad Gita 6:35',
        insight: 'Krishna himself admits the mind is restless. The solution is not force but patient practice.',
      },
    ],
  },
  {
    emotion: 'Demotivation',
    synonyms: ['uninspired', 'burned out', 'tired', 'exhausted', 'no purpose', 'why bother'],
    characterRefs: ['arjuna', 'krishna'],
    conceptRefs: ['karma', 'dharma'],
    rishiGuidanceHint: 'Rekindle purpose through duty. Your dharma does not wait for motivation.',
    shlokas: [
      {
        text: 'तस्मात्त्वमुत्तिष्ठ यशो लभस्व जित्वा शत्रून्भुङ्क्ष्व राज्यं समृद्धम्।',
        translation: 'Therefore, get up and prepare to fight. After conquering your enemies you will enjoy a flourishing kingdom.',
        source: 'Bhagavad Gita 11:33',
        insight: 'Motivation follows action, not the other way around. Rise, and the energy will come.',
      },
    ],
  },
  {
    emotion: 'Greed',
    synonyms: ['avarice', 'hoarding', 'materialism', 'never enough', 'selfish'],
    characterRefs: ['duryodhana', 'kubera'],
    conceptRefs: ['dharma', 'dana'],
    rishiGuidanceHint: 'Show that greed traps the soul in an endless cycle. Generosity is liberation.',
    shlokas: [
      {
        text: 'त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः। कामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥',
        translation: 'There are three gates to self-destructive hell: lust, anger, and greed. Every sane man should give these up.',
        source: 'Bhagavad Gita 16:21',
        insight: 'Greed is one of the three gates to ruin. Recognize it and release its grip.',
      },
    ],
  },
  {
    emotion: 'Purpose',
    synonyms: ['meaning', 'direction', 'calling', 'life purpose', 'destiny', 'mission', 'vocation'],
    characterRefs: ['arjuna', 'krishna', 'yudhishthira'],
    conceptRefs: ['dharma', 'karma', 'svadharma'],
    rishiGuidanceHint: 'Guide the seeker toward discovering their svadharma — their unique nature-aligned duty.',
    shlokas: [
      {
        text: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।',
        translation: 'It is far better to discharge one\'s prescribed duties, even though faultily, than another\'s duties perfectly.',
        source: 'Bhagavad Gita 3:35',
        insight: 'Your purpose is not someone else\'s path perfected. It is your own path, walked authentically.',
      },
    ],
  },
  {
    emotion: 'Attachment',
    synonyms: ['clinging', 'possessive', 'codependent', 'letting go', 'cannot release'],
    characterRefs: ['arjuna', 'dhritarashtra'],
    conceptRefs: ['moksha', 'karma'],
    rishiGuidanceHint: 'Teach that detachment is not coldness — it is freedom. Act without clinging to results.',
    shlokas: [
      {
        text: 'विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः। निर्ममो निरहंकारः स शान्तिमधिगच्छति॥',
        translation: 'A person who has given up all desires for sense gratification, who lives free from desires, who has given up all sense of proprietorship — he alone can attain real peace.',
        source: 'Bhagavad Gita 2:71',
        insight: 'Peace comes not from possessing more but from needing less.',
      },
    ],
  },
  {
    emotion: 'Death',
    synonyms: ['dying', 'mortality', 'terminal', 'end of life', 'afterlife', 'passed away', 'bereavement'],
    characterRefs: ['arjuna', 'yama', 'krishna'],
    conceptRefs: ['atman', 'moksha'],
    rishiGuidanceHint: 'Address the fear of death directly. The atman is eternal.',
    shlokas: [
      {
        text: 'न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥',
        translation: 'For the soul there is neither birth nor death. It is not that having once been, it ceases to exist. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain.',
        source: 'Bhagavad Gita 2:20',
        insight: 'Death touches only the body. That which you truly are is beyond its reach.',
      },
      {
        text: 'अव्यक्तादीनि भूतानि व्यक्तमध्यानि भारत। अव्यक्तनिधनान्येव तत्र का परिदेवना॥',
        translation: 'All created beings are unmanifest in their beginning, manifest in their interim state, and unmanifest again when annihilated. So what need is there for lamentation?',
        source: 'Bhagavad Gita 2:28',
        insight: 'We emerge from the unseen and return to it. This cycle is the nature of existence itself.',
      },
    ],
  },
  {
    emotion: 'Discrimination',
    synonyms: ['unfair', 'injustice', 'bias', 'prejudice', 'inequality', 'oppression'],
    characterRefs: ['krishna'],
    conceptRefs: ['dharma'],
    rishiGuidanceHint: 'Krishna declares all beings equal. Discrimination violates the cosmic order.',
    shlokas: [
      {
        text: 'विद्याविनयसम्पन्ने ब्राह्मणे गवि हस्तिनि। शुनि चैव श्वपाके च पण्डिताः समदर्शिनः॥',
        translation: 'The humble sages, by virtue of true knowledge, see with equal vision a learned brahmana, a cow, an elephant, a dog, and an outcast.',
        source: 'Bhagavad Gita 5:18',
        insight: 'True wisdom sees the same divine essence in all beings, regardless of form or status.',
      },
    ],
  },
  {
    emotion: 'Temptation',
    synonyms: ['distraction', 'weakness', 'indulgence', 'giving in', 'seduction'],
    characterRefs: ['arjuna', 'vishwamitra'],
    conceptRefs: ['dharma', 'karma'],
    rishiGuidanceHint: 'Strength against temptation comes from steady practice, not willpower alone.',
    shlokas: [
      {
        text: 'यततो ह्यपि कौन्तेय पुरुषस्य विपश्चितः। इन्द्रियाणि प्रमाथीनि हरन्ति प्रसभं मनः॥',
        translation: 'The senses are so strong and impetuous, O Arjuna, that they can forcibly carry away the mind of even a man of discrimination who is endeavoring to control them.',
        source: 'Bhagavad Gita 2:60',
        insight: 'Even the wise can be pulled by temptation. The battle is never fully won — only practiced daily.',
      },
    ],
  },
];

async function seed() {
  await connectDB();
  console.log('Clearing existing emotional mappings...');
  await EmotionalMapping.deleteMany({});
  console.log('Inserting', MAPPINGS.length, 'emotional mappings...');
  await EmotionalMapping.insertMany(MAPPINGS);
  console.log('✅ Emotional mappings seeded successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
