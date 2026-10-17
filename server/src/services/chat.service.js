const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const MaskingService = require('./masking.service');

class ChatService {
    static async getOrCreatePrivateConversation(user1Id, user2Id) {
        return await Conversation.findOrCreatePrivate(user1Id, user2Id);
    }

    static async processAndSaveMessage({ senderId, recipientId, content }) {
        if (!content || !content.trim()) {
            throw new Error('Message content cannot be empty');
        }

        // 1. Get or create private conversation
        const conversation = await this.getOrCreatePrivateConversation(senderId, recipientId);

        // 2. Sensitive PII Masking Engine (Phone & Email Regex Sanitizer)
        const maskedContent = MaskingService.maskMessage(content.trim());

        // 3. Save to database with prepared statement
        const message = await Message.create({
            conversationId: conversation.id,
            senderId,
            originalContent: content.trim(),
            maskedContent,
            status: 'sent'
        });

        return {
            message,
            conversation
        };
    }

    static async getMessages(conversationId, { beforeId = null, limit = 30 }) {
        return await Message.getHistory(conversationId, { beforeId, limit });
    }

    static async markAsRead(conversationId, senderId) {
        return await Message.markAsRead(conversationId, senderId);
    }
}

module.exports = ChatService;
