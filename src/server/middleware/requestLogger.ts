/**
 * Structured JSON Request Logger Middleware
 * Kisan Bhai Platform
 */

import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.id || 'anonymous',
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']?.substring(0, 80),
    };

    if (res.statusCode >= 400) {
      console.warn(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl} (${durationMs}ms) User: ${logData.userId}`);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl} (${durationMs}ms)`);
    }
  });

  next();
}
