// backend/routes/withdraw.js
const express            = require('express');
const router             = express.Router();
const withdrawController = require('../controllers/withdrawController');

// POST /api/withdraw → request a withdrawal
router.post('/', withdrawController.requestWithdraw);

// GET  /api/withdraw → list your withdrawals
router.get('/',  withdrawController.listWithdrawals);

module.exports = router;
