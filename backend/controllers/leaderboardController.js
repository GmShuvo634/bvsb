// backend/controllers/leaderboardController.js
const User = require('../models/userModel');
const GameRound = require('../models/GameRound');
const Trade = require('../models/Trade');
const leaderboardCacheService = require('../services/leaderboardCacheService');
const statsService = require('../services/statsService');

/**
 * Get time-based leaderboard data
 * GET /api/leaderboard?type=today|yesterday|week|month|all
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const type = req.query.type || 'today';
    const limit = parseInt(req.query.limit) || 50;

    if (!['today', 'yesterday', 'week', 'month', 'all'].includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const leaderboardData = await leaderboardCacheService.getLeaderboard(type, limit);

    res.json({
      success: true,
      data: leaderboardData,
      type,
      limit
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
};



// Module exports are handled by the exports.getLeaderboard above
