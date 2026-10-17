const PresenceService = require('../services/presence.service');
const logger = require('../utils/logger');

function registerPresenceHandlers(io, socket) {
    const user = socket.user;
    const userId = user.id;

    // Handle user connection
    PresenceService.userConnected(userId, socket.id).then((isFirstConnection) => {
        if (isFirstConnection) {
            logger.info(`User ${user.name} (${userId}) came ONLINE`);
            io.emit('user:status_changed', {
                userId,
                status: 'online',
                lastSeen: null
            });
        }
    }).catch(err => {
        logger.error(`Error registering user presence connect: ${err.message}`);
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
        try {
            const isTrulyOffline = await PresenceService.userDisconnected(userId, socket.id);
            if (isTrulyOffline) {
                const now = new Date().toISOString();
                logger.info(`User ${user.name} (${userId}) went OFFLINE`);
                io.emit('user:status_changed', {
                    userId,
                    status: 'offline',
                    lastSeen: now
                });
            }
        } catch (err) {
            logger.error(`Error in socket disconnect handler: ${err.message}`);
        }
    });
}

module.exports = registerPresenceHandlers;
