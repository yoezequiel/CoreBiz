/**
 * Custom Error Classes
 * Provides structured error handling for the application
 */

/**
 * Application Error
 * Base error class for all application errors
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error
 * For input validation failures
 */
export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, "VALIDATION_ERROR");
        this.errors = errors;
    }
}

/**
 * Authentication Error
 * For authentication failures
 */
export class AuthenticationError extends AppError {
    constructor(message = "No autorizado") {
        super(message, 401, "AUTHENTICATION_ERROR");
    }
}

/**
 * Authorization Error
 * For permission/access denied errors
 */
export class AuthorizationError extends AppError {
    constructor(message = "Acceso denegado") {
        super(message, 403, "AUTHORIZATION_ERROR");
    }
}

/**
 * Not Found Error
 * For resource not found errors
 */
export class NotFoundError extends AppError {
    constructor(resource = "Recurso") {
        super(`${resource} no encontrado`, 404, "NOT_FOUND_ERROR");
    }
}

/**
 * Conflict Error
 * For resource conflict errors (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, "CONFLICT_ERROR");
    }
}

/**
 * Database Error
 * For database operation errors
 */
export class DatabaseError extends AppError {
    constructor(message = "Error de base de datos", originalError = null) {
        super(message, 500, "DATABASE_ERROR");
        this.originalError = originalError;
    }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log error (in production, use proper logging service)
    console.error("[ERROR]", {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user?.userId,
    });

    // Handle specific error types
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Token inválido",
            code: "INVALID_TOKEN",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expirado",
            code: "TOKEN_EXPIRED",
        });
    }

    // Return structured error response
    const statusCode = err.statusCode || err.status || 500;
    const message = err.isOperational
        ? err.message
        : "Error interno del servidor";

    const response = {
        success: false,
        message,
        code: err.code || "INTERNAL_ERROR",
    };

    // Include additional error details in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
        if (err.errors) {
            response.errors = err.errors;
        }
    }

    res.status(statusCode).json(response);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
