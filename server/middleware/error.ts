import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Custom error class for API errors
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public errors?: any[]
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Error handler middleware
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.errors
        });
    }

    // Handle API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            message: err.message,
            errors: err.errors
        });
    }

    // Handle database errors
    if (err.name === 'DatabaseError') {
        return res.status(500).json({
            message: 'Database error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle file system errors
    if (err.name === 'FileSystemError') {
        return res.status(500).json({
            message: 'File system error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle authentication errors
    if (err.name === 'AuthenticationError') {
        return res.status(401).json({
            message: 'Authentication error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle authorization errors
    if (err.name === 'AuthorizationError') {
        return res.status(403).json({
            message: 'Authorization error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle not found errors
    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            message: 'Resource not found',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle rate limit errors
    if (err.name === 'RateLimitError') {
        return res.status(429).json({
            message: 'Too many requests',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle other errors
    return res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path
    });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Validation error handler
export const validationErrorHandler = (err: ZodError) => {
    return new ApiError(400, 'Validation error', err.errors);
};

// Database error handler
export const databaseErrorHandler = (err: Error) => {
    return new ApiError(500, 'Database error', [err.message]);
};

// File system error handler
export const fileSystemErrorHandler = (err: Error) => {
    return new ApiError(500, 'File system error', [err.message]);
};

// Authentication error handler
export const authenticationErrorHandler = (err: Error) => {
    return new ApiError(401, 'Authentication error', [err.message]);
};

// Authorization error handler
export const authorizationErrorHandler = (err: Error) => {
    return new ApiError(403, 'Authorization error', [err.message]);
};

// Not found error handler
export const notFoundErrorHandler = (err: Error) => {
    return new ApiError(404, 'Resource not found', [err.message]);
};

// Rate limit error handler
export const rateLimitErrorHandler = (err: Error) => {
    return new ApiError(429, 'Too many requests', [err.message]);
}; 