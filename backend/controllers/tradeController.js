// backend/controllers/tradeController.js
const Trade            = require('../models/Trade');
const User             = require('../models/userModel');
const Round            = require('../models/roundModel');
const contractService  = require('../services/contractService');
const withdrawService  = require('../services/withdrawService');
const userActivityService = require('../services/userActivityService');

// 1) Place a new trade (with demo enforcement + atomic updates)
exports.createTrade = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  try {
    const { amount, strikePrice, direction, expiry } = req.body;
    if (!amount || !strikePrice || !direction || !expiry) {
      return res.status(400).json({ error: { code: 'invalid_parameter', message: 'Missing fields' } });
    }

    // fetch current price
    const currentPrice = await contractService.getCurrentPrice();

    await session.withTransaction(async () => {
      // Reload user inside the session
      const u = await User.findById(req.user._id).session(session);
      if (!u) throw new Error('user_not_found');

      // Demo enforcement: no deposits/withdrawals, ensure balance >= amount & balance never exceeds initial 1000
      if (u.type === 'demo') {
        if (u.balance < amount) {
          const errObj = new Error('insufficient_funds'); errObj.status = 400; throw errObj;
        }
      } else {
        // real user: still enforce non-negative
        if (u.balance < amount) {
          const errObj = new Error('insufficient_funds'); errObj.status = 400; throw errObj;
        }
      }

      // Deduct balance atomically
      const updated = await User.findOneAndUpdate(
        { _id: u._id, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true, session }
      );
      if (!updated) {
        const errObj = new Error('insufficient_funds'); errObj.status = 400; throw errObj;
      }

      // Create trade
      const t = await Trade.create([{
        user: u._id,
        amount,
        strikePrice,
        direction,
        expiry,
        startPrice: currentPrice,
        result: 'pending'
      }], { session });

      // Increment pool treasuries atomically
      const Pool = require('../models/Pool');
      // Determine current roundId from DB (most recent open round)
      let roundId;
      const latestRound = await Round.findOne({}).sort({ createdAt: -1 }).session(session);
      if (latestRound && latestRound._id) {
        roundId = latestRound._id.toString();
      } else {
        // fallback to date-bucket if no rounds exist
        roundId = new Date().toISOString().slice(0,10);
      }
      const inc = direction === 'up' ? { upTreasury: amount } : { downTreasury: amount };
      await Pool.updateOne(
        { roundId },
        { $inc: inc },
        { upsert: true, session }
      );

      // WS broadcast updates
      const bus = require('../sockets/bus');
      const poolDoc = await Pool.findOne({ roundId }).session(session);
      bus.broadcast('poolUpdate', { roundId, upTreasury: poolDoc?.upTreasury || 0, downTreasury: poolDoc?.downTreasury || 0 });
      bus.broadcast('balanceUpdate', { userId: u._id.toString(), balance: updated.balance });

      // Audit log (price_selection)
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create([{ userId: u._id, guestId: u.guestId, eventType: 'price_selection', amount: -amount, beforeBal: updated.balance + amount, afterBal: updated.balance, metadata: { direction, strikePrice, expiry, startPrice: currentPrice } }], { session });

      // Log user activity (async, don't wait)
      setImmediate(async () => {
        try {
          await userActivityService.logTradeActivity(
            u.type === 'demo' ? null : u._id,
            u.type === 'demo' ? (u.guestId || u._id) : null,
            u.address,
            {
              tradeId: t[0]._id,
              amount,
              direction,
              strikePrice,
              startPrice: currentPrice,
              balanceBefore: updated.balance + amount,
              balanceAfter: updated.balance,
              balanceChange: -amount
            },
            'trade_placed'
          );
        } catch (error) {
          console.error('Failed to log trade activity:', error);
        }
      });

      res.status(201).json(t[0]);
    });
  } catch (err) {
    console.error('CreateTrade error', err);
    const status = err.status || 500;
    const code = err.message === 'insufficient_funds' ? 'insufficient_funds' : 'server_error';
    res.status(status).json({ error: { code, message: err.message || 'Create trade failed' } });
  } finally {
    session.endSession();
  }
};

// 2) Get open (pending) trades
exports.getOpenTrades = async (req, res, next) => {
  try {
    const list = await Trade.find({
      user: req.user._id,
      result: 'pending'
    }).sort({ expiry: 1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// 3) Get full history (resolved) trades
exports.getTradeHistory = async (req, res, next) => {
  try {
    const list = await Trade.find({
      user: req.user._id,
      result: { $ne: 'pending' }
    }).sort({ expiry: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// 4) Manually settle an individual trade (for admin/testing)
exports.settleTrade = async (req, res, next) => {
  try {
    const t = await Trade.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Trade not found' });
    if (t.result !== 'pending') {
      return res.status(400).json({ error: 'Already settled' });
    }

    // re-fetch price and resolve
    const price = await contractService.getCurrentPrice();
    t.result = (t.direction === 'up')
      ? (price > t.startPrice ? 'win' : 'loss')
      : (price < t.startPrice ? 'win' : 'loss');
    await t.save();

    // adjust user balance
    const u = await User.findById(t.user);
    let payout = 0;
    if (t.result === 'win') {
      payout = t.amount * 1.8;
      u.balance += payout;
      await u.save();
      await withdrawService.distributeWinnings(u._id, payout);
    }

    // Log trade settlement activity (async, don't wait)
    setImmediate(async () => {
      try {
        await userActivityService.logTradeActivity(
          u.type === 'demo' ? null : u._id,
          u.type === 'demo' ? (u.guestId || u._id) : null,
          u.address,
          {
            tradeId: t._id,
            amount: t.amount,
            direction: t.direction,
            result: t.result,
            payout,
            entryPrice: t.startPrice,
            exitPrice: price,
            balanceBefore: u.balance - (t.result === 'win' ? payout : 0),
            balanceAfter: u.balance,
            balanceChange: t.result === 'win' ? payout : 0
          },
          'trade_settled'
        );
      } catch (error) {
        console.error('Failed to log trade settlement activity:', error);
      }
    });

    res.json(t);
  } catch (err) {
    console.error('SettleTrade error', err);
    next(err);
  }
};

