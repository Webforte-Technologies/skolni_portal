import pool from '../database/connection';
import { SchoolStatusHistory } from '../types/database';
import { 
  isValidStatusTransition, 
  SCHOOL_STATUS_TRANSITIONS 
} from '../utils/statusValidation';

export interface CreateSchoolStatusHistoryRequest {
  school_id: string;
  old_status: string;
  new_status: string;
  reason?: string;
  changed_by_user_id?: string;
  metadata?: any;
}

export interface SchoolStatusHistoryFilters {
  school_id?: string;
  old_status?: string;
  new_status?: string;
  changed_by_user_id?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  limit?: number;
  offset?: number;
}

export class SchoolStatusHistoryModel {
  // Create a new status history entry
  static async create(historyData: CreateSchoolStatusHistoryRequest): Promise<SchoolStatusHistory> {
    const {
      school_id,
      old_status,
      new_status,
      reason,
      changed_by_user_id,
      metadata
    } = historyData;

    const query = `
      INSERT INTO school_status_history (school_id, old_status, new_status, reason, changed_by_user_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      school_id,
      old_status,
      new_status,
      reason || null,
      changed_by_user_id || null,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find status history by ID
  static async findById(id: string): Promise<SchoolStatusHistory | null> {
    const query = 'SELECT * FROM school_status_history WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get status history with filters
  static async findAll(filters: SchoolStatusHistoryFilters = {}): Promise<{ history: SchoolStatusHistory[]; total: number }> {
    const {
      school_id,
      old_status,
      new_status,
      changed_by_user_id,
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

    if (old_status) {
      conditions.push(`old_status = $${i}`);
      values.push(old_status);
      i++;
    }

    if (new_status) {
      conditions.push(`new_status = $${i}`);
      values.push(new_status);
      i++;
    }

    if (changed_by_user_id) {
      conditions.push(`changed_by_user_id = $${i}`);
      values.push(changed_by_user_id);
      i++;
    }

    if (date_range) {
      conditions.push(`changed_at >= $${i} AND changed_at <= $${i + 1}`);
      values.push(date_range.start_date, date_range.end_date);
      i += 2;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM school_status_history
      ${where}
      ORDER BY changed_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM school_status_history ${where}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      history: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Get status history for a specific school
  static async getSchoolStatusHistory(schoolId: string, limit: number = 50): Promise<SchoolStatusHistory[]> {
    const query = `
      SELECT * FROM school_status_history
      WHERE school_id = $1
      ORDER BY changed_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [schoolId, limit]);
    return result.rows;
  }

  // Get latest status change for a school
  static async getLatestStatusChange(schoolId: string): Promise<SchoolStatusHistory | null> {
    const query = `
      SELECT * FROM school_status_history
      WHERE school_id = $1
      ORDER BY changed_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [schoolId]);
    return result.rows[0] || null;
  }

  // Get status change statistics
  static async getStatusChangeStats(days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        old_status,
        new_status,
        COUNT(*) as change_count,
        DATE(changed_at) as change_date
      FROM school_status_history
      WHERE changed_at >= CURRENT_DATE - ($1 || ' days')::INTERVAL
      GROUP BY old_status, new_status, DATE(changed_at)
      ORDER BY change_date DESC, change_count DESC
    `;

    const result = await pool.query(query, [safeDays]);
    return result.rows;
  }

  // Get status change trends
  static async getStatusChangeTrends(days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        DATE(changed_at) as change_date,
        COUNT(*) as total_changes,
        COUNT(DISTINCT school_id) as schools_affected,
        COUNT(*) FILTER (WHERE new_status = 'active') as activated,
        COUNT(*) FILTER (WHERE new_status = 'suspended') as suspended,
        COUNT(*) FILTER (WHERE new_status = 'pending_verification') as pending
      FROM school_status_history
      WHERE changed_at >= CURRENT_DATE - ($1 || ' days')::INTERVAL
      GROUP BY DATE(changed_at)
      ORDER BY change_date DESC
    `;

    const result = await pool.query(query, [safeDays]);
    return result.rows;
  }

  // Get status change reasons
  static async getStatusChangeReasons(days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        reason,
        COUNT(*) as count,
        new_status
      FROM school_status_history
      WHERE changed_at >= CURRENT_DATE - ($1 || ' days')::INTERVAL
        AND reason IS NOT NULL
      GROUP BY reason, new_status
      ORDER BY count DESC
    `;

    const result = await pool.query(query, [safeDays]);
    return result.rows;
  }

  // Get admin activity for status changes
  static async getAdminStatusChangeActivity(adminUserId: string, days: number = 30): Promise<any> {
    // Validate days parameter to prevent injection
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    
    const query = `
      SELECT 
        ssh.*,
        s.name as school_name
      FROM school_status_history ssh
      JOIN schools s ON ssh.school_id = s.id
      WHERE ssh.changed_by_user_id = $1
        AND ssh.changed_at >= CURRENT_DATE - ($2 || ' days')::INTERVAL
      ORDER BY ssh.changed_at DESC
    `;

    const result = await pool.query(query, [adminUserId, safeDays]);
    return result.rows;
  }

  // Get status change summary for dashboard
  static async getDashboardStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_status_changes,
        COUNT(*) FILTER (WHERE changed_at >= CURRENT_DATE - INTERVAL '24 hours') as today_changes,
        COUNT(DISTINCT school_id) as schools_with_changes,
        COUNT(DISTINCT changed_by_user_id) as admins_making_changes
      FROM school_status_history
      WHERE changed_at >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Validate status transition (delegated to centralized utility)
  static isValidStatusTransition(oldStatus: string, newStatus: string): boolean {
    return isValidStatusTransition(oldStatus, newStatus);
  }

  // Get status transition rules (delegated to centralized utility)
  static getStatusTransitionRules(): Record<string, string[]> {
    return SCHOOL_STATUS_TRANSITIONS;
  }

  // Clean old status history (for maintenance)
  static async cleanOldHistory(daysToKeep: number = 1095): Promise<number> { // 3 years default
    // Validate daysToKeep parameter to prevent injection
    const safeDaysToKeep = Math.max(365, Math.min(3650, Math.floor(daysToKeep))); // Min 1 year, max 10 years
    
    const query = `
      DELETE FROM school_status_history 
      WHERE changed_at < CURRENT_DATE - ($1 || ' days')::INTERVAL
    `;

    const result = await pool.query(query, [safeDaysToKeep]);
    return result.rowCount || 0;
  }
}
