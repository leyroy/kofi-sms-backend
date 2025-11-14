"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.AppError = exports.ErrorCode = void 0;
const library_1 = require("@prisma/client/runtime/library");
const http_status_1 = require("../lib/http-status");
// Custom error class
var ErrorCode;
(function (ErrorCode) {
    //general
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["BAD_REQUEST"] = "BAD_REQUES";
    //auth
    ErrorCode["AUTH_EMAIL_ALREADY_EXISTS"] = "AUTH_EMAIL_ALREADY_EXISTS";
    ErrorCode["AUTH_INVALID_TOKEN"] = "AUTH_INVALID_TOKEN";
    ErrorCode["AUTH_USER_NOT_FOUND"] = "AUTH_USER_NOT_FOUND";
    ErrorCode["AUTH_NOT_FOUND"] = "AUTH_NOT_FOUND";
    ErrorCode["AUTH_REFRESH_TOKEN_NOT_FOUND"] = "AUTH_REFRESH_TOKEN_NOT_FOUND";
    ErrorCode["AUTH_TOO_MANY_ATTEMPTS"] = "AUTH_TOO_MANY_ATTEMPTS";
    ErrorCode["AUTH_UNAUTHORIZED_ACCESS"] = "AUTH_UNAUTHORIZED_ACCESS";
    ErrorCode["AUTH_TOKEN_NOT_FOUND"] = "AUTH_TOKEN_NOT_FOUND";
    // Access Control Errors
    ErrorCode["ACCESS_FORBIDDEN"] = "ACCESS_FORBIDDEN";
    ErrorCode["ACCESS_UNAUTHORIZED"] = "ACCESS_UNAUTHORIZED";
    ErrorCode["INVALID_PASSWORD"] = "INVALID_PASSWORD";
    // Validation and Resource Errors
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    // System Errors
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["VERIFICATION_ERROR"] = "VERIFICATION_ERROR";
    //file upload
    ErrorCode["FILE_UPLOAD_ERROR"] = "FILE_UPLOAD_ERROR";
    ErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class AppError extends Error {
    constructor({ message, statusCode = 500, errorCode = ErrorCode.INTERNAL_SERVER_ERROR, isOperational = true, }) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    setRequestInfo(path, method) {
        this.path = path;
        this.method = method;
        return this;
    }
}
exports.AppError = AppError;
// Default console logger
class ConsoleLogger {
    error(message, meta) {
        console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
    warn(message, meta) {
        console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
    info(message, meta) {
        console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
}
class ErrorHandler {
    constructor(logger, isDevelopment = process.env.NODE_ENV === "development") {
        // Express error middleware
        this.handleError = (error, req, res, next) => {
            let appError;
            // Convert known errors to AppError
            if (error instanceof AppError) {
                appError = error;
            }
            else {
                appError = this.convertToAppError(error);
            }
            // Add request info if not already present
            if (!appError.path && !appError.method) {
                appError.setRequestInfo(req.path, req.method);
            }
            // Log the error
            this.logError(appError, req);
            // Send error response
            this.sendErrorResponse(appError, res, req.headers["x-request-id"]);
        };
        // Async wrapper to catch async errors in route handlers
        this.catchAsync = (fn) => {
            return (req, res, next) => {
                Promise.resolve(fn(req, res, next)).catch(next);
            };
        };
        this.logger = logger || new ConsoleLogger();
        this.isDevelopment = isDevelopment;
    }
    // Convert various error types to AppError
    convertToAppError(error) {
        console.log(error);
        // Prisma/Mongoose errors
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            switch (error.code) {
                case "P2002": // Unique constraint
                    const field = error.meta?.target;
                    return new AppError({
                        message: `${field ? field.join(", ") : "Field"} already exists`,
                        statusCode: http_status_1.HTTPSTATUS.CONFLICT,
                        errorCode: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
                    });
                case "P2025": // Record not found
                    return new AppError({
                        message: "Record not found",
                        statusCode: http_status_1.HTTPSTATUS.NOT_FOUND,
                        errorCode: ErrorCode.NOT_FOUND,
                    });
                case "P2003": // Foreign key constraint
                    return new AppError({
                        message: "Invalid reference to related record",
                        statusCode: http_status_1.HTTPSTATUS.BAD_REQUEST,
                        errorCode: ErrorCode.BAD_REQUEST,
                    });
                case "P2014": // Required relation missing
                    return new AppError({
                        message: "Required relationship is missing",
                        statusCode: http_status_1.HTTPSTATUS.CONFLICT,
                    });
                default:
                    console.error("Prisma known error:", error);
                    return new AppError({
                        message: "Database operation failed",
                        statusCode: http_status_1.HTTPSTATUS.BAD_GATEWAY,
                    });
            }
        }
        if (error instanceof library_1.PrismaClientValidationError) {
            console.error("Prisma validation error:", error.message);
            return new AppError({
                message: "Invalid data format",
                statusCode: http_status_1.HTTPSTATUS.BAD_REQUEST,
            });
        }
        if (error instanceof library_1.PrismaClientInitializationError) {
            console.error("Prisma initialization error:", error);
            return new AppError({
                message: "Database connection failed",
                statusCode: http_status_1.HTTPSTATUS.BAD_GATEWAY,
            });
        }
        if (error instanceof library_1.PrismaClientUnknownRequestError) {
            console.error("Prisma unknown error:", error);
            return new AppError({
                message: "Unexpected database error",
                statusCode: http_status_1.HTTPSTATUS.BAD_GATEWAY,
            });
        }
        // JWT errors
        if (error.name === "JsonWebTokenError") {
            return new AppError({
                message: "Invalid token",
                statusCode: http_status_1.HTTPSTATUS.UNAUTHORIZED,
                errorCode: ErrorCode.AUTH_INVALID_TOKEN,
            });
        }
        if (error.name === "TokenExpiredError") {
            return new AppError({
                message: "Token expired",
                statusCode: http_status_1.HTTPSTATUS.UNAUTHORIZED,
                errorCode: ErrorCode.AUTH_INVALID_TOKEN,
            });
        }
        // Multer errors
        if (error.name === "MulterError") {
            const multerError = error;
            if (multerError.code === "LIMIT_FILE_SIZE") {
                return new AppError({
                    message: "File is too large",
                    errorCode: ErrorCode.FILE_TOO_LARGE,
                    statusCode: http_status_1.HTTPSTATUS.FILE_TOO_LARGE,
                });
            }
            return new AppError({
                message: "File upload error",
                statusCode: http_status_1.HTTPSTATUS.BAD_REQUEST,
                errorCode: ErrorCode.FILE_UPLOAD_ERROR,
            });
        }
        // Default for unknown errors
        return new AppError({
            message: this.isDevelopment ? error.message : "Internal server error",
            statusCode: http_status_1.HTTPSTATUS.BAD_REQUEST,
            errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
            isOperational: false,
        });
    }
    // Log error with context
    logError(error, req) {
        const logData = {
            message: error.message,
            statusCode: error.statusCode,
            timestamp: error.timestamp,
            path: error.path || req?.path,
            method: error.method || req?.method,
            userAgent: req?.get("User-Agent"),
            ip: req?.ip,
            userId: req?.user?.id,
            requestId: req?.headers["x-request-id"],
            stack: this.isDevelopment ? error.stack : undefined,
        };
        if (error.statusCode >= 500) {
            this.logger.error("Server Error", logData);
        }
        else if (error.statusCode >= 400) {
            this.logger.warn("Client Error", logData);
        }
        else {
            this.logger.info("Error Info", logData);
        }
    }
    // Send formatted error response
    sendErrorResponse(error, res, requestId) {
        const errorResponse = {
            success: false,
            error: {
                message: error.message,
                statusCode: error.statusCode,
                errorCode: error.errorCode,
                timestamp: error.timestamp,
                path: String(error.path),
                method: error.method,
                requestId,
                ...(this.isDevelopment && { stack: error.stack }),
            },
        };
        res.status(error.statusCode).json(errorResponse);
    }
    // Handle uncaught exceptions and unhandled rejections
    setupGlobalHandlers() {
        process.on("uncaughtException", (error) => {
            this.logger.error("Uncaught Exception - Shutting down gracefully", {
                error: error.message,
                stack: error.stack,
            });
            process.exit(1);
        });
        process.on("unhandledRejection", (reason, promise) => {
            this.logger.error("Unhandled Rejection - Shutting down gracefully", {
                reason: reason?.message || reason,
                stack: reason?.stack,
            });
            process.exit(1);
        });
    }
    // Create specific error types
    static badRequest(message = "Bad Request") {
        return new AppError({ message, statusCode: http_status_1.HTTPSTATUS.BAD_REQUEST });
    }
    static unauthorized(message = "Unauthorized Action") {
        //TODO: implement critical alert
        return new AppError({
            message,
            statusCode: http_status_1.HTTPSTATUS.UNAUTHORIZED,
            errorCode: ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
        });
    }
    static forbidden(message = "Forbidden") {
        return new AppError({
            message,
            statusCode: http_status_1.HTTPSTATUS.FORBIDDEN,
            errorCode: ErrorCode.ACCESS_FORBIDDEN,
        });
    }
    static notFound(message = "Resource not found") {
        return new AppError({
            message,
            statusCode: http_status_1.HTTPSTATUS.NOT_FOUND,
            errorCode: ErrorCode.NOT_FOUND,
        });
    }
    static conflict(message = "Conflict") {
        return new AppError({
            message,
            statusCode: http_status_1.HTTPSTATUS.CONFLICT,
            errorCode: ErrorCode.CONFLICT,
        });
    }
    static internal(message = "Internal Server Error") {
        return new AppError({
            message,
            statusCode: http_status_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
            isOperational: false,
        });
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map