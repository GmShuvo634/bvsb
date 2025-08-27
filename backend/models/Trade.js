// backend/models/Trade.js

const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref:  'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  strikePrice: {
    type: Number,
    required: true,
  },
  direction: {
    type: String,
    enum: ['up', 'down'],
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  startPrice: {
    type: Number,
    required: true,
  },
  result: {
    type: String,
    enum: ['pending', 'win', 'loss'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Trade', TradeSchema);

