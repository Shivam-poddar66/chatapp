const User = require('../models/User');
const PresenceService = require('../services/presence.service');
const ApiResponse = require('../utils/response');

class UserController {
    static async getContacts(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const contacts = await User.getAllContacts(currentUserId);

            // Enhance contacts with real-time in-memory presence if available
            const enhanced = contacts.map(c => ({
                ...c,
                status: PresenceService.isUserOnline(c.id) ? 'online' : c.status
            }));

            return ApiResponse.success(res, { contacts: enhanced });
        } catch (err) {
            next(err);
        }
    }

    static async search(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const query = req.query.q || '';
            if (!query.trim()) {
                return ApiResponse.success(res, { users: [] });
            }

            const users = await User.search(query.trim(), currentUserId);
            const enhanced = users.map(u => ({
                ...u,
                status: PresenceService.isUserOnline(u.id) ? 'online' : u.status
            }));

            return ApiResponse.success(res, { users: enhanced });
        } catch (err) {
            next(err);
        }
    }

    static async getProfile(req, res, next) {
        try {
            const userId = parseInt(req.params.id, 10);
            const user = await User.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }

            const enhanced = {
                ...user,
                status: PresenceService.isUserOnline(user.id) ? 'online' : user.status
            };

            return ApiResponse.success(res, { user: enhanced });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;
