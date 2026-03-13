import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { AppError } from './error.middleware';
import { AuthenticatedRequest } from '../types';

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header and attaches user data to request.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || '',
      collegeId: decoded.collegeId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(AppError.unauthorized('Invalid or expired token'));
    }
  }
}

/**
 * Admin-only middleware. Must be used AFTER authMiddleware.
 */
export function adminMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(AppError.unauthorized());
  }

  if (req.user.role !== 'ADMIN') {
    return next(AppError.forbidden('Admin access required'));
  }

  next();
}
