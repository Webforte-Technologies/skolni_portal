import express from 'express';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import pool from '../database/connection';
import { authenticateToken, requireRole, RequestWithUser } from '../middleware/auth';
import { auditLoggerForAdmin } from '../middleware/audit';
import { getMetricsSnapshot } from '../middleware/metrics';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { FeatureFlagModel } from '../models/FeatureFlag';
import { GeneratedFileModel } from '../models/GeneratedFile';
import { ConversationModel } from '../models/Conversation';
import { ContentCategoryModel, ContentCategoryFilters } from '../models/ContentCategory';
import { UserStatusHistoryModel } from '../models/UserStatusHistory';
import { UserModel } from '../models/User';
import { SchoolModel } from '../models/School';
import { UserActivityModel } from '../models/UserActivity';
import { UserNotificationModel } from '../models/UserNotification';
import { UserPreferencesModel } from '../models/UserPreferences';
import { 
  AdminCreateUserRequest, 
  AdminUpdateUserRequest, 
  AdminCreateSchoolRequest, 
  AdminUpdateSchoolRequest,
  CreateUserNotificationRequest,
  UpdateUserStatusRequest,
  UserAnalytics,
  UserActivityStats
} from '../types/database';

const router = express.Router();

// Guard entire router
router.use(authenticateToken, requireRole(['platform_admin']));
router.use(auditLoggerForAdmin);

// Helper: standard envelope
const ok = (res: express.Response, data: any) => res.status(200).json({ success: true, data });
const bad = (res: express.Response, code: number, error: string, details?: any) => res.status(code).json({ success: false, error, details });

// Users listing with enhanced filters
router.get('/users', async (req: RequestWithUser, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const role = (req.query as any)['role'] as string | undefined;
    const schoolId = (req.query as any)['school_id'] as string | undefined;
    const isActive = (req.query as any)['is_active'] as string | undefined;
    const status = (req.query as any)['status'] as string | undefined;
    const q = ((req.query as any)['q'] as string | undefined)?.trim();

    // Use enhanced search if advanced filters are provided
    if (status || req.query['date_range_start'] || req.query['credit_range_min'] || req.query['last_login_start']) {
      const filters: any = {
        role,
        school_id: schoolId,
        is_active: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        status,
        search: q,
        limit,
        offset
      };

      if (req.query['date_range_start'] && req.query['date_range_end']) {
        filters.date_range = {
          start_date: req.query['date_range_start'],
          end_date: req.query['date_range_end']
        };
      }

      if (req.query['credit_range_min'] && req.query['credit_range_max']) {
        filters.credit_range = {
          min: parseInt(req.query['credit_range_min'] as string),
          max: parseInt(req.query['credit_range_max'] as string)
        };
      }

      if (req.query['last_login_start'] && req.query['last_login_end']) {
        filters.last_login_range = {
          start_date: req.query['last_login_start'],
          end_date: req.query['last_login_end']
        };
      }

      const result = await UserModel.advancedSearch(filters);
      return ok(res, { data: result.users, total: result.total, limit, offset });
    }

    // Use basic search for simple filters
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
             u.status, u.last_login_at, u.last_activity_at,
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
    console.error('List users error:', e);
    return bad(res, 500, 'Failed to list users');
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

// Create new user (admin only)
router.post('/users', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userData: AdminCreateUserRequest = req.body;
    
    // Validate required fields
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.role) {
      return bad(res, 400, 'Missing required fields: email, first_name, last_name, role');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      return bad(res, 400, 'User with this email already exists');
    }

    // Validate role-school consistency
    if (userData.role === 'teacher_school' || userData.role === 'school_admin') {
      if (!userData.school_id) {
        return bad(res, 400, 'School ID is required for school-based roles');
      }
    } else if (userData.role === 'teacher_individual' || userData.role === 'platform_admin') {
      if (userData.school_id) {
        return bad(res, 400, 'School ID should not be provided for individual/platform admin roles');
      }
    }

    const user = await UserModel.createAdmin(userData);
    const userWithoutPassword: any = { ...user };
    delete userWithoutPassword.password_hash;

    return ok(res, userWithoutPassword);
  } catch (e) {
    console.error('Create user error:', e);
    return bad(res, 500, 'Failed to create user');
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return bad(res, 404, 'User not found');
    }

    // Prevent deleting platform admins
    if (user.role === 'platform_admin') {
      return bad(res, 403, 'Cannot delete platform admin users');
    }

    // Prevent self-deletion
    if (req.user && user.id === req.user.id) {
      return bad(res, 400, 'Cannot delete your own account');
    }

    const deleted = await UserModel.delete(userId);
    if (!deleted) {
      return bad(res, 500, 'Failed to delete user');
    }

    return ok(res, { deleted: true, message: 'User deactivated successfully' });
  } catch (e) {
    console.error('Delete user error:', e);
    return bad(res, 500, 'Failed to delete user');
  }
});

