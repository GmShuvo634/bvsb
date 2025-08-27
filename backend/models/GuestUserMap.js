// backend/models/GuestUserMap.js
const mongoose = require('mongoose');

const guestUserMapSchema = new mongoose.Schema({
  guestId: { type: String, required: true, index: true, unique: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.models.GuestUserMap || mongoose.model('GuestUserMap', guestUserMapSchema);
