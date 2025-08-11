import pool from '../database/connection';
import { GeneratedFile, CreateGeneratedFileRequest } from '../types/database';

export class GeneratedFileModel {
  // Create a new generated file
  static async create(fileData: CreateGeneratedFileRequest): Promise<GeneratedFile> {
    const { user_id, title, content, file_type = 'worksheet' } = fileData;
    
    const query = `
      INSERT INTO generated_files (user_id, title, content, file_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [user_id, title, content, file_type];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Find generated file by ID
  static async findById(id: string): Promise<GeneratedFile | null> {
    const query = 'SELECT * FROM generated_files WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Get all generated files for a user
  static async findByUserId(userId: string, limit = 50, offset = 0): Promise<GeneratedFile[]> {
    const query = `
      SELECT * FROM generated_files 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Get generated files by type for a user
  static async findByUserIdAndType(
    userId: string, 
    fileType: string, 
    limit = 50, 
    offset = 0
  ): Promise<GeneratedFile[]> {
    const query = `
      SELECT * FROM generated_files 
      WHERE user_id = $1 AND file_type = $2
      ORDER BY created_at DESC 
      LIMIT $3 OFFSET $4
    `;
    
    const result = await pool.query(query, [userId, fileType, limit, offset]);
    return result.rows;
  }

  // Update generated file
  static async update(id: string, updateData: Partial<GeneratedFile>): Promise<GeneratedFile> {
    const allowedFields = ['title', 'content', 'file_type'];
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

    values.push(id);

    const query = `
      UPDATE generated_files 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete generated file by ID
  static async delete(id: string): Promise<void> {
    const query = 'DELETE FROM generated_files WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Count generated files for a user
  static async countByUserId(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM generated_files WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Count generated files by type for a user
  static async countByUserIdAndType(userId: string, fileType: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM generated_files WHERE user_id = $1 AND file_type = $2';
    const result = await pool.query(query, [userId, fileType]);
    return parseInt(result.rows[0].count);
  }

  // Get recent generated files for a user (last 10)
  static async getRecentByUserId(userId: string): Promise<GeneratedFile[]> {
    const query = `
      SELECT * FROM generated_files 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Search generated files by title
  static async searchByTitle(userId: string, searchTerm: string): Promise<GeneratedFile[]> {
    const query = `
      SELECT * FROM generated_files 
      WHERE user_id = $1 AND title ILIKE $2
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId, `%${searchTerm}%`]);
    return result.rows;
  }

  // Get file types used by a user
  static async getFileTypesByUserId(userId: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT file_type 
      FROM generated_files 
      WHERE user_id = $1 
      ORDER BY file_type
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => row.file_type);
  }

  // Get files by folder
  static async findByFolder(folderId: string, userId: string): Promise<GeneratedFile[]> {
    const query = `
      SELECT * FROM generated_files 
      WHERE folder_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [folderId, userId]);
    return result.rows;
  }

  // Get files without folder (unorganized)
  static async findUnorganized(userId: string): Promise<GeneratedFile[]> {
    const query = `
      SELECT * FROM generated_files 
      WHERE user_id = $1 AND folder_id IS NULL
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Enhanced search with multiple criteria
  static async advancedSearch(
    userId: string,
    searchTerm?: string,
    fileType?: string,
    folderId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<GeneratedFile[]> {
    let query = `
      SELECT * FROM generated_files 
      WHERE user_id = $1
    `;
    
    const values: any[] = [userId];
    let paramCount = 2;

    if (searchTerm) {
      query += ` AND (title ILIKE $${paramCount} OR content::text ILIKE $${paramCount})`;
      values.push(`%${searchTerm}%`);
      paramCount++;
    }

    if (fileType) {
      query += ` AND file_type = $${paramCount}`;
      values.push(fileType);
      paramCount++;
    }

    if (folderId) {
      query += ` AND folder_id = $${paramCount}`;
      values.push(folderId);
      paramCount++;
    }

    if (dateFrom) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(dateTo);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Move file to folder
  static async moveToFolder(fileId: string, folderId: string | null): Promise<GeneratedFile> {
    const query = `
      UPDATE generated_files 
      SET folder_id = $1 
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [folderId, fileId]);
    return result.rows[0];
  }

  // Get file statistics for a user
  static async getUserStats(userId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_files,
        COUNT(CASE WHEN folder_id IS NOT NULL THEN 1 END) as organized_files,
        COUNT(CASE WHEN folder_id IS NULL THEN 1 END) as unorganized_files,
        COUNT(DISTINCT file_type) as unique_file_types,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_files
      FROM generated_files 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
} 