// Enhanced user update with more fields
router.put('/users/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    const updateData: AdminUpdateUserRequest = req.body;

    // Check if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return bad(res, 404, 'User not found');
    }

    // Validate role-school consistency if role is being updated
    if (updateData.role) {
      if (updateData.role === 'teacher_school' || updateData.role === 'school_admin') {
        if (!updateData.school_id && !existingUser.school_id) {
          return bad(res, 400, 'School ID is required for school-based roles');
        }
      } else if (updateData.role === 'teacher_individual' || updateData.role === 'platform_admin') {
        // Clear school_id for individual roles by omitting it from the update data
        delete updateData.school_id;
      }
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await UserModel.findByEmail(updateData.email);
      if (emailExists) {
        return bad(res, 400, 'Email already exists');
      }
    }

    // Handle status update separately if provided
    if (updateData.status) {
      const validStatuses = ['active', 'suspended', 'pending_verification', 'inactive'];
      if (!validStatuses.includes(updateData.status)) {
        return bad(res, 400, 'Invalid status');
      }
    }

    const updatedUser = await UserModel.updateAdmin(userId, updateData);
    if (!updatedUser) {
      return bad(res, 500, 'Failed to update user');
    }

    const userWithoutPassword: any = { ...updatedUser };
    delete userWithoutPassword.password_hash;

    return ok(res, userWithoutPassword);
  } catch (e) {
    console.error('Update user error:', e);
    return bad(res, 500, 'Failed to update user');
  }
});

// Schools list
router.get('/schools', async (req: RequestWithUser, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const q = ((req.query as any)['q'] as string | undefined)?.trim();
    const isActive = (req.query as any)['is_active'] as string | undefined;
    
    const filters: any = { limit, offset, search: q };
    if (typeof isActive === 'string') {
      filters.is_active = isActive === 'true';
    }

    const result = await SchoolModel.findAllWithStats(filters);
    return ok(res, { data: result.schools, total: result.total, limit, offset });
  } catch (e) {
    return bad(res, 500, 'Failed to list schools');
  }
});

// Get school details
router.get('/schools/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const schoolId = req.params['id'];
    if (!schoolId) {
      return bad(res, 400, 'School ID is required');
    }
    
    const school = await SchoolModel.findByIdWithStats(schoolId);
    
    if (!school) {
      return bad(res, 404, 'School not found');
    }

    return ok(res, school);
  } catch (e) {
    console.error('Get school error:', e);
    return bad(res, 500, 'Failed to get school');
  }
});

// Create new school
router.post('/schools', async (req: RequestWithUser, res: express.Response) => {
  try {
    const schoolData: AdminCreateSchoolRequest = req.body;
    
    // Validate required fields
    if (!schoolData.name) {
      return bad(res, 400, 'School name is required');
    }

    // Check if school with same name already exists
    const existingSchool = await SchoolModel.findByName(schoolData.name);
    if (existingSchool) {
      return bad(res, 400, 'School with this name already exists');
    }

    const school = await SchoolModel.create(schoolData);
    return ok(res, school);
  } catch (e) {
    console.error('Create school error:', e);
    return bad(res, 500, 'Failed to create school');
  }
});

// Update school
router.put('/schools/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const schoolId = req.params['id'];
    if (!schoolId) {
      return bad(res, 400, 'School ID is required');
    }
    
    const updateData: AdminUpdateSchoolRequest = req.body;

    // Check if school exists
    const existingSchool = await SchoolModel.findById(schoolId);
    if (!existingSchool) {
      return bad(res, 404, 'School not found');
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== existingSchool.name) {
      const nameExists = await SchoolModel.findByName(updateData.name);
      if (nameExists) {
        return bad(res, 400, 'School with this name already exists');
      }
    }

    const updatedSchool = await SchoolModel.update(schoolId, updateData);
    if (!updatedSchool) {
      return bad(res, 500, 'Failed to update school');
    }

    return ok(res, updatedSchool);
  } catch (e) {
    console.error('Update school error:', e);
    return bad(res, 500, 'Failed to update school');
  }
});

// Delete school (soft delete)
router.delete('/schools/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const schoolId = req.params['id'];
    if (!schoolId) {
      return bad(res, 400, 'School ID is required');
    }
    
    // Check if school exists
    const school = await SchoolModel.findById(schoolId);
    if (!school) {
      return bad(res, 404, 'School not found');
    }

    // Check if school has active users
    const usersResult = await pool.query(`
      SELECT COUNT(*) as user_count 
      FROM users 
      WHERE school_id = $1 AND is_active = true
    `, [schoolId]);

    const userCount = parseInt(usersResult.rows[0].user_count);
    if (userCount > 0) {
      return bad(res, 400, `Cannot delete school with ${userCount} active users. Please deactivate users first.`);
    }

    const deleted = await SchoolModel.delete(schoolId);
    if (!deleted) {
      return bad(res, 500, 'Failed to delete school');
    }

    return ok(res, { deleted: true, message: 'School deactivated successfully' });
  } catch (e) {
    console.error('Delete school error:', e);
    return bad(res, 500, 'Failed to delete school');
  }
});

