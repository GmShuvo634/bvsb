// backend/routes/bet.js
const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');
const authMiddleware = require('../middleware/authMiddleware');

// Optional auth middleware - allows both authenticated and demo users
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // No token provided, continue as guest/demo
    return next();
  }

  // Try to authenticate if token is provided
  authMiddleware(req, res, (err) => {
    // Continue regardless of auth result for demo support
    next();
  });
};

// Place a bet (supports both real and demo users)
router.post('/place', optionalAuth, betController.placeBet);

// Get current round information
router.get('/round', betController.getCurrentRound);

// Get betting history
router.get('/history', optionalAuth, betController.getBetHistory);

// Get user balance
router.get('/balance', optionalAuth, betController.getBalance);

// Settle round (admin only)
router.post('/settle', authMiddleware, betController.settleRound);

module.exports = router;