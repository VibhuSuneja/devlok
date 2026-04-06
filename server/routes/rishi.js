import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import rateLimit from 'express-rate-limit';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Rate limit logic
const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 questions per IP
  message: { message: 'Seeker, your guest allowance is exhausted. Please create an account to seek deeper wisdom.' }
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 questions per IP
  message: { message: 'Your mind must rest. Please wait 15 minutes before seeking further wisdom.' }
});

const rishiLimiter = (req, res, next) => {
  if (req.user) {
    return userLimiter(req, res, next);
  }
  return guestLimiter(req, res, next);
};

router.post('/ask', optionalAuth, rishiLimiter, async (req, res) => {
  const { question } = req.body;

  if (!genAI) {
    return res.status(503).json({ message: 'The Rishi is currently meditating (SDK missing)' });
  }

  try {
    // 1. Fetch entire graph for context
    const characters = await Character.find({});
    const relationships = await Relationship.find({});

    const contextData = {
      lineage: characters.map(c => ({
        name: c.label,
        sanskrit: c.sanskrit,
        type: c.type,
        yuga: c.yuga,
        traits: c.epithets,
        summary: c.desc,
        source: c.source
      })),
      ties: relationships.map(r => ({
        from: r.source,
        to: r.target,
        bond: r.label,
        nature: r.type
      }))
    };

    // 2. Prepare Prime Instruction
    const systemInstruction = `You are a Rishi (Divine Sage) of the Devlok mythological archives.
Answer ONLY based on the provided JSON context of characters and relationships. 
If someone asks about something NOT in the context, politely explain that it is not yet recorded in these scrolls.
Use a wise, grounded tone. Use modern terms if it clarifies ancient wisdom but keep the essence of Dharma.
Keep answers concise yet profound.

[RECORDS]:
${JSON.stringify(contextData, null, 2)}`;

    // 3. Ask Gemini
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent(question);
      const response = await result.response;
      const text = response.text();
      res.json({ answer: text });
    } catch (aiErr) {
      console.error('Gemini Specific Error:', aiErr);
      res.status(502).json({ message: 'The Rishi is currently silent (' + (aiErr.message || 'Model Error') + ')' });
    }
  } catch (error) {
    console.error('Rishi error detailing:', error);
    res.status(500).json({ message: 'The Rishi encountered a disturbance in the ether.' });
  }
});

export default router;
