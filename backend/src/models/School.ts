import pool from '../database/connection';
import { School } from '../types/database';
import { isValidStatusTransition } from '../utils/statusValidation';

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
  status?: 'active' | 'suspended' | 'pending_verification' | 'inactive';
  verification_required?: boolean;
  subscription_tier?: 'basic' | 'premium' | 'enterprise';
  max_teachers?: number;
  max_students?: number;
}

export interface UpdateSchoolRequest extends Partial<CreateSchoolRequest> {
  is_active?: boolean;
  status?: 'active' | 'suspended' | 'pending_verification' | 'inactive';
  verification_required?: boolean;
  subscription_tier?: 'basic' | 'premium' | 'enterprise';
  max_teachers?: number;
  max_students?: number;
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
      is_active = true,
      status = 'active',
      verification_required = false,
      subscription_tier = 'basic',
      max_teachers = 50,
      max_students = 1000
    } = schoolData;

    const query = `
      INSERT INTO schools (name, address, city, postal_code, country, contact_email, contact_phone, logo_url, is_active, status, verification_required, subscription_tier, max_teachers, max_students)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      name, 
      address || null, 
      city || null, 
      postal_code || null, 
      country, 
      contact_email || null, 
      contact_phone || null, 
      logo_url || null, 
      is_active,
      status,
      verification_required,
      subscription_tier,
      max_teachers,
      max_students
    ];
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
      'contact_email', 'contact_phone', 'logo_url', 'is_active',
      'status', 'verification_required', 'subscription_tier', 'max_teachers', 'max_students'
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

  // Advanced search with multiple criteria
  static async advancedSearch(filters: {
    search?: string;
    is_active?: boolean;
    status?: string;
    subscription_tier?: string;
    date_range?: {
      start_date: string;
      end_date: string;
    };
    teacher_count_range?: {
      min: number;
      max: number;
    };
    credit_usage_range?: {
      min: number;
      max: number;
    };
    city?: string;
    country?: string;
    verification_required?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ schools: any[]; total: number }> {
    const {
      limit = 50,
      offset = 0,
      search,
      is_active,
      status,
      subscription_tier,
      date_range,
      teacher_count_range,
      credit_usage_range,
      city,
      country,
      verification_required
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(s.name ILIKE $${i} OR s.city ILIKE $${i} OR s.contact_email ILIKE $${i} OR s.address ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`s.is_active = $${i}`);
      values.push(is_active);
      i++;
    }

    if (status) {
      conditions.push(`s.status = $${i}`);
      values.push(status);
      i++;
    }

    if (subscription_tier) {
      conditions.push(`s.subscription_tier = $${i}`);
      values.push(subscription_tier);
      i++;
    }

    if (city) {
      conditions.push(`s.city = $${i}`);
      values.push(city);
      i++;
    }

    if (country) {
      conditions.push(`s.country = $${i}`);
      values.push(country);
      i++;
    }

    if (typeof verification_required === 'boolean') {
      conditions.push(`s.verification_required = $${i}`);
      values.push(verification_required);
      i++;
    }

    if (date_range) {
      conditions.push(`s.created_at >= $${i} AND s.created_at <= $${i + 1}`);
      values.push(date_range.start_date, date_range.end_date);
      i += 2;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let query = `
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
    `;

    // Apply post-aggregation filters
    const havingConditions: string[] = [];
    if (teacher_count_range) {
      if (teacher_count_range.min !== undefined) {
        havingConditions.push(`COUNT(u.id) FILTER (WHERE u.role = 'teacher_school') >= $${i}`);
        values.push(teacher_count_range.min);
        i++;
      }
      if (teacher_count_range.max !== undefined) {
        havingConditions.push(`COUNT(u.id) FILTER (WHERE u.role = 'teacher_school') <= $${i}`);
        values.push(teacher_count_range.max);
        i++;
      }
    }

    if (credit_usage_range) {
      if (credit_usage_range.min !== undefined) {
        havingConditions.push(`COALESCE(SUM(u.credits_balance), 0) >= $${i}`);
        values.push(credit_usage_range.min);
        i++;
      }
      if (credit_usage_range.max !== undefined) {
        havingConditions.push(`COALESCE(SUM(u.credits_balance), 0) <= $${i}`);
        values.push(credit_usage_range.max);
        i++;
      }
    }

    if (havingConditions.length > 0) {
      query += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${i} OFFSET $${i + 1}`;

    const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT s.id
        FROM schools s
        LEFT JOIN users u ON s.id = u.school_id
        ${where}
        GROUP BY s.id
        ${havingConditions.length > 0 ? `HAVING ${havingConditions.join(' AND ')}` : ''}
      ) as filtered_schools
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

  // Get school analytics
  static async getAnalytics(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_schools,
        COUNT(*) FILTER (WHERE is_active = true) as active_schools,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_schools,
        COUNT(*) FILTER (WHERE status = 'pending_verification') as pending_verification_schools,
        COUNT(*) FILTER (WHERE subscription_tier = 'basic') as basic_tier,
        COUNT(*) FILTER (WHERE subscription_tier = 'premium') as premium_tier,
        COUNT(*) FILTER (WHERE subscription_tier = 'enterprise') as enterprise_tier,
        AVG(teacher_count) as average_teachers_per_school,
        AVG(total_credits) as average_credits_per_school
      FROM (
        SELECT 
          s.*,
          COUNT(u.id) FILTER (WHERE u.role = 'teacher_school') as teacher_count,
          COALESCE(SUM(u.credits_balance), 0) as total_credits
        FROM schools s
        LEFT JOIN users u ON s.id = u.school_id
        GROUP BY s.id
      ) as school_stats
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Get schools by city
  static async getSchoolsByCity(): Promise<Array<{ city: string; count: number }>> {
    const query = `
      SELECT 
        city,
        COUNT(*) as count
      FROM schools
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get activity trends
  static async getActivityTrends(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(s.last_activity_at) as date,
        COUNT(*) as active_schools,
        COUNT(*) FILTER (WHERE s.last_activity_at >= CURRENT_DATE - INTERVAL '24 hours') as today_active
      FROM schools s
      WHERE s.last_activity_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(s.last_activity_at)
      ORDER BY date DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Update school status with history tracking
  static async updateStatus(
    id: string, 
    newStatus: string, 
    _reason?: string, 
    _changedByUserId?: string
  ): Promise<School | null> {
    const school = await this.findById(id);
    if (!school) return null;

    // Validate status transition using centralized utility
    if (!isValidStatusTransition(school.status, newStatus)) {
      throw new Error(`Neplatný přechod stavu z ${school.status} na ${newStatus}`);
    }

    // Update school status
    const updateQuery = `
      UPDATE schools 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [newStatus, id]);
    return result.rows[0] || null;
  }

  // Get schools requiring verification
  static async getSchoolsRequiringVerification(limit: number = 50, offset: number = 0): Promise<{ schools: any[]; total: number }> {
    const query = `
      SELECT 
        s.*,
        COUNT(u.id) FILTER (WHERE u.role = 'teacher_school') as teacher_count,
        COUNT(u.id) FILTER (WHERE u.role = 'school_admin') as admin_count
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id
      WHERE s.verification_required = true
      GROUP BY s.id
      ORDER BY s.created_at ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM schools WHERE verification_required = true
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    return {
      schools: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Get all teachers for a specific school
  static async getSchoolTeachers(schoolId: string): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        u.credits_balance,
        u.created_at,
        u.last_activity_at
      FROM users u
      WHERE u.school_id = $1 AND u.role IN ('teacher_school', 'school_admin')
      ORDER BY u.role DESC, u.last_name ASC, u.first_name ASC
    `;

    const result = await pool.query(query, [schoolId]);
    return result.rows;
  }

  // Get school deletion information including teacher count
  static async getSchoolDeletionInfo(schoolId: string): Promise<{
    school: School | null;
    activeTeachers: number;
    totalTeachers: number;
    canDelete: boolean;
    deletionMessage: string;
  }> {
    const school = await this.findById(schoolId);
    if (!school) {
      return {
        school: null,
        activeTeachers: 0,
        totalTeachers: 0,
        canDelete: false,
        deletionMessage: 'Škola nebyla nalezena'
      };
    }

    // Get teacher statistics
    const teacherQuery = `
      SELECT 
        COUNT(*) as total_teachers,
        COUNT(*) FILTER (WHERE is_active = true) as active_teachers
      FROM users 
      WHERE school_id = $1 AND role IN ('teacher_school', 'school_admin')
    `;

    const teacherResult = await pool.query(teacherQuery, [schoolId]);
    const { total_teachers, active_teachers } = teacherResult.rows[0];

    const canDelete = active_teachers === 0;
    let deletionMessage = '';

    if (active_teachers > 0) {
      deletionMessage = `Škola má ${active_teachers} aktivních učitelů. Musíte je nejprve deaktivovat.`;
    } else if (total_teachers > 0) {
      deletionMessage = `Škola má ${total_teachers} neaktivních učitelů. Můžete ji bezpečně smazat.`;
    } else {
      deletionMessage = 'Škola nemá žádné učitele. Můžete ji bezpečně smazat.';
    }

    return {
      school,
      activeTeachers: parseInt(active_teachers),
      totalTeachers: parseInt(total_teachers),
      canDelete,
      deletionMessage
    };
  }
}
