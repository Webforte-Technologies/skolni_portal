import express from 'express';
import pool from '../database/connection';
import { authenticateToken, requireRole, RequestWithUser } from '../middleware/auth';
import { auditLoggerForAdmin } from '../middleware/audit';
import { getMetricsSnapshot } from '../middleware/metrics';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { FeatureFlagModel } from '../models/FeatureFlag';
import { GeneratedFileModel } from '../models/GeneratedFile';
import { ContentCategoryModel, ContentCategoryFilters } from '../models/ContentCategory';

const router = express.Router();

// Guard entire router
router.use(authenticateToken, requireRole(['platform_admin']));
router.use(auditLoggerForAdmin);

// Helper: standard envelope
const ok = (res: express.Response, data: any) => res.status(200).json({ success: true, data });
const bad = (res: express.Response, code: number, error: string, details?: any) => res.status(code).json({ success: false, error, details });

// Users listing with filters
router.get('/users', async (req: RequestWithUser, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const role = (req.query as any)['role'] as string | undefined;
    const schoolId = (req.query as any)['school_id'] as string | undefined;
    const isActive = (req.query as any)['is_active'] as string | undefined;
    const q = ((req.query as any)['q'] as string | undefined)?.trim();

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (role) { conditions.push(`u.role = $${i++}`); values.push(role); }
    if (schoolId) { conditions.push(`u.school_id = $${i++}`); values.push(schoolId); }
    if (typeof isActive === 'string') { conditions.push(`u.is_active = $${i++}`); values.push(isActive === 'true'); }
    if (q) {
      conditions.push(`(u.email ILIKE $${i} OR u.first_name ILIKE $${i} OR u.last_name ILIKE $${i})`);
      values.push(`%${q}%`);
      i++;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.school_id, u.credits_balance, u.created_at,
             s.name as school_name
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const countSql = `SELECT COUNT(*) FROM users u ${where}`;
    const rows = (await pool.query(sql, [...values, limit, offset])).rows;
    const total = parseInt((await pool.query(countSql, values)).rows[0].count);
    return ok(res, { data: rows, total, limit, offset });
  } catch (e) {
    return bad(res, 500, 'Failed to list users');
  }
});

