// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get user statistics (requires authentication)
router.get('/user', authMiddleware, statsController.getUserStats);

// Get leaderboard (public endpoint)
router.get('/leaderboard', statsController.getLeaderboard);

// Get user ranking (requires authentication)
router.get('/ranking', authMiddleware, statsController.getUserRanking);

// Get global statistics (public endpoint)
router.get('/global', statsController.getGlobalStats);

module.exports = router;

