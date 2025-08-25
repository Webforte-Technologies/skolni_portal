import pool from '../database/connection';
import { UserNotification, CreateUserNotificationRequest } from '../types/database';
import { cacheService } from '../services/CacheService';

export class UserNotificationModel {
  // Create a new user notification
  static async create(notificationData: CreateUserNotificationRequest): Promise<UserNotification> {
    const {
      user_id,
      notification_type,
      title,
      message,
      severity = 'info',
      expires_at,
      action_url,
      action_text,
      metadata = {}
    } = notificationData;

    const query = `
      INSERT INTO user_notifications (
        user_id, notification_type, title, message, severity, 
        expires_at, action_url, action_text, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      user_id,
      notification_type,
      title,
      message,
      severity,
      expires_at,
      action_url,
      action_text,
      JSON.stringify(metadata)
    ];

    const result = await pool.query(query, values);
    
    // Clear cache for this user and notification stats
    cacheService.clearUserCache(user_id);
    cacheService.del('notification_stats');
    
    return result.rows[0];
  }

  // Get user notifications with pagination and filters
  static async getUserNotifications(filters: {
    user_id?: string;
    notification_type?: string;
    is_read?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ notifications: UserNotification[]; total: number }> {
    const {
      user_id,
      notification_type,
      is_read,
      limit = 50,
      offset = 0
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (user_id) {
      conditions.push(`user_id = $${i}`);
      values.push(user_id);
      i++;
    }

    if (notification_type) {
      conditions.push(`notification_type = $${i}`);
      values.push(notification_type);
      i++;
    }

    if (typeof is_read === 'boolean') {
      conditions.push(`is_read = $${i}`);
      values.push(is_read);
      i++;
    }

    // Filter out expired notifications
    conditions.push(`(expires_at IS NULL OR expires_at > NOW())`);

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM user_notifications
      ${where}
      ORDER BY created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM user_notifications ${where}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      notifications: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<UserNotification | null> {
    const query = `
      UPDATE user_notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId]);
    
    if (result.rows[0]) {
      // Clear cache for notification stats and user cache
      cacheService.del('notification_stats');
      cacheService.clearUserCache(result.rows[0].user_id);
    }
    
    return result.rows[0] || null;
  }

  // Mark all user notifications as read
  static async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE user_notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rowCount && result.rowCount > 0) {
      // Clear cache for notification stats and user cache
      cacheService.del('notification_stats');
      cacheService.clearUserCache(userId);
    }
    
    return result.rowCount || 0;
  }

  // Get unread notifications count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) FROM user_notifications
      WHERE user_id = $1 AND is_read = false AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Delete a notification
  static async delete(notificationId: string): Promise<boolean> {
    // Get user_id before deletion for cache clearing
    const getQuery = 'SELECT user_id FROM user_notifications WHERE id = $1';
    const getResult = await pool.query(getQuery, [notificationId]);
    
    const query = 'DELETE FROM user_notifications WHERE id = $1';
    const result = await pool.query(query, [notificationId]);
    
    if (result.rowCount && result.rowCount > 0 && getResult.rows[0]) {
      // Clear cache for notification stats and user cache
      cacheService.del('notification_stats');
      cacheService.clearUserCache(getResult.rows[0].user_id);
    }
    
    return (result.rowCount || 0) > 0;
  }

  // Delete expired notifications
  static async deleteExpired(): Promise<number> {
    const query = `
      DELETE FROM user_notifications
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `;
    const result = await pool.query(query);
    return result.rowCount || 0;
  }

  // Send notification to multiple users
  static async sendToMultipleUsers(
    userIds: string[],
    notificationData: Omit<CreateUserNotificationRequest, 'user_id'>
  ): Promise<UserNotification[]> {
    const notifications: UserNotification[] = [];

    for (const userId of userIds) {
      const notification = await this.create({
        ...notificationData,
        user_id: userId
      });
      notifications.push(notification);
    }

    // Clear cache for all affected users and notification stats
    userIds.forEach(userId => cacheService.clearUserCache(userId));
    cacheService.del('notification_stats');

    return notifications;
  }

  // Get notification statistics for admin dashboard with caching
  static async getNotificationStats(filters: {
    start_date?: string;
    end_date?: string;
    notification_type?: string;
  } = {}): Promise<{
    total_notifications: number;
    unread_notifications: number;
    notifications_by_type: Record<string, number>;
    notifications_by_severity: Record<string, number>;
    recent_notifications: UserNotification[];
  }> {
    // Use cache for default filters (no filters = all data)
    if (Object.keys(filters).length === 0) {
      const cached = cacheService.getNotificationStats();
      if (cached) {
        return cached as {
          total_notifications: number;
          unread_notifications: number;
          notifications_by_type: Record<string, number>;
          notifications_by_severity: Record<string, number>;
          recent_notifications: UserNotification[];
        };
      }
    }
    const { start_date, end_date, notification_type } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (start_date) {
      conditions.push(`created_at >= $${i}`);
      values.push(start_date);
      i++;
    }

    if (end_date) {
      conditions.push(`created_at <= $${i}`);
      values.push(end_date);
      i++;
    }

    if (notification_type) {
      conditions.push(`notification_type = $${i}`);
      values.push(notification_type);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total notifications
    const totalQuery = `SELECT COUNT(*) FROM user_notifications ${where}`;
    const totalResult = await pool.query(totalQuery, values);
    const totalNotifications = parseInt(totalResult.rows[0].count);

    // Get unread notifications
    const unreadQuery = `
      SELECT COUNT(*) FROM user_notifications 
      ${where} ${where ? 'AND' : 'WHERE'} is_read = false
    `;
    const unreadResult = await pool.query(unreadQuery, values);
    const unreadNotifications = parseInt(unreadResult.rows[0].count);

    // Get notifications by type
    const typeQuery = `
      SELECT notification_type, COUNT(*) as count
      FROM user_notifications
      ${where}
      GROUP BY notification_type
    `;
    const typeResult = await pool.query(typeQuery, values);
    const notificationsByType: Record<string, number> = {};
    typeResult.rows.forEach((row: any) => {
      notificationsByType[row.notification_type] = parseInt(row.count);
    });

    // Get notifications by severity
    const severityQuery = `
      SELECT severity, COUNT(*) as count
      FROM user_notifications
      ${where}
      GROUP BY severity
    `;
    const severityResult = await pool.query(severityQuery, values);
    const notificationsBySeverity: Record<string, number> = {};
    severityResult.rows.forEach((row: any) => {
      notificationsBySeverity[row.severity] = parseInt(row.count);
    });

    // Get recent notifications
    const recentQuery = `
      SELECT * FROM user_notifications
      ${where}
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const recentResult = await pool.query(recentQuery, values);

    const stats = {
      total_notifications: totalNotifications,
      unread_notifications: unreadNotifications,
      notifications_by_type: notificationsByType,
      notifications_by_severity: notificationsBySeverity,
      recent_notifications: recentResult.rows
    };

    // Cache the result for default filters
    if (Object.keys(filters).length === 0) {
      cacheService.setNotificationStats(stats);
    }

    return stats;
  }
}
