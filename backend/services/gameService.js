// backend/services/gameService.js
const GameRound = require('../models/GameRound');
const User = require('../models/userModel');
const Pool = require('../models/Pool');
const { v4: uuidv4 } = require('uuid');
const bus = require('../sockets/bus');

class GameService {
  constructor() {
    this.currentRound = null;
    this.roundTimer = null;
    this.initializeGame();
  }

  /**
   * Initialize game system
   */
  async initializeGame() {
    try {
      // Check for active round
      this.currentRound = await GameRound.findOne({
        status: { $in: ['waiting', 'betting', 'playing'] }
      }).sort({ createdAt: -1 });

      if (!this.currentRound) {
        console.log('No active round found, starting new round...');
        await this.startNewRound();
      } else {
        console.log(`Found active round: ${this.currentRound.roundId}`);
        // Schedule settlement for existing round if needed
        this.scheduleRoundSettlement();
      }

      console.log('Game service initialized');
    } catch (error) {
      console.error('Game initialization error:', error);
    }
  }

  /**
   * Start a new game round
   */
  async startNewRound() {
    try {
      const roundId = uuidv4();

      this.currentRound = await GameRound.create({
        roundId,
        status: 'betting',
        startTime: new Date(),
        bettingEndTime: new Date(Date.now() + 30000), // 30 seconds betting
        playEndTime: new Date(Date.now() + 60000), // 30 seconds play
      });

      // Broadcast new round started
      bus.broadcast('roundStarted', {
        roundId: this.currentRound.roundId,
        status: 'betting',
        timeRemaining: 30000
      });

      // Broadcast ready message for new round
      bus.broadcast('roundReady', {
        roundId: this.currentRound.roundId,
        status: 'betting'
      });

      // Broadcast empty players list for new round
      bus.broadcast('players', []);

      // Schedule round settlement
      this.scheduleRoundSettlement();

      console.log(`New round started: ${roundId}`);
      return this.currentRound;
    } catch (error) {
      console.error('Start new round error:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic round settlement
   */
  scheduleRoundSettlement() {
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
    }

    // Schedule settlement after play period ends (60 seconds total)
    this.roundTimer = setTimeout(async () => {
      try {
        if (this.currentRound && this.currentRound.status !== 'completed') {
          // Generate mock prices for demo/testing
          const startPrice = 2000 + Math.random() * 1000; // Random price between 2000-3000
          const endPrice = startPrice + (Math.random() - 0.5) * 100; // +/- 50 from start

          await this.settleRound(startPrice, endPrice);
          // Start next round after a short delay
          setTimeout(() => {
            this.startNewRound();
          }, 5000);
        }
      } catch (error) {
        console.error('Scheduled round settlement error:', error);
      }
    }, 60000); // 60 seconds
  }

  /**
   * Place a bet in the current round
   */
  async placeBet(userId, address, amount, direction) {
    try {
      if (!this.currentRound || this.currentRound.status !== 'betting') {
        throw new Error('No active betting round');
      }

      // Check if user already bet in this round
      const existingBet = this.currentRound.bets.find(bet =>
        (userId && bet.userId?.toString() === userId.toString()) ||
        (address && bet.address === address)
      );

      if (existingBet) {
        throw new Error('Already placed bet in this round');
      }

      // Handle real user bet
      if (!userId) {
        throw new Error('User ID required for bets');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update user balance
      user.balance -= amount;
      await user.save();

      const balanceUpdate = {
        oldBalance: user.balance + amount,
        newBalance: user.balance
      };

      // Add bet to round
      const bet = {
        userId: userId,
        address,
        amount,
        direction,
        timestamp: new Date()
      };

      this.currentRound.bets.push(bet);

      // Update pool totals
      if (direction === 'up') {
        this.currentRound.upPoolTotal += amount;
        this.currentRound.upPoolPlayers += 1;
      } else {
        this.currentRound.downPoolTotal += amount;
        this.currentRound.downPoolPlayers += 1;
      }

      await this.currentRound.save();

      // Update Pool model for compatibility
      await Pool.updateOne(
        { roundId: this.currentRound.roundId },
        {
          $set: {
            upTreasury: this.currentRound.upPoolTotal,
            downTreasury: this.currentRound.downPoolTotal
          }
        },
        { upsert: true }
      );

      // Broadcast updates
      bus.broadcast('poolUpdate', {
        roundId: this.currentRound.roundId,
        upTreasury: this.currentRound.upPoolTotal,
        downTreasury: this.currentRound.downPoolTotal,
        upPlayers: this.currentRound.upPoolPlayers,
        downPlayers: this.currentRound.downPoolPlayers
      });

      // Broadcast individual player data
      this.broadcastPlayersUpdate();

      // Broadcast balance update
      bus.broadcast('balanceUpdate', {
        userId: userId.toString(),
        balance: balanceUpdate.newBalance
      });

      return {
        success: true,
        bet,
        balanceUpdate,
        roundInfo: {
          roundId: this.currentRound.roundId,
          upPoolTotal: this.currentRound.upPoolTotal,
          downPoolTotal: this.currentRound.downPoolTotal
        }
      };
    } catch (error) {
      console.error('Place bet error:', error);
      throw error;
    }
  }

  /**
   * Get current round info
   */
  getCurrentRound() {
    if (!this.currentRound) {
      return null;
    }

    return {
      roundId: this.currentRound.roundId,
      status: this.currentRound.status,
      upPoolTotal: this.currentRound.upPoolTotal,
      downPoolTotal: this.currentRound.downPoolTotal,
      upPoolPlayers: this.currentRound.upPoolPlayers,
      downPoolPlayers: this.currentRound.downPoolPlayers,
      bets: this.currentRound.bets,
      timeRemaining: this.getRemainingTime()
    };
  }

  /**
   * Get remaining time for current phase
   */
  getRemainingTime() {
    if (!this.currentRound) return 0;

    const now = new Date();

    switch (this.currentRound.status) {
      case 'betting':
        return Math.max(0, this.currentRound.bettingEndTime - now);
      case 'playing':
        return Math.max(0, this.currentRound.playEndTime - now);
      default:
        return 0;
    }
  }

  /**
   * Settle current round
   */
  async settleRound(startPrice, endPrice) {
    try {
      if (!this.currentRound || this.currentRound.status === 'completed') {
        return;
      }

      this.currentRound.status = 'settling';
      this.currentRound.startPrice = startPrice;
      this.currentRound.endPrice = endPrice;
      this.currentRound.settleTime = new Date();

      // Determine winning pool
      const isUpWin = endPrice > startPrice;
      this.currentRound.winningPool = isUpWin ? 'up' : 'down';

      const winningBets = this.currentRound.bets.filter(bet => bet.direction === this.currentRound.winningPool);
      const losingBets = this.currentRound.bets.filter(bet => bet.direction !== this.currentRound.winningPool);

      const totalWinningAmount = winningBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalLosingAmount = losingBets.reduce((sum, bet) => sum + bet.amount, 0);

      // Calculate house fee (5%)
      const houseFeeRate = 0.05;
      const houseFee = totalLosingAmount * houseFeeRate;
      const availablePayout = totalLosingAmount - houseFee + totalWinningAmount;

      this.currentRound.houseFee = houseFee;
      this.currentRound.totalPayout = availablePayout;

      // Calculate individual payouts and broadcast balance updates
      for (const bet of this.currentRound.bets) {
        if (bet.direction === this.currentRound.winningPool) {
          // Winner gets their bet back plus proportional share of losing pool
          const proportion = bet.amount / totalWinningAmount;
          bet.payout = bet.amount + (totalLosingAmount - houseFee) * proportion;
          bet.result = 'win';

          // Update user balance
          if (bet.userId) {
            const updatedUser = await User.findByIdAndUpdate(bet.userId, {
              $inc: { balance: bet.payout }
            }, { new: true });
            // Broadcast user balance update
            bus.broadcast('balanceUpdate', {
              userId: bet.userId.toString(),
              balance: updatedUser.balance
            });
          }
        } else {
          bet.payout = 0;
          bet.result = 'loss';
        }
      }

      this.currentRound.status = 'completed';
      await this.currentRound.save();

      // Broadcast settlement
      bus.broadcast('roundSettled', {
        roundId: this.currentRound.roundId,
        winningPool: this.currentRound.winningPool,
        startPrice,
        endPrice,
        totalPayout: availablePayout,
        winnerCount: winningBets.length,
        loserCount: losingBets.length,
        totalPlayers: this.currentRound.bets.length,
        results: this.currentRound.bets.map(bet => ({
          userId: bet.userId,
          result: bet.result,
          payout: bet.payout
        }))
      });

      // Clear players list after settlement
      bus.broadcast('players', []);

      // Start new round after short delay
      setTimeout(() => {
        this.startNewRound();
      }, 5000);

      console.log(`Round ${this.currentRound.roundId} settled. Winner: ${this.currentRound.winningPool} pool`);

      return this.currentRound;
    } catch (error) {
      console.error('Settle round error:', error);
      throw error;
    }
  }

  /**
   * Get user's betting history
   */
  async getUserHistory(userId, limit = 10) {
    try {
      if (!userId) {
        return [];
      }

      const query = { 'bets.userId': userId };

      const rounds = await GameRound.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      const history = [];

      for (const round of rounds) {
        const userBets = round.bets.filter(bet =>
          userId && bet.userId?.toString() === userId.toString()
        );

        for (const bet of userBets) {
          history.push({
            roundId: round.roundId,
            amount: bet.amount,
            direction: bet.direction,
            result: bet.result,
            payout: bet.payout,
            startPrice: round.startPrice,
            endPrice: round.endPrice,
            timestamp: bet.timestamp
          });
        }
      }

      return history;
    } catch (error) {
      console.error('Get user history error:', error);
      return [];
    }
  }
}

module.exports = new GameService();
