import pool from '../database/connection';
import { Folder, CreateFolderRequest, UpdateFolderRequest } from '../types/database';

// Extended interfaces for enhanced folder functionality
interface FolderWithMaterials extends Folder {
  materials: any[];
  materials_count: number;
}

interface FolderStats {
  materials_count: number;
  shared_materials_count: number;
  total_size: number;
  last_activity: Date | null;
  subfolders_count: number;
}

interface SharingSettings {
  is_shared: boolean;
  sharing_level: 'private' | 'school' | 'public';
  permissions: 'read' | 'read_write' | 'admin';
}

export class FolderModel {
  // Create a new folder
  static async create(folderData: CreateFolderRequest): Promise<Folder> {
    const { user_id, school_id, name, description, parent_folder_id, is_shared = false } = folderData;
    
    // Validate folder name uniqueness within parent
    const existingFolder = await pool.query(
      `SELECT id FROM folders WHERE user_id = $1 AND name = $2 AND 
       COALESCE(parent_folder_id, '') = COALESCE($3, '')`,
      [user_id, name.trim(), parent_folder_id || '']
    );
    
    if (existingFolder.rows.length > 0) {
      throw new Error('Složka s tímto názvem již existuje');
    }
    
    // Validate folder hierarchy depth (max 5 levels)
    if (parent_folder_id) {
      const depthCheck = await pool.query(`
        WITH RECURSIVE folder_depth AS (
          SELECT id, parent_folder_id, 1 as depth
          FROM folders 
          WHERE id = $1
          
          UNION ALL
          
          SELECT f.id, f.parent_folder_id, fd.depth + 1
          FROM folders f
          JOIN folder_depth fd ON f.parent_folder_id = fd.id
          WHERE fd.depth < 10
        )
        SELECT MAX(depth) as max_depth FROM folder_depth
      `, [parent_folder_id]);
      
      const maxDepth = depthCheck.rows[0]?.max_depth || 0;
      if (maxDepth >= 5) {
        throw new Error('Maximální hloubka složek je 5 úrovní');
      }
    }
    
    const query = `
      INSERT INTO folders (user_id, school_id, name, description, parent_folder_id, is_shared)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [user_id, school_id, name.trim(), description?.trim(), parent_folder_id, is_shared];
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

  // Get folder with its materials
  static async findWithMaterials(folderId: string): Promise<FolderWithMaterials | null> {
    const query = `
      SELECT 
        f.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', gf.id,
              'title', gf.title,
              'file_type', gf.file_type,
              'created_at', gf.created_at,
              'ai_category', gf.ai_category,
              'ai_subject', gf.ai_subject,
              'ai_difficulty', gf.ai_difficulty,
              'quality_score', gf.quality_score
            ) ORDER BY gf.created_at DESC
          ) FILTER (WHERE gf.id IS NOT NULL), 
          '[]'::json
        ) as materials,
        COUNT(gf.id) as materials_count
      FROM folders f
      LEFT JOIN generated_files gf ON f.id = gf.folder_id
      WHERE f.id = $1
      GROUP BY f.id
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
    const values = [userId] as any[];

    if (schoolId) {
      query += ` AND (school_id = $2 OR school_id IS NULL)`;
      values.push(schoolId);
    }

    query += ` ORDER BY name ASC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get shared folders accessible by user
  static async findSharedFoldersByUser(userId: string, schoolId: string): Promise<Folder[]> {
    const query = `
      SELECT DISTINCT f.*, u.first_name, u.last_name, u.email as owner_email
      FROM folders f
      JOIN users u ON f.user_id = u.id
      WHERE f.school_id = $1 
        AND f.is_shared = true 
        AND f.user_id != $2
      ORDER BY f.name ASC
    `;
    
    const result = await pool.query(query, [schoolId, userId]);
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

  // Update folder sharing settings
  static async updateSharingSettings(folderId: string, settings: SharingSettings): Promise<Folder | null> {
    const { is_shared, sharing_level, permissions } = settings;
    
    const query = `
      UPDATE folders 
      SET is_shared = $1,
          sharing_level = $2,
          sharing_permissions = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [is_shared, sharing_level, permissions, folderId];
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  // Get folder statistics
  static async getFolderStats(folderId: string): Promise<FolderStats> {
    const query = `
      SELECT 
        COUNT(gf.id) as materials_count,
        COUNT(sm.id) as shared_materials_count,
        COALESCE(SUM(LENGTH(gf.content::text)), 0) as total_size,
        MAX(GREATEST(gf.created_at, gf.updated_at)) as last_activity,
        (SELECT COUNT(*) FROM folders WHERE parent_folder_id = $1) as subfolders_count
      FROM folders f
      LEFT JOIN generated_files gf ON f.id = gf.folder_id
      LEFT JOIN shared_materials sm ON gf.id = sm.material_id
      WHERE f.id = $1
      GROUP BY f.id
    `;
    
    const result = await pool.query(query, [folderId]);
    return result.rows[0] || {
      materials_count: 0,
      shared_materials_count: 0,
      total_size: 0,
      last_activity: null,
      subfolders_count: 0
    };
  }

  // Search folders by name and description
  static async searchFolders(query: string, userId: string, schoolId?: string): Promise<Folder[]> {
    let searchQuery = `
      SELECT DISTINCT f.*, u.first_name, u.last_name
      FROM folders f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE (f.name ILIKE $1 OR f.description ILIKE $1)
        AND (
          f.user_id = $2 
          OR (f.is_shared = true AND f.school_id = $3)
        )
    `;
    
    const searchTerm = `%${query}%`;
    const values = [searchTerm, userId, schoolId];
    
    searchQuery += ` ORDER BY f.name ASC`;
    
    const result = await pool.query(searchQuery, values);
    return result.rows;
  }

  // Update folder
  static async update(folderId: string, updateData: UpdateFolderRequest): Promise<Folder | null> {
    const { name, description, parent_folder_id, is_shared } = updateData;
    
    // Validate name uniqueness if name is being changed
    if (name) {
      const existingFolder = await this.findById(folderId);
      if (!existingFolder) {
        throw new Error('Složka nenalezena');
      }
      
      const duplicateCheck = await pool.query(
        `SELECT id FROM folders WHERE user_id = $1 AND name = $2 AND 
         COALESCE(parent_folder_id, '') = COALESCE($3, '') AND id != $4`,
        [existingFolder.user_id, name.trim(), parent_folder_id || '', folderId]
      );
      
      if (duplicateCheck.rows.length > 0) {
        throw new Error('Složka s tímto názvem již existuje');
      }
    }
    
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
    
    const values = [name?.trim(), description?.trim(), parent_folder_id, is_shared, folderId];
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
      throw new Error('Nelze smazat složku obsahující materiály. Nejprve přesuňte nebo smažte materiály.');
    }

    // Check if folder has subfolders
    const subfoldersCheck = await pool.query(
      'SELECT COUNT(*) FROM folders WHERE parent_folder_id = $1',
      [folderId]
    );
    
    if (parseInt(subfoldersCheck.rows[0].count) > 0) {
      throw new Error('Nelze smazat složku obsahující podsložky. Nejprve smažte podsložky.');
    }

    const query = 'DELETE FROM folders WHERE id = $1';
    const result = await pool.query(query, [folderId]);
    
    return (result.rowCount ?? 0) > 0;
  }

  // Move materials to folder
  static async moveMaterialsToFolder(materialIds: string[], folderId: string): Promise<boolean> {
    const query = `
      UPDATE generated_files 
      SET folder_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($2)
    `;
    
    const result = await pool.query(query, [folderId, materialIds]);
    return (result.rowCount ?? 0) > 0;
  }

  // Remove materials from folder
  static async removeMaterialsFromFolder(materialIds: string[]): Promise<boolean> {
    const query = `
      UPDATE generated_files 
      SET folder_id = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1)
    `;
    
    const result = await pool.query(query, [materialIds]);
    return (result.rowCount ?? 0) > 0;
  }

  // Duplicate folder with all its materials
  static async duplicate(folderId: string, newName: string, userId: string): Promise<Folder> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get original folder
      const originalFolder = await this.findById(folderId);
      if (!originalFolder) {
        throw new Error('Původní složka nenalezena');
      }
      
      // Create new folder
      const newFolderData: CreateFolderRequest = {
        user_id: userId,
        school_id: originalFolder.school_id,
        name: newName,
        description: originalFolder.description ? `Kopie: ${originalFolder.description}` : undefined,
        parent_folder_id: originalFolder.parent_folder_id,
        is_shared: false // New folder is private by default
      };
      
      const newFolder = await this.create(newFolderData);
      
      // Copy materials to new folder
      await client.query(`
        INSERT INTO generated_files (user_id, title, content, file_type, folder_id, ai_category, ai_subject, ai_difficulty, ai_tags)
        SELECT $1, title || ' (Kopie)', content, file_type, $2, ai_category, ai_subject, ai_difficulty, ai_tags
        FROM generated_files 
        WHERE folder_id = $3
      `, [userId, newFolder.id, folderId]);
      
      await client.query('COMMIT');
      return newFolder;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Move folder to different parent
  static async moveFolder(folderId: string, newParentId: string | null): Promise<Folder | null> {
    // Prevent circular references
    if (newParentId) {
      const circularCheck = await pool.query(`
        WITH RECURSIVE folder_path AS (
          SELECT id, parent_folder_id
          FROM folders 
          WHERE id = $1
          
          UNION ALL
          
          SELECT f.id, f.parent_folder_id
          FROM folders f
          JOIN folder_path fp ON f.id = fp.parent_folder_id
        )
        SELECT COUNT(*) FROM folder_path WHERE id = $2
      `, [newParentId, folderId]);
      
      if (parseInt(circularCheck.rows[0].count) > 0) {
        throw new Error('Nelze přesunout složku do své vlastní podsložky');
      }
    }
    
    const query = `
      UPDATE folders 
      SET parent_folder_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [newParentId, folderId]);
    return result.rows[0] || null;
  }
}