// Update user (role, is_active)
router.put('/users/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const { role, is_active } = req.body as { role?: string; is_active?: boolean };
    const allowedRoles = ['platform_admin','school_admin','teacher_school','teacher_individual'];
    const updates: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (role !== undefined) {
      if (!allowedRoles.includes(role)) return bad(res, 400, 'Invalid role');
      updates.push(`role = $${i++}`); vals.push(role);
    }
    if (is_active !== undefined) { updates.push(`is_active = $${i++}`); vals.push(!!is_active); }
    if (!updates.length) return bad(res, 400, 'No changes provided');
    vals.push(id);
    const result = await pool.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING id, email, first_name, last_name, role, is_active, school_id, credits_balance, created_at`, vals);
    return ok(res, result.rows[0]);
  } catch (e) {
    return bad(res, 500, 'Failed to update user');
  }
});

// Credit operations
router.post('/users/:id/credits', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const { type, amount, description } = req.body as { type: 'add'|'deduct'; amount: number; description?: string };
    if (!['add','deduct'].includes(type)) return bad(res, 400, 'Invalid type');
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return bad(res, 400, 'Amount must be positive');
    const tx = type === 'add' ? await CreditTransactionModel.addCredits(id as string, amt, description) : await CreditTransactionModel.deductCredits(id as string, amt, description);
    return ok(res, tx);
  } catch (e) {
    return bad(res, 500, 'Failed to adjust credits');
  }
});

// Bulk operations on users
router.post('/users/bulk', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { action, user_ids, amount } = req.body as { action: string; user_ids: string[]; amount?: number };
    if (!Array.isArray(user_ids) || user_ids.length === 0) { return bad(res, 400, 'user_ids array required'); }

    if (action === 'activate' || action === 'deactivate') {
      const state = action === 'activate';
      const placeholders = user_ids.map((_, idx) => `$${idx + 2}`).join(',');
      await pool.query(`UPDATE users SET is_active = $1 WHERE id IN (${placeholders})`, [state, ...user_ids]);
      return ok(res, { processed: user_ids.length });
    }

    if (action === 'addCredits' || action === 'deductCredits') {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) return bad(res, 400, 'Positive amount required');
      const finalAmount = action === 'addCredits' ? amt : amt; // model handles sign by type
      for (const id of user_ids) {
        await CreditTransactionModel[action === 'addCredits' ? 'addCredits' : 'deductCredits'](id, finalAmount, `Bulk ${action}`);
      }
      return ok(res, { processed: user_ids.length });
    }

    if (action === 'delete') {
      // Perform soft-delete as deactivate
      const placeholders = user_ids.map((_, idx) => `$${idx + 1}`).join(',');
      await pool.query(`UPDATE users SET is_active = false WHERE id IN (${placeholders})`, [...user_ids]);
      return ok(res, { processed: user_ids.length });
    }

    return bad(res, 400, 'Unsupported action');
  } catch (e) {
    return bad(res, 500, 'Failed to run bulk operation');
  }
});

// Schools list
router.get('/schools', async (req: RequestWithUser, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const q = ((req.query as any)['q'] as string | undefined)?.trim();
    const conds: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (q) { conds.push(`(name ILIKE $${i} OR city ILIKE $${i})`); vals.push(`%${q}%`); i++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const rows = (await pool.query(`
      SELECT s.id, s.name, s.address, s.city, s.postal_code, s.contact_phone as phone, s.contact_email as email, s.logo_url as website, s.is_active, s.created_at,
             COUNT(u.*) FILTER (WHERE u.id IS NOT NULL) as users_count,
             COUNT(u.*) FILTER (WHERE u.role = 'teacher_school') as teacher_count,
             COUNT(u.*) FILTER (WHERE u.role = 'student') as student_count,
             'basic' as subscription_plan,
             COALESCE(SUM(u.credits_balance), 0) as credits_balance
      FROM schools s
      LEFT JOIN users u ON u.school_id = s.id
      ${where}
      GROUP BY s.id, s.address, s.city, s.postal_code, s.contact_phone, s.contact_email, s.logo_url
      ORDER BY s.created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...vals, limit, offset])).rows;
    const total = parseInt((await pool.query(`SELECT COUNT(*) FROM schools ${where}`, vals)).rows[0].count);
    return ok(res, { data: rows, total, limit, offset });
  } catch (e) {
    return bad(res, 500, 'Failed to list schools');
  }
});

// System health
router.get('/system/health', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const before = Date.now();
    const dbRes = await pool.query('SELECT 1');
    const latency = Date.now() - before;
    return ok(res, {
      status: 'OK',
      process: {
        uptime_s: Math.round(process.uptime()),
        memory: process.memoryUsage(),
        node: process.version,
      },
      db: { roundtrip_ms: latency, ok: dbRes.rowCount === 1 },
    });
  } catch (e) {
    return bad(res, 500, 'Health check failed');
  }
});

router.get('/system/metrics', async (_req: RequestWithUser, res: express.Response) => {
  try {
    return ok(res, getMetricsSnapshot());
  } catch (e) {
    return bad(res, 500, 'Metrics retrieval failed');
  }
});

