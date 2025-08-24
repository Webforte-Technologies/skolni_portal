import { Request, Response, NextFunction } from 'express';
import { UserActivityModel } from '../models/UserActivity';
import { RequestWithUser } from './auth';
import { UserActivityLog } from '../types/database';

interface ActivityLoggerOptions {
  excludePaths?: string[];
  excludeMethods?: string[];
  activityType?: string;
  includeResponseData?: boolean;
}

interface ActivityData {
  endpoint: string;
  method: string;
  query: any;
  body?: any;
  response_time: number;
  status_code: number;
  user_agent?: string;
  ip_address?: string;
  timestamp: string;
  response_data?: any;
  credits_used?: number;
  ai_model?: string;
  tokens_used?: number;
}

/**
 * Middleware to automatically log user activities
 */
export const activityLogger = (options: ActivityLoggerOptions = {}) => {
  const {
    excludePaths = ['/health', '/metrics', '/favicon.ico'],
    excludeMethods = ['OPTIONS'],
    activityType = 'api_call',
    includeResponseData = false
  } = options;

  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    // Skip if path or method should be excluded
    if (excludePaths.some(path => req.path.includes(path)) || 
        excludeMethods.includes(req.method)) {
      return next();
    }

    // Skip if user is not authenticated
    if (!req.user) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response data
    res.send = function(data: any) {
      const responseTime = Date.now() - startTime;
      
      // Log the activity asynchronously (don't block the response)
      setImmediate(async () => {
        try {
          const activityData: ActivityData = {
            endpoint: req.path,
            method: req.method,
            query: req.query,
            response_time: responseTime,
            status_code: res.statusCode,
            timestamp: new Date().toISOString()
          };

          // Only add optional properties when they have values
          if (req.method !== 'GET') {
            activityData.body = sanitizeRequestBody(req.body);
          }

          const userAgentValue = req.get('User-Agent');
          if (userAgentValue) {
            activityData.user_agent = userAgentValue;
          }

          const ipAddressValue = req.ip || (req.connection as any).remoteAddress;
          if (ipAddressValue) {
            activityData.ip_address = ipAddressValue;
          }

          if (includeResponseData && res.statusCode < 400) {
            try {
              activityData.response_data = typeof data === 'string' ? JSON.parse(data) : data;
            } catch {
              // Ignore if response data is not JSON
            }
          }

          // Extract credit usage and AI model info from response data
          if (data && typeof data === 'string') {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.credits_used) {
                activityData.credits_used = parsedData.credits_used;
              }
              if (parsedData.model_used) {
                activityData.ai_model = parsedData.model_used;
              }
              if (parsedData.tokens_used) {
                activityData.tokens_used = parsedData.tokens_used;
              }
            } catch {
              // Ignore parsing errors
            }
          }

          const logData: Parameters<typeof UserActivityModel.logActivity>[0] = {
            user_id: req.user!.id,
            activity_type: determineActivityType(req, res),
            activity_data: {
              ...activityData,
              // Add more meaningful details
              user_email: req.user!.email,
              user_role: req.user!.role,
              method: req.method,
              path: req.path,
              timestamp: new Date().toISOString()
            }
          };

          // Only add optional properties when they have values
          const ipAddressValue2 = req.ip || (req.connection as any).remoteAddress;
          if (ipAddressValue2) {
            logData.ip_address = ipAddressValue2;
          }

          const userAgentValue2 = req.get('User-Agent');
          if (userAgentValue2) {
            logData.user_agent = userAgentValue2;
          }

          const sessionId = req.get('X-Session-ID');
          if (sessionId) {
            logData.session_id = sessionId;
          }

          await UserActivityModel.logActivity(logData);
        } catch (error) {
          console.error('Failed to log user activity:', error);
          // Don't throw - just log the error
        }
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Determine the activity type based on the request
 */
function determineActivityType(req: Request, res: Response): UserActivityLog['activity_type'] {
  // Authentication endpoints
  if (req.path.includes('/auth/login')) return 'login';
  if (req.path.includes('/auth/logout')) return 'logout';
  if (req.path.includes('/auth/register')) return 'login'; // Use login for registration

  // AI-related endpoints - Enhanced detection
  if (req.path.includes('/ai/')) {
    if (req.path.includes('/chat')) return 'conversation_started';
    if (req.path.includes('/generate')) return 'file_generated';
    if (req.path.includes('/worksheet') || req.path.includes('/lesson-plan') || 
        req.path.includes('/quiz') || req.path.includes('/project') || 
        req.path.includes('/presentation') || req.path.includes('/activity')) {
      return 'file_generated';
    }
    return 'api_call';
  }

  // Admin endpoints
  if (req.path.includes('/admin/')) return 'api_call';

  // File operations
  if (req.path.includes('/files/') || req.path.includes('/materials/')) {
    if (req.method === 'POST') return 'file_generated';
    if (req.method === 'GET') return 'page_view';
    if (req.method === 'DELETE') return 'api_call';
    return 'api_call';
  }

  // Profile updates
  if (req.path.includes('/profile') && req.method !== 'GET') return 'profile_updated';

  // Credit operations
  if (req.path.includes('/credits')) return 'credits_used';

  // Conversations
  if (req.path.includes('/conversations')) {
    if (req.method === 'POST') return 'conversation_started';
    return 'page_view';
  }

  // Default to API call
  return 'api_call';
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'api_key'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Log specific user actions manually
 */
export const logUserAction = async (
  userId: string, 
  actionType: UserActivityLog['activity_type'], 
  actionData: Record<string, any> = {},
  req?: Request
) => {
  try {
    const logData: Parameters<typeof UserActivityModel.logActivity>[0] = {
      user_id: userId,
      activity_type: actionType,
      activity_data: {
        ...actionData,
        // Add timestamp and ensure we have meaningful details
        timestamp: new Date().toISOString(),
        // If we have a request, add more context
        ...(req && {
          method: req.method,
          path: req.path,
          user_agent: req.get('User-Agent'),
          ip_address: req.ip || (req.connection as any)?.remoteAddress
        })
      }
    };

    // Only add optional properties when they have values
    if (req) {
      const ipAddress = req.ip || (req.connection as any)?.remoteAddress;
      if (ipAddress) {
        logData.ip_address = ipAddress;
      }

      const userAgent = req.get('User-Agent');
      if (userAgent) {
        logData.user_agent = userAgent;
      }

      const sessionId = req.get('X-Session-ID');
      if (sessionId) {
        logData.session_id = sessionId;
      }
    }

    // Debug logging in development
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Logging user action:', {
        userId,
        actionType,
        actionData: logData.activity_data,
        ipAddress: logData.ip_address,
        userAgent: logData.user_agent
      });
    }

    await UserActivityModel.logActivity(logData);
  } catch (error) {
    console.error('Failed to log user action:', error);
  }
};

/**
 * Middleware specifically for page views
 */
export const pageViewLogger = activityLogger({
  activityType: 'page_view',
  excludePaths: ['/health', '/metrics', '/favicon.ico', '/api/'],
  excludeMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
});

/**
 * Middleware specifically for API calls
 */
export const apiCallLogger = activityLogger({
  activityType: 'api_call',
  includeResponseData: false
});
