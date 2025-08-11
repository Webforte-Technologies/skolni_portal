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
}
