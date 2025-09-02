// backend/routes/jackpot.js
const express = require('express');
const router = express.Router();
const jackpotController = require('../controllers/jackpotController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/jackpot/history - Get jackpot history (monthly and weekly awards)
router.get('/history', jackpotController.getJackpotHistory);

// GET /api/jackpot/winners - Get winners history with pagination
router.get('/winners', jackpotController.getWinnersHistory);

// GET /api/jackpot/monthly - Get monthly jackpot data
router.get('/monthly', authMiddleware, jackpotController.getMonthlyJackpot);

// GET /api/jackpot/weekly - Get weekly jackpot data
router.get('/weekly', authMiddleware, jackpotController.getWeeklyJackpot);

module.exports = router;
