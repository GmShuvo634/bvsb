const express = require('express');
const router = express.Router();

// Import controllers
const { getMe } = require('../controllers/userController');
const userActivityController = require('../controllers/userActivityController');

// Authentication middleware
const authenticate = require('../middleware/authenticate');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/user/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   GET /api/user/activity
 * @desc    Get user activity history
 * @access  Private
 */
router.get('/activity', authMiddleware, userActivityController.getUserActivity);

/**
 * @route   GET /api/user/activity/stats
 * @desc    Get user activity statistics
 * @access  Private
 */
router.get('/activity/stats', authMiddleware, userActivityController.getUserActivityStats);

/**
 * @route   GET /api/user/trades
 * @desc    Get user's trade history
 * @access  Private
 */
router.get('/trades', authMiddleware, userActivityController.getUserTrades);

/**
 * @route   GET /api/user/bets
 * @desc    Get user's betting history
 * @access  Private
 */
router.get('/bets', authMiddleware, userActivityController.getUserBets);

/**
 * @route   GET /api/user/stats
 * @desc    Get comprehensive user statistics
 * @access  Private
 */
router.get('/stats', authMiddleware, userActivityController.getUserStats);

/**
 * @route   POST /api/user/activity
 * @desc    Log user activity
 * @access  Private
 */
router.post('/activity', authMiddleware, userActivityController.logUserActivity);

module.exports = router;

