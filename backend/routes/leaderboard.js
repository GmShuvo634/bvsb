// backend/routes/leaderboard.js
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Get time-based leaderboard (public endpoint)
// GET /api/leaderboard?type=today|yesterday|week|month|all&limit=50
router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
