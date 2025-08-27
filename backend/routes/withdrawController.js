// backend/controllers/withdrawController.js
const Withdrawal = require('../models/Withdrawal');

/**
 * POST /api/withdraw
 * Request a new withdrawal.
 */
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({
        message: '"amount" must be greater than or equal to 1'
      });
    }

    const withdrawal = await Withdrawal.create({
      user:   req.user.id,
      amount
    });

    return res.status(201).json(withdrawal);
  } catch (err) {
    console.error('requestWithdraw error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/withdraw
 * List all withdrawals of the logged-in user.
 */
exports.listWithdrawals = async (req, res) => {
  try {
    const list = await Withdrawal.find({ user: req.user.id }).sort('-createdAt');
    return res.json(list);
  } catch (err) {
    console.error('listWithdrawals error:', err);
    return res.status(500).json({ message: err.message });
  }
};
