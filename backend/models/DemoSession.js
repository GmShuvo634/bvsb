// backend/models/DemoSession.js
const mongoose = require('mongoose');

const demoSessionSchema = new mongoose.Schema({
  guestId: { 
    type: String, 
    required: true, 
    index: true, 
    unique: true 
  },
  ipAddress: { 
    type: String, 
    required: true,
    index: true 
  },
  userAgent: { 
    type: String 
  },
  initialBalance: { 
    type: Number, 
    default: 1000 
  },
  currentBalance: { 
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
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  sessionExpiry: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  // Track if user has registered to prevent multiple demo accounts
  hasRegistered: { 
    type: Boolean, 
    default: false 
  },
  registeredUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

// Index for cleanup of expired sessions
demoSessionSchema.index({ sessionExpiry: 1 }, { expireAfterSeconds: 0 });

// Index for IP-based tracking
demoSessionSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model('DemoSession', demoSessionSchema);