// Audit logs
router.get('/audit-logs', async (req: RequestWithUser, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const from = (req.query as any)['from'] as string | undefined;
    const to = (req.query as any)['to'] as string | undefined;
    const userId = (req.query as any)['user_id'] as string | undefined;
    const path = (req.query as any)['path'] as string | undefined;
    const conds: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (from) { conds.push(`occurred_at >= $${i++}`); vals.push(new Date(from)); }
    if (to) { conds.push(`occurred_at <= $${i++}`); vals.push(new Date(to)); }
    if (userId) { conds.push(`user_id = $${i++}`); vals.push(userId); }
    if (path) { conds.push(`path ILIKE $${i++}`); vals.push(`%${path}%`); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const rows = (await pool.query(`
      SELECT id, occurred_at, user_id, method, path, status_code, action, ip, user_agent, meta
      FROM audit_logs
      ${where}
      ORDER BY occurred_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...vals, limit, offset])).rows;
    const total = parseInt((await pool.query(`SELECT COUNT(*) FROM audit_logs ${where}`, vals)).rows[0].count);
    return ok(res, { data: rows, total, limit, offset });
  } catch (e) {
    return bad(res, 500, 'Failed to list audit logs');
  }
});

// Moderation
router.get('/moderation/queue', async (req: RequestWithUser, res: express.Response) => {
  try {
    const status = ((req.query as any)['status'] as 'pending'|'approved'|'rejected') || 'pending';
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const rows = await GeneratedFileModel.listForModeration(status, limit, offset);
    return ok(res, { data: rows, total: rows.length, limit, offset });
  } catch (e) {
    return bad(res, 500, 'Failed to get moderation queue');
  }
});

router.post('/moderation/:id/decision', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const { status, notes, quality_score } = req.body as { status: 'approved'|'rejected'; notes?: string | undefined; quality_score?: number | undefined };
    if (!['approved','rejected'].includes(status)) return bad(res, 400, 'Invalid status');
    const payload: { status: 'approved'|'rejected'; notes?: string; quality_score?: number } = { status };
    if (notes !== undefined) payload.notes = notes;
    if (quality_score !== undefined) payload.quality_score = quality_score;
    const updated = await GeneratedFileModel.setModerationDecision(id as string, payload, req.user!.id);
    return ok(res, updated);
  } catch (e) {
    return bad(res, 500, 'Failed to set moderation decision');
  }
});

// Quality metrics (basic aggregates)
router.get('/quality/metrics', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const counts = (await pool.query(`
      SELECT moderation_status, COUNT(*) as count
      FROM generated_files
      GROUP BY moderation_status
    `)).rows;
    const avgOverall = (await pool.query(`SELECT ROUND(AVG(quality_score)::numeric, 2) as avg_quality FROM generated_files WHERE quality_score IS NOT NULL`)).rows[0];
    const byType = (await pool.query(`
      SELECT file_type, ROUND(AVG(quality_score)::numeric, 2) as avg_quality, COUNT(*) as total
      FROM generated_files
      WHERE quality_score IS NOT NULL
      GROUP BY file_type
      ORDER BY total DESC
    `)).rows;
    const recent7 = (await pool.query(`
      SELECT date_trunc('day', created_at) as day, COUNT(*) as total
      FROM generated_files
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY 1 ORDER BY 1 ASC
    `)).rows;
    const recent30 = (await pool.query(`
      SELECT date_trunc('day', created_at) as day, COUNT(*) as total
      FROM generated_files
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1 ASC
    `)).rows;
    return ok(res, {
      counts,
      avg_overall: avgOverall?.avg_quality ?? null,
      by_type: byType,
      trends: { d7: recent7, d30: recent30 },
    });
  } catch (e) {
    return bad(res, 500, 'Failed to compute quality metrics');
  }
});

// Subscriptions CRUD (basic)
router.get('/subscriptions', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = (req.query as any)['user_id'] as string | undefined;
    const where = userId ? 'WHERE user_id = $1' : '';
    const vals = userId ? [userId] : [];
    const rows = (await pool.query(`SELECT * FROM subscriptions ${where} ORDER BY created_at DESC`, vals)).rows;
    return ok(res, rows);
  } catch (e) {
    return bad(res, 500, 'Failed to list subscriptions');
  }
});

router.post('/subscriptions', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { user_id, plan_type, credits_per_month, price_per_month, start_date, end_date, auto_renew } = req.body;
    const row = (await pool.query(
      `INSERT INTO subscriptions (user_id, plan_type, credits_per_month, price_per_month, start_date, end_date, auto_renew)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, true)) RETURNING *`,
      [user_id, plan_type, credits_per_month, price_per_month, start_date, end_date || null, auto_renew]
    )).rows[0];
    return ok(res, row);
  } catch (e) {
    return bad(res, 500, 'Failed to create subscription');
  }
});

router.put('/subscriptions/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const allowed = ['plan_type','status','credits_per_month','price_per_month','end_date','auto_renew'];
    const updates: string[] = [];
    const vals: any[] = [];
    let i = 1;
    for (const k of allowed) {
      if (req.body[k] !== undefined) { updates.push(`${k} = $${i++}`); vals.push(req.body[k]); }
    }
    if (!updates.length) return bad(res, 400, 'No changes provided');
    vals.push(id);
    const row = (await pool.query(`UPDATE subscriptions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, vals)).rows[0];
    return ok(res, row);
  } catch (e) {
    return bad(res, 500, 'Failed to update subscription');
  }
});

