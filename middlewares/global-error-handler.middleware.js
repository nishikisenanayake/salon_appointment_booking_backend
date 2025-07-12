import logger from "../util/logger.js"

function globalErrorHandler(error, req, res, next) {
    error.statusCode = error.statusCode || 500
    error.status = error.status || "error"
    error.message = error.message || "internal server Error"

    // different log levels with client or server errors
    if (error.statusCode >= 500) {
        logger.error({
            message: error.message,
        })
    } else {
        logger.warn({
            message: error.message,
        })
    }

    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
    })
}

export default globalErrorHandler
