const express = require('express');
const router = express.Router();

// Import controller for user
const { getMe } = require('../controllers/userController');
// Authentication middleware
const authenticate = require('../middleware/authenticate');

/**
 * @route   GET /api/user/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

module.exports = router;