// Teacher management endpoints

// List teachers with filters
router.get('/teachers', async (req: RequestWithUser, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const schoolId = (req.query as any)['school_id'] as string | undefined;
    const isActive = (req.query as any)['is_active'] as string | undefined;
    const search = ((req.query as any)['q'] as string | undefined)?.trim();

    const filters: any = { limit, offset, search };
    if (schoolId) filters.school_id = schoolId;
    if (typeof isActive === 'string') {
      filters.is_active = isActive === 'true';
    }

    const result = await UserModel.findTeachersWithSchools(filters);
    return ok(res, { data: result.teachers, total: result.total, limit, offset });
  } catch (e) {
    console.error('List teachers error:', e);
    return bad(res, 500, 'Failed to list teachers');
  }
});

// Create new teacher
router.post('/teachers', async (req: RequestWithUser, res: express.Response) => {
  try {
    const teacherData: AdminCreateUserRequest = req.body;
    
    // Validate required fields
    if (!teacherData.email || !teacherData.first_name || !teacherData.last_name) {
      return bad(res, 400, 'Missing required fields: email, first_name, last_name');
    }

    // Set role to teacher_individual by default
    teacherData.role = teacherData.role || 'teacher_individual';

    // Validate role is teacher type
    if (!['teacher_school', 'teacher_individual'].includes(teacherData.role)) {
      return bad(res, 400, 'Role must be teacher_school or teacher_individual');
    }

    // Validate school_id consistency
    if (teacherData.role === 'teacher_school' && !teacherData.school_id) {
      return bad(res, 400, 'School ID is required for teacher_school role');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(teacherData.email);
    if (existingUser) {
      return bad(res, 400, 'User with this email already exists');
    }

    const teacher = await UserModel.createAdmin(teacherData);
    const teacherWithoutPassword: any = { ...teacher };
    delete teacherWithoutPassword.password_hash;

    return ok(res, teacherWithoutPassword);
  } catch (e) {
    console.error('Create teacher error:', e);
    return bad(res, 500, 'Failed to create teacher');
  }
});

// Update teacher
router.put('/teachers/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const teacherId = req.params['id'];
    if (!teacherId) {
      return bad(res, 400, 'Teacher ID is required');
    }
    
    const updateData: AdminUpdateUserRequest = req.body;

    // Check if teacher exists
    const existingTeacher = await UserModel.findById(teacherId);
    if (!existingTeacher) {
      return bad(res, 404, 'Teacher not found');
    }

    // Validate role is teacher type
    if (updateData.role && !['teacher_school', 'teacher_individual'].includes(updateData.role)) {
      return bad(res, 400, 'Role must be teacher_school or teacher_individual');
    }

    // Validate school_id consistency
    if (updateData.role === 'teacher_school' && !updateData.school_id && !existingTeacher.school_id) {
      return bad(res, 400, 'School ID is required for teacher_school role');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingTeacher.email) {
      const emailExists = await UserModel.findByEmail(updateData.email);
      if (emailExists) {
        return bad(res, 400, 'Email already exists');
      }
    }

    const updatedTeacher = await UserModel.updateAdmin(teacherId, updateData);
    if (!updatedTeacher) {
      return bad(res, 500, 'Failed to update teacher');
    }

    const teacherWithoutPassword: any = { ...updatedTeacher };
    delete teacherWithoutPassword.password_hash;

    return ok(res, teacherWithoutPassword);
  } catch (e) {
    console.error('Update teacher error:', e);
    return bad(res, 500, 'Failed to update teacher');
  }
});

// Delete teacher
router.delete('/teachers/:id', async (req: RequestWithUser, res: express.Response) => {
  try {
    const teacherId = req.params['id'];
    if (!teacherId) {
      return bad(res, 400, 'Teacher ID is required');
    }
    
    // Check if teacher exists
    const teacher = await UserModel.findById(teacherId);
    if (!teacher) {
      return bad(res, 404, 'Teacher not found');
    }

    // Validate it's actually a teacher
    if (!['teacher_school', 'teacher_individual'].includes(teacher.role)) {
      return bad(res, 400, 'User is not a teacher');
    }

    // Prevent self-deletion
    if (req.user && teacher.id === req.user.id) {
      return bad(res, 400, 'Cannot delete your own account');
    }

    const deleted = await UserModel.delete(teacherId);
    if (!deleted) {
      return bad(res, 500, 'Failed to delete teacher');
    }

    return ok(res, { deleted: true, message: 'Teacher deactivated successfully' });
  } catch (e) {
    console.error('Delete teacher error:', e);
    return bad(res, 500, 'Failed to delete teacher');
  }
});

