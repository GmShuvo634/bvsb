// backend/models/ChatMessage.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema({
  // User identification (supports both authenticated and guest users)
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
  
  // Message content
  message: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  
  // User display info (cached for performance)
  userInfo: {
    username: { type: String, default: 'Anonymous' },
    avatar: { type: String, default: '' },
    country: { type: String, default: '' },
    isDemo: { type: Boolean, default: false }
  },
  
  // Message metadata
  messageType: {
    type: String,
    enum: ['text', 'system', 'announcement'],
    default: 'text'
  },
  
  // Moderation
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date },
  
  // Chat room (for future expansion)
  roomId: { 
    type: String, 
    default: 'global',
    index: true
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ guestId: 1, createdAt: -1 });
chatMessageSchema.index({ isDeleted: 1, createdAt: -1 });

// Virtual for formatted timestamp
chatMessageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Method to get user display name
chatMessageSchema.methods.getDisplayName = function() {
  if (this.userInfo.username && this.userInfo.username !== 'Anonymous') {
    return this.userInfo.username;
  }
  if (this.address) {
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }
  return 'Anonymous';
};

// Static method to get recent messages
chatMessageSchema.statics.getRecentMessages = function(roomId = 'global', limit = 50) {
  return this.find({ 
    roomId, 
    isDeleted: false 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('userId', 'email avatar country')
  .lean();
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
