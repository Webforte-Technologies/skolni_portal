import pool from '../database/connection';
import { User, CreateUserRequest, AdminCreateUserRequest, AdminUpdateUserRequest } from '../types/database';
import bcrypt from 'bcryptjs';
import { cacheService } from '../services/CacheService';

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserRequest): Promise<User> {
    const { email, password, first_name, last_name, school_id } = userData;
    // Determine role if not provided
    const role = userData.role
      ? userData.role
      : (school_id ? 'teacher_school' : 'teacher_individual');
    
    // Hash the password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, school_id, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [email, password_hash, first_name, last_name, school_id || null, role];
    const result = await pool.query(query, values);
    
    if (result.rows[0]) {
      // Clear search cache since we added a new user
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Update user credits
  static async updateCredits(userId: string, newBalance: number): Promise<User> {
    const query = `
      UPDATE users 
      SET credits_balance = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [newBalance, userId]);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0];
  }

  // Update user profile
  static async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const allowedFields = ['first_name', 'last_name', 'school_id', 'email_verified'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  // Get user with school information
  static async findByIdWithSchool(id: string): Promise<any> {
    const query = `
      SELECT u.*, s.name as school_name, s.city as school_city
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get all users (for admin)
  static async findAll(limit = 50, offset = 0): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Count total users
  static async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  // Admin-specific methods

  // Create user with admin privileges (no password required, generates random one)
  static async createAdmin(userData: AdminCreateUserRequest): Promise<User> {
    const { 
      email, 
      first_name, 
      last_name, 
      role, 
      school_id, 
      credits_balance = 0, 
      is_active = true 
    } = userData;

    // Generate a random password for admin-created users
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    const password_hash = await bcrypt.hash(randomPassword, 12);

    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role, school_id, credits_balance, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [email, password_hash, first_name, last_name, role, school_id || null, credits_balance, is_active];
    const result = await pool.query(query, values);

    if (result.rows[0]) {
      // Clear search cache since we added a new user
      cacheService.clearPattern('search:');
    }

    return result.rows[0];
  }

  // Update user with admin privileges
  static async updateAdmin(userId: string, updateData: AdminUpdateUserRequest): Promise<User | null> {
    const allowedFields = [
      'first_name', 'last_name', 'email', 'role', 'school_id', 
      'is_active', 'credits_balance', 'status'
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
      return this.findById(userId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0] || null;
  }

  // Delete user (soft delete by setting is_active to false)
  static async delete(userId: string): Promise<boolean> {
    const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [userId]);
    
    if ((result.rowCount ?? 0) > 0) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return (result.rowCount ?? 0) > 0;
  }

  // Hard delete user (use with caution)
  static async hardDelete(userId: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    
    if ((result.rowCount ?? 0) > 0) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return (result.rowCount ?? 0) > 0;
  }

  // Get users with advanced filtering
  static async findAllWithFilters(filters: {
    limit?: number;
    offset?: number;
    role?: string;
    school_id?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<{ users: User[]; total: number }> {
    const { limit = 50, offset = 0, role, school_id, is_active, search } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (role) {
      conditions.push(`role = $${i}`);
      values.push(role);
      i++;
    }

    if (school_id) {
      conditions.push(`school_id = $${i}`);
      values.push(school_id);
      i++;
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`is_active = $${i}`);
      values.push(is_active);
      i++;
    }

    if (search) {
      conditions.push(`(email ILIKE $${i} OR first_name ILIKE $${i} OR last_name ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM users ${where}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Get teachers with school information
  static async findTeachersWithSchools(filters: {
    limit?: number;
    offset?: number;
    school_id?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<{ teachers: any[]; total: number }> {
    const { limit = 50, offset = 0, school_id, is_active, search } = filters;

    const conditions: string[] = ["u.role IN ('teacher_school', 'teacher_individual')"];
    const values: any[] = [];
    let i = 1;

    if (school_id) {
      conditions.push(`u.school_id = $${i}`);
      values.push(school_id);
      i++;
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`u.is_active = $${i}`);
      values.push(is_active);
      i++;
    }

    if (search) {
      conditions.push(`(u.email ILIKE $${i} OR u.first_name ILIKE $${i} OR u.last_name ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const query = `
      SELECT 
        u.*,
        s.name as school_name,
        s.city as school_city
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ${where}
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    return {
      teachers: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Enhanced user search with advanced filters
  static async advancedSearch(filters: {
    role?: string;
    school_id?: string;
    is_active?: boolean;
    status?: string;
    date_range?: {
      start_date: string;
      end_date: string;
    };
    credit_range?: {
      min: number;
      max: number;
    };
    last_login_range?: {
      start_date: string;
      end_date: string;
    };
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ users: User[]; total: number }> {
    // Generate cache key from filters
    const searchKey = this.generateSearchCacheKey(filters);
    
    // Check cache for this search
    const cached = cacheService.getSearchResults(searchKey);
    if (cached) {
      return cached as { users: User[]; total: number };
    }

    const {
      role,
      school_id,
      is_active,
      status,
      date_range,
      credit_range,
      last_login_range,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (role) {
      conditions.push(`u.role = $${i}`);
      values.push(role);
      i++;
    }

    if (school_id) {
      conditions.push(`u.school_id = $${i}`);
      values.push(school_id);
      i++;
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`u.is_active = $${i}`);
      values.push(is_active);
      i++;
    }

    if (status) {
      conditions.push(`u.status = $${i}`);
      values.push(status);
      i++;
    }

    if (date_range) {
      conditions.push(`u.created_at >= $${i} AND u.created_at <= $${i + 1}`);
      values.push(date_range.start_date, date_range.end_date);
      i += 2;
    }

    if (credit_range) {
      conditions.push(`u.credits_balance >= $${i} AND u.credits_balance <= $${i + 1}`);
      values.push(credit_range.min, credit_range.max);
      i += 2;
    }

    if (last_login_range) {
      conditions.push(`u.last_login_at >= $${i} AND u.last_login_at <= $${i + 1}`);
      values.push(last_login_range.start_date, last_login_range.end_date);
      i += 2;
    }

    if (search) {
      conditions.push(`(
        u.email ILIKE $${i} OR 
        u.first_name ILIKE $${i} OR 
        u.last_name ILIKE $${i} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${i}
      )`);
      values.push(`%${search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        u.*,
        s.name as school_name,
        s.city as school_city
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ${where}
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const searchResult = {
      users: result.rows,
      total: parseInt(countResult.rows[0].count)
    };

    // Cache the search result
    cacheService.setSearchResults(searchKey, searchResult);

    return searchResult;
  }

  // Get detailed user profile with activity stats
  static async getDetailedProfile(userId: string): Promise<any> {
    const query = `
      SELECT 
        u.*,
        s.name as school_name,
        s.city as school_city,
        up.language,
        up.theme,
        up.email_notifications,
        up.push_notifications,
        up.dashboard_layout,
        up.ai_assistant_preferences,
        up.accessibility_settings
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = $1
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0] || null;
  }

  // Update user status
  static async updateStatus(userId: string, status: string, reason?: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, userId]);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0] || null;
  }

  // Update last login information
  static async updateLastLogin(userId: string, ipAddress?: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP, 
          login_count = login_count + 1,
          failed_login_attempts = 0,
          locked_until = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
    
    // Clear cache for this user and search results
    cacheService.clearUserCache(userId);
    cacheService.clearPattern('search:');
  }

  // Increment failed login attempts
  static async incrementFailedLogins(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
    
    // Clear cache for this user and search results
    cacheService.clearUserCache(userId);
    cacheService.clearPattern('search:');
  }

  // Lock user account
  static async lockAccount(userId: string, lockDurationMinutes: number = 30): Promise<void> {
    const query = `
      UPDATE users 
      SET locked_until = CURRENT_TIMESTAMP + INTERVAL '${lockDurationMinutes} minutes',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
    
    // Clear cache for this user and search results
    cacheService.clearUserCache(userId);
    cacheService.clearPattern('search:');
  }

  // Check if user account is locked
  static async isAccountLocked(userId: string): Promise<boolean> {
    const query = `
      SELECT locked_until FROM users 
      WHERE id = $1 AND locked_until > CURRENT_TIMESTAMP
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  }

  // Get user analytics for admin dashboard with caching
  static async getUserAnalytics(): Promise<any> {
    // Check cache first
    const cached = cacheService.getUserAnalytics();
    if (cached) {
      return cached;
    }
    // Get total users
    const totalQuery = 'SELECT COUNT(*) FROM users';
    const totalResult = await pool.query(totalQuery);
    const totalUsers = parseInt(totalResult.rows[0].count);

    // Get active users
    const activeQuery = 'SELECT COUNT(*) FROM users WHERE is_active = true';
    const activeResult = await pool.query(activeQuery);
    const activeUsers = parseInt(activeResult.rows[0].count);

    // Get new users this month
    const newUsersQuery = `
      SELECT COUNT(*) FROM users 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const newUsersResult = await pool.query(newUsersQuery);
    const newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

    // Get users by role
    const roleQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;
    const roleResult = await pool.query(roleQuery);
    const usersByRole: Record<string, number> = {};
    roleResult.rows.forEach((row: any) => {
      usersByRole[row.role] = parseInt(row.count);
    });

    // Get users by status
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM users
      GROUP BY status
    `;
    const statusResult = await pool.query(statusQuery);
    const usersByStatus: Record<string, number> = {};
    statusResult.rows.forEach((row: any) => {
      usersByStatus[row.status] = parseInt(row.count);
    });

    // Get average credits balance
    const avgCreditsQuery = 'SELECT AVG(credits_balance) FROM users';
    const avgCreditsResult = await pool.query(avgCreditsQuery);
    const averageCreditsBalance = parseFloat(avgCreditsResult.rows[0].avg) || 0;

    // Get top credit users
    const topCreditsQuery = `
      SELECT id, email, first_name, last_name, credits_balance
      FROM users
      ORDER BY credits_balance DESC
      LIMIT 10
    `;
    const topCreditsResult = await pool.query(topCreditsQuery);

    // Get recent activity summary
    const loginTodayQuery = `
      SELECT COUNT(*) FROM users 
      WHERE last_login_at >= CURRENT_DATE
    `;
    const loginTodayResult = await pool.query(loginTodayQuery);
    const loginsToday = parseInt(loginTodayResult.rows[0].count);

    const loginWeekQuery = `
      SELECT COUNT(*) FROM users 
      WHERE last_login_at >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const loginWeekResult = await pool.query(loginWeekQuery);
    const loginsThisWeek = parseInt(loginWeekResult.rows[0].count);

    const loginMonthQuery = `
      SELECT COUNT(*) FROM users 
      WHERE last_login_at >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const loginMonthResult = await pool.query(loginMonthQuery);
    const loginsThisMonth = parseInt(loginMonthResult.rows[0].count);

    const analytics = {
      total_users: totalUsers,
      active_users: activeUsers,
      new_users_this_month: newUsersThisMonth,
      users_by_role: usersByRole,
      users_by_status: usersByStatus,
      average_credits_balance: averageCreditsBalance,
      top_credit_users: topCreditsResult.rows,
      recent_activity_summary: {
        logins_today: loginsToday,
        logins_this_week: loginsThisWeek,
        logins_this_month: loginsThisMonth
      }
    };

    // Cache the analytics
    cacheService.setUserAnalytics(analytics);
    
    return analytics;
  }

  // Assign teacher to school
  static async assignToSchool(userId: string, schoolId: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET school_id = $1, role = 'teacher_school', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND role IN ('teacher_individual', 'teacher_school')
      RETURNING *
    `;
    
    const result = await pool.query(query, [schoolId, userId]);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0] || null;
  }

  // Remove teacher from school
  static async removeFromSchool(userId: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET school_id = NULL, role = 'teacher_individual', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND role = 'teacher_school'
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows[0]) {
      // Clear cache for this user and search results
      cacheService.clearUserCache(userId);
      cacheService.clearPattern('search:');
    }
    
    return result.rows[0] || null;
  }

  // Generate cache key for search results
  private static generateSearchCacheKey(filters: any): string {
    // Sort keys for consistent cache keys
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = filters[key];
        return result;
      }, {});
    
    return `advanced_search:${JSON.stringify(sortedFilters)}`;
  }
} 