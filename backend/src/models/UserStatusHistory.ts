import pool from '../database/connection';

export interface UserStatusHistory {
  id: string;
  user_id: string;
  old_status?: string;
  new_status: string;
  reason?: string;
  changed_by?: string;
  expires_at?: Date;
  created_at: Date;
}

export interface CreateUserStatusHistoryRequest {
  user_id: string;
  old_status?: string;
  new_status: string;
  reason?: string | undefined;
  changed_by?: string | undefined;
  expires_at?: string | undefined;
}

export class UserStatusHistoryModel {
  // Create a new status history entry
  static async create(historyData: CreateUserStatusHistoryRequest): Promise<UserStatusHistory> {
    const {
      user_id,
      old_status,
      new_status,
      reason,
      changed_by,
      expires_at
    } = historyData;

    const query = `
      INSERT INTO user_status_history (
        user_id, old_status, new_status, reason, changed_by, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      user_id,
      old_status,
      new_status,
      reason,
      changed_by,
      expires_at ? new Date(expires_at) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get status history for a user
  static async getByUserId(userId: string, limit = 50, offset = 0): Promise<{
    history: UserStatusHistory[];
    total: number;
  }> {
    const historyQuery = `
      SELECT 
        ush.*,
        cb.first_name as changed_by_first_name,
        cb.last_name as changed_by_last_name,
        cb.email as changed_by_email
      FROM user_status_history ush
      LEFT JOIN users cb ON ush.changed_by = cb.id
      WHERE ush.user_id = $1
      ORDER BY ush.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM user_status_history
      WHERE user_id = $1
    `;

    const [historyResult, countResult] = await Promise.all([
      pool.query(historyQuery, [userId, limit, offset]),
      pool.query(countQuery, [userId])
    ]);

    return {
      history: historyResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Get recent status changes across all users
  static async getRecentChanges(limit = 100, offset = 0): Promise<{
    changes: Array<UserStatusHistory & {
      user_first_name: string;
      user_last_name: string;
      user_email: string;
      changed_by_first_name?: string;
      changed_by_last_name?: string;
      changed_by_email?: string;
    }>;
    total: number;
  }> {
    const changesQuery = `
      SELECT 
        ush.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        cb.first_name as changed_by_first_name,
        cb.last_name as changed_by_last_name,
        cb.email as changed_by_email
      FROM user_status_history ush
      LEFT JOIN users u ON ush.user_id = u.id
      LEFT JOIN users cb ON ush.changed_by = cb.id
      ORDER BY ush.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM user_status_history';

    const [changesResult, countResult] = await Promise.all([
      pool.query(changesQuery, [limit, offset]),
      pool.query(countQuery)
    ]);

    return {
      changes: changesResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Get status change statistics
  static async getStatusChangeStats(): Promise<{
    total_changes: number;
    changes_by_status: Record<string, number>;
    recent_changes_count: number;
    most_changed_users: Array<{
      user_id: string;
      user_email: string;
      user_first_name: string;
      user_last_name: string;
      change_count: number;
    }>;
  }> {
    // Get total changes
    const totalQuery = 'SELECT COUNT(*) FROM user_status_history';
    const totalResult = await pool.query(totalQuery);
    const totalChanges = parseInt(totalResult.rows[0].count);

    // Get changes by status
    const statusQuery = `
      SELECT new_status, COUNT(*) as count
      FROM user_status_history
      GROUP BY new_status
      ORDER BY count DESC
    `;
    const statusResult = await pool.query(statusQuery);
    const changesByStatus: Record<string, number> = {};
    statusResult.rows.forEach((row: any) => {
      changesByStatus[row.new_status] = parseInt(row.count);
    });

    // Get recent changes (last 7 days)
    const recentQuery = `
      SELECT COUNT(*) FROM user_status_history
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;
    const recentResult = await pool.query(recentQuery);
    const recentChangesCount = parseInt(recentResult.rows[0].count);

    // Get most changed users
    const mostChangedQuery = `
      SELECT 
        ush.user_id,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        COUNT(*) as change_count
      FROM user_status_history ush
      JOIN users u ON ush.user_id = u.id
      GROUP BY ush.user_id, u.email, u.first_name, u.last_name
      ORDER BY change_count DESC
      LIMIT 10
    `;
    const mostChangedResult = await pool.query(mostChangedQuery);

    return {
      total_changes: totalChanges,
      changes_by_status: changesByStatus,
      recent_changes_count: recentChangesCount,
      most_changed_users: mostChangedResult.rows
    };
  }
}
