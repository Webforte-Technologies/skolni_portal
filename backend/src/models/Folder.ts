import pool from '../database/connection';
import { Folder, CreateFolderRequest, UpdateFolderRequest } from '../types/database';

export class FolderModel {
  // Create a new folder
  static async create(folderData: CreateFolderRequest): Promise<Folder> {
    const { user_id, school_id, name, description, parent_folder_id, is_shared = false } = folderData;
    
    const query = `
      INSERT INTO folders (user_id, school_id, name, description, parent_folder_id, is_shared)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [user_id, school_id, name, description, parent_folder_id, is_shared];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Get folder by ID
  static async findById(folderId: string): Promise<Folder | null> {
    const query = `
      SELECT * FROM folders WHERE id = $1
    `;
    
    const result = await pool.query(query, [folderId]);
    return result.rows[0] || null;
  }

  // Get all folders for a user
  static async findByUserId(userId: string, schoolId?: string): Promise<Folder[]> {
    let query = `
      SELECT * FROM folders 
      WHERE user_id = $1
    `;
    let values = [userId];

    if (schoolId) {
      query += ` AND (school_id = $2 OR school_id IS NULL)`;
      values.push(schoolId);
    }

    query += ` ORDER BY name ASC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get shared folders for a school
  static async findSharedBySchool(schoolId: string): Promise<Folder[]> {
    const query = `
      SELECT f.*, u.first_name, u.last_name, u.email
      FROM folders f
      JOIN users u ON f.user_id = u.id
      WHERE f.school_id = $1 AND f.is_shared = true
      ORDER BY f.name ASC
    `;
    
    const result = await pool.query(query, [schoolId]);
    return result.rows;
  }

  // Get folder hierarchy (nested structure)
  static async getHierarchy(userId: string, schoolId?: string): Promise<Folder[]> {
    const query = `
      WITH RECURSIVE folder_tree AS (
        SELECT *, 0 as level
        FROM folders 
        WHERE user_id = $1 AND parent_folder_id IS NULL
        ${schoolId ? 'AND (school_id = $2 OR school_id IS NULL)' : ''}
        
        UNION ALL
        
        SELECT f.*, ft.level + 1
        FROM folders f
        JOIN folder_tree ft ON f.parent_folder_id = ft.id
        WHERE f.user_id = $1
        ${schoolId ? 'AND (f.school_id = $2 OR f.school_id IS NULL)' : ''}
      )
      SELECT * FROM folder_tree ORDER BY level, name
    `;
    
    const values = schoolId ? [userId, schoolId] : [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update folder
  static async update(folderId: string, updateData: UpdateFolderRequest): Promise<Folder | null> {
    const { name, description, parent_folder_id, is_shared } = updateData;
    
    const query = `
      UPDATE folders 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          parent_folder_id = COALESCE($3, parent_folder_id),
          is_shared = COALESCE($4, is_shared),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const values = [name, description, parent_folder_id, is_shared, folderId];
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  // Delete folder (only if empty)
  static async delete(folderId: string): Promise<boolean> {
    // Check if folder has any materials
    const materialsCheck = await pool.query(
      'SELECT COUNT(*) FROM generated_files WHERE folder_id = $1',
      [folderId]
    );
    
    if (parseInt(materialsCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete folder with materials. Move or delete materials first.');
    }

    // Check if folder has subfolders
    const subfoldersCheck = await pool.query(
      'SELECT COUNT(*) FROM folders WHERE parent_folder_id = $1',
      [folderId]
    );
    
    if (parseInt(subfoldersCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete folder with subfolders. Delete subfolders first.');
    }

    const query = 'DELETE FROM folders WHERE id = $1';
    const result = await pool.query(query, [folderId]);
    
    return (result.rowCount ?? 0) > 0;
  }

  // Move materials to folder
  static async moveMaterialsToFolder(materialIds: string[], folderId: string): Promise<boolean> {
    const query = `
      UPDATE generated_files 
      SET folder_id = $1 
      WHERE id = ANY($2)
    `;
    
    const result = await pool.query(query, [folderId, materialIds]);
    return (result.rowCount ?? 0) > 0;
  }

  // Remove materials from folder
  static async removeMaterialsFromFolder(materialIds: string[]): Promise<boolean> {
    const query = `
      UPDATE generated_files 
      SET folder_id = NULL 
      WHERE id = ANY($1)
    `;
    
    const result = await pool.query(query, [materialIds]);
    return (result.rowCount ?? 0) > 0;
  }
}
