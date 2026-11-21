/**
 * Server Middleware: Rate Limiting
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Denial-of-Service (DoS) and brute-force mitigation
 * - Sliding window in-memory rate limiter
 * - HTTP status code 429 (Too Many Requests)
 */

import { AppError } from '../errors/AppError';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export class InMemoryRateLimiter {
  private requestStore = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly message: string;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.message = options.message || 'Rate limit exceeded: Too many requests, please try again later';
  }

  public checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.requestStore.get(clientIp) || [];
    // Filter out timestamps outside the active window
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      this.requestStore.set(clientIp, timestamps);
      return { allowed: false, remaining: 0, resetMs };
    }

    timestamps.push(now);
    this.requestStore.set(clientIp, timestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetMs: this.windowMs,
    };
  }

  public enforce(clientIp: string): void {
    const status = this.checkRateLimit(clientIp);
    if (!status.allowed) {
      throw new AppError(this.message, 429);
    }
  }
}

export const apiRateLimiter = new InMemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'API rate limit exceeded. Max 100 requests per minute.',
});

export const authRateLimiter = new InMemoryRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Authentication rate limit reached. Please wait before retrying.',
});
