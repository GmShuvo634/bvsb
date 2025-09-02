// backend/models/LeaderboardEntry.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaderboardEntrySchema = new Schema({
  // Time period and type
  period: {
    type: String,
    enum: ['today', 'yesterday', 'week', 'month', 'all'],
    required: true,
    index: true
  },
  
  periodStart: {
    type: Date,
    required: true,
    index: true
  },
  
  periodEnd: {
    type: Date,
    required: true
  },
  
  // User identification
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  address: { 
    type: String,
    required: true,
    index: true
  },
  
  // Performance metrics
  rank: {
    type: Number,
    required: true,
    index: true
  },
  
  totalGames: {
    type: Number,
    default: 0
  },
  
  totalWins: {
    type: Number,
    default: 0
  },
  
  totalLosses: {
    type: Number,
    default: 0
  },
  
  winRate: {
    type: Number,
    default: 0
  },
  
  totalVolume: {
    type: Number,
    default: 0
  },
  
  totalPayout: {
    type: Number,
    default: 0
  },
  
  netProfit: {
    type: Number,
    default: 0
  },
  
  biggestWin: {
    type: Number,
    default: 0
  },
  
  currentStreak: {
    type: Number,
    default: 0
  },
  
  bestStreak: {
    type: Number,
    default: 0
  },
  
  averageBetSize: {
    type: Number,
    default: 0
  },
  
  // Metadata
  lastActivity: {
    type: Date
  },
  
  // Cache control
  cacheExpiry: {
    type: Date,
    required: true,
    index: true
  },
  
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
leaderboardEntrySchema.index({ period: 1, rank: 1 });
leaderboardEntrySchema.index({ period: 1, totalWins: -1 });
leaderboardEntrySchema.index({ period: 1, winRate: -1 });
leaderboardEntrySchema.index({ period: 1, netProfit: -1 });
leaderboardEntrySchema.index({ period: 1, totalVolume: -1 });

// TTL index to automatically clean up expired cache entries
leaderboardEntrySchema.index({ cacheExpiry: 1 }, { expireAfterSeconds: 0 });

// Static methods for cache management
leaderboardEntrySchema.statics.invalidateCache = function(period) {
  return this.updateMany(
    { period, isValid: true },
    { isValid: false }
  );
};

leaderboardEntrySchema.statics.getCachedLeaderboard = function(period, limit = 50) {
  return this.find({
    period,
    isValid: true,
    cacheExpiry: { $gt: new Date() }
  })
  .sort({ rank: 1 })
  .limit(limit);
};

leaderboardEntrySchema.statics.isCacheValid = function(period) {
  return this.findOne({
    period,
    isValid: true,
    cacheExpiry: { $gt: new Date() }
  });
};

module.exports = mongoose.models.LeaderboardEntry || mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
