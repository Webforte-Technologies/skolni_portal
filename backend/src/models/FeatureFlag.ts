import pool from '../database/connection';

export interface FeatureFlag {
  key: string;
  value: boolean;
  description?: string;
  updated_at: Date;
}

export class FeatureFlagModel {
  static async list(): Promise<FeatureFlag[]> {
    const result = await pool.query('SELECT key, value, description, updated_at FROM feature_flags ORDER BY key');
    return result.rows;
  }

  static async get(key: string): Promise<FeatureFlag | null> {
    const result = await pool.query('SELECT key, value, description, updated_at FROM feature_flags WHERE key = $1', [key]);
    return result.rows[0] || null;
  }

  static async set(key: string, value: boolean, description?: string): Promise<FeatureFlag> {
    const result = await pool.query(
      `INSERT INTO feature_flags (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = COALESCE(EXCLUDED.description, feature_flags.description), updated_at = NOW()
       RETURNING key, value, description, updated_at`,
      [key, value, description || null]
    );
    return result.rows[0];
  }
}


