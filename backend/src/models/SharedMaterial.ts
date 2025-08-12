import pool from '../database/connection';
import { SharedMaterial, ShareMaterialRequest } from '../types/database';

export class SharedMaterialModel {
  // Share a material
  static async share(materialData: ShareMaterialRequest): Promise<SharedMaterial> {
    const { material_id, school_id, folder_id, is_public = false } = materialData;
    
    // Get the user_id from the material
    const materialQuery = 'SELECT user_id FROM generated_files WHERE id = $1';
    const materialResult = await pool.query(materialQuery, [material_id]);
    
    if (materialResult.rows.length === 0) {
      throw new Error('Material not found');
    }
    
    const shared_by_user_id = materialResult.rows[0].user_id;
    
    // Check if already shared
    const existingShare = await pool.query(
      'SELECT * FROM shared_materials WHERE material_id = $1 AND school_id = $2',
      [material_id, school_id]
    );
    
    if (existingShare.rows.length > 0) {
      throw new Error('Material is already shared in this school');
    }
    
    const query = `
      INSERT INTO shared_materials (material_id, shared_by_user_id, school_id, folder_id, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [material_id, shared_by_user_id, school_id, folder_id, is_public];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Get shared materials for a school
  static async findBySchool(schoolId: string, folderId?: string): Promise<any[]> {
    console.log('🔍 SharedMaterialModel.findBySchool called with schoolId:', schoolId, 'folderId:', folderId);
    
    let query = `
      SELECT 
        sm.*,
        gf.title,
        gf.content,
        gf.file_type,
        gf.created_at as material_created_at,
        u.first_name,
        u.last_name,
        u.email,
        f.name as folder_name
      FROM shared_materials sm
      JOIN generated_files gf ON sm.material_id = gf.id
      JOIN users u ON sm.shared_by_user_id = u.id
      LEFT JOIN folders f ON sm.folder_id = f.id
      WHERE sm.school_id = $1
    `;
    
    let values = [schoolId];
    
    if (folderId) {
      query += ` AND sm.folder_id = $2`;
      values.push(folderId);
    }
    
    query += ` ORDER BY sm.shared_at DESC`;
    
    console.log('🔍 Executing query:', query);
    console.log('🔍 With values:', values);
    
    const result = await pool.query(query, values);
    console.log('🔍 Query result:', result.rows.length, 'rows');
    
    return result.rows;
  }

  // Get shared materials by a specific user
  static async findByUser(userId: string, schoolId?: string): Promise<SharedMaterial[]> {
    let query = `
      SELECT * FROM shared_materials 
      WHERE shared_by_user_id = $1
    `;
    
    let values = [userId];
    
    if (schoolId) {
      query += ` AND school_id = $2`;
      values.push(schoolId);
    }
    
    query += ` ORDER BY shared_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Unshare a material
  static async unshare(materialId: string, schoolId: string): Promise<boolean> {
    const query = `
      DELETE FROM shared_materials 
      WHERE material_id = $1 AND school_id = $2
    `;
    
    const result = await pool.query(query, [materialId, schoolId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Update sharing settings
  static async updateSharing(
    materialId: string, 
    schoolId: string, 
    updates: { folder_id?: string; is_public?: boolean }
  ): Promise<SharedMaterial | null> {
    const { folder_id, is_public } = updates;
    
    const query = `
      UPDATE shared_materials 
      SET folder_id = COALESCE($1, folder_id),
          is_public = COALESCE($2, is_public)
      WHERE material_id = $3 AND school_id = $4
      RETURNING *
    `;
    
    const values = [folder_id, is_public, materialId, schoolId];
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  // Get sharing statistics for a school
  static async getSchoolStats(schoolId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_shared,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_materials,
        COUNT(DISTINCT shared_by_user_id) as unique_sharers,
        COUNT(CASE WHEN folder_id IS NOT NULL THEN 1 END) as organized_materials
      FROM shared_materials 
      WHERE school_id = $1
    `;
    
    const result = await pool.query(query, [schoolId]);
    return result.rows[0];
  }

  // Search shared materials
  static async search(
    schoolId: string, 
    searchTerm: string, 
    folderId?: string
  ): Promise<any[]> {
    let query = `
      SELECT 
        sm.*,
        gf.title,
        gf.content,
        gf.file_type,
        gf.created_at as material_created_at,
        u.first_name,
        u.last_name,
        u.email,
        f.name as folder_name
      FROM shared_materials sm
      JOIN generated_files gf ON sm.material_id = gf.id
      JOIN users u ON sm.shared_by_user_id = u.id
      LEFT JOIN folders f ON sm.folder_id = f.id
      WHERE sm.school_id = $1 
        AND (gf.title ILIKE $2 OR gf.content::text ILIKE $2)
    `;
    
    let values = [schoolId, `%${searchTerm}%`];
    
    if (folderId) {
      query += ` AND sm.folder_id = $3`;
      values.push(folderId);
    }
    
    query += ` ORDER BY sm.shared_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get community statistics
  static async getCommunityStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(DISTINCT sm.id) as total_materials,
        COUNT(DISTINCT sm.school_id) as total_schools,
        COUNT(DISTINCT u.id) as total_contributors,
        COALESCE(SUM(sm.stats->>'views'), '0')::int as total_views,
        COALESCE(SUM(sm.stats->>'downloads'), '0')::int as total_downloads,
        COALESCE(SUM(sm.stats->>'likes'), '0')::int as total_likes,
        COALESCE(SUM(sm.stats->>'shares'), '0')::int as total_shares,
        COALESCE(SUM(sm.stats->>'comments'), '0')::int as total_comments
      FROM shared_materials sm
      LEFT JOIN users u ON sm.material_id IN (
        SELECT id FROM generated_files WHERE user_id = u.id
      )
      WHERE sm.is_public = true
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Get top contributors
  static async getTopContributors(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        s.name as school_name,
        COUNT(sm.id) as materials_count,
        COALESCE(SUM((sm.stats->>'downloads')::int), 0) as total_downloads,
        COALESCE(SUM((sm.stats->>'likes')::int), 0) as total_likes,
        COALESCE(SUM((sm.stats->>'views')::int), 0) as total_views
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN generated_files gf ON u.id = gf.user_id
      LEFT JOIN shared_materials sm ON gf.id = sm.material_id
      WHERE u.role IN ('teacher_school', 'school_admin')
      GROUP BY u.id, u.first_name, u.last_name, u.email, s.name
      HAVING COUNT(sm.id) > 0
      ORDER BY materials_count DESC, total_downloads DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Like a material
  static async likeMaterial(materialId: string): Promise<any> {
    const query = `
      UPDATE shared_materials 
      SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb),
        '{likes}',
        COALESCE((stats->>'likes')::int, 0) + 1
      )
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [materialId]);
    return result.rows[0];
  }

  // Record a download
  static async recordDownload(materialId: string): Promise<any> {
    const query = `
      UPDATE shared_materials 
      SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb),
        '{downloads}',
        COALESCE((stats->>'downloads')::int, 0) + 1
      )
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [materialId]);
    return result.rows[0];
  }

  // Record a share
  static async recordShare(materialId: string): Promise<any> {
    const query = `
      UPDATE shared_materials 
      SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb),
        '{shares}',
        COALESCE((stats->>'shares')::int, 0) + 1
      )
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [materialId]);
    return result.rows[0];
  }

  // Record a view
  static async recordView(materialId: string): Promise<any> {
    const query = `
      UPDATE shared_materials 
      SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb),
        '{views}',
        COALESCE((stats->>'views')::int, 0) + 1
      )
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [materialId]);
    return result.rows[0];
  }

  // Get materials with enhanced stats
  static async browseWithStats(
    schoolId: string, 
    folderId?: string, 
    searchTerm?: string,
    filters?: {
      category?: string;
      subject?: string;
      difficulty?: string;
      gradeLevel?: string;
      creator?: string;
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string;
    }
  ): Promise<any[]> {
    let query = `
      SELECT 
        sm.*,
        gf.title,
        gf.content,
        gf.file_type,
        gf.user_id,
        gf.created_at,
        gf.ai_category,
        gf.ai_subject,
        gf.ai_difficulty,
        gf.ai_tags,
        gf.moderation_status,
        gf.quality_score,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        s.name as school_name,
        s.city as school_city,
        f.name as folder_name,
        f.description as folder_description,
        COALESCE(sm.stats->>'views', '0')::int as views,
        COALESCE(sm.stats->>'downloads', '0')::int as downloads,
        COALESCE(sm.stats->>'likes', '0')::int as likes,
        COALESCE(sm.stats->>'shares', '0')::int as shares,
        COALESCE(sm.stats->>'comments', '0')::int as comments
      FROM shared_materials sm
      JOIN generated_files gf ON sm.material_id = gf.id
      JOIN users u ON gf.user_id = u.id
      JOIN schools s ON u.school_id = s.id
      LEFT JOIN folders f ON sm.folder_id = f.id
      WHERE sm.school_id = $1
    `;
    
    const values: any[] = [schoolId];
    let paramCount = 2;
    
    if (folderId) {
      query += ` AND sm.folder_id = $${paramCount}`;
      values.push(folderId);
      paramCount++;
    }
    
    if (searchTerm) {
      query += ` AND (gf.title ILIKE $${paramCount} OR gf.content::text ILIKE $${paramCount})`;
      values.push(`%${searchTerm}%`);
      paramCount++;
    }
    
    if (filters?.category) {
      query += ` AND gf.ai_category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }
    
    if (filters?.subject) {
      query += ` AND gf.ai_subject = $${paramCount}`;
      values.push(filters.subject);
      paramCount++;
    }
    
    if (filters?.difficulty) {
      query += ` AND gf.ai_difficulty = $${paramCount}`;
      values.push(filters.difficulty);
      paramCount++;
    }
    
    if (filters?.gradeLevel) {
      query += ` AND gf.ai_grade_level = $${paramCount}`;
      values.push(filters.gradeLevel);
      paramCount++;
    }
    
    if (filters?.creator) {
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      values.push(`%${filters.creator}%`);
      paramCount++;
    }
    
    if (filters?.dateFrom) {
      query += ` AND gf.created_at >= $${paramCount}`;
      values.push(filters.dateFrom);
      paramCount++;
    }
    
    if (filters?.dateTo) {
      query += ` AND gf.created_at <= $${paramCount}`;
      values.push(filters.dateTo);
      paramCount++;
    }
    
    // Add sorting
    switch (filters?.sortBy) {
      case 'popular':
        query += ` ORDER BY COALESCE(sm.stats->>'downloads', '0')::int DESC, COALESCE(sm.stats->>'likes', '0')::int DESC`;
        break;
      case 'quality':
        query += ` ORDER BY COALESCE(gf.quality_score, 0) DESC, gf.created_at DESC`;
        break;
      case 'views':
        query += ` ORDER BY COALESCE(sm.stats->>'views', '0')::int DESC, gf.created_at DESC`;
        break;
      default: // recent
        query += ` ORDER BY gf.created_at DESC`;
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  }
}