router.delete('/subscriptions/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    await pool.query('DELETE FROM subscriptions WHERE id = $1', [id]);
    return ok(res, { deleted: true });
  } catch (e) {
    return bad(res, 500, 'Failed to delete subscription');
  }
});

// Feature flags
router.get('/feature-flags', async (_req: RequestWithUser, res: express.Response) => {
  try { return ok(res, await FeatureFlagModel.list()); } catch { return bad(res, 500, 'Failed to list flags'); }
});
router.put('/feature-flags/:key', async (req: RequestWithUser, res: express.Response) => {
  try {
    const key = req.params['key'] as string; const { value, description } = req.body as { value: boolean; description?: string };
    if (typeof value !== 'boolean') return bad(res, 400, 'value must be boolean');
    return ok(res, await FeatureFlagModel.set(key as string, value, description));
  } catch (e) { return bad(res, 500, 'Failed to set flag'); }
});

// Developer tools
router.get('/docs', async (_req: RequestWithUser, res: express.Response) => {
  return ok(res, {
    info: 'Admin API docs',
    base: '/api/admin',
    endpoints: [
      'GET /users', 'PUT /users/:id', 'POST /users/:id/credits',
      'GET /schools',
      'GET /system/health', 'GET /system/metrics',
      'GET /audit-logs',
      'GET /moderation/queue', 'POST /moderation/:id/decision',
      'GET /quality/metrics', 'GET /credits/analytics',
      'GET /subscriptions', 'POST /subscriptions', 'PUT /subscriptions/:id', 'DELETE /subscriptions/:id',
      'GET /content/categories', 'POST /content/categories', 'PUT /content/categories/:id', 'DELETE /content/categories/:id',
      'GET /content/categories/statistics/overview',
      'GET /feature-flags', 'PUT /feature-flags/:key',
      'GET /ping'
    ]
  });
});

router.get('/ping', (_req: RequestWithUser, res: express.Response) => ok(res, { pong: true, now: new Date().toISOString() }));

