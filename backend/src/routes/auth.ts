import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { generateToken, authenticateToken } from '../middleware/auth';
import pool from '../database/connection';
import { CreateUserRequest, LoginRequest, AuthResponse, CreateSchoolRequest, User } from '../types/database';

const router = Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('first_name').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('last_name').trim().isLength({ min: 2 }).withMessage('Last name is required')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register new school + admin user
router.post('/register-school', [
  body('school.name').trim().isLength({ min: 2 }).withMessage('School name is required'),
  body('admin.email').isEmail().withMessage('Valid admin email is required'),
  body('admin.password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('admin.first_name').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('admin.last_name').trim().isLength({ min: 2 }).withMessage('Last name is required'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }

  const schoolData: CreateSchoolRequest = req.body.school || {};
  const adminData = req.body.admin || {};

  try {
    // Create school
    const schoolInsert = await pool.query(
      `INSERT INTO schools (name, address, city, postal_code, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [schoolData.name, schoolData.address || null, schoolData.city || null, schoolData.postal_code || null, schoolData.contact_email || adminData.email || null, schoolData.contact_phone || null]
    );
    const school = schoolInsert.rows[0];

    // Create admin user for this school
    const user = await UserModel.create({
      email: adminData.email,
      password: adminData.password,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      school_id: school.id,
      role: 'school_admin'
    } as CreateUserRequest);

    const adminUser: User = user as any;

    const token = generateToken(adminUser);
    const userWithoutPassword: any = { ...(adminUser as any) };
    delete userWithoutPassword.password_hash;

    const response: AuthResponse = { user: userWithoutPassword, token };

    return res.status(201).json({ success: true, data: response, message: 'School and admin created' });
  } catch (error) {
    console.error('Register school error:', error);
    return res.status(500).json({ success: false, error: 'Failed to register school' });
  }
});

// Register new user
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, first_name, last_name, school_id }: CreateUserRequest = req.body;

    console.log('Registration attempt for email:', email);

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const userData: CreateUserRequest = {
      email,
      password,
      first_name,
      last_name
    };
    
    // Only add school_id if it's provided
    if (school_id) {
      userData.school_id = school_id;
      userData.role = 'teacher_school';
    } else {
      userData.role = 'teacher_individual';
    }
    
    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });
    
    const user = await UserModel.create(userData);

    console.log('User created successfully with ID:', user.id);

    // Generate JWT token
    const token = generateToken(user);

    // Remove password_hash from response
    const userWithoutPassword: any = { ...(user as any) };
    delete userWithoutPassword.password_hash;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token
    };

    return res.status(201).json({
      success: true,
      data: response,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password_hash from response
    const userWithoutPassword: any = { ...(user as any) };
    delete userWithoutPassword.password_hash;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token
    };

    return res.status(200).json({
      success: true,
      data: response,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get user with school information
    const userWithSchool = await UserModel.findByIdWithSchool(req.user.id);

    return res.status(200).json({
      success: true,
      data: userWithSchool,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('first_name').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('last_name').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('school_id').optional().isUUID().withMessage('Invalid school ID format')
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const updateData = req.body;
    const updatedUser = await UserModel.updateProfile(req.user.id, updateData);

    // Remove password_hash from response
    const userWithoutPassword: any = { ...(updatedUser as any) };
    delete userWithoutPassword.password_hash;

    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { current_password, new_password } = req.body;

    // Get current user
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await UserModel.verifyPassword(user, current_password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.default.hash(new_password, saltRounds);

    // Update password
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    await pool.query(query, [newPasswordHash, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Add demo credits endpoint
router.post('/me/add-credits', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const creditsToAdd = 100; // Demo feature: add 100 credits

    // Add credits using the CreditTransactionModel
    const transaction = await CreditTransactionModel.addCredits(
      userId,
      creditsToAdd,
      'Demo credits added'
    );

    // Get updated user with new balance
    const updatedUser = await UserModel.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found after credit addition'
      });
    }

    // Remove password_hash from response
    const userWithoutPassword: any = { ...(updatedUser as any) };
    delete userWithoutPassword.password_hash;

    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        credits_added: creditsToAdd,
        transaction_id: transaction.id
      },
      message: 'Demo credits added successfully'
    });

  } catch (error) {
    console.error('Add credits error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add credits'
    });
  }
});

export default router; 