// Assign teacher to school
router.post('/teachers/:id/assign-school', async (req: RequestWithUser, res: express.Response) => {
  try {
    const teacherId = req.params['id'];
    if (!teacherId) {
      return bad(res, 400, 'Teacher ID is required');
    }
    
    const { school_id } = req.body;

    if (!school_id) {
      return bad(res, 400, 'School ID is required');
    }

    // Check if teacher exists
    const teacher = await UserModel.findById(teacherId);
    if (!teacher) {
      return bad(res, 404, 'Teacher not found');
    }

    // Validate it's actually a teacher
    if (!['teacher_school', 'teacher_individual'].includes(teacher.role)) {
      return bad(res, 400, 'User is not a teacher');
    }

    // Check if school exists
    const school = await SchoolModel.findById(school_id);
    if (!school) {
      return bad(res, 404, 'School not found');
    }

    const updatedTeacher = await UserModel.assignToSchool(teacherId, school_id);
    if (!updatedTeacher) {
      return bad(res, 500, 'Failed to assign teacher to school');
    }

    const teacherWithoutPassword: any = { ...updatedTeacher };
    delete teacherWithoutPassword.password_hash;

    return ok(res, teacherWithoutPassword);
  } catch (e) {
    console.error('Assign teacher to school error:', e);
    return bad(res, 500, 'Failed to assign teacher to school');
  }
});

// Remove teacher from school
router.delete('/teachers/:id/unassign-school', async (req: RequestWithUser, res: express.Response) => {
  try {
    const teacherId = req.params['id'];
    if (!teacherId) {
      return bad(res, 400, 'Teacher ID is required');
    }

    // Check if teacher exists
    const teacher = await UserModel.findById(teacherId);
    if (!teacher) {
      return bad(res, 404, 'Teacher not found');
    }

    // Validate it's actually a school teacher
    if (teacher.role !== 'teacher_school') {
      return bad(res, 400, 'Teacher is not assigned to a school');
    }

    const updatedTeacher = await UserModel.removeFromSchool(teacherId);
    if (!updatedTeacher) {
      return bad(res, 500, 'Failed to remove teacher from school');
    }

    const teacherWithoutPassword: any = { ...updatedTeacher };
    delete teacherWithoutPassword.password_hash;

    return ok(res, teacherWithoutPassword);
  } catch (e) {
    console.error('Remove teacher from school error:', e);
    return bad(res, 500, 'Failed to remove teacher from school');
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
      // User management
      'GET /users', 'POST /users', 'PUT /users/:id', 'DELETE /users/:id', 'POST /users/:id/credits', 'POST /users/bulk',
      // Enhanced user management
      'GET /users/:id/activity', 'GET /users/:id/profile', 'GET /users/analytics', 'GET /users/search/advanced',
      'POST /users/:id/send-notification', 'PUT /users/:id/status', 'GET /users/:id/status-history', 'POST /users/:id/reset-password',
      'GET /users/activity-logs', 'GET /users/export', 'POST /users/import',
      // School management
      'GET /schools', 'GET /schools/:id', 'POST /schools', 'PUT /schools/:id', 'DELETE /schools/:id',
      // Teacher management
      'GET /teachers', 'POST /teachers', 'PUT /teachers/:id', 'DELETE /teachers/:id',
      'POST /teachers/:id/assign-school', 'DELETE /teachers/:id/unassign-school',
      // System
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

// Enhanced User CRUD Operations - New Endpoints

// Get user activity logs and statistics
router.get('/users/:id/activity', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    const { limit = 50, offset = 0, activity_type, start_date, end_date } = req.query as any;

    const filters = {
      user_id: userId,
      limit: parseInt(limit),
      offset: parseInt(offset),
      activity_type,
      start_date,
      end_date
    };

    const [activities, activityStats] = await Promise.all([
      UserActivityModel.getUserActivities(filters),
      UserActivityModel.getUserActivityStats(userId)
    ]);

    return ok(res, {
      activities: activities.activities,
      total: activities.total,
      stats: activityStats
    });
  } catch (e) {
    console.error('Get user activity error:', e);
    return bad(res, 500, 'Failed to get user activity');
  }
});

// Get user activity chart data in format expected by frontend
router.get('/users/:id/activity-chart', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    const { timeRange = '30d' } = req.query as any;
    
    // Calculate date range
    const now = new Date();
    let start_date: string;
    
    switch (timeRange) {
      case '7d':
        start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        start_date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '90d':
        start_date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        start_date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Get activity data grouped by date
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN activity_type = 'login' THEN 1 END) as logins,
        COUNT(CASE WHEN activity_type NOT IN ('login', 'logout') THEN 1 END) as actions,
        COALESCE(SUM(CASE WHEN activity_data->>'credits_used' IS NOT NULL 
          THEN CAST(activity_data->>'credits_used' AS INTEGER) 
          ELSE 0 END), 0) as credits_used,
        COUNT(DISTINCT session_id) as sessions
      FROM user_activity_logs 
      WHERE user_id = $1 AND created_at >= $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [userId, start_date]);
    
    // Get user activity stats
    const activityStats = await UserActivityModel.getUserActivityStats(userId);
    
    // Transform stats to match frontend interface
    const transformedStats = {
      total_logins: activityStats.activities_by_type?.['login'] || 0,
      total_actions: activityStats.total_activities || 0,
      total_credits_used: 0, // TODO: Calculate from activity data
      average_session_duration: 0, // TODO: Calculate from session data
      most_active_day: activityStats.last_activity ? new Date(activityStats.last_activity).toISOString().split('T')[0] : '',
      most_active_hour: Array.isArray(activityStats.most_active_hours) && activityStats.most_active_hours.length > 0 ? activityStats.most_active_hours[0] : 0,
      last_activity: activityStats.last_activity ? new Date(activityStats.last_activity).toISOString() : '',
      activity_trend: 'stable' as const // TODO: Calculate trend
    };
    
    return ok(res, {
      activityData: result.rows.map(row => ({
        date: row.date,
        logins: parseInt(row.logins),
        actions: parseInt(row.actions),
        credits_used: parseInt(row.credits_used),
        sessions: parseInt(row.sessions)
      })),
      activityStats: transformedStats
    });
  } catch (e) {
    console.error('Get user activity chart error:', e);
    return bad(res, 500, 'Failed to get user activity chart data');
  }
});

