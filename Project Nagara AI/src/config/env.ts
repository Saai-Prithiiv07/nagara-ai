/**
 * Environment Variables & Secrets Management Service
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Centralized parsing and validation of environment variables
 * - Type-safe configuration access
 * - Defensive fallback defaults with security auditing
 * - Secrets isolation from client-side bundles
 */

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  host: string;
  jwtSecret: string;
  jwtExpiryHours: number;
  bcryptSaltRounds: number;
  databaseUrl: string;
  mongodbUri: string;
  redisUrl: string;
  aiProvider: string;
  openaiApiKey?: string;
  awsRegion: string;
}

export function loadEnvironmentConfig(): AppConfig {
  const env = process.env;

  // Validate critical security secrets
  const jwtSecret = env.JWT_SECRET || 'nagara_ai_fallback_secret_development_only';
  if (env.NODE_ENV === 'production' && jwtSecret.includes('fallback')) {
    throw new Error('SECURITY CRITICAL: JWT_SECRET must be explicitly provided in production!');
  }

  return {
    nodeEnv: (env.NODE_ENV as AppConfig['nodeEnv']) || 'development',
    port: env.PORT ? parseInt(env.PORT, 10) : 4000,
    host: env.HOST || '0.0.0.0',
    jwtSecret,
    jwtExpiryHours: env.JWT_EXPIRY_HOURS ? parseInt(env.JWT_EXPIRY_HOURS, 10) : 24,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS ? parseInt(env.BCRYPT_SALT_ROUNDS, 10) : 10,
    databaseUrl:
      env.DATABASE_URL ||
      'postgresql://nagara_admin:nagara_pass@localhost:5432/nagara_db?schema=public',
    mongodbUri: env.MONGODB_URI || 'mongodb://localhost:27017/nagara_telemetry',
    redisUrl: env.REDIS_URL || 'redis://localhost:6379',
    aiProvider: env.AI_PROVIDER || 'openai',
    openaiApiKey: env.OPENAI_API_KEY,
    awsRegion: env.AWS_REGION || 'ap-south-1',
  };
}

export const appConfig = loadEnvironmentConfig();
