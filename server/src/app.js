const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const websocketConfig = require('./config/websocket');

const app = express();

// Middleware
app.use(cors(websocketConfig.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Root
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Full-Stack Real-Time Private Chat API',
        version: '1.0.0',
        documentation: '/CHAT_SYSTEM_DOCUMENTATION.md',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            conversations: '/api/conversations',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
