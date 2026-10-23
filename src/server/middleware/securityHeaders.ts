/**
 * Production Security Headers Middleware
 * Kisan Bhai Platform
 */

import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Frame options: Allow embedding in AI Studio preview iframe while securing content
  // Do not send SAMEORIGIN so iframe preview works seamlessly

  // XSS Auditor
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy: Enable camera, microphone, and geolocation for farming tools and voice navigation
  res.setHeader('Permissions-Policy', 'camera=*, microphone=*, geolocation=*');

  // Strict Transport Security (HSTS in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}
