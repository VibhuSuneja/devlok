// server/models/User.js
// FULL FILE — replaces existing server/models/User.js
// Change: added `gurukul` boolean field to track paid Gurukul access

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  role:         { type: String, enum: ['admin', 'user'], default: 'user' },
  bookmarks:    [{ type: String }],         // array of character IDs
  conceptsRead: [{ type: Number }],         // array of concept date_index values
  shraddha:     { type: Number, default: 0 },
  joinedAt:     { type: Date, default: Date.now },

  // ── Gurukul access ──────────────────────────────────────────────────────
  // True once payment is verified. Kept separate from role so admin/user
  // roles remain clean and Gurukul is just an additive capability.
  gurukul:         { type: Boolean, default: false },
  gurkulPaidAt:    { type: Date, default: null },
  gurkulOrderId:   { type: String, default: null }, // Razorpay order_id for audit
  gurkulPaymentId: { type: String, default: null }, // Razorpay payment_id for audit

}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', UserSchema);
