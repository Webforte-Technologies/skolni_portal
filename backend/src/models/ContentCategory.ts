import pool from '../database/connection';

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parent_id?: string;
  parent_name?: string;
  subject: string;
  grade: string;
  material_count: number;
  user_count: number;
  last_activity: Date;
  status: 'active' | 'inactive' | 'archived';
  color: string;
  icon: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateContentCategoryData {
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  subject: string;
  grade: string;
  color?: string;
  icon?: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateContentCategoryData {
  name?: string;
  description?: string;
  slug?: string;
  parent_id?: string;
  subject?: string;
  grade?: string;
  color?: string;
  icon?: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'archived';
}

export interface ContentCategoryFilters {
  status?: string;
  subject?: string;
  search?: string;
  parent_id?: string;
  limit?: number;
  offset?: number;
}

export class ContentCategoryModel {
  static async findAll(filters: ContentCategoryFilters = {}): Promise<{ data: ContentCategory[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (filters.status && filters.status !== 'all') {
      conditions.push(`cc.status = $${i++}`);
      values.push(filters.status);
    }

    if (filters.subject && filters.subject !== 'all') {
      conditions.push(`cc.subject = $${i++}`);
      values.push(filters.subject);
    }

    if (filters.parent_id) {
      conditions.push(`cc.parent_id = $${i++}`);
      values.push(filters.parent_id);
    }

    if (filters.search) {
      conditions.push(`(cc.name ILIKE $${i} OR cc.description ILIKE $${i} OR cc.subject ILIKE $${i})`);
      values.push(`%${filters.search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(filters.limit || 50, 200);
    const offset = filters.offset || 0;

    const sql = `
      SELECT 
        cc.*,
        parent.name as parent_name
      FROM content_categories cc
      LEFT JOIN content_categories parent ON cc.parent_id = parent.id
      ${where}
      ORDER BY cc.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const countSql = `
      SELECT COUNT(*) FROM content_categories cc ${where}
    `;

    const rows = (await pool.query(sql, [...values, limit, offset])).rows;
    const total = parseInt((await pool.query(countSql, values)).rows[0].count);

    return { data: rows, total };
  }

  static async findById(id: string): Promise<ContentCategory | null> {
    const sql = `
      SELECT 
        cc.*,
        parent.name as parent_name
      FROM content_categories cc
      LEFT JOIN content_categories parent ON cc.parent_id = parent.id
      WHERE cc.id = $1
    `;
    
    const result = await pool.query(sql, [id]);
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<ContentCategory | null> {
    const sql = `
      SELECT 
        cc.*,
        parent.name as parent_name
      FROM content_categories cc
      LEFT JOIN content_categories parent ON cc.parent_id = parent.id
      WHERE cc.slug = $1
    `;
    
    const result = await pool.query(sql, [slug]);
    return result.rows[0] || null;
  }

  static async create(data: CreateContentCategoryData): Promise<ContentCategory> {
    const sql = `
      INSERT INTO content_categories (
        name, description, slug, parent_id, subject, grade, 
        color, icon, tags, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.name,
      data.description || '',
      data.slug,
      data.parent_id || null,
      data.subject,
      data.grade,
      data.color || '#4A90E2',
      data.icon || 'folder',
      data.tags || [],
      data.status || 'active'
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  }

  static async update(id: string, data: UpdateContentCategoryData): Promise<ContentCategory> {
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${i++}`);
      values.push(data.description);
    }

    if (data.slug !== undefined) {
      updates.push(`slug = $${i++}`);
      values.push(data.slug);
    }

    if (data.parent_id !== undefined) {
      updates.push(`parent_id = $${i++}`);
      values.push(data.parent_id);
    }

    if (data.subject !== undefined) {
      updates.push(`subject = $${i++}`);
      values.push(data.subject);
    }

    if (data.grade !== undefined) {
      updates.push(`grade = $${i++}`);
      values.push(data.grade);
    }

    if (data.color !== undefined) {
      updates.push(`color = $${i++}`);
      values.push(data.color);
    }

    if (data.icon !== undefined) {
      updates.push(`icon = $${i++}`);
      values.push(data.icon);
    }

    if (data.tags !== undefined) {
      updates.push(`tags = $${i++}`);
      values.push(data.tags);
    }

    if (data.status !== undefined) {
      updates.push(`status = $${i++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      throw new Error('No updates provided');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE content_categories 
      SET ${updates.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(sql, values);
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM content_categories WHERE id = $1 RETURNING id';
    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async updateCounts(id: string): Promise<void> {
    // Update material count
    const materialCountSql = `
      SELECT COUNT(*) FROM generated_files 
      WHERE content_category_id = $1 AND is_active = true
    `;
    const materialResult = await pool.query(materialCountSql, [id]);
    const materialCount = parseInt(materialResult.rows[0].count);

    // Update user count (users who have materials in this category)
    const userCountSql = `
      SELECT COUNT(DISTINCT user_id) FROM generated_files 
      WHERE content_category_id = $1 AND is_active = true
    `;
    const userResult = await pool.query(userCountSql, [id]);
    const userCount = parseInt(userResult.rows[0].count);

    // Update last activity
    const lastActivitySql = `
      SELECT MAX(created_at) FROM generated_files 
      WHERE content_category_id = $1 AND is_active = true
    `;
    const lastActivityResult = await pool.query(lastActivitySql, [id]);
    const lastActivity = lastActivityResult.rows[0].max || new Date();

    // Update the category
    const updateSql = `
      UPDATE content_categories 
      SET material_count = $1, user_count = $2, last_activity = $3, updated_at = NOW()
      WHERE id = $4
    `;
    await pool.query(updateSql, [materialCount, userCount, lastActivity, id]);
  }

  static async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    archived: number;
    totalMaterials: number;
    totalUsers: number;
    subjects: Array<{ subject: string; count: number }>;
  }> {
    const statsSql = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived,
        SUM(material_count) as total_materials,
        SUM(user_count) as total_users
      FROM content_categories
    `;

    const subjectsSql = `
      SELECT subject, COUNT(*) as count
      FROM content_categories
      WHERE status = 'active'
      GROUP BY subject
      ORDER BY count DESC
    `;

    const [statsResult, subjectsResult] = await Promise.all([
      pool.query(statsSql),
      pool.query(subjectsSql)
    ]);

    const stats = statsResult.rows[0];
    const subjects = subjectsResult.rows;

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      inactive: parseInt(stats.inactive),
      archived: parseInt(stats.archived),
      totalMaterials: parseInt(stats.total_materials) || 0,
      totalUsers: parseInt(stats.total_users) || 0,
      subjects
    };
  }
}
