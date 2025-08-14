import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import pool from '../database/connection';
import { UserModel } from '../models/User';

const router = express.Router();

// Get school details (admin only)
router.get('/:schoolId', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const result = await pool.query('SELECT id, name, address, city, postal_code, contact_email, contact_phone, is_active, created_at, updated_at FROM schools WHERE id = $1', [schoolId]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'School not found' });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get school error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get school' });
  }
});

// Update school details (admin only)
router.put('/:schoolId', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const allowed = ['name','address','city','postal_code','contact_email','contact_phone'];
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) { updates.push(`${key} = $${i++}`); values.push(req.body[key]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No changes' });
    values.push(schoolId);
    const result = await pool.query(`UPDATE schools SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING id, name, address, city, postal_code, contact_email, contact_phone, is_active, created_at, updated_at`, values);
    return res.status(200).json({ success: true, data: result.rows[0], message: 'School updated' });
  } catch (error) {
    console.error('Update school error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update school' });
  }
});

// Get teachers for a school (admin only)
router.get('/:schoolId/teachers', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const result = await pool.query('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE school_id = $1 AND role = \'teacher_school\' ORDER BY created_at DESC', [schoolId]);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('List teachers error:', error);
    return res.status(500).json({ success: false, error: 'Failed to list teachers' });
  }
});

// Add a teacher to a school (admin only)
router.post('/:schoolId/teachers', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const { email, first_name, last_name, password } = req.body;
    
    // Validate required fields
    if (!email || !first_name || !last_name || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    
    // Create teacher with role teacher_school
    const user = await UserModel.create({
      email,
      password,
      first_name,
      last_name,
      school_id: schoolId,
      role: 'teacher_school'
    });
    const userSafe: any = { ...(user as any) };
    delete userSafe.password_hash;
    return res.status(201).json({ success: true, data: userSafe, message: 'Teacher added' });
  } catch (error) {
    console.error('Add teacher error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add teacher' });
  }
});

