/**
 * NAGARA AI Backend Server Entry Point
 * -------------------------------------------------------------
 * Sets up environment configurations, initializes database connections,
 * launches scheduled background cron jobs, and mounts REST endpoints.
 */

import { expressApp } from './app';
import { cronManager } from './system/cronJobs';
import { redisCache } from './system/redisCache';

export async function startServer(port = 4000) {
  console.log(`[NAGARA AI] Initializing municipal backend engine on port ${port}...`);

  // Initialize background scheduled cron workers
  cronManager.registerJob('sensor-telemetry-heartbeat', '*/15 * * * *');

  // Verify Redis caching layer
  await redisCache.set('server:status', 'HEALTHY', 60);

  console.log('[NAGARA AI] Backend server services ready.');
  return expressApp;
}

export * from './app';
export * from './errors/AppError';
export * from './middleware/auth';
export * from './middleware/rateLimiter';
export * from './middleware/validation';
export * from './middleware/upload';
export * from './middleware/errorHandler';
export * from './db/postgres/queries';
export * from './db/mongo/models';
export * from './db/mongo/crud';
export * from './db/mongo/aggregations';
export * from './ai/llmService';
export * from './system/redisCache';
export * from './system/websocketServer';
export * from './system/cronJobs';
export * from './system/thirdPartyApi';
export * from './system/ssr';
