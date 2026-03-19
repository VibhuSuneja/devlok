---
name: devlok
description: Use this skill when building, extending, fixing, or deploying Devlok — the Indian Mythology Knowledge Graph web app. Triggers include any mention of "devlok", "mythology graph", "knowledge graph", "yuga", "deity nodes", D3 force graph in this project, or anything about the mythology app's backend/frontend/database. Contains complete architecture, file map, data models, API routes, frontend components, D3 graph conventions, deployment config, and every design decision so Claude can pick up exactly where work left off without re-explaining anything.
---

# Devlok — Indian Mythology Knowledge Graph
## Complete Developer Reference

An interactive full-stack web application that renders Hindu mythology as a
force-directed knowledge graph. Users explore 70+ deities, heroes, sages,
asuras and celestial beings across Mahabharata, Ramayana, and Puranas with
Yuga timeline filtering, searchable detail panels, and relationship traversal.

**Codename:** Devlok (देवलोक — the realm of the gods)
**Stack:** MERN — same conventions as Antigravity research portal
**Total operating cost:** ₹0/month (Render free + Vercel free + MongoDB Atlas free)

---

## Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | React 18 + Vite                                         |
| Graph       | D3.js v7 (force-directed, SVG-based)                    |
| Backend     | Node.js + Express 4                                     |
| Database    | MongoDB Atlas (Mongoose 8)                              |
| Auth        | JWT + bcryptjs (same pattern as Antigravity)            |
| Styling     | Pure CSS custom properties — dark cosmic aesthetic      |
| Fonts       | Cinzel Decorative (headings) + Cormorant Garamond (body)|
| Deployment  | Render (backend) + Vercel (frontend)                    |
| DNS/Edge    | Cloudflare                                              |
| Email       | Resend                                                  |
| Analytics   | PostHog                                                 |
| Vector DB   | Pinecone (for AI Oracle search)                         |
| Payments    | Stripe (for Divine Offerings)                           |

---

## Project Structure

```
devlok/
├── client/
│   ├── public/
│   │   └── om.svg                     # Favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance + JWT auto-attach
│   │   ├── components/
│   │   │   ├── Graph.jsx              # D3 force graph — CORE COMPONENT
│   │   │   ├── DetailPanel.jsx        # Slide-in character detail panel
│   │   │   ├── SearchBar.jsx          # Fuzzy search over nodes
│   │   │   ├── FilterBar.jsx          # Scripture + Type filter buttons
│   │   │   ├── YugaTimeline.jsx       # Bottom yuga selector bar
│   │   │   ├── Legend.jsx             # Node colour legend
│   │   │   ├── Tooltip.jsx            # Hover tooltip
│   │   │   ├── Loader.jsx             # Sanskrit loading screen
│   │   │   ├── NodeCounter.jsx        # Bottom-right being count
│   │   │   ├── AddNodeModal.jsx       # Admin: add new character
│   │   │   └── AddLinkModal.jsx       # Admin: add new relationship
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth state (same as Antigravity)
│   │   ├── hooks/
│   │   │   └── useAuth.js             # useContext wrapper
│   │   ├── pages/
│   │   │   ├── GraphPage.jsx          # Main explore page (public)
│   │   │   ├── Login.jsx              # Admin login only
│   │   │   └── AdminPanel.jsx         # Manage nodes + links
│   │   ├── App.jsx                    # Routes + AuthProvider
│   │   ├── index.css                  # ALL styles (single file — mandatory)
│   │   └── main.jsx
│   ├── index.html
│   ├── vercel.json                    # SPA rewrite — MANDATORY
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js                      # Mongoose connect
│   ├── middleware/
│   │   └── auth.js                    # protect + adminOnly
│   ├── models/
│   │   ├── Character.js               # Node data model
│   │   ├── Relationship.js            # Edge data model
│   │   └── User.js                    # Admin user (minimal)
│   ├── routes/
│   │   ├── auth.js                    # Login + register (JWT)
│   │   ├── characters.js              # CRUD for nodes
│   │   ├── relationships.js           # CRUD for edges
│   │   └── graph.js                   # Full graph data endpoint
│   ├── seed/
│   │   └── seed.js                    # Seeds all 70+ characters + links
│   ├── utils/
│   │   └── email.js                   # Nodemailer (optional — for future)
│   └── index.js                       # Express app + keep-alive
│
└── .env (server)
```

