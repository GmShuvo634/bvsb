// backend/models/userModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance:  { type: Number, default: 0 },
  address:  { type: String, default: '' },
  isAdmin:  { type: Boolean, default: false },
  // demo/guest fields
  type:     { type: String, enum: ['real', 'demo'], default: 'real' },
  guestId:  { type: String, index: true, sparse: true, unique: false },
  guestOriginalIp: { type: String },
  demoCreatedAt:   { type: Date },
}, { timestamps: true });

// Enable optimistic concurrency to prevent balance races
userSchema.set('optimisticConcurrency', true);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

