// backend/routes/fund.js
const router = require('express').Router();
const ctrl   = require('../controllers/fundController');
// Import the middleware as a function export (not destructured)
const protect = require('../middleware/authMiddleware');

// All fund routes require a valid JWT
router.get('/',  protect, ctrl.getBalance);
router.post('/', protect, ctrl.deposit);

module.exports = router;