// Get detailed user profile with usage data
router.get('/users/:id/profile', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    const [userProfile, activityStats, unreadNotifications, creditStats, recentActivities] = await Promise.all([
      UserModel.getDetailedProfile(userId),
      UserActivityModel.getUserActivityStats(userId),
      UserNotificationModel.getUnreadCount(userId),
      CreditTransactionModel.getUserStats(userId),
      UserActivityModel.getUserActivities({
        user_id: userId,
        limit: 10,
        offset: 0
      })
    ]);

    if (!userProfile) {
      return bad(res, 404, 'User not found');
    }

    // Get additional metrics
    const [conversationsCount, filesCount] = await Promise.all([
      ConversationModel.countByUserId(userId),
      GeneratedFileModel.countByUserId(userId)
    ]);

    const profile = {
      ...userProfile,
      activity_stats: {
        total_logins: activityStats.activities_by_type?.['login'] || 0,
        last_login: userProfile.last_login_at,
        total_activities: activityStats.total_activities,
        credits_used: creditStats.total_credits_used || 0,
        conversations_count: conversationsCount || 0,
        files_generated: filesCount || 0
      },
      recent_activities: recentActivities.activities,
      unread_notifications_count: unreadNotifications
    };

    return ok(res, profile);
  } catch (e) {
    console.error('Get user profile error:', e);
    return bad(res, 500, 'Failed to get user profile');
  }
});

// Get user analytics and statistics
router.get('/users/analytics', async (req: RequestWithUser, res: express.Response) => {
  try {
    const [userAnalytics, activitySummary, notificationStats] = await Promise.all([
      UserModel.getUserAnalytics(),
      UserActivityModel.getActivitySummary(),
      UserNotificationModel.getNotificationStats()
    ]);

    return ok(res, {
      user_analytics: userAnalytics,
      activity_summary: activitySummary,
      notification_stats: notificationStats
    });
  } catch (e) {
    console.error('Get user analytics error:', e);
    return bad(res, 500, 'Failed to get user analytics');
  }
});

// Advanced user search with multiple criteria
router.get('/users/search/advanced', async (req: RequestWithUser, res: express.Response) => {
  try {
    const {
      role, school_id, is_active, status, search,
      date_range_start, date_range_end,
      credit_range_min, credit_range_max,
      last_login_start, last_login_end,
      limit = 50, offset = 0
    } = req.query as any;

    const filters: any = {
      role,
      school_id,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      status,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (date_range_start && date_range_end) {
      filters.date_range = {
        start_date: date_range_start,
        end_date: date_range_end
      };
    }

    if (credit_range_min && credit_range_max) {
      filters.credit_range = {
        min: parseInt(credit_range_min),
        max: parseInt(credit_range_max)
      };
    }

    if (last_login_start && last_login_end) {
      filters.last_login_range = {
        start_date: last_login_start,
        end_date: last_login_end
      };
    }

    const result = await UserModel.advancedSearch(filters);
    return ok(res, result);
  } catch (e) {
    console.error('Advanced user search error:', e);
    return bad(res, 500, 'Failed to perform advanced user search');
  }
});

// Send notification to user
router.post('/users/:id/send-notification', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    const notificationData: CreateUserNotificationRequest = {
      user_id: userId,
      ...req.body
    };

    // Validate required fields
    if (!notificationData.title || !notificationData.message || !notificationData.notification_type) {
      return bad(res, 400, 'Missing required fields: title, message, notification_type');
    }

    const notification = await UserNotificationModel.create(notificationData);
    return ok(res, notification);
  } catch (e) {
    console.error('Send notification error:', e);
    return bad(res, 500, 'Failed to send notification');
  }
});

