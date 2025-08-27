// routes/price.js
const express = require('express');
const { getPrice, getSupportedChains } = require('../controllers/priceController');
const router = express.Router();

// GET /api/price - Get current ETH/USD price
// Query params: ?chainId=11155111 (optional)
router.get('/', getPrice);

// GET /api/price/chains - Get supported chains
router.get('/chains', getSupportedChains);

module.exports = router;

