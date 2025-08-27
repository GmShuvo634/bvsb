// backend/services/leaderboardCacheService.js
const LeaderboardEntry = require('../models/LeaderboardEntry');
const User = require('../models/userModel');
const GameRound = require('../models/GameRound');

class LeaderboardCacheService {
  /**
   * Get cached leaderboard or generate new one
   */
  async getLeaderboard(period, limit = 50, forceRefresh = false) {
    try {
      // Check if cache is valid and not forcing refresh
      if (!forceRefresh) {
        const cachedData = await LeaderboardEntry.getCachedLeaderboard(period, limit);
        if (cachedData && cachedData.length > 0) {
          console.log(`Returning cached leaderboard for ${period}`);
          return this.formatLeaderboardData(cachedData);
        }
      }

      // Generate new leaderboard data
      console.log(`Generating new leaderboard for ${period}`);
      const leaderboardData = await this.generateLeaderboard(period, limit);
      
      // Cache the results
      await this.cacheLeaderboard(period, leaderboardData);
      
      return leaderboardData;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Generate leaderboard data from GameRound bets
   */
  async generateLeaderboard(period, limit) {
    try {
      const dateRange = this.getDateRange(period);
      
      // Aggregate user performance from GameRound bets within the date range
      const pipeline = [
        {
          $match: {
            createdAt: dateRange,
            'bets.0': { $exists: true } // Only rounds with bets
          }
        },
        {
          $unwind: '$bets'
        },
        {
          $match: {
            'bets.userId': { $exists: true, $ne: null }, // Only real users, not demo
            'bets.result': { $in: ['win', 'loss'] } // Only settled bets
          }
        },
        {
          $group: {
            _id: '$bets.userId',
            totalGames: { $sum: 1 },
            totalWins: {
              $sum: {
                $cond: [{ $eq: ['$bets.result', 'win'] }, 1, 0]
              }
            },
            totalLosses: {
              $sum: {
                $cond: [{ $eq: ['$bets.result', 'loss'] }, 1, 0]
              }
            },
            totalVolume: { $sum: '$bets.amount' },
            totalPayout: { $sum: '$bets.payout' },
            biggestWin: { $max: '$bets.payout' },
            lastActivity: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $addFields: {
            winRate: {
              $cond: [
                { $gt: ['$totalGames', 0] },
                { $multiply: [{ $divide: ['$totalWins', '$totalGames'] }, 100] },
                0
              ]
            },
            netProfit: { $subtract: ['$totalPayout', '$totalVolume'] },
            averageBetSize: {
              $cond: [
                { $gt: ['$totalGames', 0] },
                { $divide: ['$totalVolume', '$totalGames'] },
                0
              ]
            }
          }
        },
        {
          $sort: { totalWins: -1, winRate: -1, totalGames: -1 }
        },
        {
          $limit: limit
        }
      ];

      const results = await GameRound.aggregate(pipeline);
      
      // Format results and add ranks
      const formattedResults = results.map((result, index) => ({
        rank: index + 1,
        userId: result._id,
        address: result.user.address || 'Unknown',
        player: {
          address: result.user.address || 'Unknown'
        },
        totalGames: result.totalGames,
        totalWins: result.totalWins,
        totalLosses: result.totalLosses,
        winRate: Math.round(result.winRate * 100) / 100,
        totalVolume: result.totalVolume,
        totalPayout: result.totalPayout,
        netProfit: result.netProfit,
        biggestWin: result.biggestWin || 0,
        averageBetSize: Math.round(result.averageBetSize * 100) / 100,
        lastActivity: result.lastActivity
      }));

      // If no results from GameRound, fall back to user stats
      if (formattedResults.length === 0) {
        return await this.getFallbackLeaderboard(period, limit);
      }

      return formattedResults;
    } catch (error) {
      console.error('Generate leaderboard error:', error);
      // Fall back to user stats if aggregation fails
      return await this.getFallbackLeaderboard(period, limit);
    }
  }

  /**
   * Fallback leaderboard using user stats
   */
  async getFallbackLeaderboard(period, limit) {
    try {
      const users = await User.find({ 
        'stats.totalBets': { $gt: 0 },
        address: { $exists: true, $ne: '' }
      })
      .select('address stats')
      .sort({ 'stats.totalWins': -1, 'stats.totalProfit': -1 })
      .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        address: user.address,
        player: {
          address: user.address
        },
        totalGames: user.stats?.totalBets || 0,
        totalWins: user.stats?.totalWins || 0,
        totalLosses: user.stats?.totalLosses || 0,
        winRate: user.stats?.totalBets > 0 
          ? Math.round((user.stats.totalWins / user.stats.totalBets) * 100 * 100) / 100
          : 0,
        totalVolume: user.stats?.totalVolume || 0,
        netProfit: user.stats?.totalProfit || 0,
        biggestWin: user.stats?.biggestWin || 0,
        averageBetSize: user.stats?.averageBetSize || 0,
        lastActivity: user.stats?.lastBetDate
      }));
    } catch (error) {
      console.error('Fallback leaderboard error:', error);
      return [];
    }
  }

