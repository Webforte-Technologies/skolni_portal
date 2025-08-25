import pool from '../database/connection';
import { UserActivityLog, UserActivityStats } from '../types/database';
import { cacheService } from '../services/CacheService';

export class UserActivityModel {
  // Log a new user activity
  static async logActivity(activityData: {
    user_id: string;
    activity_type: UserActivityLog['activity_type'];
    activity_data?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  }): Promise<UserActivityLog> {
    const {
      user_id,
      activity_type,
      activity_data = {},
      ip_address,
      user_agent,
      session_id
    } = activityData;

    const query = `
      INSERT INTO user_activity_logs (user_id, activity_type, activity_data, ip_address, user_agent, session_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [user_id, activity_type, JSON.stringify(activity_data), ip_address, user_agent, session_id];
    const result = await pool.query(query, values);
    
    // Clear cache for this user and activity summary
    cacheService.clearUserCache(user_id);
    cacheService.del('activity_summary');
    
    return result.rows[0];
  }

  // Get user activity logs with pagination and filters
  static async getUserActivities(filters: {
    user_id?: string;
    activity_type?: string;
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{ activities: UserActivityLog[]; total: number }> {
    const {
      user_id,
      activity_type,
      limit = 50,
      offset = 0,
      start_date,
      end_date
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (user_id) {
      conditions.push(`ual.user_id = $${i}`);
      values.push(user_id);
      i++;
    }

    if (activity_type) {
      conditions.push(`ual.activity_type = $${i}`);
      values.push(activity_type);
      i++;
    }

    if (start_date) {
      conditions.push(`ual.created_at >= $${i}`);
      values.push(start_date);
      i++;
    }

    if (end_date) {
      conditions.push(`ual.created_at <= $${i}`);
      values.push(end_date);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        ual.*,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.school_id,
        s.name as school_name
      FROM user_activity_logs ual
      LEFT JOIN users u ON ual.user_id = u.id
      LEFT JOIN schools s ON u.school_id = s.id
      ${where}
      ORDER BY ual.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM user_activity_logs ual
      ${where}
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    // Debug logging to help identify issues
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Count query result:', countResult.rows[0]);
      console.log('Main query result count:', result.rows.length);
      console.log('Applied filters:', filters);
      console.log('Where clause:', where);
      console.log('Values:', values);
      console.log('Count query SQL:', countQuery);
    }

    // Ensure we have a valid count
    const totalCount = countResult.rows[0]?.count;
    const total = totalCount ? parseInt(totalCount) : result.rows.length;

    return {
      activities: result.rows,
      total: total
    };
  }

  // Batch log multiple activities for performance
  static async logActivitiesBatch(activities: Array<{
    user_id: string;
    activity_type: UserActivityLog['activity_type'];
    activity_data?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  }>): Promise<UserActivityLog[]> {
    if (activities.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];
    
    activities.forEach((activity, index) => {
      const baseIndex = index * 6;
      placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`);
      values.push(
        activity.user_id,
        activity.activity_type,
        JSON.stringify(activity.activity_data || {}),
        activity.ip_address || null,
        activity.user_agent || null,
        activity.session_id || null
      );
    });

    const query = `
      INSERT INTO user_activity_logs (user_id, activity_type, activity_data, ip_address, user_agent, session_id)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    // Clear cache for affected users
    const userIds = [...new Set(activities.map(a => a.user_id))];
    userIds.forEach(userId => {
      cacheService.clearUserCache(userId);
    });

    return result.rows;
  }

  // Get user activity statistics with caching
  static async getUserActivityStats(userId: string): Promise<UserActivityStats> {
    // Check cache first
    const cached = cacheService.getUserActivityStatsFromCache(userId);
    if (cached) {
      return cached as unknown as UserActivityStats;
    }
    const query = `
      SELECT 
        user_id,
        COUNT(*) as total_activities,
        MAX(created_at) as last_activity,
        activity_type,
        COUNT(*) as type_count
      FROM user_activity_logs
      WHERE user_id = $1
      GROUP BY user_id, activity_type
    `;

    const result = await pool.query(query, [userId]);
    
    const activitiesByType: Record<string, number> = {};
    let totalActivities = 0;
    let lastActivity: Date | null = null;

    result.rows.forEach((row: any) => {
      activitiesByType[row.activity_type] = parseInt(row.type_count);
      totalActivities += parseInt(row.type_count);
      if (!lastActivity || new Date(row.last_activity) > lastActivity) {
        lastActivity = new Date(row.last_activity);
      }
    });

    // Get most active hours
    const hoursQuery = `
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
      FROM user_activity_logs
      WHERE user_id = $1
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY count DESC
      LIMIT 5
    `;

    const hoursResult = await pool.query(hoursQuery, [userId]);
    const mostActiveHours = hoursResult.rows.map((row: any) => parseInt(row.hour));

    // Calculate average daily activities
    const avgQuery = `
      SELECT COUNT(*) / GREATEST(DATE_PART('day', NOW() - MIN(created_at)), 1) as avg_daily
      FROM user_activity_logs
      WHERE user_id = $1
    `;

    const avgResult = await pool.query(avgQuery, [userId]);
    const averageDailyActivities = parseFloat(avgResult.rows[0].avg_daily) || 0;

    const stats = {
      user_id: userId,
      total_activities: totalActivities,
      activities_by_type: activitiesByType,
      last_activity: lastActivity || new Date(),
      most_active_hours: mostActiveHours,
      average_daily_activities: averageDailyActivities
    };

    // Cache the result
    cacheService.setUserActivityStats(userId, stats);
    
    return stats;
  }

  // Get activity summary for admin dashboard with caching
  static async getActivitySummary(filters: {
    start_date?: string;
    end_date?: string;
    activity_type?: string;
  } = {}): Promise<{
    total_activities: number;
    activities_by_type: Record<string, number>;
    most_active_users: Array<{
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      activity_count: number;
    }>;
    activity_trend: Array<{
      date: string;
      count: number;
    }>;
    credit_usage: {
      total_credits_used: number;
      average_credits_per_activity: number;
      top_credit_users: Array<{
        user_id: string;
        email: string;
        first_name: string;
        last_name: string;
        credits_used: number;
      }>;
    };
  }> {
    // Use cache for default filters (no filters = all data)
    const _cacheKey = `activity_summary:${JSON.stringify(filters)}`;
    if (Object.keys(filters).length === 0) {
      const cached = cacheService.getActivitySummary();
      if (cached) {
        return cached as {
          total_activities: number;
          activities_by_type: Record<string, number>;
          most_active_users: Array<{
            user_id: string;
            email: string;
            first_name: string;
            last_name: string;
            activity_count: number;
          }>;
          activity_trend: Array<{
            date: string;
            count: number;
          }>;
          credit_usage: {
            total_credits_used: number;
            average_credits_per_activity: number;
            top_credit_users: Array<{
              user_id: string;
              email: string;
              first_name: string;
              last_name: string;
              credits_used: number;
            }>;
          };
        };
      }
    }
    const { start_date, end_date, activity_type } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (start_date) {
      conditions.push(`ual.created_at >= $${i}`);
      values.push(start_date);
      i++;
    }

    if (end_date) {
      conditions.push(`ual.created_at <= $${i}`);
      values.push(end_date);
      i++;
    }

    if (activity_type) {
      conditions.push(`ual.activity_type = $${i}`);
      values.push(activity_type);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total activities and activities by type
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_activities,
        activity_type,
        COUNT(*) as type_count
      FROM user_activity_logs ual
      ${where ? where + ' AND' : 'WHERE'} ual.id IS NOT NULL
      GROUP BY activity_type
    `;

    const summaryResult = await pool.query(summaryQuery, values);
    
    let totalActivities = 0;
    const activitiesByType: Record<string, number> = {};

    summaryResult.rows.forEach((row: any) => {
      activitiesByType[row.activity_type] = parseInt(row.type_count);
      totalActivities += parseInt(row.type_count);
    });

    // Get most active users
    const usersQuery = `
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        COUNT(*) as activity_count
      FROM user_activity_logs ual
      JOIN users u ON ual.user_id = u.id
      ${where ? where + ' AND' : 'WHERE'} ual.id IS NOT NULL
      GROUP BY u.id, u.email, u.first_name, u.last_name
      ORDER BY activity_count DESC
      LIMIT 10
    `;

    const usersResult = await pool.query(usersQuery, values);

    // Get activity trend (last 30 days)
    const trendQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM user_activity_logs ual
      ${where ? where + ' AND' : 'WHERE'} created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const trendResult = await pool.query(trendQuery, values);

    // Get credit usage statistics
    const creditQuery = `
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        COALESCE(SUM(
          CASE 
            WHEN ual.activity_data->>'credits_used' IS NOT NULL 
            THEN (ual.activity_data->>'credits_used')::numeric 
            ELSE 0 
          END
        ), 0) as credits_used
      FROM user_activity_logs ual
      JOIN users u ON ual.user_id = u.id
      ${where ? where + ' AND' : 'WHERE'} ual.id IS NOT NULL
      GROUP BY u.id, u.email, u.first_name, u.last_name
      HAVING COALESCE(SUM(
        CASE 
          WHEN ual.activity_data->>'credits_used' IS NOT NULL 
          THEN (ual.activity_data->>'credits_used')::numeric 
          ELSE 0 
        END
      ), 0) > 0
      ORDER BY credits_used DESC
      LIMIT 10
    `;

    const creditResult = await pool.query(creditQuery, values);

    // Calculate total credits used
    const totalCreditsQuery = `
      SELECT COALESCE(SUM(
        CASE 
          WHEN activity_data->>'credits_used' IS NOT NULL 
          THEN (activity_data->>'credits_used')::numeric 
          ELSE 0 
        END
      ), 0) as total_credits_used
      FROM user_activity_logs ual
      ${where}
    `;

    const totalCreditsResult = await pool.query(totalCreditsQuery, values);
    const totalCreditsUsed = parseFloat(totalCreditsResult.rows[0].total_credits_used) || 0;
    const averageCreditsPerActivity = totalActivities > 0 ? totalCreditsUsed / totalActivities : 0;

    const summary = {
      total_activities: totalActivities,
      activities_by_type: activitiesByType,
      most_active_users: usersResult.rows,
      activity_trend: trendResult.rows,
      credit_usage: {
        total_credits_used: totalCreditsUsed,
        average_credits_per_activity: averageCreditsPerActivity,
        top_credit_users: creditResult.rows
      }
    };

    // Cache the result for default filters
    if (Object.keys(filters).length === 0) {
      cacheService.setActivitySummary(summary);
    }

    return summary;
  }

  // Update user's last activity timestamp
  static async updateLastActivity(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
    
    // Clear cache for this user and search results
    cacheService.clearUserCache(userId);
    cacheService.clearPattern('search:');
  }

  // Clean old activity logs (older than specified days)
  static async cleanOldLogs(daysOld: number = 90): Promise<number> {
    const query = `
      DELETE FROM user_activity_logs
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;
    const result = await pool.query(query);
    
    if (result.rowCount && result.rowCount > 0) {
      // Clear all activity-related cache since we don't know which users were affected
      cacheService.clearPattern('user_activity_stats:');
      cacheService.del('activity_summary');
    }
    
    return result.rowCount || 0;
  }
}