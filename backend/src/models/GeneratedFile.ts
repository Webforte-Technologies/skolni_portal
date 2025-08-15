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
    const allowedFields = ['title', 'content', 'file_type', 'moderation_status', 'quality_score', 'reviewed_by', 'reviewed_at', 'moderation_notes'];
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

  // List for moderation queue by status
  static async listForModeration(status: 'pending' | 'approved' | 'rejected' = 'pending', limit = 50, offset = 0): Promise<any[]> {
    const query = `
      SELECT gf.id, gf.title, gf.file_type, gf.created_at, 
             u.id as user_id, u.email, u.first_name, u.last_name, u.school_id,
             s.name as school_name
      FROM generated_files gf
      LEFT JOIN users u ON gf.user_id = u.id
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE gf.moderation_status = $1
      ORDER BY gf.created_at ASC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [status, limit, offset]);
    return result.rows;
  }

  // Set moderation decision and optional quality score/notes
  static async setModerationDecision(
    id: string,
    params: { status: 'approved' | 'rejected'; notes?: string; quality_score?: number },
    reviewerId: string
  ): Promise<GeneratedFile> {
    const fields: string[] = [
      `moderation_status = $1`,
      `reviewed_by = $2`,
      `reviewed_at = NOW()`
    ];
    const values: any[] = [params.status, reviewerId];
    let i = 3;
    if (params.notes !== undefined) { fields.push(`moderation_notes = $${i++}`); values.push(params.notes); }
    if (params.quality_score !== undefined) { fields.push(`quality_score = $${i++}`); values.push(params.quality_score); }
    values.push(id);
    const query = `UPDATE generated_files SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
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

  // Get files with AI-powered categorization and tags
  static async findWithCategorization(userId: string, limit = 50, offset = 0): Promise<any[]> {
    const query = `
      SELECT 
        gf.*,
        COALESCE(gf.ai_tags, '[]'::jsonb) as tags,
        COALESCE(gf.ai_category, 'Uncategorized') as category,
        COALESCE(gf.ai_difficulty, 'medium') as difficulty,
        COALESCE(gf.ai_subject, 'general') as subject,
        COALESCE(gf.ai_grade_level, 'high_school') as grade_level
      FROM generated_files gf
      WHERE gf.user_id = $1 
      ORDER BY gf.created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Search files with AI-powered relevance scoring
  static async searchWithRelevance(
    userId: string, 
    searchTerm: string, 
    filters: {
      category?: string;
      subject?: string;
      difficulty?: string;
      gradeLevel?: string;
      tags?: string[];
      dateFrom?: string;
      dateTo?: string;
    } = {},
    limit = 50,
    offset = 0
  ): Promise<any[]> {
    let query = `
      SELECT 
        gf.*,
        COALESCE(gf.ai_tags, '[]'::jsonb) as tags,
        COALESCE(gf.ai_category, 'Uncategorized') as category,
        COALESCE(gf.ai_difficulty, 'medium') as difficulty,
        COALESCE(gf.ai_subject, 'general') as subject,
        COALESCE(gf.ai_grade_level, 'high_school') as grade_level,
        CASE 
          WHEN gf.title ILIKE $1 THEN 3
          WHEN gf.content::text ILIKE $1 THEN 2
          WHEN gf.ai_tags::text ILIKE $1 THEN 1
          ELSE 0
        END as relevance_score
      FROM generated_files gf
      WHERE gf.user_id = $2
    `;
    
    const values: any[] = [`%${searchTerm}%`, userId];
    let paramCount = 3;
    
    // Add filters
    if (filters.category) {
      query += ` AND gf.ai_category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }
    
    if (filters.subject) {
      query += ` AND gf.ai_subject = $${paramCount}`;
      values.push(filters.subject);
      paramCount++;
    }
    
    if (filters.difficulty) {
      query += ` AND gf.ai_difficulty = $${paramCount}`;
      values.push(filters.difficulty);
      paramCount++;
    }
    
    if (filters.gradeLevel) {
      query += ` AND gf.ai_grade_level = $${paramCount}`;
      values.push(filters.gradeLevel);
      paramCount++;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query += ` AND gf.ai_tags ?| $${paramCount}`;
      values.push(filters.tags);
      paramCount++;
    }
    
    if (filters.dateFrom) {
      query += ` AND gf.created_at >= $${paramCount}`;
      values.push(filters.dateFrom);
      paramCount++;
    }
    
    if (filters.dateTo) {
      query += ` AND gf.created_at <= $${paramCount}`;
      values.push(filters.dateTo);
      paramCount++;
    }
    
    query += ` ORDER BY relevance_score DESC, gf.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get content recommendations based on user preferences and usage patterns
  static async getRecommendations(
    userId: string, 
    limit = 10
  ): Promise<any[]> {
    const query = `
      WITH user_preferences AS (
        SELECT 
          COALESCE(gf.ai_category, 'Uncategorized') as preferred_category,
          COALESCE(gf.ai_subject, 'general') as preferred_subject,
          COALESCE(gf.ai_difficulty, 'medium') as preferred_difficulty,
          COUNT(*) as usage_count
        FROM generated_files gf
        WHERE gf.user_id = $1
        GROUP BY gf.ai_category, gf.ai_subject, gf.ai_difficulty
        ORDER BY usage_count DESC
        LIMIT 3
      ),
      recommendations AS (
        SELECT 
          gf.*,
          COALESCE(gf.ai_tags, '{}'::text[]) as tags,
          COALESCE(gf.ai_category, 'Uncategorized') as category,
          COALESCE(gf.ai_difficulty, 'medium') as difficulty,
          COALESCE(gf.ai_subject, 'general') as subject,
          COALESCE(gf.ai_grade_level, 'high_school') as grade_level,
          CASE 
            WHEN up.preferred_category = gf.ai_category THEN 3
            WHEN up.preferred_subject = gf.ai_subject THEN 2
            WHEN up.preferred_difficulty = gf.ai_difficulty THEN 1
            ELSE 0
          END as match_score
        FROM generated_files gf
        CROSS JOIN user_preferences up
        WHERE gf.user_id != $1
        AND gf.moderation_status = 'approved'
      )
      SELECT DISTINCT ON (id) *
      FROM recommendations
      ORDER BY id, match_score DESC, created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Update AI-generated metadata for a file
  static async updateAIMetadata(
    id: string, 
    metadata: {
      category?: string;
      subject?: string;
      difficulty?: string;
      gradeLevel?: string;
      tags?: string[];
      // raw JSON metadata (e.g., raw AI response, prompts)
      metadata?: Record<string, any>;
      qualityScore?: number;
    }
  ): Promise<GeneratedFile> {
    const allowedFields = [
      'ai_category', 'ai_subject', 'ai_difficulty', 
      'ai_grade_level', 'ai_tags', 'ai_quality_score', 'ai_metadata'
    ];
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(metadata)) {
      if (key === 'metadata' && value !== undefined) {
        // map `metadata` input to `ai_metadata` column
        const dbField = 'ai_metadata';
        updates.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      } else if (allowedFields.includes(`ai_${key}`) && value !== undefined) {
        const dbField = `ai_${key}`;
        if (key === 'tags') {
          updates.push(`${dbField} = $${paramCount}::text[]`);
        } else {
          updates.push(`${dbField} = $${paramCount}`);
        }
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid AI metadata fields to update');
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

  // Get content analytics and usage statistics
  static async getContentAnalytics(userId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_files,
        COUNT(CASE WHEN ai_category IS NOT NULL THEN 1 END) as categorized_files,
        COUNT(CASE WHEN ai_tags IS NOT NULL AND array_length(ai_tags, 1) > 0 THEN 1 END) as tagged_files,
        COUNT(CASE WHEN moderation_status = 'approved' THEN 1 END) as approved_files,
        COUNT(CASE WHEN moderation_status = 'pending' THEN 1 END) as pending_files,
        COUNT(CASE WHEN moderation_status = 'rejected' THEN 1 END) as rejected_files,
        AVG(CASE WHEN ai_quality_score IS NOT NULL THEN ai_quality_score END) as avg_quality_score,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as files_last_30_days,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as files_last_7_days
      FROM generated_files
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get content by category distribution
  static async getCategoryDistribution(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        COALESCE(ai_category, 'Uncategorized') as category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM generated_files WHERE user_id = $1), 2) as percentage
      FROM generated_files
      WHERE user_id = $1
      GROUP BY ai_category
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get content by subject distribution
  static async getSubjectDistribution(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        COALESCE(ai_subject, 'general') as subject,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM generated_files WHERE user_id = $1), 2) as percentage
      FROM generated_files
      WHERE user_id = $1
      GROUP BY ai_subject
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get content by difficulty distribution
  static async getDifficultyDistribution(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        COALESCE(ai_difficulty, 'medium') as difficulty,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM generated_files WHERE user_id = $1), 2) as percentage
      FROM generated_files
      WHERE user_id = $1
      GROUP BY ai_difficulty
      ORDER BY 
        CASE ai_difficulty
          WHEN 'beginner' THEN 1
          WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3
          ELSE 4
        END
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
} 