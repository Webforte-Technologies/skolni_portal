import pool from '../database/connection';
import { UserPreferences } from '../types/database';

export class UserPreferencesModel {
  // Get user preferences
  static async getByUserId(userId: string): Promise<UserPreferences | null> {
    const query = 'SELECT * FROM user_preferences WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  // Create or update user preferences
  static async upsert(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const {
      language,
      theme,
      email_notifications,
      push_notifications,
      dashboard_layout,
      ai_assistant_preferences,
      accessibility_settings
    } = preferences;

    const query = `
      INSERT INTO user_preferences (
        user_id, language, theme, email_notifications, push_notifications,
        dashboard_layout, ai_assistant_preferences, accessibility_settings
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO UPDATE SET
        language = EXCLUDED.language,
        theme = EXCLUDED.theme,
        email_notifications = EXCLUDED.email_notifications,
        push_notifications = EXCLUDED.push_notifications,
        dashboard_layout = EXCLUDED.dashboard_layout,
        ai_assistant_preferences = EXCLUDED.ai_assistant_preferences,
        accessibility_settings = EXCLUDED.accessibility_settings,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      userId,
      language || 'cs-CZ',
      theme || 'light',
      JSON.stringify(email_notifications || { marketing: true, updates: true, security: true }),
      JSON.stringify(push_notifications || { enabled: true, sound: true }),
      JSON.stringify(dashboard_layout || {}),
      JSON.stringify(ai_assistant_preferences || {}),
      JSON.stringify(accessibility_settings || { high_contrast: false, font_size: 'medium' })
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update specific preference fields
  static async updateFields(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences | null> {
    const allowedFields = [
      'language', 'theme', 'email_notifications', 'push_notifications',
      'dashboard_layout', 'ai_assistant_preferences', 'accessibility_settings'
    ];

    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClauses.push(`${key} = $${i}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        i++;
      }
    }

    if (setClauses.length === 0) {
      return this.getByUserId(userId);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE user_preferences
      SET ${setClauses.join(', ')}
      WHERE user_id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete user preferences
  static async delete(userId: string): Promise<boolean> {
    const query = 'DELETE FROM user_preferences WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return (result.rowCount || 0) > 0;
  }

  // Get preferences statistics for admin dashboard
  static async getPreferencesStats(): Promise<{
    total_users_with_preferences: number;
    theme_distribution: Record<string, number>;
    language_distribution: Record<string, number>;
    notification_settings: {
      email_enabled: number;
      push_enabled: number;
    };
  }> {
    // Get total users with preferences
    const totalQuery = 'SELECT COUNT(*) FROM user_preferences';
    const totalResult = await pool.query(totalQuery);
    const totalUsersWithPreferences = parseInt(totalResult.rows[0].count);

    // Get theme distribution
    const themeQuery = `
      SELECT theme, COUNT(*) as count
      FROM user_preferences
      GROUP BY theme
    `;
    const themeResult = await pool.query(themeQuery);
    const themeDistribution: Record<string, number> = {};
    themeResult.rows.forEach((row: any) => {
      themeDistribution[row.theme] = parseInt(row.count);
    });

    // Get language distribution
    const languageQuery = `
      SELECT language, COUNT(*) as count
      FROM user_preferences
      GROUP BY language
    `;
    const languageResult = await pool.query(languageQuery);
    const languageDistribution: Record<string, number> = {};
    languageResult.rows.forEach((row: any) => {
      languageDistribution[row.language] = parseInt(row.count);
    });

    // Get notification settings
    const notificationQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE email_notifications->>'marketing' = 'true') as email_enabled,
        COUNT(*) FILTER (WHERE push_notifications->>'enabled' = 'true') as push_enabled
      FROM user_preferences
    `;
    const notificationResult = await pool.query(notificationQuery);
    const notificationSettings = {
      email_enabled: parseInt(notificationResult.rows[0].email_enabled),
      push_enabled: parseInt(notificationResult.rows[0].push_enabled)
    };

    return {
      total_users_with_preferences: totalUsersWithPreferences,
      theme_distribution: themeDistribution,
      language_distribution: languageDistribution,
      notification_settings: notificationSettings
    };
  }

  // Initialize default preferences for a user
  static async initializeDefaults(userId: string): Promise<UserPreferences> {
    const defaultPreferences = {
      language: 'cs-CZ',
      theme: 'light' as const,
      email_notifications: {
        marketing: true,
        updates: true,
        security: true
      },
      push_notifications: {
        enabled: true,
        sound: true
      },
      dashboard_layout: {},
      ai_assistant_preferences: {},
      accessibility_settings: {
        high_contrast: false,
        font_size: 'medium' as const
      }
    };

    return this.upsert(userId, defaultPreferences);
  }
}
