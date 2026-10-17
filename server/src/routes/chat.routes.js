const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// Get or start conversation with a user
router.get('/user/:userId', ChatController.getOrCreateWithUser);

// Get paginated messages for a conversation
router.get('/:conversationId/messages', ChatController.getMessages);

// Mark conversation messages as read
router.post('/:conversationId/read', ChatController.markAsRead);

module.exports = router;
