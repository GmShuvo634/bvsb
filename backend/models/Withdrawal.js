// backend/models/Withdrawal.js
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);

