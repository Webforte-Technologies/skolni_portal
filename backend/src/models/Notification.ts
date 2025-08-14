import pool from '../database/connection';

export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface NotificationRow {
  id: string;
  created_at: string;
  user_id: string | null;
  school_id: string | null;
  severity: NotificationSeverity;
  type: string;
  title: string;
  message: string;
  meta: any;
  read_at: string | null;
}

export async function createNotification(params: {
  user_id?: string | null;
  school_id?: string | null;
  severity?: NotificationSeverity;
  type: string;
  title: string;
  message: string;
  meta?: any;
}): Promise<NotificationRow> {
  const {
    user_id = null,
    school_id = null,
    severity = 'info',
    type,
    title,
    message,
    meta = null,
  } = params;
  const result = await pool.query(
    `INSERT INTO notifications (user_id, school_id, severity, type, title, message, meta)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [user_id, school_id, severity, type, title, message, meta]
  );
  return result.rows[0];
}

export async function listNotificationsForUser(userId: string, limit = 50, offset = 0): Promise<NotificationRow[]> {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 OR school_id IN (SELECT school_id FROM users WHERE id = $1)
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(`UPDATE notifications SET read_at = NOW() WHERE id = $1 AND (user_id = $2 OR school_id IN (SELECT school_id FROM users WHERE id = $2))`, [id, userId]);
  return (result.rowCount ?? 0) > 0;
}


