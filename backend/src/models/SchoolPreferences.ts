import pool from '../database/connection';
import { SchoolPreferences } from '../types/database';

export interface CreateSchoolPreferenceRequest {
  school_id: string;
  preference_key: string;
  preference_value?: string;
  preference_type?: 'string' | 'boolean' | 'number' | 'json';
  is_public?: boolean;
}

export interface UpdateSchoolPreferenceRequest {
  preference_value?: string;
  preference_type?: string;
  is_public?: boolean;
}

export interface SchoolPreferenceFilters {
  school_id?: string;
  preference_key?: string;
  preference_type?: string;
  is_public?: boolean;
}

export class SchoolPreferencesModel {
  // Create a new school preference
  static async create(preferenceData: CreateSchoolPreferenceRequest): Promise<SchoolPreferences> {
    const {
      school_id,
      preference_key,
      preference_value,
      preference_type = 'string',
      is_public = false
    } = preferenceData;

    const query = `
      INSERT INTO school_preferences (school_id, preference_key, preference_value, preference_type, is_public)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (school_id, preference_key) 
      DO UPDATE SET 
        preference_value = EXCLUDED.preference_value,
        preference_type = EXCLUDED.preference_type,
        is_public = EXCLUDED.is_public,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      school_id,
      preference_key,
      preference_value || null,
      preference_type,
      is_public
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find preference by ID
  static async findById(id: string): Promise<SchoolPreferences | null> {
    const query = 'SELECT * FROM school_preferences WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find preference by school and key
  static async findBySchoolAndKey(schoolId: string, key: string): Promise<SchoolPreferences | null> {
    const query = 'SELECT * FROM school_preferences WHERE school_id = $1 AND preference_key = $2';
    const result = await pool.query(query, [schoolId, key]);
    return result.rows[0] || null;
  }

  // Get preferences with filters
  static async findAll(filters: SchoolPreferenceFilters = {}): Promise<SchoolPreferences[]> {
    const {
      school_id,
      preference_key,
      preference_type,
      is_public
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (school_id) {
      conditions.push(`school_id = $${i}`);
      values.push(school_id);
      i++;
    }

    if (preference_key) {
      conditions.push(`preference_key = $${i}`);
      values.push(preference_key);
      i++;
    }

    if (preference_type) {
      conditions.push(`preference_type = $${i}`);
      values.push(preference_type);
      i++;
    }

    if (typeof is_public === 'boolean') {
      conditions.push(`is_public = $${i}`);
      values.push(is_public);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM school_preferences
      ${where}
      ORDER BY school_id, preference_key
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update preference
  static async update(id: string, updateData: UpdateSchoolPreferenceRequest): Promise<SchoolPreferences | null> {
    const allowedFields = ['preference_value', 'preference_type', 'is_public'];

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE school_preferences 
      SET ${updates.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Update preference by school and key
  static async updateBySchoolAndKey(
    schoolId: string,
    key: string,
    updateData: UpdateSchoolPreferenceRequest
  ): Promise<SchoolPreferences | null> {
    const allowedFields = ['preference_value', 'preference_type', 'is_public'];

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (updates.length === 0) {
      return this.findBySchoolAndKey(schoolId, key);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(schoolId, key);

    const query = `
      UPDATE school_preferences 
      SET ${updates.join(', ')}
      WHERE school_id = $${i} AND preference_key = $${i + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete preference
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM school_preferences WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Delete preference by school and key
  static async deleteBySchoolAndKey(schoolId: string, key: string): Promise<boolean> {
    const query = 'DELETE FROM school_preferences WHERE school_id = $1 AND preference_key = $2';
    const result = await pool.query(query, [schoolId, key]);
    return (result.rowCount ?? 0) > 0;
  }

  // Get preference value with type conversion
  static async getValue(schoolId: string, key: string, defaultValue?: any): Promise<any> {
    const preference = await this.findBySchoolAndKey(schoolId, key);
    
    if (!preference) {
      return defaultValue;
    }

    switch (preference.preference_type) {
      case 'boolean':
        return preference.preference_value === 'true';
      case 'number':
        return parseFloat(preference.preference_value || '0');
      case 'json':
        try {
          return JSON.parse(preference.preference_value || '{}');
        } catch {
          return defaultValue;
        }
      default:
        return preference.preference_value || defaultValue;
    }
  }

  // Set preference value with automatic type detection
  static async setValue(schoolId: string, key: string, value: any, isPublic: boolean = false): Promise<SchoolPreferences> {
    let preferenceType: 'string' | 'boolean' | 'number' | 'json' = 'string';
    let preferenceValue: string;

    if (typeof value === 'boolean') {
      preferenceType = 'boolean';
      preferenceValue = value.toString();
    } else if (typeof value === 'number') {
      preferenceType = 'number';
      preferenceValue = value.toString();
    } else if (typeof value === 'object') {
      preferenceType = 'json';
      preferenceValue = JSON.stringify(value);
    } else {
      preferenceType = 'string';
      preferenceValue = String(value);
    }

    return this.create({
      school_id: schoolId,
      preference_key: key,
      preference_value: preferenceValue,
      preference_type: preferenceType,
      is_public: isPublic
    });
  }

  // Get all preferences for a school as a key-value object
  static async getSchoolPreferences(schoolId: string): Promise<Record<string, any>> {
    const preferences = await this.findAll({ school_id: schoolId });
    const result: Record<string, any> = {};

    for (const pref of preferences) {
      result[pref.preference_key] = await this.getValue(schoolId, pref.preference_key);
    }

    return result;
  }

  // Set multiple preferences for a school
  static async setSchoolPreferences(
    schoolId: string,
    preferences: Record<string, any>,
    isPublic: boolean = false
  ): Promise<SchoolPreferences[]> {
    const results: SchoolPreferences[] = [];

    for (const [key, value] of Object.entries(preferences)) {
      const result = await this.setValue(schoolId, key, value, isPublic);
      results.push(result);
    }

    return results;
  }

  // Get public preferences for a school
  static async getPublicPreferences(schoolId: string): Promise<Record<string, any>> {
    const preferences = await this.findAll({ school_id: schoolId, is_public: true });
    const result: Record<string, any> = {};

    for (const pref of preferences) {
      result[pref.preference_key] = await this.getValue(schoolId, pref.preference_key);
    }

    return result;
  }

  // Get preference statistics for dashboard
  static async getDashboardStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_preferences,
        COUNT(DISTINCT school_id) as schools_with_preferences,
        preference_type,
        COUNT(*) as count
      FROM school_preferences
      GROUP BY preference_type
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}