// Remove/deactivate a teacher (admin only)
router.delete('/:schoolId/teachers/:userId', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
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

// Add credits to school (admin only) - Demo/Paywall function
router.post('/:schoolId/add-credits', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;

    const { amount, description = 'Demo credit addition' } = req.body;
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid credit amount is required (must be positive number)' 
      });
    }

    // Get all active teachers in the school (exclude school admins)
    const usersResult = await pool.query(`
      SELECT id, first_name, last_name, credits_balance
      FROM users 
      WHERE school_id = $1 AND role = 'teacher_school' AND is_active = true
      ORDER BY created_at
    `, [schoolId]);

    if (usersResult.rows.length === 0) {
      // No active teachers yet: credit the requesting school admin instead
      // Fetch current admin balance
      const adminResult = await pool.query(
        `SELECT id, credits_balance FROM users WHERE id = $1 AND role = 'school_admin' AND is_active = true`,
        [req.user!.id]
      );

      if (adminResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'School admin not found'
        });
      }

      const admin = adminResult.rows[0];
      const balanceBefore = admin.credits_balance;
      const balanceAfter = balanceBefore + amount;

      await pool.query(
        `UPDATE users SET credits_balance = $1 WHERE id = $2`,
        [balanceAfter, admin.id]
      );

      await pool.query(
        `INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_before, balance_after, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [admin.id, 'bonus', amount, balanceBefore, balanceAfter, `${description} - credited to school admin (no teachers yet)`]
      );

      return res.json({
        success: true,
        message: `Successfully added ${amount} credits to school admin (no active teachers found)`,
        data: {
          credits_added: amount,
          users_updated: 1,
          credited_admin_id: admin.id
        }
      });
    }

    // Calculate credits per user (distribute evenly)
    const creditsPerUser = Math.floor(amount / usersResult.rows.length);
    const remainingCredits = amount % usersResult.rows.length;

    // Add credits to each user and create transaction records
    for (let i = 0; i < usersResult.rows.length; i++) {
      const user = usersResult.rows[i];
      const creditsToAdd = creditsPerUser + (i < remainingCredits ? 1 : 0); // Distribute remaining credits
      
      if (creditsToAdd > 0) {
        // Update user's credit balance
        await pool.query(`
          UPDATE users 
          SET credits_balance = credits_balance + $1 
          WHERE id = $2
        `, [creditsToAdd, user.id]);

        // Create credit transaction record
        await pool.query(`
          INSERT INTO credit_transactions (
            user_id, transaction_type, amount, balance_before, balance_after, description
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          user.id,
          'bonus',
          creditsToAdd,
          user.credits_balance,
          user.credits_balance + creditsToAdd,
          `${description} - ${creditsToAdd} credits added`
        ]);
      }
    }

    // Get updated credit statistics
    const updatedStatsResult = await pool.query(`
      SELECT COALESCE(SUM(credits_balance), 0) as total_credits
      FROM users 
      WHERE school_id = $1 AND role IN ('teacher_school', 'school_admin') AND is_active = true
    `, [schoolId]);

    return res.json({
      success: true,
      message: `Successfully added ${amount} credits to school`,
      data: {
        credits_added: amount,
        users_updated: usersResult.rows.length,
        new_total_credits: updatedStatsResult.rows[0].total_credits,
        credits_per_user: creditsPerUser,
        remaining_distribution: remainingCredits
      }
    });

  } catch (error) {
    console.error('Error adding credits to school:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Allocate credits to a specific teacher (admin only)
router.post('/:schoolId/allocate-credits', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;

    const { teacherId, amount, description = 'Credit allocation' } = req.body;
    
    // Validate inputs
    if (!teacherId || !amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid teacher ID and credit amount are required' 
      });
    }

    // Check if teacher exists and belongs to the school
    const teacherResult = await pool.query(`
      SELECT id, first_name, last_name, credits_balance, role
      FROM users 
      WHERE id = $1 AND school_id = $2 AND role = 'teacher_school' AND is_active = true
    `, [teacherId, schoolId]);

    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found in your school' 
      });
    }

    const teacher = teacherResult.rows[0];

    // Check if school admin has enough credits to allocate
    const adminCreditsResult = await pool.query(`
      SELECT id, credits_balance
      FROM users 
      WHERE school_id = $1 AND role = 'school_admin' AND is_active = true
      LIMIT 1
    `, [schoolId]);

    if (adminCreditsResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'School admin not found' 
      });
    }

    const adminUser = adminCreditsResult.rows[0];
    const adminCredits = adminUser.credits_balance;

    if (amount > adminCredits) {
      return res.status(400).json({ 
        success: false, 
        error: `Not enough credits available for allocation. Available: ${adminCredits}, Requested: ${amount}` 
      });
    }

    // Use a transaction to ensure data consistency
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduct credits from school admin
      await client.query(`
        UPDATE users 
        SET credits_balance = credits_balance - $1 
        WHERE school_id = $2 AND role = 'school_admin' AND is_active = true
      `, [amount, schoolId]);

      // Add credits to teacher
      await client.query(`
        UPDATE users 
        SET credits_balance = credits_balance + $1 
        WHERE id = $2
      `, [amount, teacherId]);

      // Create credit transaction record for teacher (receiving credits)
      await client.query(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, description
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        teacherId,
        'bonus',
        amount,
        teacher.credits_balance,
        teacher.credits_balance + amount,
        `${description} - ${amount} credits allocated from school`
      ]);

      // Create credit transaction record for school admin (losing credits)
      await client.query(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, description
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        adminUser.id,
        'usage',
        -amount,
        adminCredits,
        adminCredits - amount,
        `${description} - ${amount} credits allocated to teacher`
      ]);

      await client.query('COMMIT');

      // Get updated balances
      const updatedTeacherResult = await pool.query(`
        SELECT credits_balance FROM users WHERE id = $1
      `, [teacherId]);

      const updatedAdminResult = await pool.query(`
        SELECT credits_balance FROM users WHERE school_id = $1 AND role = 'school_admin' AND is_active = true
      `, [schoolId]);

      return res.json({
        success: true,
        message: `Successfully allocated ${amount} credits to ${teacher.first_name} ${teacher.last_name}`,
        data: {
          teacher_id: teacherId,
          teacher_name: `${teacher.first_name} ${teacher.last_name}`,
          credits_allocated: amount,
          teacher_new_balance: updatedTeacherResult.rows[0].credits_balance,
          admin_new_balance: updatedAdminResult.rows[0].credits_balance,
          admin_credits_remaining: updatedAdminResult.rows[0].credits_balance
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error allocating credits to teacher:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get credit allocation status for school (admin only)
router.get('/:schoolId/credit-allocation', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;

    // Get credit allocation breakdown
    const allocationResult = await pool.query(`
      SELECT 
        COALESCE(SUM(credits_balance), 0) as total_credits,
        COALESCE(SUM(CASE WHEN role = 'teacher_school' THEN credits_balance ELSE 0 END), 0) as allocated_credits,
        COALESCE(SUM(CASE WHEN role = 'school_admin' THEN credits_balance ELSE 0 END), 0) as admin_credits,
        COUNT(CASE WHEN role = 'teacher_school' AND is_active = true THEN 1 END) as active_teachers
      FROM users 
      WHERE school_id = $1 AND role IN ('teacher_school', 'school_admin') AND is_active = true
    `, [schoolId]);

    const data = allocationResult.rows[0];
    const unallocatedCredits = data.total_credits - data.allocated_credits;

    // Get individual teacher allocations
    const teachersResult = await pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.credits_balance, u.is_active,
        COALESCE(SUM(CASE WHEN ct.transaction_type = 'usage' THEN ABS(ct.amount) ELSE 0 END), 0) as credits_used
      FROM users u
      LEFT JOIN credit_transactions ct ON u.id = ct.user_id AND ct.transaction_type = 'usage'
      WHERE u.school_id = $1 AND u.role = 'teacher_school' AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.credits_balance, u.is_active
      ORDER BY u.first_name, u.last_name
    `, [schoolId]);

    return res.json({
      success: true,
      data: {
        total_credits: data.total_credits,
        allocated_credits: data.allocated_credits,
        unallocated_credits: unallocatedCredits,
        admin_credits: data.admin_credits,
        active_teachers: data.active_teachers,
        teachers: teachersResult.rows.map(t => ({
          id: t.id,
          name: `${t.first_name} ${t.last_name}`,
          allocated_credits: t.credits_balance,
          credits_used: t.credits_used,
          available_credits: t.credits_balance - t.credits_used
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching credit allocation:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get school credit statistics (admin only)
router.get('/:schoolId/credit-stats', authenticateToken, requireRole(['school_admin']), async (req, res) => {
  try {
    const schoolId = ensureOwnSchool(req, res);
    if (!schoolId) return;

    // Get total credits for the school (sum of all teachers' balances)
    const totalCreditsQuery = `
      SELECT COALESCE(SUM(credits_balance), 0) as total_credits
      FROM users 
      WHERE school_id = $1 AND role IN ('teacher_school', 'school_admin') AND is_active = true
    `;
    const totalCreditsResult = await pool.query(totalCreditsQuery, [schoolId]);
    const totalCredits = totalCreditsResult.rows[0].total_credits;

    // Get credits used this month
    const currentMonthQuery = `
      SELECT COALESCE(SUM(ABS(amount)), 0) as monthly_usage
      FROM credit_transactions ct
      JOIN users u ON ct.user_id = u.id
      WHERE u.school_id = $1 
        AND u.role IN ('teacher_school', 'school_admin') 
        AND u.is_active = true
        AND ct.transaction_type = 'usage'
        AND ct.created_at >= date_trunc('month', CURRENT_DATE)
    `;
    const monthlyUsageResult = await pool.query(currentMonthQuery, [schoolId]);
    const monthlyUsage = monthlyUsageResult.rows[0].monthly_usage;

    // Get credit usage per teacher
    const teacherUsageQuery = `
      SELECT 
        u.id as teacher_id,
        u.first_name,
        u.last_name,
        u.credits_balance,
        COALESCE(SUM(CASE WHEN ct.transaction_type = 'usage' THEN ABS(ct.amount) ELSE 0 END), 0) as credits_used,
        MAX(CASE WHEN ct.transaction_type = 'usage' THEN ct.created_at END) as last_used
      FROM users u
      LEFT JOIN credit_transactions ct ON u.id = ct.user_id AND ct.transaction_type = 'usage'
      WHERE u.school_id = $1 
        AND u.role IN ('teacher_school', 'school_admin') 
        AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.credits_balance
      ORDER BY credits_used DESC
    `;
    const teacherUsageResult = await pool.query(teacherUsageQuery, [schoolId]);
    const teacherUsage = teacherUsageResult.rows;

    // Get subscription info for the school admin
    const subscriptionQuery = `
      SELECT 
        s.plan_type,
        s.credits_per_month,
        s.end_date,
        s.start_date
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE u.school_id = $1 AND u.role = 'school_admin' AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    const subscriptionResult = await pool.query(subscriptionQuery, [schoolId]);
    const subscription = subscriptionResult.rows[0] || null;

    res.json({
      success: true,
      data: {
        total_credits: totalCredits,
        monthly_usage: monthlyUsage,
        available_credits: totalCredits - monthlyUsage,
        teacher_usage: teacherUsage,
        subscription: subscription ? {
          plan: subscription.plan_type,
          renewal_date: subscription.end_date,
          total_credits: subscription.credits_per_month,
          credits_used: monthlyUsage,
          monthly_usage: monthlyUsage
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching school credit stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Helper to ensure the requester can only manage their own school
const ensureOwnSchool = (req: any, res: any): string | null => {
  const { schoolId } = req.params;
  if (!schoolId) {
    res.status(400).json({ success: false, error: 'School ID is required' });
    return null;
  }
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

export default router;



