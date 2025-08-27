// backend/models/candleModel.js
const mongoose = require('mongoose');
const candleSchema = new mongoose.Schema({
  timestamp: { type: Date, unique: true },
  open:      Number,
  high:      Number,
  low:       Number,
  close:     Number,
}, { timestamps: true });
module.exports = mongoose.models.Candle || mongoose.model('Candle', candleSchema);