---

## Design System

### Color Palette (CSS variables in index.css)
```css
:root {
  --void:        #04020f;   /* Page background — deep space black */
  --deep:        #080520;   /* Panel background */
  --amber:       #d4973a;   /* Deva / Trimurti nodes */
  --amber-glow:  #f0b84a;   /* Headings, active states */
  --amber-dim:   #7a5520;   /* Borders, muted text */
  --lotus:       #c45c8a;   /* Devi / Shakti nodes */
  --dharma:      #5c8ac4;   /* Hero / King nodes */
  --sacred:      #5cb88a;   /* Sage / Rishi nodes */
  --destroy:     #c45c5c;   /* Asura / Rakshasa nodes */
  --celestial:   #9a6ed4;   /* Apsara / Celestial nodes */
  --text:        #e8d5a3;   /* Primary text — warm parchment */
  --text-dim:    #7a6840;   /* Secondary text */
  --border:      rgba(212,151,58,0.22); /* Subtle gold borders */
}
```

### Yuga Colours (ring around each node)
```js
const YUGA_COLORS = {
  eternal:  'rgba(212,151,58,0.5)',   // Always present — Trimurti etc
  satya:    'rgba(92,184,138,0.5)',    // Age of Truth
  treta:    'rgba(92,138,196,0.5)',    // Age of Ritual — Ramayana
  dvapara:  'rgba(154,110,212,0.5)',   // Age of Duality — Mahabharata
  kali:     'rgba(196,92,92,0.5)',     // Age of Discord — present age
};
```

### Node Type → Colour Map
```js
const NODE_COLORS = {
  deva:      '#d4973a',
  devi:      '#c45c8a',
  hero:      '#5c8ac4',
  sage:      '#5cb88a',
  asura:     '#c45c5c',
  celestial: '#9a6ed4',
};
```

### Link Type → Stroke Colour
```js
const LINK_STROKES = {
  family:   '#7a6840',  // solid
  divine:   '#5a4a8a',  // solid, 1.4px
  conflict: '#7a3030',  // dashed 4,3
  guru:     '#3a6a4a',  // solid
  alliance: '#3a4a7a',  // solid
};
```

### Typography
- `font-family: 'Cinzel Decorative', serif` — titles, brand, panel names, yuga names
- `font-family: 'Cormorant Garamond', serif` — body, labels, descriptions, filters
- Google Fonts import in index.html

---

## Data Models

