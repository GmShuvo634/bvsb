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
  type:     { type: String, enum: ['real', 'demo'], default: 'real' },

  // User Statistics
  stats: {
    totalBets: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 }, // Total amount bet
    totalProfit: { type: Number, default: 0 }, // Net profit/loss
    biggestWin: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 }, // Current win/loss streak
    bestStreak: { type: Number, default: 0 }, // Best win streak
    lastBetDate: { type: Date },
    averageBetSize: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Enable optimistic concurrency to prevent balance races
userSchema.set('optimisticConcurrency', true);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

