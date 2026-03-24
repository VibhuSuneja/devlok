import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['correction', 'new_character', 'new_relationship'],
    required: true
  },
  targetId: {
    type: String,
    // e.g., 'krishna' if correcting Krishna. Null if new character.
    default: null
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // If correction: { field: 'desc', oldValue: '...', newValue: '...' }
    // If new char: { id, label, type, size, ... }
  },
  sourceCitation: {
    type: String,
    required: [true, 'A scriptural source citation is strictly required for any submission.'],
    trim: true,
    minlength: [5, 'Please provide a specific textual source (e.g. Mahabharata, Adi Parva).']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminFeedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
