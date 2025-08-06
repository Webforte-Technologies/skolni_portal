import pool from '../database/connection';
import { User, CreateUserRequest } from '../types/database';
import bcrypt from 'bcryptjs';

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserRequest): Promise<User> {
    const { email, password, first_name, last_name, school_id } = userData;
    
    // Hash the password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, school_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [email, password_hash, first_name, last_name, school_id];
    const result = await pool.query(query, values);
    
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
} 