import mongoose from 'mongoose';

const RelationshipSchema = new mongoose.Schema({
  source: { type: String, required: true },
  target: { type: String, required: true },
  label:  { type: String, required: true },
  type: {
    type: String,
    enum: ['family', 'divine', 'conflict', 'guru', 'alliance', 'manifestation'],
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

RelationshipSchema.index({ source: 1 });
RelationshipSchema.index({ target: 1 });

export default mongoose.model('Relationship', RelationshipSchema);