### Character (Node)
```js
// server/models/Character.js
const CharacterSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true }, // e.g. 'krishna'
  label:     { type: String, required: true },               // Display name
  sanskrit:  { type: String },                               // Sanskrit name e.g. 'कृष्ण'
  type:      {
    type: String,
    enum: ['deva','devi','hero','sage','asura','celestial'],
    required: true
  },
  size:      { type: Number, default: 14 },   // Node radius — 11–25
  filter:    {
    type: String,
    enum: ['mahabharata','ramayana','purana','vedic'],
    required: true
  },
  yuga:      {
    type: String,
    enum: ['eternal','satya','treta','dvapara','kali'],
    required: true
  },
  epithets:  [String],                        // Array of alternate names/titles
  desc:      { type: String },                // Story / biography paragraph
  source:    { type: String },                // Source texts e.g. 'Mahābhārata · Bhagavad Gītā'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

### Relationship (Link/Edge)
```js
// server/models/Relationship.js
const RelationshipSchema = new mongoose.Schema({
  source:   { type: String, required: true },  // Character id
  target:   { type: String, required: true },  // Character id
  label:    { type: String, required: true },  // e.g. 'Father', 'Slays', 'Avatar'
  type:     {
    type: String,
    enum: ['family','divine','conflict','guru','alliance'],
    required: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

### User (Admin only)
```js
// server/models/User.js
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },   // bcryptjs hash
  role:     { type: String, enum: ['admin'], default: 'admin' },
}, { timestamps: true });
```

---

## API Routes

### Auth — `/api/auth`
```
POST   /api/auth/login          # { email, password } → { token, user }
POST   /api/auth/register       # { name, email, password } → { token, user }
GET    /api/auth/me             # protect → current user
```

### Graph — `/api/graph`
```
GET    /api/graph               # Public. Returns { nodes: [...], links: [...] }
                                # This is what the D3 component fetches on mount.
                                # Combines Character + Relationship collections.
```

### Characters — `/api/characters`
```
GET    /api/characters          # Public. All characters.
GET    /api/characters/:id      # Public. Single character by string id.
POST   /api/characters          # protect + adminOnly. Create character.
PUT    /api/characters/:id      # protect + adminOnly. Update character.
DELETE /api/characters/:id      # protect + adminOnly. Delete character.
```

### Relationships — `/api/relationships`
```
GET    /api/relationships           # Public. All relationships.
GET    /api/relationships/:id       # Public. Single relationship by _id.
POST   /api/relationships           # protect + adminOnly.
PUT    /api/relationships/:id       # protect + adminOnly.
DELETE /api/relationships/:id       # protect + adminOnly.
```

---

## Core Component: Graph.jsx

This is the heart of Devlok. D3 force simulation runs inside a React component using `useRef` and `useEffect`. **Never put D3 in component state — it manages its own DOM inside the SVG ref.**

### Pattern
```jsx
// client/src/components/Graph.jsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function Graph({ nodes, links, onNodeClick, activeFilter, activeType, activeYuga, searchQuery }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear on re-render

    // Build simulation, draw links, draw nodes, set up interactions
    // Full implementation follows the standalone HTML prototype exactly.

    return () => { svg.selectAll('*').remove(); }; // Cleanup
  }, [nodes, links, activeFilter, activeType, activeYuga, searchQuery]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
```

### Critical D3 Rules
1. **Never use React state for D3 selections** — D3 owns the SVG DOM
2. **Always `svg.selectAll('*').remove()` at top of useEffect** — prevents ghost elements
3. **Return cleanup function** from useEffect to remove SVG contents on unmount
4. **Drag + Zoom** must call `e.stopPropagation()` / separate handlers — do not conflict
5. **Labels**: use `<text>` not HTML — D3 SVG text, anchored `dy: node.size + 12`
6. **Markers (arrowheads)**: defined in `<defs>`, referenced by link type
7. **Glow filters**: defined in `<defs>` as `<feGaussianBlur>` + `<feMerge>`
8. **Node size encodes importance**: major deities 22–25, primary heroes 16–21, secondary 11–15

### Filter Logic in Graph
```js
// Opacity-based filtering — nodes never removed, just dimmed to 0.06
nodeSel.style('opacity', d => {
  const fMatch = activeFilter === 'all' || d.filter === activeFilter;
  const tMatch = activeType === 'all' || d.type === activeType;
  return fMatch && tMatch ? 1 : 0.06;
});

// Yuga filter: eternal nodes always show alongside the selected yuga
nodeSel.style('opacity', d =>
  activeYuga === 'all' || d.yuga === activeYuga || d.yuga === 'eternal' ? 1 : 0.06
);
```

### Hover Behaviour
```js
// On mouseover: highlight ego network only
nodeSel.style('opacity', n => {
  const connected = links.some(l =>
    (l.source.id === hovered.id && l.target.id === n.id) ||
    (l.target.id === hovered.id && l.source.id === n.id) ||
    n.id === hovered.id
  );
  return connected ? 1 : 0.10;
});
linkSel.style('opacity', l =>
  l.source.id === hovered.id || l.target.id === hovered.id ? 0.85 : 0.03
);
```

---

## GraphPage.jsx — Main Page

Fetches graph data, manages filter state, renders all components.

```jsx
// client/src/pages/GraphPage.jsx
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Graph from '../components/Graph';
import DetailPanel from '../components/DetailPanel';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import YugaTimeline from '../components/YugaTimeline';
import Legend from '../components/Legend';
import Loader from '../components/Loader';
import NodeCounter from '../components/NodeCounter';
import Tooltip from '../components/Tooltip';

export default function GraphPage() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);       // Selected node for panel
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');  // Scripture filter
  const [activeType, setActiveType] = useState('all');      // Type filter
  const [activeYuga, setActiveYuga] = useState('all');      // Yuga timeline filter
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });

  useEffect(() => {
    axios.get('/api/graph').then(res => {
      setNodes(res.data.nodes);
      setLinks(res.data.links);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--void)' }}>
      <header>...</header>
      <Graph
        nodes={nodes}
        links={links}
        onNodeClick={setSelected}
        onNodeHover={(node, x, y) => setTooltip({ visible: !!node, x, y, node })}
        activeFilter={activeFilter}
        activeType={activeType}
        activeYuga={activeYuga}
        searchQuery={searchQuery}
      />
      <DetailPanel node={selected} links={links} nodes={nodes} onClose={() => setSelected(null)} onNavigate={setSelected} />
      <YugaTimeline active={activeYuga} onChange={setActiveYuga} />
      <Legend />
      <Tooltip {...tooltip} />
      <NodeCounter count={nodes.length} />
    </div>
  );
}
```

---

## DetailPanel.jsx

Slides in from the right. Shows: Yuga badge, type badge, Sanskrit name, epithets, description, source texts, clickable connections list.

```jsx
// Props: { node, links, nodes, onClose, onNavigate }
// node: the selected Character object
// onNavigate(otherNode): called when user clicks a connected character in the panel

// Key behaviours:
// - transform: translateX(100%) when node === null
// - transform: translateX(0) when node !== null
// - transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1)
// - Connections list: filter links where source/target === node.id
//   then render each as a clickable item that calls onNavigate(otherNode)
```

---

## YugaTimeline.jsx

Fixed bottom bar with 5 segments: All Yugas, Satya, Treta, Dvapara, Kali.

```jsx
// Props: { active: string, onChange: fn }
const YUGAS = [
  { id: 'all',     name: 'All Yugas',    sub: 'Complete Cosmos',  years: 'Eternal' },
  { id: 'satya',   name: 'Satya Yuga',   sub: 'Age of Truth',     years: '1,728,000 yrs' },
  { id: 'treta',   name: 'Treta Yuga',   sub: 'Age of Ritual',    years: '1,296,000 yrs' },
  { id: 'dvapara', name: 'Dvāpara Yuga', sub: 'Age of Duality',   years: '864,000 yrs' },
  { id: 'kali',    name: 'Kali Yuga',    sub: 'Age of Discord',   years: '432,000 yrs' },
];
// Clicking a segment calls onChange(yuga.id)
// Note: 'eternal' nodes always show in every yuga — this logic lives in Graph.jsx
```

---

## seed/seed.js

Run once to populate MongoDB with all 70+ characters and 100+ relationships.

```js
// Usage: node server/seed/seed.js
// Clears existing characters + relationships, then inserts fresh data.

const characters = [
  {
    id: 'vishnu', label: 'Vishnu', type: 'deva', size: 25,
    filter: 'purana', yuga: 'eternal', sanskrit: 'विष्णु',
    epithets: ['The Preserver','Narayana','Hari','Chakrapani'],
    desc: 'Reclining on the endless serpent Ananta-Shesha...',
    source: 'Vishnu Purāṇa · Bhāgavata Purāṇa · Mahābhārata'
  },
  // ... all 70+ characters from the HTML prototype
];

const relationships = [
  { source: 'vishnu', target: 'lakshmi', label: 'Consort',   type: 'family' },
  { source: 'vishnu', target: 'rama',    label: 'Avatar',    type: 'divine' },
  { source: 'rama',   target: 'ravana',  label: 'Enemies',   type: 'conflict' },
  // ... all 100+ links from the HTML prototype
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Character.deleteMany({});
  await Relationship.deleteMany({});
  await Character.insertMany(characters);
  await Relationship.insertMany(relationships);
  console.log(`Seeded ${characters.length} characters, ${relationships.length} relationships`);
  process.exit(0);
}
seed();
```

---

## server/routes/graph.js

The most important backend route — fetches nodes + links together.

```js
// GET /api/graph — public, no auth required
router.get('/', async (req, res) => {
  try {
    const [nodes, links] = await Promise.all([
      Character.find({}).lean(),
      Relationship.find({}).lean(),
    ]);
    res.json({ nodes, links });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

---

## Environment Variables

### server/.env
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=devlok_jwt_secret_change_in_prod
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
RENDER_EXTERNAL_URL=https://devlok-api.onrender.com
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

---

## server/index.js (key parts)
```js
import cors from 'cors';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';
import relationshipRoutes from './routes/relationships.js';
import graphRoutes from './routes/graph.js';

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/graph', graphRoutes);

// Keep-alive for Render free tier
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    fetch(process.env.RENDER_EXTERNAL_URL + '/').catch(() => {});
  }, 14 * 60 * 1000);
}
```

---

## client/vercel.json — MANDATORY
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```
Without this, any direct URL visit or browser refresh returns 404.

