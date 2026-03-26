// server/models/GurkulWaitlist.js
import mongoose from 'mongoose';

const GurkulWaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  // Which cohort they're interested in (for future segmentation)
  cohort: {
    type: String,
    default: 'cohort-1',
  },
  // Where they came from
  source: {
    type: String,
    enum: ['gurukul_page', 'concept_page', 'graph_page', 'profile_page', 'other'],
    default: 'gurukul_page',
  },
  // Shraddha user ID if they were logged in (optional link)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Track if we've sent them the confirmation email
  emailSent: {
    type: Boolean,
    default: false,
  },
  // Track if they converted to a paid student
  converted: {
    type: Boolean,
    default: false,
  },
  convertedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Index for fast lookup
GurkulWaitlistSchema.index({ email: 1 });
GurkulWaitlistSchema.index({ createdAt: -1 });

export default mongoose.model('GurkulWaitlist', GurkulWaitlistSchema);
