// backend/controllers/betController.js
const gameService = require('../services/gameService');
const User = require('../models/userModel');
const AuditLog = require('../models/AuditLog');

// POST /api/bet/place
exports.placeBet = async (req, res, next) => {
  try {
    const { amount, direction } = req.body;

    if (!amount || !direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid bet parameters' });
    }

    if (amount <= 0 || amount > 1000) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    // Real user bet handling
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;
    const address = req.body.address || req.user.address;

    // Place bet through game service
    const result = await gameService.placeBet(
      userId,
      address,
      amount,
      direction
    );

    // Log the bet
    await AuditLog.create({
      userId: userId,
      eventType: 'bet',
      amount: -amount,
      beforeBal: result.balanceUpdate.oldBalance,
      afterBal: result.balanceUpdate.newBalance,
      metadata: {
        direction,
        roundId: result.roundInfo.roundId,
        address
      }
    });

    res.json({
      success: true,
      bet: result.bet,
      balance: result.balanceUpdate.newBalance,
      roundInfo: result.roundInfo
    });

  } catch (err) {
    console.error('Place bet error:', err);

    if (err.message.includes('No active betting round')) {
      return res.status(400).json({ error: 'No active betting round' });
    }

    if (err.message.includes('Already placed bet')) {
      return res.status(400).json({ error: 'Already placed bet in this round' });
    }

    if (err.message.includes('Insufficient')) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    next(err);
  }
};

// GET /api/bet/round
exports.getCurrentRound = async (req, res, next) => {
  try {
    const roundInfo = gameService.getCurrentRound();

    if (!roundInfo) {
      return res.json({
        roundId: null,
        status: 'waiting',
        upPoolTotal: 0,
        downPoolTotal: 0,
        upPoolPlayers: 0,
        downPoolPlayers: 0,
        timeRemaining: 0
      });
    }

    res.json(roundInfo);
  } catch (err) {
    console.error('Get current round error:', err);
    next(err);
  }
};

// GET /api/bet/history
exports.getBetHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;
    const history = await gameService.getUserHistory(userId, limit);

    res.json({
      history,
      total: history.length
    });

  } catch (err) {
    console.error('Get bet history error:', err);
    next(err);
  }
};

// GET /api/bet/balance
exports.getBalance = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      balance: user.balance
    });

  } catch (err) {
    console.error('Get balance error:', err);
    next(err);
  }
};

// POST /api/bet/settle (admin only)
exports.settleRound = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startPrice, endPrice } = req.body;

    if (!startPrice || !endPrice) {
      return res.status(400).json({ error: 'Start and end prices required' });
    }

    const result = await gameService.settleRound(startPrice, endPrice);

    res.json({
      success: true,
      roundId: result.roundId,
      winningPool: result.winningPool,
      totalPayout: result.totalPayout
    });

  } catch (err) {
    console.error('Settle round error:', err);
    next(err);
  }
};
