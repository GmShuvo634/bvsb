cd controllers
cat > withdrawController.js << 'EOF'
// backend/controllers/withdrawController.js

const Withdrawal = require('../models/Withdrawal');

/**
 * POST /api/withdraw
 * Creates a new withdrawal request for the authenticated user.
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ message: '"amount" must be >= 1' });
    }
    const withdrawal = await Withdrawal.create({
      user:   req.user.id,
      amount: Number(amount),
    });
    return res.status(201).json(withdrawal);
  } catch (err) {
    console.error('requestWithdrawal error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/withdraw
 * Lists all withdrawals for the authenticated user.
 */
exports.listWithdrawals = async (req, res) => {
  try {
    const items = await Withdrawal.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error('listWithdrawals error:', err);
    return res.status(500).json({ message: err.message });
  }
};
EOF

