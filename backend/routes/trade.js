// backend/routes/trade.js
const router    = require('express').Router();
const tradeCtrl = require('../controllers/tradeController');
// Import middleware as default export function (not destructured)
const protect = require('../middleware/authMiddleware');

// Place a new trade
// POST /api/trade
router.post('/',          protect, tradeCtrl.createTrade);

// Get all open (pending) trades for the authenticated user
// GET /api/trade/open
router.get('/open',       protect, tradeCtrl.getOpenTrades);

// Get full trade history for the authenticated user
// GET /api/trade/history
router.get('/history',    protect, tradeCtrl.getTradeHistory);

// (Optional) Manually settle a trade if you need to trigger it early
// POST /api/trade/:id/settle
router.post('/:id/settle', protect, tradeCtrl.settleTrade);

module.exports = router;

