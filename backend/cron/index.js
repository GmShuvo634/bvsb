// backend/cron/index.js
const Trade = require('../models/Trade');
const User  = require('../models/userModel');
const Round = require('../models/roundModel');
const AuditLog = require('../models/AuditLog');
const bus   = require('../sockets/bus');
const cs    = require('../services/contractService');
const gameService = require('../services/gameService');

let currentRoundId = null;

async function startNewRound() {
  try {
    const price = await cs.getCurrentPrice();
    // Create a fresh round with open/high/low/close initialized to the same price
    const round = await Round.create({
      open: price,
      high: price,
      low: price,
      close: price,
      startedAt: new Date(),
    });
    currentRoundId = round._id.toString();

    // Broadcast to clients that a new round is ready
    bus.broadcast('roundReady', { roundId: currentRoundId });
  } catch (err) {
    console.error('❌ startNewRound error:', err);
  }
}

async function resolveTrades() {
  const now = Date.now();
  const list = await Trade.find({ result: 'pending', expiry: { $lte: now } }).sort({ expiry: 1 });
  let settledCount = 0;
  for (let t of list) {
    const session = await require('mongoose').startSession();
    try {
      await session.withTransaction(async () => {
        const price = await cs.getCurrentPrice();
        t.startPrice = t.startPrice || price;
        t.result = (t.direction==='up' ? price>t.startPrice : price<t.startPrice) ? 'win' : 'loss';
        await t.save({ session });

        // update user balance atomically
        const u = await User.findById(t.user).session(session);
        if (!u) return;
        if (t.result==='win') {
          const payout = t.amount * 1.8;
          const updated = await User.findOneAndUpdate(
            { _id: u._id },
            { $inc: { balance: payout } },
            { new: true, session }
          );
          await AuditLog.create([{ userId: u._id, eventType: 'payout', amount: payout, beforeBal: updated.balance - payout, afterBal: updated.balance, metadata: { tradeId: t._id } }], { session });
          bus.broadcast('balanceUpdate', { userId: u._id.toString(), balance: updated.balance });
        }

        // broadcast settlement
        await AuditLog.create([{ userId: u._id, guestId: u.guestId, eventType: 'settlement', amount: 0, beforeBal: u.balance, afterBal: u.balance, metadata: { tradeId: t._id, result: t.result } }], { session });
        bus.broadcast('roundSettled', { tradeId: t._id.toString(), userId: t.user.toString(), result: t.result });
      });
      settledCount += 1;
    } catch(err) {
      console.error(`❌ Error resolving ${t._id}:`, err);
    }
  }
}

// export the starter function
module.exports = function startCronJobs() {
  console.log('🔄 [cron] starting trade resolution every 5s…');

  // Use the game service for round management
  const handle = setInterval(async () => {
    await resolveTrades();
  }, 5000);

  // Game service handles its own round timing, so we don't need to create rounds here
  return handle;
};

