const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { createWithdrawal } = require('../controllers/withdrawController');

// All withdrawal routes require auth
router.use(auth);

// POST /api/withdraw
router.post('/', createWithdrawal);

module.exports = router;