---

## client/src/api/axios.js
```js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('devlok_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
```

---

## Auth Middleware (server/middleware/auth.js)
```js
// protect: verifies JWT, attaches req.user
// adminOnly: checks req.user.role === 'admin'
// Usage: router.post('/', protect, adminOnly, handler)
```

---

## Deployment

### Architecture
```
GitHub monorepo
├── client/   → Vercel  (Vite, free tier)
└── server/   → Render  (Node.js, free tier)
               ↕
           MongoDB Atlas (shared free cluster)
```

### Vercel Setup
```
Root Directory: client
Framework: Vite
Build command: npm run build
Output directory: dist
Env var: VITE_API_URL = https://devlok-api.onrender.com/api
```

### Render Setup
```
Root Directory: server
Build command: npm install
Start command: node index.js
Port: 10000
Env vars: all from server/.env with production values
```

### Deployment Checklist
```
□ client/vercel.json created with SPA rewrite
□ seed.js run on production (via Render Shell)
□ MONGO_URI set on Render
□ CLIENT_URL on Render = exact Vercel URL (no trailing slash)
□ VITE_API_URL on Vercel = exact Render URL + /api
□ MongoDB Atlas network: 0.0.0.0/0
□ Smoke test: /api/graph returns JSON
□ Smoke test: Graph renders all nodes
□ Smoke test: Search filters nodes
□ Smoke test: Yuga timeline filters nodes
□ Smoke test: Click node opens detail panel
□ Smoke test: Clicking connected character navigates panel
□ Smoke test: Admin login works
□ Smoke test: Admin can add a character via UI
```

