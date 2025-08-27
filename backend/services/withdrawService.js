const User = require('../models/userModel');

exports.distributeWinnings = async (trade) => {
  const u = await User.findById(trade.user);
  u.balance += trade.amount * 2;  // simple 2× payout
  await u.save();
};

