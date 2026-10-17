const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/response');

class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, phone, password } = req.body;
            const result = await AuthService.register({ name, email, phone, password });
            return ApiResponse.success(res, result, 'User registered successfully', 201);
        } catch (err) {
            next(err);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });
            return ApiResponse.success(res, result, 'Login successful');
        } catch (err) {
            next(err);
        }
    }

    static async getMe(req, res, next) {
        try {
            return ApiResponse.success(res, { user: req.user }, 'Current user profile');
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AuthController;
