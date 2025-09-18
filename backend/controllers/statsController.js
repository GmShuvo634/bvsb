// backend/controllers/statsController.js
const statsService = require('../services/statsService');

/**
 * Get user statistics
 * GET /api/stats/user
 */
exports.getUserStats = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if this is a demo user
    const isDemo = req.user.type === 'demo' || req.user.isDemo;
    const userId = isDemo ? (req.user.guestId || req.user._id) : req.user._id;

    const stats = await statsService.getUserStats(userId, isDemo);

    if (!stats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    next(error);
  }
};

/**
 * Get leaderboard
 * GET /api/stats/leaderboard?type=profit&limit=10
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const type = req.query.type || 'profit'; // profit, volume, winrate, streak
    const limit = parseInt(req.query.limit) || 10;

    if (!['profit', 'volume', 'winrate', 'streak'].includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const leaderboard = await statsService.getLeaderboard(type, limit);

    res.json({
      type,
      limit,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    next(error);
  }
};

/**
 * Get user ranking in leaderboard
 * GET /api/stats/ranking?type=profit
 */
exports.getUserRanking = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Demo users don't participate in leaderboards
    if (req.user.type === 'demo' || req.user.isDemo) {
      return res.json({
        rank: null,
        message: 'Demo users are not included in leaderboards'
      });
    }

    const type = req.query.type || 'profit';
    const userId = req.user._id;

    if (!['profit', 'volume', 'winrate', 'streak'].includes(type)) {
      return res.status(400).json({ error: 'Invalid ranking type' });
    }

    // Get full leaderboard to find user's position
    const leaderboard = await statsService.getLeaderboard(type, 1000); // Get top 1000
    const userRank = leaderboard.findIndex(entry =>
      entry.email.includes(req.user.email.substring(0, 3))
    ) + 1;

    const userStats = await statsService.getUserStats(userId, false);

    res.json({
      rank: userRank || null,
      totalUsers: leaderboard.length,
      userStats,
      type
    });
  } catch (error) {
    console.error('Get user ranking error:', error);
    next(error);
  }
};

/**
 * Get global statistics
 * GET /api/stats/global
 */
exports.getGlobalStats = async (req, res, next) => {
  try {
    const User = require('../models/userModel');
    const GameRound = require('../models/GameRound');

    // Get global statistics
    const [userStats, roundStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalVolume: { $sum: '$stats.totalVolume' },
            totalProfit: { $sum: '$stats.totalProfit' },
            totalBets: { $sum: '$stats.totalBets' },
            totalWins: { $sum: '$stats.totalWins' }
          }
        }
      ]),
      GameRound.aggregate([
        {
          $group: {
            _id: null,
            totalRounds: { $sum: 1 },
            totalBetsPlaced: { $sum: { $size: '$bets' } }
          }
        }
      ])
    ]);

    const userStat = userStats[0] || {};
    const roundStat = roundStats[0] || {};

    const globalWinRate = userStat.totalBets > 0
      ? Math.round((userStat.totalWins / userStat.totalBets) * 100)
      : 0;

    res.json({
      totalUsers: userStat.totalUsers || 0,
      totalVolume: userStat.totalVolume || 0,
      totalProfit: userStat.totalProfit || 0,
      totalBets: userStat.totalBets || 0,
      totalWins: userStat.totalWins || 0,
      totalRounds: roundStat.totalRounds || 0,
      totalBetsPlaced: roundStat.totalBetsPlaced || 0,
      globalWinRate: `${globalWinRate}%`
    });
  } catch (error) {
    console.error('Get global stats error:', error);
    next(error);
  }
};

