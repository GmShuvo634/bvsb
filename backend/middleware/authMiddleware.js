// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const DemoSession = require('../models/DemoSession');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'demo') {
      // Handle demo user
      const session = await DemoSession.findOne({ 
        guestId: decoded.sub,
        isActive: true,
        sessionExpiry: { $gt: new Date() }
      });
      
      if (!session) {
        return res.status(401).json({ error: 'Demo session expired' });
      }
      
      // Create a pseudo-user object for demo sessions
      req.user = {
        _id: decoded.sub,
        guestId: decoded.sub,
        type: 'demo',
        isDemo: true,
        balance: session.currentBalance
      };
    } else {
      // Handle regular user
      const user = await User.findById(decoded.sub);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;