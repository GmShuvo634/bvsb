// backend/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance:  { type: Number, default: 0 },
  address:  { type: String, default: '' },
  isAdmin:  { type: Boolean, default: false },
}, { timestamps: true });

// Avoid OverwriteModelError on hot‑reload / multiple requires:
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

