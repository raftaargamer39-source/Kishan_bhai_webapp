/**
 * Production Environment Configuration & Validation
 * Kisan Bhai Platform
 */

import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  demoMode: boolean;
  jwtSecret: string;
  jwtExpiresIn: string;
  geminiApiKey: string;
  appUrl: string;
  corsOrigins: string[];
  maxUploadSizeBytes: number;
  rateLimitAuthWindowMs: number;
  rateLimitAuthMaxReqs: number;
  rateLimitAiWindowMs: number;
  rateLimitAiMaxReqs: number;
  weatherCacheTtlMs: number;
  mandiCacheTtlMs: number;
  mandiApiKey: string;
  databaseUrl?: string;
  redisUrl?: string;
  sentryDsn?: string;
}

const isProd = process.env.NODE_ENV === 'production';

export const config: AppConfig = {
  env: (process.env.NODE_ENV as any) || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  // Strict DEMO_MODE flag: false by default in production, true only if explicitly requested
  demoMode: process.env.DEMO_MODE === 'true' || (!isProd && process.env.DEMO_MODE !== 'false'),
  jwtSecret: process.env.JWT_SECRET || 'kisan_bhai_secure_jwt_production_secret_key_2026_seed_to_sale',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  appUrl: process.env.APP_URL || 'https://kishanbhai.in',
  corsOrigins: process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : ['*'],
  maxUploadSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '10485760', 10), // 10MB default
  rateLimitAuthWindowMs: 60 * 1000, // 1 minute
  rateLimitAuthMaxReqs: 10,
  rateLimitAiWindowMs: 60 * 1000,
  rateLimitAiMaxReqs: 20,
  weatherCacheTtlMs: 30 * 60 * 1000, // 30 minutes
  mandiCacheTtlMs: 60 * 60 * 1000, // 1 hour
  mandiApiKey: process.env.MANDI_API_KEY || process.env.DATA_GOV_IN_API_KEY || '9ef84268-d588-465a-a308-a864a43d0070',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  sentryDsn: process.env.SENTRY_DSN,
};
