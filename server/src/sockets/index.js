const socketAuth = require('../middlewares/socketAuth');
const registerPresenceHandlers = require('./presence.handler');
const registerChatHandlers = require('./chat.handler');
const logger = require('../utils/logger');

function setupSockets(io) {
    // Authenticate all incoming socket connections via JWT
    io.use(socketAuth);

    io.on('connection', (socket) => {
        const user = socket.user;
        const userRoom = `user_${user.id}`;

        // Join private user room for targeted notifications
        socket.join(userRoom);
        logger.info(`Socket connected: ${socket.id} (User: ${user.name} - ID: ${user.id}) joined room ${userRoom}`);

        // Register event handler domains
        registerPresenceHandlers(io, socket);
        registerChatHandlers(io, socket);

        socket.on('error', (err) => {
            logger.error(`Socket ${socket.id} error:`, err);
        });
    });
}

module.exports = setupSockets;
