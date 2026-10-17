const AuthService = require('../services/auth.service');
const User = require('../models/User');
const logger = require('../utils/logger');

async function socketAuth(socket, next) {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            logger.warn(`Socket connection rejected: No token provided (${socket.id})`);
            return next(new Error('Authentication error: Token required'));
        }

        let decoded;
        try {
            decoded = AuthService.verifyToken(token);
        } catch (err) {
            logger.warn(`Socket connection rejected: Invalid token (${socket.id}) - ${err.message}`);
            return next(new Error('Authentication error: Invalid or expired token'));
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        // Attach authenticated user to socket
        socket.user = user;
        next();
    } catch (err) {
        logger.error(`Socket auth exception: ${err.message}`);
        next(new Error('Authentication internal error'));
    }
}

module.exports = socketAuth;
