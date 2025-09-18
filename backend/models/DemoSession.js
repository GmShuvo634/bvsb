// backend/models/DemoSession.js
const mongoose = require('mongoose');

const demoSessionSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  currentBalance: {
    type: Number,
    default: 1000 // Demo users start with 1000 tokens
  },
  initialBalance: {
    type: Number,
    default: 1000
  },
  totalBets: {
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
  isActive: {
    type: Boolean,
    default: true
  },
  sessionExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for cleanup of expired sessions
demoSessionSchema.index({ sessionExpiry: 1 }, { expireAfterSeconds: 0 });

// Update last activity on save
demoSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('DemoSession', demoSessionSchema);
