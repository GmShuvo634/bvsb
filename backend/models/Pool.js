// backend/models/Pool.js
const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
  roundId:    { type: String, index: true },
  upTreasury:   { type: Number, default: 0 },
  downTreasury: { type: Number, default: 0 },
  chainId:      { type: Number },
}, { timestamps: true });

poolSchema.set('optimisticConcurrency', true);

module.exports = mongoose.model('Pool', poolSchema);
