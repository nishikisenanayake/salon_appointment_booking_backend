class CustomError extends Error {
    constructor(message, statusCode, details = null) {
        super(message)
        this.statusCode = statusCode
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error" // fail for client errors and error for server errors
        this.details = details
        this.isOperational = true // this property is used to check if the error is operational or not

        Error.captureStackTrace(this, this.constructor)
    }
}

export default CustomError