// Credits analytics
router.get('/credits/analytics', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const totalBalance = (await pool.query(`SELECT COALESCE(SUM(credits_balance), 0) AS sum FROM users`)).rows[0].sum;
    const totalPurchased = (await pool.query(`SELECT COALESCE(SUM(amount), 0) AS sum FROM credit_transactions WHERE transaction_type = 'purchase'`)).rows[0].sum;
    const totalUsed = (await pool.query(`SELECT COALESCE(SUM(ABS(amount)), 0) AS sum FROM credit_transactions WHERE transaction_type = 'usage'`)).rows[0].sum;

    const monthlyPurchases = (await pool.query(`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, SUM(amount) AS total
      FROM credit_transactions
      WHERE transaction_type = 'purchase' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1
    `)).rows;
    const monthlyUsage = (await pool.query(`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, SUM(ABS(amount)) AS total
      FROM credit_transactions
      WHERE transaction_type = 'usage' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1
    `)).rows;

    const topUsers = (await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, SUM(ABS(ct.amount)) AS used
      FROM credit_transactions ct
      JOIN users u ON u.id = ct.user_id
      WHERE ct.transaction_type = 'usage'
      GROUP BY u.id, u.email, u.first_name, u.last_name
      ORDER BY used DESC
      LIMIT 10
    `)).rows;

    const topSchools = (await pool.query(`
      SELECT s.id, s.name, COALESCE(SUM(ABS(ct.amount)),0) AS used
      FROM users u
      JOIN schools s ON s.id = u.school_id
      JOIN credit_transactions ct ON ct.user_id = u.id AND ct.transaction_type = 'usage'
      GROUP BY s.id, s.name
      ORDER BY used DESC
      LIMIT 10
    `)).rows;

    return ok(res, {
      totals: { balance: Number(totalBalance) || 0, purchased: Number(totalPurchased) || 0, used: Number(totalUsed) || 0 },
      monthly: { purchases: monthlyPurchases, usage: monthlyUsage },
      top_users: topUsers,
      top_schools: topSchools,
    });
  } catch (e) {
    return bad(res, 500, 'Failed to compute credits analytics');
  }
});

// Content Categories Management
router.get('/content/categories', async (req: RequestWithUser, res: express.Response) => {
  try {
    const filters: ContentCategoryFilters = {
      status: (req.query as any)['status'] as string,
      subject: (req.query as any)['subject'] as string,
      search: (req.query as any)['q'] as string,
      parent_id: (req.query as any)['parent_id'] as string,
      limit: parseInt(String((req.query as any)['limit'] || '50')),
      offset: parseInt(String((req.query as any)['offset'] || '0'))
    };

    // Filter out undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ContentCategoryFilters] === undefined) {
        delete filters[key as keyof ContentCategoryFilters];
      }
    });

    const result = await ContentCategoryModel.findAll(filters);
    return ok(res, result);
  } catch (e) {
    return bad(res, 500, 'Failed to list content categories');
  }
});

router.get('/content/categories/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const category = await ContentCategoryModel.findById(id);
    
    if (!category) {
      return bad(res, 404, 'Content category not found');
    }
    
    return ok(res, category);
  } catch (e) {
    return bad(res, 500, 'Failed to get content category');
  }
});

router.post('/content/categories', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { name, description, slug, parent_id, subject, grade, color, icon, tags, status } = req.body;
    
    if (!name || !slug || !subject || !grade) {
      return bad(res, 400, 'Missing required fields: name, slug, subject, grade');
    }

    // Check if slug already exists
    const existingCategory = await ContentCategoryModel.findBySlug(slug);
    if (existingCategory) {
      return bad(res, 400, 'Slug already exists');
    }

    const category = await ContentCategoryModel.create({
      name, description, slug, parent_id, subject, grade, color, icon, tags, status
    });

    return ok(res, category);
  } catch (e) {
    return bad(res, 500, 'Failed to create content category');
  }
});

router.put('/content/categories/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const { name, description, slug, parent_id, subject, grade, color, icon, tags, status } = req.body;
    
    // Check if slug already exists (if being updated)
    if (slug) {
      const existingCategory = await ContentCategoryModel.findBySlug(slug);
      if (existingCategory && existingCategory.id !== id) {
        return bad(res, 400, 'Slug already exists');
      }
    }

    const category = await ContentCategoryModel.update(id, {
      name, description, slug, parent_id, subject, grade, color, icon, tags, status
    });

    return ok(res, category);
  } catch (e) {
    return bad(res, 500, 'Failed to update content category');
  }
});

router.delete('/content/categories/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    const deleted = await ContentCategoryModel.delete(id);
    
    if (!deleted) {
      return bad(res, 404, 'Content category not found');
    }

    return ok(res, { deleted: true });
  } catch (e) {
    return bad(res, 500, 'Failed to delete content category');
  }
});

router.get('/content/categories/:id/statistics', async (req: RequestWithUser, res: express.Response) => {
  try {
    const id = req.params['id'] as string;
    await ContentCategoryModel.updateCounts(id);
    const category = await ContentCategoryModel.findById(id);
    
    if (!category) {
      return bad(res, 404, 'Content category not found');
    }
    
    return ok(res, category);
  } catch (e) {
    return bad(res, 500, 'Failed to update category statistics');
  }
});

router.get('/content/categories/statistics/overview', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const stats = await ContentCategoryModel.getStatistics();
    return ok(res, stats);
  } catch (e) {
    return bad(res, 500, 'Failed to get content categories statistics');
  }
});

export default router;


