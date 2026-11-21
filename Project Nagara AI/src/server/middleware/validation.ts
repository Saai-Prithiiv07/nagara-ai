/**
 * Server Middleware: Request Body Validation
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Schema validation for incoming request payloads
 * - Field-level error compilation
 * - HTTP status code 400 (Bad Request)
 * - Input sanitization before controller invocation
 */

import { AppError } from '../errors/AppError';
import { InputSanitizer } from './auth';

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: unknown) => boolean;
  errorMessage: string;
}

export class RequestValidator {
  /**
   * Validates a request body against a set of rules.
   * Throws an AppError with status 400 if validation fails.
   */
  public static validateBody<T extends Record<string, unknown>>(
    body: unknown,
    rules: ValidationRule<T>[]
  ): T {
    if (typeof body !== 'object' || body === null) {
      throw new AppError('Invalid request payload: Request body must be a JSON object', 400);
    }

    const payload = InputSanitizer.sanitizeNoSqlInput(body as Record<string, unknown>) as T;
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const val = payload[rule.field];
      if (!rule.validate(val)) {
        errors[String(rule.field)] = rule.errorMessage;
      }
    }

    if (Object.keys(errors).length > 0) {
      const combinedMsg = Object.entries(errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('; ');
      throw new AppError(`Validation failed: ${combinedMsg}`, 400);
    }

    return payload;
  }
}

// Preset validation rules for common endpoints
export const LoginValidationRules: ValidationRule<{ email: string; password: string }>[] = [
  {
    field: 'email',
    validate: (val) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    errorMessage: 'A valid email address is required',
  },
  {
    field: 'password',
    validate: (val) => typeof val === 'string' && val.length >= 8,
    errorMessage: 'Password must be at least 8 characters long',
  },
];

export const AllocationValidationRules: ValidationRule<{
  wardId: string;
  interventionId: string;
  units: number;
}>[] = [
  {
    field: 'wardId',
    validate: (val) => typeof val === 'string' && val.trim().length > 0,
    errorMessage: 'wardId is required and must be non-empty',
  },
  {
    field: 'interventionId',
    validate: (val) => typeof val === 'string' && val.trim().length > 0,
    errorMessage: 'interventionId is required and must be non-empty',
  },
  {
    field: 'units',
    validate: (val) => typeof val === 'number' && Number.isInteger(val) && val > 0 && val <= 100,
    errorMessage: 'units must be an integer between 1 and 100',
  },
];
