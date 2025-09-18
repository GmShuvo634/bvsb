// backend/models/GameRound.js
const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['waiting', 'betting', 'playing', 'settling', 'completed'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  bettingEndTime: {
    type: Date
  },
  playEndTime: {
    type: Date
  },
  settleTime: {
    type: Date
  },
  startPrice: {
    type: Number
  },
  endPrice: {
    type: Number
  },
  upPoolTotal: {
    type: Number,
    default: 0
  },
  downPoolTotal: {
    type: Number,
    default: 0
  },
  upPoolPlayers: {
    type: Number,
    default: 0
  },
  downPoolPlayers: {
    type: Number,
    default: 0
  },
  winningPool: {
    type: String,
    enum: ['up', 'down', null],
    default: null
  },
  totalPayout: {
    type: Number,
    default: 0
  },
  houseFee: {
    type: Number,
    default: 0
  },
  // Track all bets in this round
  bets: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestId: { type: String },
    address: { type: String },
    amount: { type: Number },
    direction: { type: String, enum: ['up', 'down'] },
    isDemo: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    payout: { type: Number, default: 0 },
    result: { type: String, enum: ['pending', 'win', 'loss'], default: 'pending' }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
gameRoundSchema.index({ status: 1, createdAt: -1 });
gameRoundSchema.index({ 'bets.userId': 1 });
gameRoundSchema.index({ 'bets.guestId': 1 });

module.exports = mongoose.model('GameRound', gameRoundSchema);
