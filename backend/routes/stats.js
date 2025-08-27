// backend/routes/stats.js
const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

// GET /api/stats → return user trade metrics
router.get('/', authMiddleware, getStats);

module.exports = router;

