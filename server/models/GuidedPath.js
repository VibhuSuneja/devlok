import mongoose from 'mongoose';

const GuidedPathStepSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
}, { _id: false });

const GuidedPathSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  thesis: { type: String, required: true },
  description: { type: String, default: '' },
  startNodeId: { type: String, required: true },
  endNodeId: { type: String, required: true },
  steps: { type: [GuidedPathStepSchema], required: true },
  citations: { type: [String], default: [] },
  sourceCitation: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('GuidedPath', GuidedPathSchema);
