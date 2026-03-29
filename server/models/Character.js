import mongoose from 'mongoose';

const CharacterSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  label:    { type: String, required: true },
  sanskrit: { type: String },
  type: {
    type: String,
    enum: ['deva', 'devi', 'hero', 'sage', 'asura', 'celestial', 'avatar', 'darshana'],
    required: true,
  },
  size:   { type: Number, default: 14 },
  filter: {
    type: String,
    enum: ['mahabharata', 'ramayana', 'purana', 'vedic', 'philosophical'],
    required: true,
  },
  yuga: {
    type: String,
    enum: ['eternal', 'satya', 'treta', 'dvapara', 'kali'],
    required: true,
  },
  epithets:  [String],
  desc:      { type: String },
  source:    { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

CharacterSchema.index({ type: 1 });
CharacterSchema.index({ yuga: 1 });
CharacterSchema.index({ filter: 1 });

export default mongoose.model('Character', CharacterSchema);
