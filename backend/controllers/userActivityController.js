// backend/controllers/userActivityController.js
const userActivityService = require('../services/userActivityService');
const statsService = require('../services/statsService');

/**
 * Get user activity history
 * GET /api/user/activity?limit=50&skip=0&type=trade_placed&startDate=2024-01-01&endDate=2024-12-31
 */
exports.getUserActivity = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      limit = 50,
      skip = 0,
      type: activityType,
      startDate,
      endDate,
      status
    } = req.query;

    // Determine user identifier
    const isDemo = req.user.type === 'demo' || req.user.isDemo;
    const identifier = isDemo 
      ? { guestId: req.user.guestId || req.user._id }
      : { userId: req.user._id };

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      activityType,
      startDate,
      endDate,
      status
    };

    const activities = await userActivityService.getUserActivity(identifier, options);

    res.json({
      success: true,
      data: activities,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Server error fetching user activity' });
  }
};

/**
 * Get user activity statistics
 * GET /api/user/activity/stats?timeRange=today|week|month|all
 */
exports.getUserActivityStats = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { timeRange = 'all' } = req.query;

    // Determine user identifier
    const isDemo = req.user.type === 'demo' || req.user.isDemo;
    const identifier = isDemo 
      ? { guestId: req.user.guestId || req.user._id }
      : { userId: req.user._id };

    const stats = await userActivityService.getUserActivityStats(identifier, timeRange);

    res.json({
      success: true,
      data: stats,
      timeRange
    });
  } catch (error) {
    console.error('Get user activity stats error:', error);
    res.status(500).json({ error: 'Server error fetching activity stats' });
  }
};

/**
 * Get user's trade history with enhanced details
 * GET /api/user/trades?limit=50&skip=0&status=win|loss|pending
 */
exports.getUserTrades = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      limit = 50,
      skip = 0,
      status,
      startDate,
      endDate
    } = req.query;

    // Get trade activities
    const isDemo = req.user.type === 'demo' || req.user.isDemo;
    const identifier = isDemo 
      ? { guestId: req.user.guestId || req.user._id }
      : { userId: req.user._id };

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      activityType: 'trade_placed',
      startDate,
      endDate
    };

    const tradeActivities = await userActivityService.getUserActivity(identifier, options);

    // Format trade data for frontend
    const trades = tradeActivities.map(activity => ({
      id: activity._id,
      tradeId: activity.metadata?.tradeId,
      amount: activity.metadata?.amount || 0,
      direction: activity.metadata?.direction,
      result: activity.metadata?.result || 'pending',
      payout: activity.metadata?.payout || 0,
      entryPrice: activity.metadata?.entryPrice,
      exitPrice: activity.metadata?.exitPrice,
      strikePrice: activity.metadata?.strikePrice,
      timestamp: activity.timestamp,
      status: activity.status,
      balanceChange: activity.metadata?.balanceChange || 0
    }));

    // Filter by status if provided
    const filteredTrades = status 
      ? trades.filter(trade => trade.result === status)
      : trades;

    res.json({
      success: true,
      data: filteredTrades,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: filteredTrades.length
      }
    });
  } catch (error) {
    console.error('Get user trades error:', error);
    res.status(500).json({ error: 'Server error fetching user trades' });
  }
};

/**
 * Get user's betting history with enhanced details
 * GET /api/user/bets?limit=50&skip=0&status=win|loss|pending
 */
exports.getUserBets = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      limit = 50,
      skip = 0,
      status,
      startDate,
      endDate
    } = req.query;

    // Get bet activities
    const isDemo = req.user.type === 'demo' || req.user.isDemo;
    const identifier = isDemo 
      ? { guestId: req.user.guestId || req.user._id }
      : { userId: req.user._id };

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      activityType: 'bet_placed',
      startDate,
      endDate
    };

    const betActivities = await userActivityService.getUserActivity(identifier, options);

    // Format bet data for frontend
    const bets = betActivities.map(activity => ({
      id: activity._id,
      betId: activity.metadata?.betId,
      roundId: activity.metadata?.roundId,
      amount: activity.metadata?.amount || 0,
      direction: activity.metadata?.direction,
      result: activity.metadata?.result || 'pending',
      payout: activity.metadata?.payout || 0,
      timestamp: activity.timestamp,
      status: activity.status,
      balanceChange: activity.metadata?.balanceChange || 0
    }));

    // Filter by status if provided
    const filteredBets = status 
      ? bets.filter(bet => bet.result === status)
      : bets;

    res.json({
      success: true,
      data: filteredBets,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: filteredBets.length
      }
    });
  } catch (error) {
    console.error('Get user bets error:', error);
    res.status(500).json({ error: 'Server error fetching user bets' });
  }
};

/**
 * Get comprehensive user statistics
 * GET /api/user/stats
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

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Server error fetching user stats' });
  }
};

/**
 * Log user activity (for tracking user actions)
 * POST /api/user/activity
 */
exports.logUserActivity = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { activityType, metadata = {} } = req.body;

    if (!activityType) {
      return res.status(400).json({ error: 'Activity type is required' });
    }

    // Determine user identifier
    const isDemo = req.user.type === 'demo' || req.user.isDemo;
    const activityData = {
      activityType,
      metadata: {
        ...metadata,
        source: 'web',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    };

    if (isDemo) {
      activityData.guestId = req.user.guestId || req.user._id;
    } else {
      activityData.userId = req.user._id;
      activityData.address = req.user.address;
    }

    const activity = await userActivityService.logActivity(activityData);

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Log user activity error:', error);
    res.status(500).json({ error: 'Server error logging activity' });
  }
};
