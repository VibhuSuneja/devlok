// server/models/Reflection.js
// One document per daily reflection submitted by a user
// interpretation is populated ASYNC — never blocks the response

import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text:            { type: String, required: true },
  archetypeRef:    { type: String },
  phaseRef:        { type: String },
  dimensionTarget: { type: String },
  mythContext:     { type: String }
}, { _id: false });

const AnswerSchema = new mongoose.Schema({
  text:        { type: String, required: true },
  wordCount:   { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const DimensionDeltasSchema = new mongoose.Schema({
  dharmaClarity:       { type: Number, default: 0 },
  emotionalDepth:      { type: Number, default: 0 },
  shadowAwareness:     { type: Number, default: 0 },
  actionOrientation:   { type: Number, default: 0 },
  relationshipPattern: { type: Number, default: 0 }
}, { _id: false });

const InterpretationSchema = new mongoose.Schema({
  mythologicalMirror: { type: String },
  insight:            { type: String },
  dimensionDeltas:    { type: DimensionDeltasSchema, default: () => ({}) },
  generatedAt:        { type: Date },
  model:              { type: String }
}, { _id: false });

const ReflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  soulProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SoulProfile',
    required: true
  },

  // The question that was shown
  question: { type: QuestionSchema, required: true },

  // User's raw answer
  answer: { type: AnswerSchema, required: true },

  // AI interpretation — null until async generation completes
  interpretation: { type: InterpretationSchema, default: null },

  // Whether this reflection triggered a profile update
  triggeredProfileUpdate: { type: Boolean, default: false },

  // Convenience date field (date-only comparison for streak logic)
  reflectedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Indexes for common queries
ReflectionSchema.index({ userId: 1, reflectedAt: -1 });
ReflectionSchema.index({ soulProfileId: 1, reflectedAt: -1 });

export default mongoose.model('Reflection', ReflectionSchema);
