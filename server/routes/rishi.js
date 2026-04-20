import express from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Seeker, your guest allowance is exhausted. Please create an account to seek deeper wisdom.' },
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Your mind must rest. Please wait 15 minutes before seeking further wisdom.' },
});

const rishiLimiter = (req, res, next) => {
  if (req.user) {
    const isPremium = req.user.gurukul || ['Bhamashah', 'Vajra'].includes(req.user.danaTier);
    if (isPremium) return next(); // No limit for highest patrons/students
    return userLimiter(req, res, next);
  }
  return guestLimiter(req, res, next);
};

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function rankRelevantNodes(nodes, relationships, text) {
  const tokens = new Set(tokenize(text));
  const scores = new Map();

  nodes.forEach((node) => {
    let score = 0;
    const haystacks = [
      node.label,
      node.sanskrit,
      node.desc,
      ...(node.epithets || []),
    ].filter(Boolean).map((value) => value.toLowerCase());

    tokens.forEach((token) => {
      if (haystacks.some((value) => value.includes(token))) score += 3;
    });

    if (score > 0) scores.set(node.id, score);
  });

  const topNodes = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nodeId]) => nodes.find((node) => node.id === nodeId))
    .filter(Boolean);

  const topNodeIds = new Set(topNodes.map((node) => node.id));
  const relatedLinks = relationships
    .filter((rel) => topNodeIds.has(rel.source) || topNodeIds.has(rel.target))
    .slice(0, 8);

  return { topNodes, relatedLinks };
}

router.post('/ask', optionalAuth, rishiLimiter, async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length < 3) {
    return res.status(400).json({ message: 'A meaningful question is required.' });
  }

  if (!genAI) {
    return res.status(503).json({ message: 'The Rishi is currently meditating (SDK missing)' });
  }

  try {
    const [characters, relationships] = await Promise.all([
      Character.find({}).lean(),
      Relationship.find({}).lean(),
    ]);

    const contextData = {
      nodes: characters.map((c) => ({
        id: c.id,
        name: c.label,
        sanskrit: c.sanskrit,
        type: c.type,
        yuga: c.yuga,
        epithets: c.epithets,
        summary: c.desc,
        source: c.source,
      })),
      links: relationships.map((r) => ({
        source: r.source,
        target: r.target,
        label: r.label,
        type: r.type,
      })),
    };

    const systemInstruction = `You are the Rishi of Devlok, an enlightened sage with absolute access to the cosmic knowledge graph.
Your purpose is to answer the seeker's questions by weaving together the beings (devas, heroes, sages), concepts (dharma, karma, atman), and texts of our tradition.

Answer ONLY using the provided [GRAPH_RECORDS]. 
- If the records contain the answer, explain it with depth and clarity.
- If the records are insufficient, state it humbly: "The current archives of Devlok do not yet hold the full truth of this query."
- ALWAYS mention at least two relevant nodes from the graph in your explanation to ground your wisdom.
- Address the seeker with respect ("Seeker...", "O child of Bharat...").

Current Cosmic Context:
[GRAPH_RECORDS]
${JSON.stringify(contextData)}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    const result = await model.generateContent(question.trim());
    const response = await result.response;
    const answer = response.text();

    const { topNodes, relatedLinks } = rankRelevantNodes(characters, relationships, `${question}\n${answer}`);
    const nodeById = new Map(characters.map((node) => [node.id, node]));

    res.json({
      answer,
      coverage: topNodes.length ? 'graph-grounded' : 'limited',
      relatedNodes: topNodes.map((node) => ({
        id: node.id,
        label: node.label,
        type: node.type,
      })),
      relatedLinks: relatedLinks.map((rel) => ({
        source: nodeById.get(rel.source)?.label || rel.source,
        target: nodeById.get(rel.target)?.label || rel.target,
        label: rel.label,
        type: rel.type,
      })),
    });
  } catch (error) {
    console.error('Rishi error detailing:', error);
    res.status(500).json({ message: 'The Rishi encountered a disturbance in the ether.' });
  }
});

export default router;
