const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const pool = require('./config/database');
const websocketConfig = require('./config/websocket');
const setupSockets = require('./sockets');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, websocketConfig);
setupSockets(io);

// Verify DB connection and start listening
async function bootstrap() {
    try {
        const [result] = await pool.query('SELECT 1 + 1 AS test');
        logger.info('✅ MySQL Database connected successfully.');

        server.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
            logger.info(`⚡ Socket.IO listening on port ${PORT}`);
            logger.info(`📡 Client origin allowed: ${websocketConfig.cors.origin}`);
        });
    } catch (err) {
        logger.error('❌ Failed to connect to database:', err);
        process.exit(1);
    }
}

bootstrap();

module.exports = { app, server, io };
