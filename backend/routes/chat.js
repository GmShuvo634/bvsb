// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

// GET /api/chat/messages - Get recent chat messages (public)
router.get('/messages', chatController.getMessages);

// POST /api/chat/send - Send a chat message (requires auth or guest session)
router.post('/send', optionalAuth, chatController.sendMessage);

// DELETE /api/chat/messages/:messageId - Delete a message (admin only)
router.delete('/messages/:messageId', authMiddleware, chatController.deleteMessage);

// GET /api/chat/stats - Get chat statistics (admin only)
router.get('/stats', authMiddleware, chatController.getChatStats);

module.exports = router;
