import type { Request, Response, NextFunction } from "express";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { HTTPSTATUS, type HttpStatusCode } from "../lib/http-status";

// Custom error class
const enum ErrorCode {
  //general
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  BAD_REQUEST = "BAD_REQUES",

  //auth
  AUTH_EMAIL_ALREADY_EXISTS = "AUTH_EMAIL_ALREADY_EXISTS",
  AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
  AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  AUTH_NOT_FOUND = "AUTH_NOT_FOUND",
  AUTH_REFRESH_TOKEN_NOT_FOUND = "AUTH_REFRESH_TOKEN_NOT_FOUND",
  AUTH_TOO_MANY_ATTEMPTS = "AUTH_TOO_MANY_ATTEMPTS",
  AUTH_UNAUTHORIZED_ACCESS = "AUTH_UNAUTHORIZED_ACCESS",
  AUTH_TOKEN_NOT_FOUND = "AUTH_TOKEN_NOT_FOUND",

  // Access Control Errors
  ACCESS_FORBIDDEN = "ACCESS_FORBIDDEN",
  ACCESS_UNAUTHORIZED = "ACCESS_UNAUTHORIZED",
  INVALID_PASSWORD = "INVALID_PASSWORD",

  // Validation and Resource Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  // System Errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  VERIFICATION_ERROR = "VERIFICATION_ERROR",

  //file upload
  FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
}

export { ErrorCode };

interface AppErrorTypes {
  message?: string;
  statusCode?: number;
  errorCode?: string;
  isOperational?: boolean;
}
export class AppError extends Error {
  public statusCode: HttpStatusCode;
  public isOperational: boolean;
  public errorCode: string;
  public timestamp: string;
  public path?: string;
  public method?: string;

  constructor({
    message,
    statusCode = 500,
    errorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational = true,
  }: AppErrorTypes) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  setRequestInfo(path: string, method: string): this {
    this.path = path;
    this.method = method;
    return this;
  }
}

// Logger interface for dependency injection
interface Logger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
}

// Default console logger
class ConsoleLogger implements Logger {
  error(message: string, meta?: any): void {
    console.error(
      `[ERROR] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  }

  warn(message: string, meta?: any): void {
    console.warn(
      `[WARN] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  }

  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    errorCode: string;
    timestamp: string;
    path?: string | undefined;
    method?: string | undefined;
    requestId?: string | undefined;
    stack?: string | undefined;
  };
}

export class ErrorHandler {
  private logger: Logger;
  private isDevelopment: boolean;

  constructor(
    logger?: Logger,
    isDevelopment: boolean = process.env.NODE_ENV === "development"
  ) {
    this.logger = logger || new ConsoleLogger();
    this.isDevelopment = isDevelopment;
  }

  // Express error middleware
  public handleError = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    let appError: AppError;

