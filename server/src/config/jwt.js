const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_chatapp_2026_dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
