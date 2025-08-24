import pool from '../database/connection';
import { School } from '../types/database';

export interface CreateSchoolRequest {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface UpdateSchoolRequest extends Partial<CreateSchoolRequest> {
  is_active?: boolean;
}

export class SchoolModel {
  // Create a new school
  static async create(schoolData: CreateSchoolRequest): Promise<School> {
    const {
      name,
      address,
      city,
      postal_code,
      country = 'Czech Republic',
      contact_email,
      contact_phone,
      logo_url,
      is_active = true
    } = schoolData;

    const query = `
      INSERT INTO schools (name, address, city, postal_code, country, contact_email, contact_phone, logo_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [name, address || null, city || null, postal_code || null, country, contact_email || null, contact_phone || null, logo_url || null, is_active];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  // Find school by ID
  static async findById(id: string): Promise<School | null> {
    const query = 'SELECT * FROM schools WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find school by name
  static async findByName(name: string): Promise<School | null> {
    const query = 'SELECT * FROM schools WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  // Get all schools with optional filters
  static async findAll(filters: {
    limit?: number;
    offset?: number;
    search?: string;
    is_active?: boolean;
  } = {}): Promise<{ schools: School[]; total: number }> {
    const { limit = 50, offset = 0, search, is_active } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(name ILIKE $${i} OR city ILIKE $${i} OR contact_email ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`is_active = $${i}`);
      values.push(is_active);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM schools
      ${where}
      ORDER BY created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM schools ${where}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      schools: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Update school
  static async update(id: string, updateData: UpdateSchoolRequest): Promise<School | null> {
    const allowedFields = [
      'name', 'address', 'city', 'postal_code', 'country',
      'contact_email', 'contact_phone', 'logo_url', 'is_active'
    ];

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
      UPDATE schools 
      SET ${updates.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete school (soft delete by setting is_active to false)
  static async delete(id: string): Promise<boolean> {
    const query = 'UPDATE schools SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Hard delete school (use with caution)
  static async hardDelete(id: string): Promise<boolean> {
    const query = 'DELETE FROM schools WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Get school with user statistics
  static async findByIdWithStats(id: string): Promise<any> {
    const query = `
      SELECT 
        s.*,
        COUNT(u.id) FILTER (WHERE u.role = 'teacher_school') as teacher_count,
        COUNT(u.id) FILTER (WHERE u.role = 'school_admin') as admin_count,
        COUNT(u.id) FILTER (WHERE u.is_active = true) as active_users,
        COALESCE(SUM(u.credits_balance), 0) as total_credits
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get schools with user statistics
  static async findAllWithStats(filters: {
    limit?: number;
    offset?: number;
    search?: string;
    is_active?: boolean;
  } = {}): Promise<{ schools: any[]; total: number }> {
    const { limit = 50, offset = 0, search, is_active } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(s.name ILIKE $${i} OR s.city ILIKE $${i} OR s.contact_email ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`s.is_active = $${i}`);
      values.push(is_active);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        s.*,
        COUNT(u.id) FILTER (WHERE u.role = 'teacher_school') as teacher_count,
        COUNT(u.id) FILTER (WHERE u.role = 'school_admin') as admin_count,
        COUNT(u.id) FILTER (WHERE u.is_active = true) as active_users,
        COALESCE(SUM(u.credits_balance), 0) as total_credits
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id
      ${where}
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM schools s ${where}
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      schools: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }
}
