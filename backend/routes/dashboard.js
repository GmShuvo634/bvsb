// backend/routes/dashboard.js
const router   = require('express').Router();
const dashCtrl = require('../controllers/dashboardController');

// GET /api/get-dashboard
router.get('/', dashCtrl.getDashboard);

module.exports = router;

