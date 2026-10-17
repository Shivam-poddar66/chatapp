const ApiResponse = require('../utils/response');

function validateBody(requiredFields) {
    return (req, res, next) => {
        const missing = [];
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return ApiResponse.error(res, `Missing required fields: ${missing.join(', ')}`, 400);
        }

        next();
    };
}

module.exports = {
    validateBody
};
