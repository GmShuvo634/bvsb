// backend/services/demoService.js
const DemoSession = require('../models/DemoSession');
const { v4: uuidv4 } = require('uuid');

class DemoService {
  /**
   * Create or resume a demo session
   */
  async createOrResumeSession(ipAddress, userAgent, existingGuestId = null) {
    try {
      // Try to resume existing session first
      if (existingGuestId) {
        const existing = await DemoSession.findOne({ 
          guestId: existingGuestId,
          isActive: true,
          sessionExpiry: { $gt: new Date() }
        });
        
        if (existing) {
          // Update last activity
          existing.lastActivity = new Date();
          await existing.save();
          return existing;
        }
      }

      // Check if IP has too many recent demo sessions (prevent abuse)
      const recentSessions = await DemoSession.countDocuments({
        ipAddress,
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      if (recentSessions >= 5) {
        throw new Error('Too many demo sessions from this IP. Please try again later.');
      }

      // Create new demo session
      const guestId = uuidv4();
      const session = await DemoSession.create({
        guestId,
        ipAddress,
        userAgent,
        initialBalance: 1000,
        currentBalance: 1000
      });

      return session;
    } catch (error) {
      console.error('Demo service error:', error);
      throw error;
    }
  }

  /**
   * Update demo session balance
   */
  async updateBalance(guestId, amount, operation = 'bet') {
    try {
      const session = await DemoSession.findOne({ 
        guestId, 
        isActive: true 
      });

      if (!session) {
        throw new Error('Demo session not found or expired');
      }

      // Check if session is expired
      if (session.sessionExpiry < new Date()) {
        session.isActive = false;
        await session.save();
        throw new Error('Demo session expired');
      }

      const oldBalance = session.currentBalance;

      if (operation === 'bet') {
        if (session.currentBalance < amount) {
          throw new Error('Insufficient demo balance');
        }
        session.currentBalance -= amount;
        session.totalBets += 1;
      } else if (operation === 'win') {
        session.currentBalance += amount;
        session.totalWins += 1;
      } else if (operation === 'loss') {
        session.totalLosses += 1;
      }

      // Prevent balance from going negative or exceeding reasonable limits
      session.currentBalance = Math.max(0, Math.min(session.currentBalance, 10000));
      session.lastActivity = new Date();

      await session.save();

      return {
        oldBalance,
        newBalance: session.currentBalance,
        session
      };
    } catch (error) {
      console.error('Demo balance update error:', error);
      throw error;
    }
  }

  /**
   * Get demo session info
   */
  async getSession(guestId) {
    try {
      const session = await DemoSession.findOne({ 
        guestId, 
        isActive: true,
        sessionExpiry: { $gt: new Date() }
      });

      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await session.save();

      return session;
    } catch (error) {
      console.error('Get demo session error:', error);
      return null;
    }
  }

  /**
   * Mark session as registered (prevent multiple demo accounts)
   */
  async markAsRegistered(guestId, userId) {
    try {
      await DemoSession.updateOne(
        { guestId },
        { 
          hasRegistered: true, 
          registeredUserId: userId,
          isActive: false // Deactivate demo session after registration
        }
      );
    } catch (error) {
      console.error('Mark registered error:', error);
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const result = await DemoSession.updateMany(
        { sessionExpiry: { $lt: new Date() } },
        { isActive: false }
      );
      console.log(`Cleaned up ${result.modifiedCount} expired demo sessions`);
      return result.modifiedCount;
    } catch (error) {
      console.error('Cleanup expired sessions error:', error);
      return 0;
    }
  }

  /**
   * Get demo session statistics
   */
  async getSessionStats(guestId) {
    try {
      const session = await DemoSession.findOne({ guestId });
      if (!session) return null;

      return {
        guestId: session.guestId,
        balance: session.currentBalance,
        totalBets: session.totalBets,
        totalWins: session.totalWins,
        totalLosses: session.totalLosses,
        winRate: session.totalBets > 0 ? (session.totalWins / session.totalBets * 100).toFixed(1) : 0,
        isActive: session.isActive,
        timeRemaining: session.sessionExpiry > new Date() ? 
          Math.max(0, session.sessionExpiry - new Date()) : 0
      };
    } catch (error) {
      console.error('Get session stats error:', error);
      return null;
    }
  }
}

module.exports = new DemoService();