const config = require('../config/config');

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: config.nodeEnv === 'development' ? err.stack : ""
    });
}

module.exports = globalErrorHandler;