  /**
   * Cache leaderboard data
   */
  async cacheLeaderboard(period, leaderboardData) {
    try {
      // Invalidate existing cache for this period
      await LeaderboardEntry.invalidateCache(period);

      const { periodStart, periodEnd } = this.getPeriodBounds(period);
      const cacheExpiry = this.getCacheExpiry(period);

      // Create new cache entries
      const cacheEntries = leaderboardData.map(entry => ({
        period,
        periodStart,
        periodEnd,
        userId: entry.userId,
        address: entry.address,
        rank: entry.rank,
        totalGames: entry.totalGames,
        totalWins: entry.totalWins,
        totalLosses: entry.totalLosses,
        winRate: entry.winRate,
        totalVolume: entry.totalVolume,
        totalPayout: entry.totalPayout || 0,
        netProfit: entry.netProfit,
        biggestWin: entry.biggestWin,
        averageBetSize: entry.averageBetSize,
        lastActivity: entry.lastActivity,
        cacheExpiry,
        isValid: true
      }));

      if (cacheEntries.length > 0) {
        await LeaderboardEntry.insertMany(cacheEntries);
        console.log(`Cached ${cacheEntries.length} leaderboard entries for ${period}`);
      }
    } catch (error) {
      console.error('Cache leaderboard error:', error);
      // Don't throw error - caching failure shouldn't break the API
    }
  }

  /**
   * Format cached leaderboard data for API response
   */
  formatLeaderboardData(cachedEntries) {
    return cachedEntries.map(entry => ({
      rank: entry.rank,
      userId: entry.userId,
      address: entry.address,
      player: {
        address: entry.address
      },
      totalGames: entry.totalGames,
      totalWins: entry.totalWins,
      totalLosses: entry.totalLosses,
      winRate: entry.winRate,
      totalVolume: entry.totalVolume,
      netProfit: entry.netProfit,
      biggestWin: entry.biggestWin,
      averageBetSize: entry.averageBetSize,
      lastActivity: entry.lastActivity
    }));
  }

  /**
   * Get date range for time-based queries
   */
  getDateRange(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
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
      
      case 'all':
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
   * Get period bounds for caching
   */
  getPeriodBounds(period) {
    const dateRange = this.getDateRange(period);
    return {
      periodStart: dateRange.$gte,
      periodEnd: dateRange.$lt
    };
  }

  /**
   * Get cache expiry time based on period
   */
  getCacheExpiry(period) {
    const now = new Date();
    
    switch (period) {
      case 'today':
        // Cache expires at end of day
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      case 'yesterday':
        // Cache for 24 hours
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      case 'week':
        // Cache for 1 hour
        return new Date(now.getTime() + 60 * 60 * 1000);
      
      case 'month':
        // Cache for 1 hour
        return new Date(now.getTime() + 60 * 60 * 1000);
      
      case 'all':
        // Cache for 30 minutes
        return new Date(now.getTime() + 30 * 60 * 1000);
      
      default:
        return new Date(now.getTime() + 30 * 60 * 1000);
    }
  }

  /**
   * Invalidate cache for a specific period
   */
  async invalidateCache(period) {
    try {
      await LeaderboardEntry.invalidateCache(period);
      console.log(`Invalidated cache for ${period}`);
    } catch (error) {
      console.error('Invalidate cache error:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache() {
    try {
      const result = await LeaderboardEntry.deleteMany({
        $or: [
          { cacheExpiry: { $lt: new Date() } },
          { isValid: false }
        ]
      });

      console.log(`Cleaned up ${result.deletedCount} expired cache entries`);
      return result;
    } catch (error) {
      console.error('Cleanup expired cache error:', error);
      throw error;
    }
  }
}

module.exports = new LeaderboardCacheService();
