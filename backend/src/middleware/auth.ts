import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { User } from '../types/database';

// Extend Express Request interface to include user
// Add `user` to Express Request in a safe way for lint rules
export type RequestWithUser = Request & { user?: Omit<User, 'password_hash'> };

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  school_id?: string;
  iat: number;
  exp: number;
}

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload: Record<string, any> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  if (user.school_id) {
    payload['school_id'] = user.school_id;
  }

  const secret = process.env['JWT_SECRET'] || 'fallback-secret';

  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Verify JWT token middleware
export const authenticateToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const secret = process.env['JWT_SECRET'] || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Get user from database
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
      return;
    }

    // Remove password_hash from user object
    const userWithoutPassword = { ...(user as any) } as any;
    delete userWithoutPassword.password_hash;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  }
};

// Require specific role middleware
export const requireRole = (roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: RequestWithUser, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const secret = process.env['JWT_SECRET'] || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    const user = await UserModel.findById(decoded.userId);
    if (user && user.is_active) {
      const userWithoutPassword = { ...(user as any) } as any;
      delete userWithoutPassword.password_hash;
      req.user = userWithoutPassword;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
}; 