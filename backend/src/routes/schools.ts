import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import pool from '../database/connection';
import { body, param, validationResult } from 'express-validator';
import { UserModel } from '../models/User';

const router = Router();

// Get school details (admin only)
router.get('/:schoolId', authenticateToken, requireRole(['school_admin']), async (req: Request, res: Response) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const result = await pool.query('SELECT id, name, address, city, postal_code, contact_email, contact_phone, logo_url, is_active, created_at, updated_at FROM schools WHERE id = $1', [schoolId]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'School not found' });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get school error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get school' });
  }
});

// Update school details (admin only)
router.put('/:schoolId', authenticateToken, requireRole(['school_admin']), [
  param('schoolId').isUUID(),
  body('name').optional().isLength({ min: 2 }),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('postal_code').optional().isString(),
  body('contact_email').optional().isEmail(),
  body('contact_phone').optional().isString(),
  body('logo_url').optional().isString(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const allowed = ['name','address','city','postal_code','contact_email','contact_phone','logo_url'];
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) { updates.push(`${key} = $${i++}`); values.push(req.body[key]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No changes' });
    values.push(schoolId);
    const result = await pool.query(`UPDATE schools SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING id, name, address, city, postal_code, contact_email, contact_phone, logo_url, is_active, created_at, updated_at`, values);
    return res.status(200).json({ success: true, data: result.rows[0], message: 'School updated' });
  } catch (error) {
    console.error('Update school error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update school' });
  }
});

// Helper to ensure the requester can only manage their own school
const ensureOwnSchool = (req: Request, res: Response): string | null => {
  const { schoolId } = req.params as { schoolId: string };
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  if (!req.user.school_id || req.user.school_id !== schoolId) {
    res.status(403).json({ success: false, error: 'Insufficient permissions for this school' });
    return null;
  }
  return schoolId;
};

// Get teachers for a school (admin only)
router.get('/:schoolId/teachers', authenticateToken, requireRole(['school_admin']), async (req: Request, res: Response) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const result = await pool.query('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE school_id = $1 ORDER BY created_at DESC', [schoolId]);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('List teachers error:', error);
    return res.status(500).json({ success: false, error: 'Failed to list teachers' });
  }
});

// Add a teacher to a school (admin only)
router.post('/:schoolId/teachers', authenticateToken, requireRole(['school_admin']), [
  param('schoolId').isUUID().withMessage('Invalid school ID'),
  body('email').isEmail().withMessage('Valid email required'),
  body('first_name').isLength({ min: 2 }),
  body('last_name').isLength({ min: 2 }),
  body('password').isLength({ min: 8 })
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const { email, first_name, last_name, password } = req.body;
    // Create teacher with role teacher_school
    const user = await UserModel.create({
      email,
      password,
      first_name,
      last_name,
      school_id: schoolId,
      role: 'teacher_school'
    });
    const { password_hash, ...userSafe } = user as any;
    return res.status(201).json({ success: true, data: userSafe, message: 'Teacher added' });
  } catch (error) {
    console.error('Add teacher error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add teacher' });
  }
});

// Remove/deactivate a teacher (admin only)
router.delete('/:schoolId/teachers/:userId', authenticateToken, requireRole(['school_admin']), async (req: Request, res: Response) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const { userId } = req.params as { userId: string };
    // Ensure target user belongs to the same school
    const user = await UserModel.findById(userId);
    if (!user || user.school_id !== schoolId) {
      return res.status(404).json({ success: false, error: 'Teacher not found in your school' });
    }
    // Safety: do not allow deactivating school admins or self
    if (user.role !== 'teacher_school') {
      return res.status(400).json({ success: false, error: 'Only teacher accounts can be deactivated' });
    }
    if (req.user && user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
    }
    await pool.query(`UPDATE users SET is_active = false WHERE id = $1`, [userId]);
    return res.status(200).json({ success: true, message: 'Teacher deactivated' });
  } catch (error) {
    console.error('Remove teacher error:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove teacher' });
  }
});

export default router;



