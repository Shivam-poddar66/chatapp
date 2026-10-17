const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

class AuthService {
    static generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );
    }

    static verifyToken(token) {
        return jwt.verify(token, jwtConfig.secret);
    }

    static async register({ name, email, phone, password }) {
        const existing = await User.findByEmail(email);
        if (existing) {
            const error = new Error('Email is already registered');
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        });

        const token = this.generateToken(user);
        return { user, token };
    }

    static async login({ email, password }) {
        const userWithPassword = await User.findByEmail(email);
        if (!userWithPassword) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, userWithPassword.password);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findById(userWithPassword.id);
        const token = this.generateToken(user);
        return { user, token };
    }
}

module.exports = AuthService;
