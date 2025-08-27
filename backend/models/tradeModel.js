// backend/models/tradeModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tradeSchema = new Schema({
  user:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isUpPool:       { type: Boolean,            required: true },
  bettedBalance:  { type: Number,             required: true },
  result:         { type: Boolean },               // true if win, false if lose
  settledAt:      { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.Trade || mongoose.model('Trade', tradeSchema);

