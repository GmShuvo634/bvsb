// backend/services/demoService.js
const DemoSession = require('../models/DemoSession');
const { v4: uuidv4 } = require('uuid');

class DemoService {
  /**
   * Create a new demo session or resume existing one for the same IP
   */
  async createSession(ipAddress, userAgent = '') {
    try {
      // First, check if there's an existing active session for this IP
      const existingSession = await DemoSession.findOne({
        ipAddress,
        isActive: true,
        sessionExpiry: { $gt: new Date() }
      }).sort({ lastActivity: -1 }); // Get the most recent session

      if (existingSession) {
        // Resume existing session - extend expiry and update activity
        existingSession.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        existingSession.lastActivity = new Date();
        existingSession.userAgent = userAgent; // Update user agent if changed
        await existingSession.save();

        console.log(`Resumed existing demo session for IP ${ipAddress}: ${existingSession.guestId}, balance: ${existingSession.currentBalance}`);

        return {
          guestId: existingSession.guestId,
          balance: existingSession.currentBalance,
          sessionExpiry: existingSession.sessionExpiry,
          isResumed: true
        };
      }

      // No existing session found, create a new one
      const guestId = uuidv4();

      const session = new DemoSession({
        guestId,
        ipAddress,
        userAgent,
        currentBalance: 1000,
        initialBalance: 1000,
        isActive: true,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      await session.save();

      console.log(`Created new demo session for IP ${ipAddress}: ${guestId}`);

      return {
        guestId,
        balance: session.currentBalance,
        sessionExpiry: session.sessionExpiry,
        isResumed: false
      };
    } catch (error) {
      console.error('Demo service - Create session error:', error);
      throw new Error('Failed to create demo session');
    }
  }

  /**
   * Get demo session by IP address
   */
  async getSessionByIP(ipAddress) {
    try {
      const session = await DemoSession.findOne({
        ipAddress,
        isActive: true,
        sessionExpiry: { $gt: new Date() }
      }).sort({ lastActivity: -1 }); // Get the most recent session

      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await session.save();

      return session;
    } catch (error) {
      console.error('Demo service - Get session by IP error:', error);
      return null;
    }
  }

  /**
   * Get demo session by guest ID
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

      // Update last activity and extend session if needed
      session.lastActivity = new Date();

      // Extend session expiry if it's close to expiring (within 1 hour)
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (session.sessionExpiry < oneHourFromNow) {
        session.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend by 24 hours
        console.log(`Extended demo session expiry for ${guestId}`);
      }

      await session.save();

      return session;
    } catch (error) {
      console.error('Demo service - Get session error:', error);
      return null;
    }
  }

  /**
   * Update demo user balance
   */
  async updateBalance(guestId, amount, operation = 'bet') {
    try {
      const session = await this.getSession(guestId);

      if (!session) {
        throw new Error('Demo session not found or expired');
      }

      const oldBalance = session.currentBalance;
      let newBalance = oldBalance;

      switch (operation) {
        case 'bet':
          // Deduct bet amount
          if (session.currentBalance < amount) {
            throw new Error('Insufficient demo balance');
          }
          newBalance = session.currentBalance - amount;
          session.totalBets += 1;
          break;

        case 'win':
          // Add winnings
          newBalance = session.currentBalance + amount;
          session.totalWins += 1;
          break;

        case 'loss':
          // No balance change for losses, just update stats
          session.totalLosses += 1;
          break;

        case 'reset':
          // Reset to initial balance
          newBalance = session.initialBalance;
          session.totalBets = 0;
          session.totalWins = 0;
          session.totalLosses = 0;
          break;

        default:
          throw new Error('Invalid balance operation');
      }

      session.currentBalance = newBalance;
      await session.save();

      return {
        oldBalance,
        newBalance,
        operation,
        sessionStats: {
          totalBets: session.totalBets,
          totalWins: session.totalWins,
          totalLosses: session.totalLosses
        }
      };
    } catch (error) {
      console.error('Demo service - Update balance error:', error);
      throw error;
    }
  }

  /**
   * Reset demo session
   */
  async resetSession(guestId) {
    try {
      const result = await this.updateBalance(guestId, 0, 'reset');
      return result;
    } catch (error) {
      console.error('Demo service - Reset session error:', error);
      throw error;
    }
  }

  /**
   * Refresh session expiry to prevent expiration during active gameplay
   */
  async refreshSession(guestId) {
    try {
      const session = await DemoSession.findOne({
        guestId,
        isActive: true
      });

      if (!session) {
        return null;
      }

      // Extend session by 24 hours
      session.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      session.lastActivity = new Date();
      await session.save();

      console.log(`Refreshed demo session for ${guestId}`);
      return session;
    } catch (error) {
      console.error('Demo service - Refresh session error:', error);
      return null;
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const result = await DemoSession.deleteMany({
        $or: [
          { sessionExpiry: { $lt: new Date() } },
          { isActive: false }
        ]
      });

      console.log(`Cleaned up ${result.deletedCount} expired demo sessions`);
      return result.deletedCount;
    } catch (error) {
      console.error('Demo service - Cleanup error:', error);
      return 0;
    }
  }
}

module.exports = new DemoService();
