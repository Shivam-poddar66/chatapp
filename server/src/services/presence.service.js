const User = require('../models/User');

class PresenceService {
    constructor() {
        // Map<userId, Set<socketId>>
        this.userSockets = new Map();
    }

    async userConnected(userId, socketId) {
        const idStr = String(userId);
        if (!this.userSockets.has(idStr)) {
            this.userSockets.set(idStr, new Set());
        }
        this.userSockets.get(idStr).add(socketId);

        // Update database status if this is the first active connection
        if (this.userSockets.get(idStr).size === 1) {
            await User.updateStatus(userId, 'online');
            return true; // Newly online
        }
        return false;
    }

    async userDisconnected(userId, socketId) {
        const idStr = String(userId);
        if (this.userSockets.has(idStr)) {
            const sockets = this.userSockets.get(idStr);
            sockets.delete(socketId);

            if (sockets.size === 0) {
                this.userSockets.delete(idStr);
                await User.updateStatus(userId, 'offline');
                return true; // Truly went offline
            }
        }
        return false;
    }

    isUserOnline(userId) {
        const idStr = String(userId);
        return this.userSockets.has(idStr) && this.userSockets.get(idStr).size > 0;
    }

    getOnlineUserIds() {
        return Array.from(this.userSockets.keys()).map(id => parseInt(id, 10));
    }
}

module.exports = new PresenceService();
