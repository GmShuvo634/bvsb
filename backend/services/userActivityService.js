// backend/services/userActivityService.js
const UserActivity = require('../models/UserActivity');
const User = require('../models/userModel');
const DemoSession = require('../models/DemoSession');

class UserActivityService {
  /**
   * Log user activity
   */
  async logActivity(activityData) {
    try {
      const {
        userId,
        guestId,
        address,
        activityType,
        metadata = {},
        status = 'success',
        error = null
      } = activityData;

      // Validate required fields
      if (!activityType) {
        throw new Error('Activity type is required');
      }

      if (!userId && !guestId && !address) {
        throw new Error('At least one identifier (userId, guestId, or address) is required');
      }

      const activity = new UserActivity({
        userId,
        guestId,
        address,
        activityType,
        metadata,
        status,
        error,
        timestamp: new Date()
      });

      await activity.save();
      console.log(`Activity logged: ${activityType} for ${userId || guestId || address}`);
      
      return activity;
    } catch (error) {
      console.error('Log activity error:', error);
      throw error;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(identifier, options = {}) {
    try {
      const {
        limit = 50,
        skip = 0,
        activityType,
        startDate,
        endDate,
        status
      } = options;

      // Build query based on identifier type
      let query = {};
      if (identifier.userId) {
        query.userId = identifier.userId;
      } else if (identifier.guestId) {
        query.guestId = identifier.guestId;
      } else if (identifier.address) {
        query.address = identifier.address;
      } else {
        throw new Error('Invalid identifier provided');
      }

      // Add filters
      if (activityType) {
        query.activityType = activityType;
      }

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const activities = await UserActivity.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);

      return activities;
    } catch (error) {
      console.error('Get user activity error:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics for a user
   */
  async getUserActivityStats(identifier, timeRange = 'all') {
    try {
      let query = {};
      if (identifier.userId) {
        query.userId = identifier.userId;
      } else if (identifier.guestId) {
        query.guestId = identifier.guestId;
      } else if (identifier.address) {
        query.address = identifier.address;
      }

      // Add time range filter
      if (timeRange !== 'all') {
        const dateRange = this.getDateRange(timeRange);
        query.timestamp = dateRange;
      }

      const stats = await UserActivity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: '$count' },
            activityBreakdown: {
              $push: {
                type: '$_id',
                count: '$count',
                lastActivity: '$lastActivity'
              }
            },
            lastActivity: { $max: '$lastActivity' }
          }
        }
      ]);

      return stats[0] || {
        totalActivities: 0,
        activityBreakdown: [],
        lastActivity: null
      };
    } catch (error) {
      console.error('Get user activity stats error:', error);
      throw error;
    }
  }

  /**
   * Log trade activity
   */
  async logTradeActivity(userId, guestId, address, tradeData, activityType = 'trade_placed') {
    try {
      const metadata = {
        tradeId: tradeData.tradeId || tradeData._id,
        amount: tradeData.amount,
        direction: tradeData.direction,
        strikePrice: tradeData.strikePrice,
        entryPrice: tradeData.startPrice,
        balanceBefore: tradeData.balanceBefore,
        balanceAfter: tradeData.balanceAfter,
        balanceChange: tradeData.balanceChange || -tradeData.amount
      };

      if (tradeData.result) {
        metadata.result = tradeData.result;
      }

      if (tradeData.payout) {
        metadata.payout = tradeData.payout;
      }

      return await this.logActivity({
        userId,
        guestId,
        address,
        activityType,
        metadata
      });
    } catch (error) {
      console.error('Log trade activity error:', error);
      throw error;
    }
  }

  /**
   * Log bet activity
   */
  async logBetActivity(userId, guestId, address, betData, activityType = 'bet_placed') {
    try {
      const metadata = {
        betId: betData.betId,
        roundId: betData.roundId,
        amount: betData.amount,
        direction: betData.direction,
        balanceBefore: betData.balanceBefore,
        balanceAfter: betData.balanceAfter,
        balanceChange: betData.balanceChange || -betData.amount
      };

      if (betData.result) {
        metadata.result = betData.result;
      }

      if (betData.payout) {
        metadata.payout = betData.payout;
      }

      return await this.logActivity({
        userId,
        guestId,
        address,
        activityType,
        metadata
      });
    } catch (error) {
      console.error('Log bet activity error:', error);
      throw error;
    }
  }

  /**
   * Get date range for time-based queries
   */
  getDateRange(timeRange) {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      
      case 'week':
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        startDate = startOfWeek;
        endDate = new Date();
        break;
      
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      
      default:
        startDate = new Date(0);
        endDate = new Date();
        break;
    }

    return {
      $gte: startDate,
      $lt: endDate
    };
  }

  /**
   * Clean up old activities (called by cron job)
   */
  async cleanupOldActivities(daysToKeep = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await UserActivity.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      console.log(`Cleaned up ${result.deletedCount} old activity records`);
      return result;
    } catch (error) {
      console.error('Cleanup old activities error:', error);
      throw error;
    }
  }
}

module.exports = new UserActivityService();
