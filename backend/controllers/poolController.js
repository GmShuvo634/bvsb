// backend/controllers/poolController.js
const Pool = require('../models/Pool');

exports.getCurrent = async (req, res, next) => {
  try {
    // Placeholder current round: the most recently updated pool
    const pool = await Pool.findOne({}).sort({ updatedAt: -1 }).lean();
    if (!pool) return res.json({ roundId: null, upTreasury: 0, downTreasury: 0 });
    return res.json({ roundId: pool.roundId, upTreasury: pool.upTreasury, downTreasury: pool.downTreasury });
  } catch (err) {
    next(err);
  }
};
