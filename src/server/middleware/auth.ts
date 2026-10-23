/**
 * Authentication & Authorization Middleware
 * JWT Validation, Role-Based Access Control (RBAC), and IDOR Verification
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../core/config.js';
import { UnauthorizedError, ForbiddenError } from '../core/errors.js';
import { UserProfile } from '../../../shared/types.js';
import { db } from '../db.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'FARMER' | 'CHAMPION' | 'BUYER' | 'ADMIN';
  fullName: string;
  village: string;
  state: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      village: user.village,
      state: user.state,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (!token) {
    // If running in development / demo mode with a fallback demo user
    const fallbackUserId = (req.headers['x-farmer-id'] as string) || 'usr_farmer_ramesh';
    const fallbackUser = db.users.get(fallbackUserId);
    if (fallbackUser && (config.demoMode || process.env.NODE_ENV !== 'production')) {
      req.user = {
        id: fallbackUser.id,
        email: fallbackUser.email,
        role: fallbackUser.role,
        fullName: fallbackUser.fullName,
        village: fallbackUser.village,
        state: fallbackUser.state,
      };
      return next();
    }
    return next(new UnauthorizedError('Authentication token missing or invalid.', 'AUTH_UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Authentication token expired or invalid.', 'AUTH_INVALID_TOKEN'));
  }
}

export function requireRole(...allowedRoles: ('FARMER' | 'CHAMPION' | 'BUYER' | 'ADMIN')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (req.user.role === 'ADMIN') {
      // Super-admin has universal clearance
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

export function verifyOwnership(resourceOwnerId: string, currentUser?: AuthenticatedUser): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'ADMIN') return true;
  return currentUser.id === resourceOwnerId;
}
