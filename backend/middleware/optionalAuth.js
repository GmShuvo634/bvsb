// backend/middleware/optionalAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Optional authentication middleware - doesn't require authentication but extracts user info if available
const optionalAuth = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          req.user = user;
        }
      } catch (jwtError) {
        // Invalid token, but we continue without authentication
        console.log('Invalid JWT token in optional auth:', jwtError.message);
      }
    }
    
    // Generate or retrieve guest ID for non-authenticated users
    if (!req.user) {
      // Check for guest ID in headers or generate one
      const guestId = req.headers['x-guest-id'] || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      req.guestId = guestId;
    }
    
    next();
  } catch (error) {
    console.error('Error in optional auth middleware:', error);
    // Continue without authentication on error
    next();
  }
};

module.exports = optionalAuth;
