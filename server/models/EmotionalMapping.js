// server/models/EmotionalMapping.js
// Maps human emotional states to relevant shlokas, characters, and concepts
// Used by Rishi AI for Graph-RAG grounded retrieval

import mongoose from 'mongoose';

const ShlokaRefSchema = new mongoose.Schema({
  text:        { type: String, required: true },
  translation: { type: String, required: true },
  source:      { type: String, required: true },
  insight:     { type: String },
}, { _id: false });

const EmotionalMappingSchema = new mongoose.Schema({
  emotion: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  synonyms: { type: [String], default: [] },
  characterRefs: { type: [String], default: [] },
  conceptRefs: { type: [String], default: [] },
  shlokas: { type: [ShlokaRefSchema], default: [] },
  rishiGuidanceHint: { type: String, default: '' },
}, { timestamps: true });

EmotionalMappingSchema.index({ synonyms: 1 });

export default mongoose.model('EmotionalMapping', EmotionalMappingSchema);
