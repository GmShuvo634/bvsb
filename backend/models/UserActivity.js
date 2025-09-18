// backend/models/UserActivity.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userActivitySchema = new Schema({
  // User identification
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  guestId: { 
    type: String,
    index: true
  },
  address: { 
    type: String,
    index: true
  },
  
  // Activity details
  activityType: {
    type: String,
    enum: [
      'login',
      'logout', 
      'trade_placed',
      'trade_settled',
      'bet_placed',
      'bet_settled',
      'deposit',
      'withdrawal',
      'balance_update',
      'profile_update',
      'demo_start',
      'demo_reset'
    ],
    required: true,
    index: true
  },
  
  // Activity metadata
  metadata: {
    // Trade/Bet specific
    tradeId: { type: Schema.Types.ObjectId },
    betId: { type: Schema.Types.ObjectId },
    roundId: { type: String },
    amount: { type: Number },
    direction: { type: String, enum: ['up', 'down'] },
    result: { type: String, enum: ['pending', 'win', 'loss'] },
    payout: { type: Number },
    
    // Price data
    entryPrice: { type: Number },
    exitPrice: { type: Number },
    strikePrice: { type: Number },
    
    // Balance changes
    balanceBefore: { type: Number },
    balanceAfter: { type: Number },
    balanceChange: { type: Number },
    
    // Session info
    sessionId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    
    // Additional context
    source: { type: String }, // 'web', 'mobile', 'api'
    referrer: { type: String },
    notes: { type: String }
  },
  
  // Timing
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  
  // Error information (if applicable)
  error: {
    code: { type: String },
    message: { type: String }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ guestId: 1, timestamp: -1 });
userActivitySchema.index({ address: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ 'metadata.roundId': 1, timestamp: -1 });

// TTL index to automatically delete old activities after 1 year
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.models.UserActivity || mongoose.model('UserActivity', userActivitySchema);
