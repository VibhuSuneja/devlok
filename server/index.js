import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';
import relationshipRoutes from './routes/relationships.js';
import graphRoutes from './routes/graph.js';
import paymentRoutes from './routes/payments.js';
import userRoutes from './routes/users.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const rawOrigin = process.env.CLIENT_URL?.replace(/\/$/, '');

const allowedOrigins = [
  rawOrigin,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://devlok-three.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Devlok API running 🕉' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Devlok server listening on port ${PORT}`));

// Keep-alive for Render free tier (14 min interval)
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(process.env.RENDER_EXTERNAL_URL + '/').catch(() => {});
  }, 14 * 60 * 1000);
}

export default app;