    // Convert known errors to AppError
    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = this.convertToAppError(error);
    }

    // Add request info if not already present
    if (!appError.path && !appError.method) {
      appError.setRequestInfo(req.path, req.method);
    }

    // Log the error
    this.logError(appError, req);

    // Send error response
    this.sendErrorResponse(
      appError,
      res,
      req.headers["x-request-id"] as string
    );
  };

  // Convert various error types to AppError
  private convertToAppError(error: Error): AppError {
    console.log(error);
    // Prisma/Mongoose errors
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": // Unique constraint
          const field = error.meta?.target as string[];
          return new AppError({
            message: `${field ? field.join(", ") : "Field"} already exists`,
            statusCode: HTTPSTATUS.CONFLICT,
            errorCode: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
          });

        case "P2025": // Record not found
          return new AppError({
            message: "Record not found",
            statusCode: HTTPSTATUS.NOT_FOUND,
            errorCode: ErrorCode.NOT_FOUND,
          });

        case "P2003": // Foreign key constraint
          return new AppError({
            message: "Invalid reference to related record",
            statusCode: HTTPSTATUS.BAD_REQUEST,
            errorCode: ErrorCode.BAD_REQUEST,
          });

        case "P2014": // Required relation missing
          return new AppError({
            message: "Required relationship is missing",
            statusCode: HTTPSTATUS.CONFLICT,
          });

        default:
          console.error("Prisma known error:", error);
          return new AppError({
            message: "Database operation failed",
            statusCode: HTTPSTATUS.BAD_GATEWAY,
          });
      }
    }

    if (error instanceof PrismaClientValidationError) {
      console.error("Prisma validation error:", error.message);
      return new AppError({
        message: "Invalid data format",
        statusCode: HTTPSTATUS.BAD_REQUEST,
      });
    }

    if (error instanceof PrismaClientInitializationError) {
      console.error("Prisma initialization error:", error);
      return new AppError({
        message: "Database connection failed",
        statusCode: HTTPSTATUS.BAD_GATEWAY,
      });
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      console.error("Prisma unknown error:", error);
      return new AppError({
        message: "Unexpected database error",
        statusCode: HTTPSTATUS.BAD_GATEWAY,
      });
    }

    // JWT errors
    if (error.name === "JsonWebTokenError") {
      return new AppError({
        message: "Invalid token",
        statusCode: HTTPSTATUS.UNAUTHORIZED,
        errorCode: ErrorCode.AUTH_INVALID_TOKEN,
      });
    }

    if (error.name === "TokenExpiredError") {
      return new AppError({
        message: "Token expired",
        statusCode: HTTPSTATUS.UNAUTHORIZED,
        errorCode: ErrorCode.AUTH_INVALID_TOKEN,
      });
    }

    // Multer errors
    if (error.name === "MulterError") {
      const multerError = error as any;
      if (multerError.code === "LIMIT_FILE_SIZE") {
        return new AppError({
          message: "File is too large",
          errorCode: ErrorCode.FILE_TOO_LARGE,
          statusCode: HTTPSTATUS.FILE_TOO_LARGE,
        });
      }
      return new AppError({
        message: "File upload error",
        statusCode: HTTPSTATUS.BAD_REQUEST,
        errorCode: ErrorCode.FILE_UPLOAD_ERROR,
      });
    }

    // Default for unknown errors
    return new AppError({
      message: this.isDevelopment ? error.message : "Internal server error",
      statusCode: HTTPSTATUS.BAD_REQUEST,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
    });
  }

  // Log error with context
  private logError(error: AppError, req?: Request): void {
    const logData = {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      path: error.path || req?.path,
      method: error.method || req?.method,
      userAgent: req?.get("User-Agent"),
      ip: req?.ip,
      userId: (req as any)?.user?.id,
      requestId: req?.headers["x-request-id"],
      stack: this.isDevelopment ? error.stack : undefined,
    };

    if (error.statusCode >= 500) {
      this.logger.error("Server Error", logData);
    } else if (error.statusCode >= 400) {
      this.logger.warn("Client Error", logData);
    } else {
      this.logger.info("Error Info", logData);
    }
  }

  // Send formatted error response
  private sendErrorResponse(
    error: AppError,
    res: Response,
    requestId?: string
  ): void {
    const errorResponse: ErrorResponse = {
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
  public setupGlobalHandlers(): void {
    process.on("uncaughtException", (error: Error) => {
      this.logger.error("Uncaught Exception - Shutting down gracefully", {
        error: error.message,
        stack: error.stack,
      });

      process.exit(1);
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      this.logger.error("Unhandled Rejection - Shutting down gracefully", {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });

      process.exit(1);
    });
  }

  // Async wrapper to catch async errors in route handlers
  public catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  // Create specific error types
  public static badRequest(message: string = "Bad Request"): AppError {
    return new AppError({ message, statusCode: HTTPSTATUS.BAD_REQUEST });
  }

  public static unauthorized(
    message: string = "Unauthorized Action"
  ): AppError {
    //TODO: implement critical alert
    return new AppError({
      message,
      statusCode: HTTPSTATUS.UNAUTHORIZED,
      errorCode: ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    });
  }

  public static forbidden(message: string = "Forbidden"): AppError {
    return new AppError({
      message,
      statusCode: HTTPSTATUS.FORBIDDEN,
      errorCode: ErrorCode.ACCESS_FORBIDDEN,
    });
  }

  public static notFound(message: string = "Resource not found"): AppError {
    return new AppError({
      message,
      statusCode: HTTPSTATUS.NOT_FOUND,
      errorCode: ErrorCode.NOT_FOUND,
    });
  }

  public static conflict(message: string = "Conflict"): AppError {
    return new AppError({
      message,
      statusCode: HTTPSTATUS.CONFLICT,
      errorCode: ErrorCode.CONFLICT,
    });
  }

  public static internal(message: string = "Internal Server Error"): AppError {
    return new AppError({
      message,
      statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
    });
  }
}
