// backend/services/statsService.js
const User = require('../models/userModel');
const GameRound = require('../models/GameRound');
const DemoSession = require('../models/DemoSession');

class StatsService {
  /**
   * Update user statistics after a bet is placed
   */
  async updateUserBetStats(userId, amount, isDemo = false) {
    try {
      if (isDemo) {
        // Demo stats are handled in DemoSession model
        return;
      }

      await User.findByIdAndUpdate(userId, {
        $inc: {
          'stats.totalBets': 1,
          'stats.totalVolume': amount
        },
        $set: {
          'stats.lastBetDate': new Date(),
          'stats.averageBetSize': await this.calculateAverageBetSize(userId, amount)
        }
      });

      console.log(`Updated bet stats for user ${userId}: +${amount} volume`);
    } catch (error) {
      console.error('Update user bet stats error:', error);
    }
  }

  /**
   * Update user statistics after a bet is settled
   */
  async updateUserSettlementStats(userId, betAmount, payout, result, isDemo = false) {
    try {
      if (isDemo) {
        // Demo stats are handled in DemoSession model
        return;
      }

      const profit = payout - betAmount; // Net profit (can be negative)
      const isWin = result === 'win';

      // Get current user to calculate streaks
      const user = await User.findById(userId);
      if (!user) return;

      let newCurrentStreak = 0;
      let newBestStreak = user.stats.bestStreak || 0;

      if (isWin) {
        // Win: increment or start positive streak
        newCurrentStreak = user.stats.currentStreak >= 0 
          ? user.stats.currentStreak + 1 
          : 1;
        
        // Update best streak if current is better
        if (newCurrentStreak > newBestStreak) {
          newBestStreak = newCurrentStreak;
        }
      } else {
        // Loss: increment or start negative streak
        newCurrentStreak = user.stats.currentStreak <= 0 
          ? user.stats.currentStreak - 1 
          : -1;
      }

      const updateData = {
        $inc: {
          'stats.totalWins': isWin ? 1 : 0,
          'stats.totalLosses': isWin ? 0 : 1,
          'stats.totalProfit': profit
        },
        $set: {
          'stats.currentStreak': newCurrentStreak,
          'stats.bestStreak': newBestStreak
        }
      };

      // Update biggest win if this is a new record
      if (isWin && payout > (user.stats.biggestWin || 0)) {
        updateData.$set['stats.biggestWin'] = payout;
      }

      await User.findByIdAndUpdate(userId, updateData);

      console.log(`Updated settlement stats for user ${userId}: ${result}, profit: ${profit}`);
    } catch (error) {
      console.error('Update user settlement stats error:', error);
    }
  }

  /**
   * Calculate average bet size for a user
   */
  async calculateAverageBetSize(userId, newBetAmount) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.stats) return newBetAmount;

      const totalBets = user.stats.totalBets + 1; // Including the new bet
      const totalVolume = user.stats.totalVolume + newBetAmount;
      
      return Math.round((totalVolume / totalBets) * 100) / 100; // Round to 2 decimals
    } catch (error) {
      console.error('Calculate average bet size error:', error);
      return newBetAmount;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId, isDemo = false) {
    try {
      if (isDemo) {
        // For demo users, get stats from DemoSession
        const session = await DemoSession.findOne({ guestId: userId });
        if (!session) return null;

        const winRate = session.totalBets > 0 
          ? Math.round((session.totalWins / session.totalBets) * 100) 
          : 0;

        return {
          totalBets: session.totalBets,
          totalWins: session.totalWins,
          totalLosses: session.totalLosses,
          winRate: `${winRate}%`,
          balance: session.currentBalance,
          isDemo: true
        };
      }

      // For real users
      const user = await User.findById(userId);
      if (!user) return null;

      const stats = user.stats || {};
      const winRate = stats.totalBets > 0 
        ? Math.round((stats.totalWins / stats.totalBets) * 100) 
        : 0;

      const roi = stats.totalVolume > 0 
        ? Math.round((stats.totalProfit / stats.totalVolume) * 100) 
        : 0;

      return {
        totalBets: stats.totalBets || 0,
        totalWins: stats.totalWins || 0,
        totalLosses: stats.totalLosses || 0,
        totalVolume: stats.totalVolume || 0,
        totalProfit: stats.totalProfit || 0,
        biggestWin: stats.biggestWin || 0,
        currentStreak: stats.currentStreak || 0,
        bestStreak: stats.bestStreak || 0,
        averageBetSize: stats.averageBetSize || 0,
        winRate: `${winRate}%`,
        roi: `${roi}%`,
        lastBetDate: stats.lastBetDate,
        balance: user.balance,
        isDemo: false
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return null;
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(type = 'profit', limit = 10) {
    try {
      let sortField = {};
      
      switch (type) {
        case 'profit':
          sortField = { 'stats.totalProfit': -1 };
          break;
        case 'volume':
          sortField = { 'stats.totalVolume': -1 };
          break;
        case 'winrate':
          // We'll calculate win rate in aggregation
          break;
        case 'streak':
          sortField = { 'stats.bestStreak': -1 };
          break;
        default:
          sortField = { 'stats.totalProfit': -1 };
      }

      let users;
      
      if (type === 'winrate') {
        // Use aggregation for win rate calculation
        users = await User.aggregate([
          { $match: { 'stats.totalBets': { $gt: 0 } } },
          {
            $addFields: {
              winRate: {
                $multiply: [
                  { $divide: ['$stats.totalWins', '$stats.totalBets'] },
                  100
                ]
              }
            }
          },
          { $sort: { winRate: -1 } },
          { $limit: limit },
          {
            $project: {
              email: 1,
              'stats.totalBets': 1,
              'stats.totalWins': 1,
              'stats.totalProfit': 1,
              'stats.totalVolume': 1,
              winRate: 1
            }
          }
        ]);
      } else {
        users = await User.find({ 'stats.totalBets': { $gt: 0 } })
          .select('email stats')
          .sort(sortField)
          .limit(limit);
      }

      return users.map((user, index) => ({
        rank: index + 1,
        email: user.email.replace(/(.{3}).*@/, '$1***@'), // Mask email for privacy
        totalBets: user.stats?.totalBets || 0,
        totalWins: user.stats?.totalWins || 0,
        totalProfit: user.stats?.totalProfit || 0,
        totalVolume: user.stats?.totalVolume || 0,
        winRate: user.winRate ? `${Math.round(user.winRate)}%` : 
                 user.stats?.totalBets > 0 ? 
                 `${Math.round((user.stats.totalWins / user.stats.totalBets) * 100)}%` : '0%',
        bestStreak: user.stats?.bestStreak || 0
      }));
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  }
}

module.exports = new StatsService();
