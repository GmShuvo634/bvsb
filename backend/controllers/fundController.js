// backend/controllers/fundController.js
const User = require('../models/userModel');

exports.getBalance = async (req, res, next) => {
  try {
    // Ensure authenticated user
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Reload user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with all fields, defaulting avatar and country to empty strings
    return res.json({
      balance: user.balance,
      avatar: user.avatar != null ? user.avatar : "",
      country: user.country != null ? user.country : ""
    });
  } catch (err) {
    next(err);
  }
};

exports.deposit = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { amount, token, txHash, chainId } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    // Validate token type
    const supportedTokens = ['USDT', 'USDC', 'ETH'];
    const tokenSymbol = token || 'ETH';
    if (!supportedTokens.includes(tokenSymbol)) {
      return res.status(400).json({ error: 'Unsupported token type' });
    }

    // For testing purposes, we'll accept deposits without blockchain verification
    // In production, you would verify the transaction on-chain
    console.log(`💰 Deposit received: ${amount} ${tokenSymbol} from user ${req.user.id}`);
    if (txHash) {
      console.log(`📝 Transaction hash: ${txHash}`);
    }
    if (chainId) {
      console.log(`🔗 Chain ID: ${chainId}`);
    }

    // Update balance (convert all tokens to a common unit for simplicity)
    req.user.balance += amount;
    await req.user.save();

    // Log the deposit for audit purposes
    console.log(`✅ User ${req.user.id} balance updated: ${req.user.balance}`);

    // Audit log
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user._id,
        guestId: req.user.guestId,
        eventType: 'deposit',
        amount: amount,
        beforeBal: req.user.balance - amount,
        afterBal: req.user.balance,
        metadata: { token: tokenSymbol, txHash, chainId }
      });
    } catch (e) {
      console.warn('AuditLog deposit failed:', e?.message || e);
    }

    // Return updated full info
    return res.json({
      success: true,
      balance: req.user.balance,
      token: tokenSymbol,
      amount: amount,
      avatar: req.user.avatar != null ? req.user.avatar : "",
      country: req.user.country != null ? req.user.country : "",
      message: `Successfully deposited ${amount} ${tokenSymbol}`
    });
  } catch (err) {
    console.error('💥 Deposit error:', err);
    next(err);
  }
};