### Common Issues
```
Vercel 404 on page refresh    → vercel.json missing or wrong folder
Graph shows empty             → /api/graph returns empty, seed not run
D3 renders ghost nodes        → Missing svg.selectAll('*').remove() in useEffect
Panel doesn't open            → onNodeClick prop not wired from Graph to GraphPage
Links missing arrowheads      → Marker refX value too small for node radius
Eternal nodes hidden in yuga  → Filter not checking d.yuga === 'eternal'
CORS error                    → CLIENT_URL trailing slash mismatch on Render
Cold start lag                → Render free tier — keep-alive ping missing
D3 import error               → npm install d3 inside /client
```

---

## Future Phases

### Phase 2 — Community & Crowdsourcing
- User accounts (not just admin)
- Suggest a new character / relationship (moderated by admin)
- Vote on character descriptions
- User bookmarks / personal constellation map

### Phase 3 — Storytelling Layer
- Story arcs: click "Kurukshetra War" to highlight all participants
- Timeline scrubber: animate character appearances across yugas
- Event nodes (e.g. "Samudra Manthan") linked to character nodes

### Phase 4 — AI & The Oracle
- **Pinecone Vector Search**: Index all Puranic descriptions for semantic discovery.
- **"Ask the Oracle"**: Type "Who is the most tragic character?" or "Find me characters who sacrificed for dharma" → AI answers using graph data + Pinecone.
- **Auto-suggest relationships**: LLM-based suggestion when a new character is added via Admin.
- **Natural language graph queries**: "Show me all incarnations of Vishnu that fought asuras."

