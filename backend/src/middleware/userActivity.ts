import { Request, Response, NextFunction } from 'express';
import { UserActivityModel } from '../models/UserActivity';
import { RequestWithUser } from './auth';

export interface ActivityLogOptions {
  activity_type: 'login' | 'logout' | 'page_view' | 'api_call' | 'file_generated' | 
                 'conversation_started' | 'credits_used' | 'profile_updated' | 
                 'password_changed' | 'email_verified' | 'subscription_changed';
  activity_data?: Record<string, any>;
  skip_logging?: boolean;
}

// Middleware to log user activity
export const logUserActivity = (options: ActivityLogOptions) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log activity after response is sent
      if (req.user && !options.skip_logging) {
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        UserActivityModel.logActivity({
          user_id: req.user.id,
          activity_type: options.activity_type,
          activity_data: {
            ...options.activity_data,
            method: req.method,
            path: req.path,
            status_code: res.statusCode,
            response_size: data ? data.length : 0
          },
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: req.sessionID
        }).catch(error => {
          console.error('Failed to log user activity:', error);
        });

        // Update user's last activity timestamp
        UserActivityModel.updateLastActivity(req.user.id).catch(error => {
          console.error('Failed to update user last activity:', error);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to log page views
export const logPageView = (pageName?: string) => {
  return logUserActivity({
    activity_type: 'page_view',
    activity_data: {
      page: pageName || 'unknown'
    }
  });
};

// Middleware to log API calls
export const logApiCall = (apiName?: string) => {
  return logUserActivity({
    activity_type: 'api_call',
    activity_data: {
      api: apiName || 'unknown'
    }
  });
};

// Helper function to log specific activities
export const logActivity = async (
  userId: string, 
  activityType: ActivityLogOptions['activity_type'], 
  activityData?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await UserActivityModel.logActivity({
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
