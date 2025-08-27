const Withdrawal = require('../models/Withdrawal');
const User       = require('../models/userModel');

/**
 * POST /api/withdraw
 * Body: { amount: Number, address: String }
 */
exports.createWithdrawal = async (req, res, next) => {
  try {
    const { amount, address } = req.body;
    if (amount == null || !address) {
      return res.status(400).json({ error: 'Amount and address are required' });
    }

    // Ensure user has enough balance
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance -= amount;
    await user.save();

    // Record the withdrawal request
    const w = new Withdrawal({
      user:    req.user.id,
      amount,
      address,
    });
    await w.save();

    // Audit log for withdraw
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user._id,
        guestId: req.user.guestId,
        eventType: 'withdraw',
        amount: -amount,
        beforeBal: user.balance + amount,
        afterBal: user.balance,
        metadata: { address, withdrawalId: w._id }
      });
    } catch (e) {
      console.warn('AuditLog withdraw failed:', e?.message || e);
    }

    res.status(201).json(w);
  } catch (err) {
    next(err);
  }
};

