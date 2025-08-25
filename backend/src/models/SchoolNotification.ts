import pool from '../database/connection';
import { SchoolNotification } from '../types/database';

export interface CreateSchoolNotificationRequest {
  school_id: string;
  title: string;
  message: string;
  notification_type?: 'general' | 'announcement' | 'warning' | 'maintenance' | 'update';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sent_by_user_id?: string;
  expires_at?: Date;
  metadata?: any;
}

export interface UpdateSchoolNotificationRequest {
  title?: string;
  message?: string;
  notification_type?: string;
  priority?: string;
  is_read?: boolean;
  expires_at?: Date;
  metadata?: any;
}

export interface SchoolNotificationFilters {
  school_id?: string;
  notification_type?: string;
  priority?: string;
  is_read?: boolean;
  sent_by_user_id?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  limit?: number;
  offset?: number;
}

export class SchoolNotificationModel {
  // Create a new school notification
  static async create(notificationData: CreateSchoolNotificationRequest): Promise<SchoolNotification> {
    const {
      school_id,
      title,
      message,
      notification_type = 'general',
      priority = 'normal',
      sent_by_user_id,
      expires_at,
      metadata
    } = notificationData;

    const query = `
      INSERT INTO school_notifications (school_id, title, message, notification_type, priority, sent_by_user_id, expires_at, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      school_id,
      title,
      message,
      notification_type,
      priority,
      sent_by_user_id || null,
      expires_at || null,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find notification by ID
  static async findById(id: string): Promise<SchoolNotification | null> {
    const query = 'SELECT * FROM school_notifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get notifications with filters
  static async findAll(filters: SchoolNotificationFilters = {}): Promise<{ notifications: SchoolNotification[]; total: number }> {
    const {
      school_id,
      notification_type,
      priority,
      is_read,
      sent_by_user_id,
      date_range,
      limit = 100,
      offset = 0
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (school_id) {
      conditions.push(`school_id = $${i}`);
      values.push(school_id);
      i++;
    }

    if (notification_type) {
      conditions.push(`notification_type = $${i}`);
      values.push(notification_type);
      i++;
    }

    if (priority) {
      conditions.push(`priority = $${i}`);
      values.push(priority);
      i++;
    }

    if (typeof is_read === 'boolean') {
      conditions.push(`is_read = $${i}`);
      values.push(is_read);
      i++;
    }

    if (sent_by_user_id) {
      conditions.push(`sent_by_user_id = $${i}`);
      values.push(sent_by_user_id);
      i++;
    }

    if (date_range) {
      conditions.push(`sent_at >= $${i} AND sent_at <= $${i + 1}`);
      values.push(date_range.start_date, date_range.end_date);
      i += 2;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM school_notifications
      ${where}
      ORDER BY sent_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM school_notifications ${where}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      notifications: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Update notification
  static async update(id: string, updateData: UpdateSchoolNotificationRequest): Promise<SchoolNotification | null> {
    const allowedFields = [
      'title', 'message', 'notification_type', 'priority', 'is_read', 'expires_at', 'metadata'
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'metadata' && value !== null) {
          updates.push(`${key} = $${i}`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = $${i}`);
          values.push(value);
        }
        i++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE school_notifications 
      SET ${updates.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Mark notification as read
  static async markAsRead(id: string): Promise<boolean> {
    const query = 'UPDATE school_notifications SET is_read = true WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const query = `UPDATE school_notifications SET is_read = true WHERE id IN (${placeholders})`;
    
    const result = await pool.query(query, ids);
    return result.rowCount || 0;
  }

  // Delete notification
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM school_notifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Send notification to multiple schools
  static async sendToMultipleSchools(
    schoolIds: string[],
    notificationData: Omit<CreateSchoolNotificationRequest, 'school_id'>
  ): Promise<SchoolNotification[]> {
    const notifications: SchoolNotification[] = [];
    
    for (const schoolId of schoolIds) {
      const notification = await this.create({
        ...notificationData,
        school_id: schoolId
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Get unread notifications count for a school
  static async getUnreadCount(schoolId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) FROM school_notifications 
      WHERE school_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(query, [schoolId]);
    return parseInt(result.rows[0].count);
  }

  // Get notifications by priority for a school
  static async getByPriority(schoolId: string, priority: string): Promise<SchoolNotification[]> {
    const query = `
      SELECT * FROM school_notifications 
      WHERE school_id = $1 AND priority = $2
      ORDER BY sent_at DESC
    `;
    
    const result = await pool.query(query, [schoolId, priority]);
    return result.rows;
  }

  // Get expired notifications
  static async getExpired(): Promise<SchoolNotification[]> {
    const query = `
      SELECT * FROM school_notifications 
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
      ORDER BY expires_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Clean expired notifications
  static async cleanExpired(): Promise<number> {
    const query = `
      DELETE FROM school_notifications 
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
    `;
    
    const result = await pool.query(query);
    return result.rowCount || 0;
  }

  // Get notification statistics for dashboard
  static async getDashboardStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(*) FILTER (WHERE is_read = false) as unread_notifications,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_notifications,
        COUNT(*) FILTER (WHERE sent_at >= CURRENT_DATE - INTERVAL '24 hours') as today_notifications
      FROM school_notifications
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}
