/**
 * Centralized Server-Side Error Handling Middleware
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Proper HTTP status code usage (200, 201, 400, 401, 403, 404, 429, 500)
 * - Operational vs programming error differentiation
 * - Sanitized error envelopes for production environments
 */

import { AppError } from '../errors/AppError';

export interface ErrorResponseEnvelope {
  status: 'fail' | 'error';
  statusCode: number;
  message: string;
  timestamp: string;
  stack?: string;
}

export function handleServerSideError(
  err: Error | AppError,
  isProduction = process.env.NODE_ENV === 'production'
): { statusCode: number; payload: ErrorResponseEnvelope } {
  let statusCode = 500;
  let status: 'fail' | 'error' = 'error';
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    status = 'fail';
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid authentication token signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Authentication token has expired';
  } else {
    // Unhandled unexpected programming errors
    message = isProduction ? 'An unexpected internal server error occurred' : err.message;
  }

  const payload: ErrorResponseEnvelope = {
    status,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: err.stack }),
  };

  return { statusCode, payload };
}

/**
 * Async Handler Wrapper (Higher-Order Function)
 * Eliminates repetitive try-catch blocks in async REST controllers.
 */
export function catchAsync<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  return (...args: TArgs): Promise<TReturn> => {
    return fn(...args).catch((err) => {
      throw err;
    });
  };
}
