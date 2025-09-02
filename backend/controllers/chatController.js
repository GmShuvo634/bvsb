// backend/controllers/chatController.js
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/userModel');
const bus = require('../sockets/bus');

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 10; // Max messages per minute

// Profanity filter (basic implementation)
const PROFANITY_WORDS = ['spam', 'scam', 'hack']; // Add more as needed

function isProfane(text) {
  const lowerText = text.toLowerCase();
  return PROFANITY_WORDS.some(word => lowerText.includes(word));
}

function checkRateLimit(identifier) {
  const now = Date.now();
  const userLimits = rateLimitStore.get(identifier) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  if (userLimits.count >= RATE_LIMIT_MAX_MESSAGES) {
    return false;
  }
  
  userLimits.count++;
  rateLimitStore.set(identifier, userLimits);
  return true;
}

// Get recent chat messages
exports.getMessages = async (req, res) => {
  try {
    const { roomId = 'global', limit = 50 } = req.query;
    
    const messages = await ChatMessage.getRecentMessages(roomId, parseInt(limit));
    
    // Reverse to get chronological order (oldest first)
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id,
      message: msg.message,
      avatar: msg.userInfo.avatar,
      username: msg.userInfo.username || (msg.address ? `${msg.address.slice(0, 6)}...${msg.address.slice(-4)}` : 'Anonymous'),
      timestamp: msg.createdAt,
      isDemo: msg.userInfo.isDemo,
      country: msg.userInfo.country
    }));
    
    res.json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Send a chat message
exports.sendMessage = async (req, res) => {
  try {
    const { message, roomId = 'global' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }
    
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 500 characters)'
      });
    }
    
    // Get user info from request (set by auth middleware)
    const userId = req.user?.id;
    const guestId = req.guestId;
    const address = req.user?.address || req.body.address;
    
    // Rate limiting
    const identifier = userId || guestId || address || req.ip;
    if (!checkRateLimit(identifier)) {
      return res.status(429).json({
        success: false,
        error: 'Too many messages. Please wait before sending another message.'
      });
    }
    
    // Basic profanity filter
    if (isProfane(message)) {
      return res.status(400).json({
        success: false,
        error: 'Message contains inappropriate content'
      });
    }
    
    // Get user info for display
    let userInfo = {
      username: 'Anonymous',
      avatar: '',
      country: '',
      isDemo: false
    };
    
    if (userId) {
      const user = await User.findById(userId).select('email avatar country type');
      if (user) {
        userInfo = {
          username: user.email?.split('@')[0] || 'User',
          avatar: user.avatar || '',
          country: user.country || '',
          isDemo: user.type === 'demo'
        };
      }
    }
    
    // Create chat message
    const chatMessage = new ChatMessage({
      userId,
      guestId,
      address,
      message: message.trim(),
      userInfo,
      roomId
    });
    
    await chatMessage.save();
    
    // Broadcast message to all connected clients
    const broadcastData = {
      id: chatMessage._id,
      message: chatMessage.message,
      avatar: userInfo.avatar,
      username: userInfo.username,
      timestamp: chatMessage.createdAt,
      isDemo: userInfo.isDemo,
      country: userInfo.country
    };
    
    bus.broadcast('chatMessage', broadcastData);
    
    res.json({
      success: true,
      data: broadcastData
    });
    
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// Delete a message (admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    message.isDeleted = true;
    message.deletedBy = userId;
    message.deletedAt = new Date();
    await message.save();
    
    // Broadcast message deletion
    bus.broadcast('chatMessageDeleted', { messageId });
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
};

// Get chat statistics (admin only)
exports.getChatStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const stats = await ChatMessage.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          deletedMessages: { $sum: { $cond: ['$isDeleted', 1, 0] } },
          uniqueUsers: { $addToSet: { $ifNull: ['$userId', '$guestId'] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalMessages: stats[0]?.totalMessages || 0,
        deletedMessages: stats[0]?.deletedMessages || 0,
        uniqueUsers: stats[0]?.uniqueUsers?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat statistics'
    });
  }
};
