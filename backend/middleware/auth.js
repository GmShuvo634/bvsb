// backend/middleware/auth.js
require('dotenv').config();
const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // <-- use payload._id, not payload.id
    const user = await User.findById(payload._id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth };

