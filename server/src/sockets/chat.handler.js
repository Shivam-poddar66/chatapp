const ChatService = require('../services/chat.service');
const logger = require('../utils/logger');

// Simple in-memory rate limiter per socket: max 5 messages per second
const messageRateMap = new Map();

function registerChatHandlers(io, socket) {
    const user = socket.user;
    const userId = user.id;

    // 1. Send 1-on-1 Message
    socket.on('message:send', async (data, ackCallback) => {
        try {
            const { recipientId, content, tempId } = data || {};

            if (!recipientId || !content) {
                const errPayload = { success: false, error: 'Recipient and content are required' };
                if (typeof ackCallback === 'function') ackCallback(errPayload);
                return;
            }

            // Rate limiting check
            const now = Date.now();
            const userTimestamps = messageRateMap.get(userId) || [];
            const recent = userTimestamps.filter(t => now - t < 1000);
            if (recent.length >= 5) {
                const errPayload = { success: false, error: 'Rate limit exceeded. Please wait a moment.' };
                if (typeof ackCallback === 'function') ackCallback(errPayload);
                return;
            }
            recent.push(now);
            messageRateMap.set(userId, recent);

            // Process message (PII masking and save to DB)
            const { message, conversation } = await ChatService.processAndSaveMessage({
                senderId: userId,
                recipientId: parseInt(recipientId, 10),
                content
            });

            const payload = {
                id: message.id,
                tempId,
                conversationId: conversation.id,
                senderId: userId,
                senderName: user.name,
                senderAvatar: user.avatar,
                recipientId: parseInt(recipientId, 10),
                content: message.content, // Masked content
                status: message.status,
                createdAt: message.created_at
            };

            // Deliver to recipient's private room
            io.to(`user_${recipientId}`).emit('message:receive', payload);

            // Emit confirmation back to sender
            socket.emit('message:sent', {
                tempId,
                message: payload,
                conversationId: conversation.id
            });

            if (typeof ackCallback === 'function') {
                ackCallback({ success: true, message: payload, tempId });
            }
        } catch (err) {
            logger.error(`Error in message:send handler: ${err.message}`);
            const errPayload = { success: false, error: err.message };
            if (typeof ackCallback === 'function') ackCallback(errPayload);
        }
    });

    // 2. Typing Indicator
    socket.on('message:typing', ({ recipientId, isTyping }) => {
        if (!recipientId) return;
        io.to(`user_${recipientId}`).emit('user:typing', {
            senderId: userId,
            isTyping: Boolean(isTyping)
        });
    });

    // 3. Read Receipts (Seen event)
    socket.on('message:seen', async ({ conversationId, messageIds, senderId }) => {
        try {
            if (!conversationId || !senderId) return;

            // Mark in database
            const updatedIds = await ChatService.markAsRead(conversationId, senderId);

            const effectiveIds = (messageIds && messageIds.length > 0) ? messageIds : updatedIds;

            if (effectiveIds && effectiveIds.length > 0) {
                // Notify the sender that their messages were read
                io.to(`user_${senderId}`).emit('message:status_update', {
                    conversationId,
                    messageIds: effectiveIds,
                    status: 'read'
                });
            }
        } catch (err) {
            logger.error(`Error in message:seen handler: ${err.message}`);
        }
    });
}

module.exports = registerChatHandlers;
