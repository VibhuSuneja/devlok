# Devlok — Indian Mythology Knowledge Graph

> *"Everything you were told was mythology was actually a knowledge system — and this is the map."*

An interactive force-graph of Hindu mythology — 90+ characters, 200+ relationships, across Mahabharata, Ramayana, and Puranas. Built as a public knowledge commons.

**Live:** [devlok.in](https://devlok.in)

---

## The Open Dataset

**The complete Devlok dataset is free for any use — no registration, no API key.**

This data belongs to everyone. The underlying knowledge predates all of us by 5,000 years.

### Download

| Format | Link | Contents |
|--------|------|---------|
| **JSON** | [`/api/export/graph.json`](https://devlok-api.onrender.com/api/export/graph.json) | Full graph — nodes + edges, D3-compatible |
| **CSV** | [`/api/export/characters.csv`](https://devlok-api.onrender.com/api/export/characters.csv) | Characters spreadsheet |
| **CSV** | [`/api/export/relationships.csv`](https://devlok-api.onrender.com/api/export/relationships.csv) | Relationships spreadsheet |
| **Source** | [`server/seed/seed.js`](./server/seed/seed.js) | Canonical JavaScript source of truth |

### License

Data: **[CC BY 4.0](./DATA_LICENSE.md)** — use freely with attribution  
Code: **MIT**  

Attribution: *Data from [Devlok](https://devlok.in), CC BY 4.0*

### What's in the dataset

- **90+ characters** — Deva, Devi, Hero, Sage, Asura, Celestial, Avatar
- **200+ relationships** — Family, Divine, Conflict, Guru, Alliance, Manifestation
- **5 Yuga timestamps** — Satya, Treta, Dvapara, Kali, Eternal
- **4 Scripture filters** — Mahabharata, Ramayana, Purana, Vedic
- **Sanskrit names, epithets, descriptions, source citations** for every character

---

## What Devlok Is

A thinking tool for the world's oldest living knowledge system.

Not an encyclopedia (flat lists). Not a social network (optimizes for attention). Not a temple app (assumes belief). Devlok is a **traversable map** — start at Krishna, follow the edges, arrive at Advaita Vedanta. Everything connects. Now you can see how.

Built for the generation that found Stoicism instead of Vedanta and Jordan Peterson instead of the Bhagavad Gita — not because they don't care, but because no one gave them a beautiful, honest bridge to their own tradition.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Graph | D3.js v7 (force-directed, SVG) |
| Backend | Node.js + Express 4 |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Styling | Pure CSS (single-file) |
| Fonts | Cinzel Decorative + Cormorant Garamond |
| Deployment | Render (API) + Vercel (client) |
| Analytics | PostHog |

---

## Run Locally

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/devlok.git
cd devlok

# Server
cd server
cp .env.example .env   # Add your MONGO_URI + JWT_SECRET
npm install
node seed/seed.js      # Seed the database
node index.js          # Starts on :5000

# Client (new terminal)
cd client
cp .env.example .env   # Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev            # Starts on :5173
```

---

## Project Status (Phase 3)

- [x] Phase 1 — Living Graph (public, force-directed)
- [x] Phase 2 — Daily Concepts (30 concepts, shareable cards, streaks)
- [x] Phase 3A — User Accounts (signup, bookmarks, Shraddha points)
- [x] Phase 3B — Constellation Map (personal bookmark graph)
- [ ] Phase 3C — Contribution Queue (community corrections)
- [ ] Phase 3D — Gurukul (₹999 cohort-based learning)

Full roadmap: [phases/DEVLOK_PHASE3.md](./phases/)

---

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md).

Short version: every contribution needs a source citation from a named ancient text. No source = no entry. This is the only rule that matters.

---

## License

See [LICENSE](./LICENSE) and [DATA_LICENSE.md](./DATA_LICENSE.md).

Data: CC BY 4.0 | Code: MIT

---

*Built by Vibhu — sole architect, 2026*  
*"The data outlasts the code."*
