// server/models/Dana.js
import mongoose from 'mongoose';

const DanaSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:    { type: Number, required: true }, // in INR
  currency:  { type: String, default: 'INR' },
  status:    { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  orderId:   { type: String, required: true },
  paymentId: { type: String, default: null },
  message:   { type: String, default: null }, // Optional message from donor (Anoshakti)
}, { timestamps: true });

export default mongoose.model('Dana', DanaSchema);
