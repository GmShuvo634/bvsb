// backend/controllers/adminController.js

const User       = require('../models/userModel')
const Trade      = require('../models/tradeModel')
const Fund       = require('../models/fund')
const Withdrawal = require('../models/Withdrawal')
const Round      = require('../models/roundModel')

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/trades
exports.getAllTrades = async (req, res, next) => {
  try {
    const trades = await Trade.find().populate('user', 'email')
    res.json(trades)
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/funds
exports.getAllFunds = async (req, res, next) => {
  try {
    const funds = await Fund.find().populate('user', 'email')
    res.json(funds)
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/withdrawals
exports.getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'email')
    res.json(withdrawals)
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/override-candle
// Now explicitly uses the Round model (rounds collection)
// POST /api/admin/override-candle
exports.overrideCandle = async (req, res, next) => {
  const { roundId, open, high, low, close, outcome } = req.body;

  console.log('⚙️ overrideCandle called with:', req.body);

  try {
    // 1️⃣ Fetch the round
    const round = await Round.findById(roundId);
    console.log('🔍 Round.findById returned:', round);
    if (!round) {
      console.warn('⚠️ No round found for ID:', roundId);
      return res.status(404).json({ error: 'Round not found' });
    }

    // 2️⃣ If they passed a side, auto‑generate OHLC to make that side win:
    if (outcome === 'up' || outcome === 'down') {
      const baseOpen = round.open;
      const existingHigh = round.high ?? baseOpen * 1.01;
      const existingLow  = round.low  ?? baseOpen * 0.99;
      const range = existingHigh - existingLow;
      const delta = range * 0.5;

      if (outcome === 'up') {
        round.close = baseOpen + delta;
        round.high  = round.close;
        round.low   = baseOpen;
      } else {
        round.close = baseOpen - delta;
        round.low   = round.close;
        round.high  = baseOpen;
      }

    // 3️⃣ Otherwise if they supplied explicit OHLC, apply those:
    } else if (
      typeof open  === 'number' &&
      typeof high  === 'number' &&
      typeof low   === 'number' &&
      typeof close === 'number'
    ) {
      round.open  = open;
      round.high  = high;
      round.low   = low;
      round.close = close;

    // 4️⃣ Reject any other payload
    } else {
      return res
        .status(400)
        .json({ error: 'Must supply either outcome or all of open, high, low, close' });
    }

    // 5️⃣ Persist & respond
    await round.save();
    console.log('✅ Round updated:', round);
    return res.json({ success: true, round });

  } catch (err) {
    console.error('❌ overrideCandle error:', err);
    next(err);
  }
};




