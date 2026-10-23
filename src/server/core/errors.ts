/**
 * Centralized Application Error Classes & Structured Error Codes
 * Kisan Bhai Platform
 */

import { Response } from 'express';

export type ErrorCode =
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_USER_EXISTS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'RESOURCE_NOT_FOUND'
  | 'IDOR_VIOLATION'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'AI_QUOTA_EXCEEDED'
  | 'WEATHER_SERVICE_UNAVAILABLE'
  | 'MARKET_DATA_UNAVAILABLE'
  | 'IMAGE_INVALID'
  | 'IMAGE_TOO_LARGE'
  | 'PAYMENT_REQUIRED'
  | 'DEMO_MODE_DISABLED'
  | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details?: any;

  constructor(message: string, statusCode = 500, code: ErrorCode = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required. Please sign in.', code: ErrorCode = 'AUTH_UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.', code: ErrorCode = 'AUTH_FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource was not found.', code: ErrorCode = 'RESOURCE_NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters.', details?: any) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMITED', { retryAfterSeconds });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code: ErrorCode = 'AI_SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: any) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
    error: null,
  });
}

export function sendError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      error: {
        code: error.code,
        message: error.message,
        details: error.details || null,
      },
    });
  }

  const genericMsg =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : (error as Error)?.message || 'Internal Server Error';

  console.error('[Centralized Error Handler]', error);

  return res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: genericMsg,
      details: null,
    },
  });
}