### Phase 5 — Multi-Mythology
- Add: Jain cosmology, Buddhist Jataka figures, regional deities
- Source filters extended: Jain Agamas, Pali Canon, Tamil Sangam

### Phase 6 — Mobile App
- React Native wrapper
- Offline graph (GraphQL + local cache)
- Share a character card as image

---

## Development Conventions (inherited from Antigravity)

1. **Single index.css** — All styles in one file. No CSS modules, no Tailwind.
2. **JWT in localStorage** — key: `devlok_token`
3. **Fire-and-forget side effects** — never block API responses
4. **vercel.json SPA rewrite** — mandatory, lives in /client
5. **Render keep-alive ping** — 14-minute interval in production
6. **HOD-equivalent = adminOnly middleware** — all write routes protected
7. **Seed before first deploy** — run seed.js from Render Shell
8. **D3 owns the SVG DOM** — React only controls the container div
9. **Monorepo** — /client and /server in one GitHub repo
10. **No truncation, no placeholders** — every prompt must produce complete files

---

## How to Continue Development

Adding a new character:
1. Add to `seed/seed.js` characters array (or POST /api/characters from admin UI)
2. Include: id, label, type, size, filter, yuga, sanskrit, epithets, desc, source
3. Add relationships to the relationships array
4. Re-run seed (or use admin panel)
5. Graph auto-updates on next /api/graph fetch

Adding a new feature:
1. Backend: new model → new route → register in index.js
2. Frontend: new component → import in GraphPage or App.jsx
3. D3 changes: always inside useEffect, always clear + redraw
4. Style: append to index.css only
5. Update this SKILL.md

Generating prompts for a new Claude session:
- State: "Continue Devlok from Phase X"
- List exact files to paste
- Write: "No truncation. No placeholders. Every file complete."
- Write: "Keep ALL existing functionality 100% intact"
- Include any new npm packages to install

---

## Quick Reference: All 70 Characters

