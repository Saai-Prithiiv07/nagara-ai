/**
 * Server-Side Error Handling: Custom AppError Class
 * -------------------------------------------------------------
 * Provides operational error abstraction with explicit HTTP status codes
 * and standardized error envelopes.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capturing stack trace excluding constructor call safely
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export function createBadRequestError(msg: string) {
  return new AppError(msg, 400);
}

export function createUnauthorizedError(msg = 'Authentication required') {
  return new AppError(msg, 401);
}

export function createForbiddenError(msg = 'Access denied: Insufficient permissions') {
  return new AppError(msg, 403);
}

export function createNotFoundError(msg = 'Resource not found') {
  return new AppError(msg, 404);
}

export function createRateLimitError(msg = 'Too many requests. Please try again later.') {
  return new AppError(msg, 429);
}

export function createInternalError(msg = 'Internal server error') {
  return new AppError(msg, 500);
}
