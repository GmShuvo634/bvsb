// backend/controllers/statsController.js
const Trade = require('../models/Trade');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all resolved trades for this user
    const trades = await Trade.find({ player: userId, resolved: true });

    const totalVolume = trades.reduce((sum, t) => sum + t.amount, 0);

    const wins = trades.filter(t => t.won).length;
    const total = trades.length;
    const winRate = total ? (wins / total) * 100 : 0;

    // Assume payout = amount*2 when won, else 0
    const totalPayout = trades.reduce((sum, t) => sum + (t.won ? t.amount * 2 : 0), 0);
    const avgPayout = total ? totalPayout / total : 0;

    res.json({
      totalVolume,
      winRate: winRate.toFixed(2) + '%',
      avgPayout: avgPayout.toFixed(2),
    });
  } catch (err) {
    next(err);
  }
};

