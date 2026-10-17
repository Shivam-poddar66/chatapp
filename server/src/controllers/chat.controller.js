const Conversation = require('../models/Conversation');
const ChatService = require('../services/chat.service');
const ApiResponse = require('../utils/response');

class ChatController {
    static async getOrCreateWithUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const targetUserId = parseInt(req.params.userId, 10);

            if (currentUserId === targetUserId) {
                return ApiResponse.error(res, 'Cannot create conversation with yourself', 400);
            }

            const conversation = await ChatService.getOrCreatePrivateConversation(currentUserId, targetUserId);
            const otherUser = await Conversation.getOtherParticipant(conversation.id, currentUserId);

            return ApiResponse.success(res, {
                conversation: {
                    ...conversation,
                    participant: otherUser
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static async getMessages(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const conversationId = parseInt(req.params.conversationId, 10);
            const { beforeId, limit } = req.query;

            const isParticipant = await Conversation.isParticipant(conversationId, currentUserId);
            if (!isParticipant) {
                return ApiResponse.error(res, 'Access denied: You are not a participant in this conversation', 403);
            }

            const messages = await ChatService.getMessages(conversationId, { beforeId, limit });
            return ApiResponse.success(res, { messages });
        } catch (err) {
            next(err);
        }
    }

    static async markAsRead(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const conversationId = parseInt(req.params.conversationId, 10);
            const { senderId } = req.body;

            const isParticipant = await Conversation.isParticipant(conversationId, currentUserId);
            if (!isParticipant) {
                return ApiResponse.error(res, 'Access denied', 403);
            }

            const updatedIds = await ChatService.markAsRead(conversationId, senderId);
            return ApiResponse.success(res, { updatedIds });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ChatController;
