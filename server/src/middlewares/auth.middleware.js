const AuthService = require('../services/auth.service');
const User = require('../models/User');
const ApiResponse = require('../utils/response');

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ApiResponse.error(res, 'Authentication required: missing or invalid Bearer token', 401);
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = AuthService.verifyToken(token);
        } catch (jwtErr) {
            return ApiResponse.error(res, 'Authentication failed: token expired or invalid', 401);
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return ApiResponse.error(res, 'User no longer exists', 401);
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = authMiddleware;
