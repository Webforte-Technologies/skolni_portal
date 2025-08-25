import pool from '../database/connection';
import { SchoolActivityLog } from '../types/database';

export interface CreateSchoolActivityRequest {
  school_id: string;
  action_type: string;
  action_description?: string;
  user_id?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

export interface SchoolActivityFilters {
  school_id?: string;
  action_type?: string;
  user_id?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  limit?: number;
  offset?: number;
}

export class SchoolActivityModel {
  // Create a new school activity log entry
  static async create(activityData: CreateSchoolActivityRequest): Promise<SchoolActivityLog> {
    const {
      school_id,
      action_type,
      action_description,
      user_id,
      metadata,
      ip_address,
      user_agent
    } = activityData;

    const query = `
      INSERT INTO school_activity_logs (school_id, action_type, action_description, user_id, metadata, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      school_id,
      action_type,
      action_description || null,
      user_id || null,
      metadata ? JSON.stringify(metadata) : null,
      ip_address || null,
      user_agent || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find activity log by ID
  static async findById(id: string): Promise<SchoolActivityLog | null> {
    const query = 'SELECT * FROM school_activity_logs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get activity logs with filters
  static async findAll(filters: SchoolActivityFilters = {}): Promise<{ activities: SchoolActivityLog[]; total: number }> {
    const {
      school_id,
      action_type,
      user_id,
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

    if (action_type) {
      conditions.push(`action_type = $${i}`);
      values.push(action_type);
      i++;
    }

    if (user_id) {
      conditions.push(`user_id = $${i}`);
      values.push(user_id);
      i++;
    }

    if (date_range) {
      conditions.push(`created_at >= $${i} AND created_at <= $${i + 1}`);
      values.push(date_range.start_date, date_range.end_date);
      i += 2;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM school_activity_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM school_activity_logs ${where}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      activities: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Get school activity summary for analytics
  static async getSchoolActivitySummary(schoolId: string, days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        action_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM school_activity_logs
      WHERE school_id = $1 
        AND created_at >= CURRENT_DATE - ($2 || ' days')::INTERVAL
      GROUP BY action_type, DATE(created_at)
      ORDER BY date DESC, count DESC
    `;

    const result = await pool.query(query, [schoolId, safeDays]);
    return result.rows;
  }

  // Get activity trends for multiple schools
  static async getActivityTrends(days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        s.id as school_id,
        s.name as school_name,
        COUNT(sal.id) as activity_count,
        COUNT(DISTINCT sal.user_id) as active_users,
        MAX(sal.created_at) as last_activity
      FROM schools s
      LEFT JOIN school_activity_logs sal ON s.id = sal.school_id 
        AND sal.created_at >= CURRENT_DATE - ($1 || ' days')::INTERVAL
      WHERE s.is_active = true
      GROUP BY s.id, s.name
      ORDER BY activity_count DESC
    `;

    const result = await pool.query(query, [safeDays]);
    return result.rows;
  }

  // Get user activity within a school
  static async getUserActivityInSchool(schoolId: string, userId: string, days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        action_type,
        action_description,
        created_at,
        metadata
      FROM school_activity_logs
      WHERE school_id = $1 
        AND user_id = $2
        AND created_at >= CURRENT_DATE - ($3 || ' days')::INTERVAL
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [schoolId, userId, safeDays]);
    return result.rows;
  }

  // Log school admin activity
  static async logAdminActivity(schoolId: string, userId: string, action: string, description?: string, metadata?: any): Promise<void> {
    await this.create({
      school_id: schoolId,
      action_type: `admin_${action}`,
      user_id: userId,
      ...(description && { action_description: description }),
      ...(metadata && { metadata })
      // ip_address and user_agent will be set by middleware
    });

    // Update school's admin activity timestamp
    await pool.query(
      'UPDATE schools SET admin_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
      [schoolId]
    );
  }

  // Log teacher activity within school
  static async logTeacherActivity(schoolId: string, userId: string, action: string, description?: string, metadata?: any): Promise<void> {
    await this.create({
      school_id: schoolId,
      action_type: `teacher_${action}`,
      user_id: userId,
      ...(description && { action_description: description }),
      ...(metadata && { metadata })
      // ip_address and user_agent will be set by middleware
    });

    // Update school's last activity timestamp
    await pool.query(
      'UPDATE schools SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
      [schoolId]
    );
  }

  // Get activity statistics for dashboard
  static async getDashboardStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(DISTINCT school_id) as active_schools,
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours') as today_activities
      FROM school_activity_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Clean old activity logs (for maintenance)
  static async cleanOldLogs(daysToKeep: number = 365): Promise<number> {
    // Validate daysToKeep parameter to prevent injection
    const safeDaysToKeep = Math.max(30, Math.min(3650, Math.floor(daysToKeep))); // Min 30 days, max 10 years
    
    const query = `
      DELETE FROM school_activity_logs 
      WHERE created_at < CURRENT_DATE - ($1 || ' days')::INTERVAL
    `;

    const result = await pool.query(query, [safeDaysToKeep]);
    return result.rowCount || 0;
  }
}
