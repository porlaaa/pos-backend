const cofig = require('../config/config');

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: statusCode,
        message: err.message,
        stack: cofig.nodeEnv === 'development' ? err.stack : ""
    });
}

module.exports = globalErrorHandler;