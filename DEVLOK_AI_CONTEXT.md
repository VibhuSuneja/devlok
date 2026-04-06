# Devlok - Project Architecture & Feature Summary
*A comprehensive technical and feature-level manifest designed for AI Agent context injection.*

## 1. Core Paradigm
**Devlok** is an interactive, community-built knowledge graph mappings Indian Mythology & Sanatan Dharma. It is designed as a "thinking tool" rather than a rigid encyclopedia. The architecture involves a Node/Express/MongoDB backend serving a React/Vite frontend. The core interface is a highly interactive D3.js force-directed graph.

---

## 2. Frontend Architecture (React + Vite + D3.js)
### 2.1 Graph Visualization Engine (`GraphPage.jsx`, `CharacterModal.jsx`)
*   **D3.js Integration:** The graph is driven by D3.js (Force-directed layout). React manages the wrapper components, while D3 directly manipulates the SVG DOM for maximum performance.
*   **Nodes & Edges:** Entities are visually distinct (e.g., Deva, Asura, Sage). Relationships form the edges (e.g., 'Avatar of', 'Fought', 'Guru of').
*   **Graph Filtering:** Implemented via `FilterBar.jsx` & `Legend.jsx`, allowing users to filter by Yuga (era) or Scripture source (Mahabharata, Ramayana, etc.).

### 2.2 The Gurukul Engine (`GurkulPage.jsx`, `GurkulWeekPage.jsx`, `ConceptPage.jsx`)
*   **Cohort Learning:** A structured, guided learning platform modeled after ancient Gurukuls.
*   **The "Shraddha" System:** A tracking and streak mechanic (`useStreak.js`) acting as a reputation/engagement metric for users.
*   **Content Gating:** "The Shraddha Lock" mechanism uses Razorpay integration to gate premium, deep-curriculum features and cohorts.

### 2.3 User Accounts & Progression (`ProfilePage.jsx`, `ConstellationPage.jsx`)
*   **Personalized Maps:** Users can track their learning journey, potentially seeing their own "Constellation" representing their intellectual exploration path.

### 2.4 Agentic RAG Search: "Ask the Rishi" (`AskRishiPage.jsx`)
*   **Premium Chat Portal:** A glassmorphic chat interface located at `/ask`.
*   **UI Polish:** Features an ambient pulsing "🕉" orb for loading states and markdown parsing. (Includes `useSound.js` scaffolding for upcoming soundscape integration).

---

## 3. Backend Architecture (Node + Express + MongoDB)
### 3.1 Content Moderation & Submissions (`AdminPanel.jsx`, `routes/submissions.js`)
*   **Community Sourcing:** As the platform relies on community data (Wiki-style), users submit potential new `Character` and `Relationship` nodes.
*   **Validation Pipeline:** Submissions flow into a Queue where an Admin (via `AdminPanel`) can review, edit, approve, or reject. This protects the Graph from vandalism.

### 3.2 The Semantic Brain (`routes/rishi.js`)
*   **Full Context Injection (RAG):** Instead of simple fetching, the `/api/rishi/ask` route fetches the *entire* MongoDB Graph (every Character and Relationship) and creates a minimized JSON representation.
*   **Gemini AI Layer:** This JSON is injected as `systemInstruction` into **Google's Gemini 2.5 Flash** model (via `@google/generative-ai` SDK).
*   **Hallucination Prevention:** The prompt strictly enforces that Gemini *must only* reply using the provided Devlok context—if it's not in the graph, it's not known.

### 3.3 Auth & Security (`routes/auth.js`, `middleware/auth.js`)
*   **JWT Setup:** Secure JSON Web Token authentication standardizes the `user` and `admin` roles, guarding mutation endpoints.

---

## 4. Environment & Integrations
*   **Database:** MongoDB Atlas (`Character` and `Relationship` schemas heavily indexed efficiently for fast querying).
*   **Vector DB (Scaling framework):** Pinecone API configured for when graph data escapes maximum traditional context windows.
*   **Monetization:** Razorpay & Stripe API keys configured for Indian and International cohorts.
*   **Analytics:** PostHog implemented for precise route tracking and interaction analytics.
*   **Transactional Comm:** Resend integrated for transactional "Divine" emails.
*   **Deployment:** Vercel (Frontend SPA) + Render (Backend Node API, equipped with a 14-min keep-alive ping to bypass free-tier sleep cycles).

---

## 5. Upcoming Roadmap Context (Unimplemented / In Progress)
*   **Phase 4A (The Darshanas):** Evolving from Mythology to detailed Philosophy by adding the Six Classical Schools of Indian Philosophy as unique, Octagon-shaped graph nodes.
*   **Phase 4C (The Shraddha Lock):** Finalizing the implementation of Razorpay gates blocking non-subscribed individuals from premium Devlok content.
*   **Phase 4D (Divine Soundscapes):** Activating the `useSound.js` hooks to provide an immersive, meditative audio layer while interacting with the graph or Ask the Rishi.
*   **Phase 3E (Mobile Hardening):** Advancing the D3 interface to support perfect multi-touch interactions and "Pinch-to-room".