| id                | label          | type      | yuga     | filter      |
|-------------------|----------------|-----------|----------|-------------|
| brahma            | Brahma         | deva      | eternal  | purana      |
| vishnu            | Vishnu         | deva      | eternal  | purana      |
| shiva             | Shiva          | deva      | eternal  | purana      |
| indra             | Indra          | deva      | eternal  | vedic       |
| surya             | Surya          | deva      | eternal  | vedic       |
| yama              | Yama           | deva      | eternal  | purana      |
| vayu              | Vayu           | deva      | eternal  | vedic       |
| agni              | Agni           | deva      | eternal  | vedic       |
| varuna            | Varuna         | deva      | eternal  | vedic       |
| ganesha           | Ganesha        | deva      | eternal  | purana      |
| kartikeya         | Kartikeya      | deva      | eternal  | purana      |
| kubera            | Kubera         | deva      | eternal  | purana      |
| vishwakarma       | Vishwakarma    | deva      | eternal  | purana      |
| narasimha         | Narasimha      | deva      | satya    | purana      |
| parashurama       | Parashurama    | deva      | treta    | purana      |
| rama              | Rama           | deva      | treta    | ramayana    |
| hanuman           | Hanuman        | deva      | treta    | ramayana    |
| krishna           | Krishna        | deva      | dvapara  | mahabharata |
| lakshmi           | Lakshmi        | devi      | eternal  | purana      |
| parvati           | Parvati        | devi      | eternal  | purana      |
| saraswati         | Saraswati      | devi      | eternal  | vedic       |
| durga             | Durga          | devi      | eternal  | purana      |
| kali              | Kali           | devi      | eternal  | purana      |
| sati              | Sati           | devi      | satya    | purana      |
| radha             | Radha          | devi      | dvapara  | purana      |
| sita              | Sita           | devi      | treta    | ramayana    |
| draupadi          | Draupadi       | devi      | dvapara  | mahabharata |
| mandodari         | Mandodari      | devi      | treta    | ramayana    |
| ahalya            | Ahalya         | devi      | treta    | ramayana    |
| kunti             | Kunti          | devi      | dvapara  | mahabharata |
| gandhari          | Gandhari       | devi      | dvapara  | mahabharata |
| arjuna            | Arjuna         | hero      | dvapara  | mahabharata |
| karna             | Karna          | hero      | dvapara  | mahabharata |
| yudhishthira      | Yudhishthira   | hero      | dvapara  | mahabharata |
| bhima             | Bhima          | hero      | dvapara  | mahabharata |
| duryodhana        | Duryodhana     | hero      | dvapara  | mahabharata |
| bhishma           | Bhishma        | hero      | dvapara  | mahabharata |
| ashvatthama       | Ashvatthama    | hero      | dvapara  | mahabharata |
| nakula            | Nakula         | hero      | dvapara  | mahabharata |
| sahadeva          | Sahadeva       | hero      | dvapara  | mahabharata |
| dhritarashtra     | Dhritarashtra  | hero      | dvapara  | mahabharata |
| ekalavya          | Ekalavya       | hero      | dvapara  | mahabharata |
| lakshmana         | Lakshmana      | hero      | treta    | ramayana    |
| vibhishana        | Vibhishana     | hero      | treta    | ramayana    |
| sugriva           | Sugriva        | hero      | treta    | ramayana    |
| vali              | Vali           | hero      | treta    | ramayana    |
| jatayu            | Jatayu         | deva      | treta    | ramayana    |
| prahlada          | Prahlada       | hero      | satya    | purana      |
| shakuntala        | Shakuntala     | hero      | dvapara  | mahabharata |
| vyasa             | Vyasa          | sage      | dvapara  | mahabharata |
| valmiki           | Valmiki        | sage      | treta    | ramayana    |
| narada            | Narada         | sage      | eternal  | purana      |
| vishwamitra       | Vishwamitra    | sage      | treta    | ramayana    |
| vasishtha         | Vasishtha      | sage      | treta    | ramayana    |
| agastya           | Agastya        | sage      | treta    | purana      |
| drona             | Drona          | sage      | dvapara  | mahabharata |
| durvasa           | Durvasa        | sage      | eternal  | purana      |
| ravana            | Ravana         | asura     | treta    | ramayana    |
| hiranyakashipu    | Hiranyakashipu | asura     | satya    | purana      |
| mahishasura       | Mahishasura    | asura     | satya    | purana      |
| tarakasura        | Tarakasura     | asura     | satya    | purana      |
| kumbhakarna       | Kumbhakarna    | asura     | treta    | ramayana    |
| vritra            | Vritra         | asura     | satya    | vedic       |
| shishupala        | Shishupala     | asura     | dvapara  | mahabharata |
| bali              | King Bali      | asura     | treta    | purana      |
| garuda            | Garuda         | celestial | eternal  | purana      |
| nandi             | Nandi          | celestial | eternal  | purana      |
| menaka            | Menaka         | celestial | eternal  | purana      |
| urvashi           | Urvashi        | celestial | eternal  | purana      |

Total: 70 characters, 100+ relationships across 5 link types.
