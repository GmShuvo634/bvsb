// backend/middleware/adminAuth.js

// Assumes req.user is already set by authenticate middleware
module.exports = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
};

