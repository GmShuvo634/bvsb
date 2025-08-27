// backend/models/roundModel.js
const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  open:      { type: Number, required: true },
  high:      { type: Number, required: true },
  low:       { type: Number, required: true },
  close:     { type: Number, required: true },
  startedAt: { type: Date,   default: Date.now },
  settledAt: { type: Date },
}, {
  timestamps: true,
  collection: 'rounds'   // make sure this matches the name you see in Mongo
});

module.exports = mongoose.models.Round || mongoose.model('Round', roundSchema);
