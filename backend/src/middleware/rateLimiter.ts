import express from 'express';
import { RequestWithUser } from './auth';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (in production, use Redis)
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    const entry = store[key];
    if (entry && entry.resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: RequestWithUser) => string; // Custom key generator
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions): express.RequestHandler {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    keyGenerator = (req: RequestWithUser) => {
      // Ensure we always return a string, fallback to IP if no user ID
      const userId = req.user?.id;
      const ip = req.ip || 'unknown';
      return userId ? `user_${userId}` : `ip_${ip}`;
    }
  } = options;

  return (req: RequestWithUser, res: express.Response, next: express.NextFunction): void => {
    const key = keyGenerator(req);
    
    // Ensure key is always a string
    if (!key || typeof key !== 'string') {
      // Fallback to IP-based key if key generation fails
      const fallbackKey = `ip_${req.ip || 'unknown'}`;
      return handleRateLimit(fallbackKey, windowMs, maxRequests, message, res, next);
    }

    handleRateLimit(key, windowMs, maxRequests, message, res, next);
  };
}

/**
 * Helper function to handle rate limiting logic
 */
function handleRateLimit(
  key: string,
  windowMs: number,
  maxRequests: number,
  message: string,
  res: express.Response,
  next: express.NextFunction
): void {
  const now = Date.now();
  const resetTime = now + windowMs;

  // Initialize or get existing record
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime
    };
  } else {
    store[key].count++;
  }

  const current = store[key];

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - current.count).toString(),
    'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
  });

  // Check if limit exceeded
  if (current.count > maxRequests) {
    res.status(429).json({
      success: false,
      error: message,
      details: {
        limit: maxRequests,
        windowMs,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      }
    });
    return;
  }

  next();
}

/**
 * Bulk operations rate limiter
 * Limits bulk operations to prevent abuse
 */
export const bulkOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 bulk operations per 15 minutes
  message: 'Příliš mnoho hromadných operací. Zkuste to znovu za 15 minut.',
  keyGenerator: (req: RequestWithUser) => {
    const userId = req.user?.id;
    const ip = req.ip || 'unknown';
    return `bulk_${userId || ip}`;
  }
});

/**
 * Search rate limiter
 * Limits search requests to prevent abuse
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60, // 60 searches per minute
  message: 'Příliš mnoho vyhledávacích požadavků. Zkuste to znovu za chvíli.',
  keyGenerator: (req: RequestWithUser) => {
    const userId = req.user?.id;
    const ip = req.ip || 'unknown';
    return `search_${userId || ip}`;
  }
});

/**
 * Notification rate limiter
 * Limits notification sending to prevent spam
 */
export const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 notifications per hour
  message: 'Příliš mnoho oznámení odesláno. Zkuste to znovu za hodinu.',
  keyGenerator: (req: RequestWithUser) => {
    const userId = req.user?.id;
    const ip = req.ip || 'unknown';
    return `notification_${userId || ip}`;
  }
});

/**
 * General API rate limiter
 * General protection against API abuse
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 requests per 15 minutes
  message: 'Příliš mnoho požadavků. Zkuste to znovu za 15 minut.',
  keyGenerator: (req: RequestWithUser) => {
    const userId = req.user?.id;
    const ip = req.ip || 'unknown';
    return `general_${userId || ip}`;
  }
});