// Update user status
router.put('/users/:id/status', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    const { status, reason, expires_at }: UpdateUserStatusRequest = req.body;

    if (!status) {
      return bad(res, 400, 'Status is required');
    }

    const validStatuses = ['active', 'suspended', 'pending_verification', 'inactive'];
    if (!validStatuses.includes(status)) {
      return bad(res, 400, 'Invalid status');
    }

    // Get current user to capture old status
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      return bad(res, 404, 'User not found');
    }

    // Update user status
    const updatedUser = await UserModel.updateStatus(userId, status, reason);
    if (!updatedUser) {
      return bad(res, 500, 'Failed to update user status');
    }

    // Log status change in audit trail
    if (currentUser.status !== status) {
      const historyData: any = {
        user_id: userId,
        old_status: currentUser.status,
        new_status: status
      };
      
      if (reason) historyData.reason = reason;
      if (req.user?.id) historyData.changed_by = req.user.id;
      if (expires_at) historyData.expires_at = expires_at;
      
      await UserStatusHistoryModel.create(historyData);
    }

    return ok(res, {
      user: updatedUser,
      message: 'User status updated successfully',
      status_change: {
        from: currentUser.status,
        to: status,
        reason,
        changed_by: req.user?.id,
        changed_at: new Date().toISOString()
      }
    });
  } catch (e) {
    console.error('Update user status error:', e);
    return bad(res, 500, 'Failed to update user status');
  }
});

// Get user status history
router.get('/users/:id/status-history', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));

    const statusHistory = await UserStatusHistoryModel.getByUserId(userId, limit, offset);
    return ok(res, statusHistory);
  } catch (e) {
    console.error('Get user status history error:', e);
    return bad(res, 500, 'Failed to get user status history');
  }
});

// Reset user password
router.post('/users/:id/reset-password', async (req: RequestWithUser, res: express.Response) => {
  try {
    const userId = req.params['id'];
    if (!userId) {
      return bad(res, 400, 'User ID is required');
    }
    
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return bad(res, 404, 'User not found');
    }

    // Generate secure reset token
    const resetToken = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + Date.now().toString(36);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    const query = `
      UPDATE users 
      SET password_reset_token = $1, 
          password_reset_expires_at = $2, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, first_name, last_name
    `;
    
    const result = await pool.query(query, [resetToken, tokenExpiry, userId]);
    const updatedUser = result.rows[0];

    // TODO: Send email with reset link to user
    // Reset link should be: `/reset-password?token=${resetToken}`

    return ok(res, {
      user: { id: updatedUser.id, email: updatedUser.email },
      message: 'Password reset link has been sent to the user\'s email address.',
      expires_at: tokenExpiry.toISOString()
    });
  } catch (e) {
    console.error('Reset password error:', e);
    return bad(res, 500, 'Failed to reset password');
  }
});

