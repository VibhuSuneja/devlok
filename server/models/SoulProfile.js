// server/models/SoulProfile.js
// One document per user — the living, evolving soul identity layer

import mongoose from 'mongoose';

const ArchetypeEntrySchema = new mongoose.Schema({
  name:              { type: String },
  assignedAt:        { type: Date },
  confidence:        { type: Number, min: 0, max: 100, default: 30 },
  mythText:          { type: String },
  coreWound:         { type: String },
  emergingStrength:  { type: String }
}, { _id: false });

const SecondaryArchetypeSchema = new mongoose.Schema({
  name:        { type: String },
  unlockedAt:  { type: Date },
  mythText:    { type: String }
}, { _id: false });

const CurrentPhaseSchema = new mongoose.Schema({
  phaseKey:    { type: String },
  phaseLabel:  { type: String },
  enteredAt:   { type: Date },
  resolvedAt:  { type: Date, default: null },
  isActive:    { type: Boolean, default: true }
}, { _id: false });

const PhaseHistoryEntrySchema = new mongoose.Schema({
  phaseKey:         { type: String },
  phaseLabel:       { type: String },
  enteredAt:        { type: Date },
  resolvedAt:       { type: Date },
  reflectionCount:  { type: Number, default: 0 }
}, { _id: false });

const StreakSchema = new mongoose.Schema({
  current:          { type: Number, default: 0 },
  longest:          { type: Number, default: 0 },
  lastReflectedAt:  { type: Date, default: null }
}, { _id: false });

const MilestoneSchema = new mongoose.Schema({
  type:         { type: String },
  achievedAt:   { type: Date, default: Date.now },
  label:        { type: String }
}, { _id: false });

const DimensionsSchema = new mongoose.Schema({
  dharmaClarity:       { type: Number, min: 0, max: 100, default: 50 },
  emotionalDepth:      { type: Number, min: 0, max: 100, default: 50 },
  shadowAwareness:     { type: Number, min: 0, max: 100, default: 50 },
  actionOrientation:   { type: Number, min: 0, max: 100, default: 50 },
  relationshipPattern: { type: Number, min: 0, max: 100, default: 50 }
}, { _id: false });

const SoulProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  primaryArchetype:    { type: ArchetypeEntrySchema,     default: () => ({}) },
  secondaryArchetype:  { type: SecondaryArchetypeSchema, default: () => ({}) },

  currentPhase:  { type: CurrentPhaseSchema,          default: () => ({}) },
  phaseHistory:  { type: [PhaseHistoryEntrySchema],   default: [] },

  streak:       { type: StreakSchema,     default: () => ({}) },
  milestones:   { type: [MilestoneSchema], default: [] },

  // Hidden from user — dimensions drive archetype confidence silently
  dimensions: { type: DimensionsSchema, default: () => ({}) },

  // Track question IDs already answered per phase to avoid repeating
  answeredQuestionIds: { type: [String], default: [] },

  lastCardGeneratedAt: { type: Date, default: null },
  cardVersion:         { type: Number, default: 0 }

}, { timestamps: true });

// Index for fast user lookup
SoulProfileSchema.index({ userId: 1 });

export default mongoose.model('SoulProfile', SoulProfileSchema);
