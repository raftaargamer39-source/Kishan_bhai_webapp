/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Kisan Bhai Platform
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../core/errors.js';

interface RateLimitRecord {
  timestamps: number[];
}

const ipBuckets = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipBuckets.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 10 * 60 * 1000);
    if (record.timestamps.length === 0) {
      ipBuckets.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(options: { windowMs: number; maxRequests: number; prefix?: string }) {
  const { windowMs, maxRequests, prefix = 'default' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${prefix}:${ip}`;
    const now = Date.now();

    if (!ipBuckets.has(key)) {
      ipBuckets.set(key, { timestamps: [] });
    }

    const record = ipBuckets.get(key)!;
    // Keep timestamps within window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      return next(new RateLimitError(`Too many requests. Please retry in ${retryAfterSeconds}s.`, retryAfterSeconds));
    }

    record.timestamps.push(now);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.timestamps.length));
    next();
  };
}
