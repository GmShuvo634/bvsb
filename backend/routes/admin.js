// backend/routes/admin.js

const express       = require('express');
const router        = express.Router();

// Auth + admin checks
const authMiddleware = require('../middleware/authMiddleware'); // verifies JWT
const adminOnly      = require('../middleware/adminAuth');      // ensures req.user.isAdmin

const adminCtrl      = require('../controllers/adminController');

// Apply to all admin routes
router.use(authMiddleware, adminOnly);

// List users, trades, funds, withdrawals
router.get('/users',       adminCtrl.getAllUsers);
router.get('/trades',      adminCtrl.getAllTrades);
router.get('/funds',       adminCtrl.getAllFunds);
router.get('/withdrawals', adminCtrl.getAllWithdrawals);

// Override‐candle endpoint (manual OHLC or auto “up”/“down”)
router.post('/override-candle', adminCtrl.overrideCandle);

module.exports = router;