// Get user activity logs with filters
router.get('/users/activity-logs', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { 
      user_id, activity_type, limit = 50, offset = 0, 
      start_date, end_date 
    } = req.query as any;

    const filters = {
      user_id,
      activity_type,
      limit: parseInt(limit),
      offset: parseInt(offset),
      start_date,
      end_date
    };

    const activities = await UserActivityModel.getUserActivities(filters);
    
    // Debug logging to help identify issues
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Raw activities from database:', JSON.stringify(activities.activities.slice(0, 2), null, 2));
      console.log('Total count from database:', activities.total);
      console.log('Applied filters:', filters);
      
      // Check if we have any activities
      if (activities.activities.length > 0) {
        const firstActivity = activities.activities[0];
        if (firstActivity) {
          console.log('First activity user info:', {
            user_id: firstActivity.user_id,
            first_name: firstActivity.first_name,
            last_name: firstActivity.last_name,
            email: firstActivity.email,
            activity_data: firstActivity.activity_data
          });
        }
      }
    }
    
    // Format activities for frontend with proper user information
    const formattedActivities = activities.activities.map(activity => {
      // Extract user information with better fallback logic
      let userName = 'N/A';
      let userEmail = 'N/A';
      
      if (activity.first_name && activity.last_name) {
        userName = `${activity.first_name} ${activity.last_name}`;
        userEmail = activity.email || 'N/A';
      } else if (activity.email) {
        userName = activity.email;
        userEmail = activity.email;
      } else if (activity.user_id) {
        // If we have user_id but no name/email, show the ID
        userName = `Uživatel ${activity.user_id.substring(0, 8)}...`;
        userEmail = 'N/A';
      }
      
      // Extract meaningful details from activity_data with better logic
      let details = 'N/A';
      if (activity.activity_data) {
        const data = activity.activity_data;
        if (typeof data === 'object') {
          // Try to extract the most meaningful detail
          if (data['endpoint']) {
            details = data['endpoint'];
          } else if (data['path']) {
            details = data['path'];
          } else if (data['description']) {
            details = data['description'];
          } else if (data['message']) {
            details = data['message'];
          } else if (data['action']) {
            details = data['action'];
          } else if (data['type']) {
            details = data['type'];
          } else if (data['method']) {
            details = `${data['method']} ${data['path'] || ''}`;
          } else if (Object.keys(data).length > 0) {
            // If we have data but no clear field, show a summary
            const relevantKeys = Object.keys(data).filter(key => 
              !['timestamp', 'user_email', 'user_role'].includes(key)
            );
            if (relevantKeys.length > 0) {
              details = `${relevantKeys.length} položek: ${relevantKeys.slice(0, 3).join(', ')}`;
            } else {
              details = 'Žádné další detaily';
            }
          }
        }
      }
      
      // Extract credits used
      let creditsUsed = 0;
      if (activity.activity_data && typeof activity.activity_data === 'object') {
        creditsUsed = activity.activity_data['credits_used'] || activity.activity_data['credits'] || 0;
      }

      return {
        id: activity.id,
        user_id: activity.user_id,
        user_name: userName,
        user_email: userEmail,
        action: activity.activity_type,
        action_type: activity.activity_type,
        details: details,
        ip_address: activity.ip_address || 'N/A',
        user_agent: activity.user_agent || 'N/A',
        timestamp: activity.created_at,
        session_id: activity.session_id,
        credits_used: creditsUsed,
        school_name: activity.school_name || 'N/A',
        activity_data: activity.activity_data,
        created_at: activity.created_at
      };
    });

    // Debug logging for formatted activities
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Formatted activities sample:', JSON.stringify(formattedActivities.slice(0, 2), null, 2));
      console.log('Total formatted activities:', formattedActivities.length);
    }

    return ok(res, {
      activities: formattedActivities,
      total: activities.total
    });
  } catch (e) {
    console.error('Get activity logs error:', e);
    return bad(res, 500, 'Failed to get activity logs');
  }
});

// Get activity logs statistics
router.get('/users/activity-logs/stats', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { date_range, activity_type, user_id } = req.query as any;
    
    // Calculate date range
    let start_date: string | undefined;
    let end_date: string | undefined;
    
    if (date_range) {
      const now = new Date();
      switch (date_range) {
        case '24h':
          start_date = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case '7d':
          start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          start_date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '90d':
          start_date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
      end_date = now.toISOString();
    }

    const filters: {
      start_date?: string;
      end_date?: string;
      activity_type?: string;
    } = {};
    
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (activity_type) filters.activity_type = activity_type;

    const summary = await UserActivityModel.getActivitySummary(filters);
    
    // Calculate additional stats needed by frontend
    const stats = {
      total_activities: summary.total_activities,
      unique_users: summary.most_active_users.length,
      failed_activities: 0, // TODO: Implement failed activity tracking
      average_session_duration: 0, // TODO: Calculate from session data
      most_common_actions: Object.entries(summary.activities_by_type)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      peak_activity_hours: [], // TODO: Calculate peak hours
      credit_usage: summary.credit_usage
    };

    return ok(res, stats);
  } catch (e) {
    console.error('Get activity stats error:', e);
    return bad(res, 500, 'Failed to get activity statistics');
  }
});

