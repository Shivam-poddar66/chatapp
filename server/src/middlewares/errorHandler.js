const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

function errorHandler(err, req, res, next) {
    logger.error('Unhandled API Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return ApiResponse.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = errorHandler;
