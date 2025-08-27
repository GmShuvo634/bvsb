// backend/models/userModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance:  { type: Number, default: 0 },
  address:  { type: String, default: '' },
  isAdmin:  { type: Boolean, default: false },
  avatar:   { type: String, default: '' },
  country:  { type: String, default: '' },
}, { timestamps: true });

// Enable optimistic concurrency to prevent balance races
userSchema.set('optimisticConcurrency', true);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