// Export users to CSV/Excel
router.get('/users/export', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { format = 'csv', include_activity = 'false', include_preferences = 'false' } = req.query as any;
    const includeActivity = include_activity === 'true';
    const includePreferences = include_preferences === 'true';
    
    // Get all users with basic info
    const users = await UserModel.findAll(1000, 0); // Get up to 1000 users
    
    if (!users || users.length === 0) {
      return bad(res, 400, 'No users found to export');
    }
    
    if (format === 'csv') {
      // Helper function to escape CSV values
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Build CSV data with optional fields
      const csvData = await Promise.all(users.map(async (user) => {
        const baseData: Record<string, any> = {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
          is_active: user.is_active,
          credits_balance: user.credits_balance,
          school_id: user.school_id || '',
          created_at: user.created_at,
          last_login_at: user.last_login_at || ''
        };

        // Add activity data if requested
        if (includeActivity) {
          try {
            const activityStats = await UserActivityModel.getUserActivityStats(user.id);
            baseData['total_activities'] = activityStats.total_activities || 0;
            baseData['login_count'] = activityStats.activities_by_type?.['login'] || 0;
            baseData['last_activity'] = activityStats.last_activity || '';
          } catch (e) {
            baseData['total_activities'] = 0;
            baseData['login_count'] = 0;
            baseData['last_activity'] = '';
          }
        }

        // Add preferences data if requested
        if (includePreferences) {
          try {
            const preferences = await UserPreferencesModel.getByUserId(user.id);
            baseData['language'] = preferences?.language || 'cs-CZ';
            baseData['theme'] = preferences?.theme || 'light';
            baseData['email_notifications'] = preferences?.email_notifications ? JSON.stringify(preferences.email_notifications) : '';
          } catch (e) {
            baseData['language'] = 'cs-CZ';
            baseData['theme'] = 'light';
            baseData['email_notifications'] = '';
          }
        }

        return baseData;
      }));

      // Generate CSV with proper escaping
      const headers = Object.keys(csvData[0] || {}).map(escapeCsvValue);
      const rows = csvData.map(row => 
        Object.values(row).map(escapeCsvValue).join(',')
      );
      
      const csv = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
      return res.send(csv);
    } else if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      // Build Excel data with optional fields
      const excelData = await Promise.all(users.map(async (user) => {
        const baseData: Record<string, any> = {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
          is_active: user.is_active,
          credits_balance: user.credits_balance,
          school_id: user.school_id || '',
          created_at: user.created_at,
          last_login_at: user.last_login_at || ''
        };

        // Add activity data if requested
        if (includeActivity) {
          try {
            const activityStats = await UserActivityModel.getUserActivityStats(user.id);
            baseData['total_activities'] = activityStats.total_activities || 0;
            baseData['login_count'] = activityStats.activities_by_type?.['login'] || 0;
            baseData['last_activity'] = activityStats.last_activity || '';
          } catch (e) {
            baseData['total_activities'] = 0;
            baseData['login_count'] = 0;
            baseData['last_activity'] = '';
          }
        }

        // Add preferences data if requested
        if (includePreferences) {
          try {
            const preferences = await UserPreferencesModel.getByUserId(user.id);
            baseData['language'] = preferences?.language || 'cs-CZ';
            baseData['theme'] = preferences?.theme || 'light';
            baseData['email_notifications'] = preferences?.email_notifications ? JSON.stringify(preferences.email_notifications) : '';
          } catch (e) {
            baseData['language'] = 'cs-CZ';
            baseData['theme'] = 'light';
            baseData['email_notifications'] = '';
          }
        }

        return baseData;
      }));

      // Set columns and headers
      const headers = Object.keys(excelData[0] || {});
      worksheet.columns = headers.map(header => ({
        header: header.replace(/_/g, ' ').toUpperCase(),
        key: header,
        width: 15
      }));

      // Add data rows
      excelData.forEach(row => {
        worksheet.addRow(row);
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Set response headers for Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.xlsx');

      // Write to response
      await workbook.xlsx.write(res);
      return res.end();
    }

    return bad(res, 400, 'Unsupported export format. Use csv or excel.');
  } catch (e) {
    console.error('Export users error:', e);
    return bad(res, 500, 'Failed to export users');
  }
});

// Import users from CSV/Excel
router.post('/users/import', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { users } = req.body as { users: any[] };
    
    if (!Array.isArray(users) || users.length === 0) {
      return bad(res, 400, 'Users array is required');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.email || !userData.first_name || !userData.last_name || !userData.role) {
          results.failed++;
          results.errors.push(`Missing required fields for user: ${userData.email || 'unknown'}`);
          continue;
        }

        // Check if email already exists
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
          results.failed++;
          results.errors.push(`Email already exists: ${userData.email}`);
          continue;
        }

        // Create user
        await UserModel.createAdmin({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          school_id: userData.school_id,
          credits_balance: userData.credits_balance || 0,
          is_active: userData.is_active !== false,
          password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) // Generate random password
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to create user ${userData.email}: ${error}`);
      }
    }

    return ok(res, results);
  } catch (e) {
    console.error('Import users error:', e);
    return bad(res, 500, 'Failed to import users');
  }
});

// Debug endpoint to check database directly
router.get('/debug/activity-logs', async (req: RequestWithUser, res: express.Response) => {
  try {
    // Check if we have any activity logs at all
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM user_activity_logs');
    const totalLogs = parseInt(totalResult.rows[0].total);
    
    // Get a few sample logs with user info
    const sampleResult = await pool.query(`
      SELECT 
        ual.id,
        ual.user_id,
        ual.activity_type,
        ual.activity_data,
        ual.created_at,
        u.email,
        u.first_name,
        u.last_name,
        u.role
      FROM user_activity_logs ual
      LEFT JOIN users u ON ual.user_id = u.id
      ORDER BY ual.created_at DESC
      LIMIT 5
    `);
    
    // Check if users table has data
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);
    
    return ok(res, {
      total_activity_logs: totalLogs,
      total_users: totalUsers,
      sample_logs: sampleResult.rows,
      message: 'Debug information retrieved'
    });
  } catch (e) {
    console.error('Debug activity logs error:', e);
    return bad(res, 500, 'Failed to get debug information');
  }
});

export default router;


