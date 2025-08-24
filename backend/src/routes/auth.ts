import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { generateToken, authenticateToken, RequestWithUser } from '../middleware/auth';
import { validateBody } from '../middleware/zodValidation';
import { logUserAction } from '../middleware/activity-logger';
import pool from '../database/connection';
import { CreateUserRequest, LoginRequest, AuthResponse, CreateSchoolRequest, User } from '../types/database';
import { 
  RegistrationSchema, 
  LoginSchema, 
  SchoolRegistrationSchema,

  ChangePasswordSchema,
  UpdateProfileSchema
} from '../schemas/auth';

const router = Router();

// Register new school + admin user
router.post('/register-school', validateBody(SchoolRegistrationSchema), async (req: Request, res: Response) => {

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
router.post('/register', validateBody(RegistrationSchema), async (req: Request, res: Response) => {
  try {

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
router.post('/login', validateBody(LoginSchema), async (req: Request, res: Response) => {
  try {

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Log failed login attempt (no user found) - skip user logging for unknown users
      // TODO: Implement anonymous activity logging for security monitoring
      
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      // Log failed login attempt (deactivated account)
      await logUserAction(user.id, 'login_failed', {
        email: user.email,
        reason: 'account_deactivated',
        timestamp: new Date().toISOString()
      }, req);
      
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(user, password);
    if (!isValidPassword) {
      // Log failed login attempt (wrong password)
      await logUserAction(user.id, 'login_failed', {
        email: user.email,
        reason: 'invalid_password',
        timestamp: new Date().toISOString()
      }, req);
      
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Log successful login
    await logUserAction(user.id, 'login', {
      email: user.email,
      timestamp: new Date().toISOString(),
      success: true
    }, req);

    // Update last login timestamp
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = COALESCE(login_count, 0) + 1 WHERE id = $1',
      [user.id]
    );

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
router.get('/profile', authenticateToken, async (req: RequestWithUser, res: Response) => {
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
router.put('/profile', authenticateToken, validateBody(UpdateProfileSchema), async (req: RequestWithUser, res: Response) => {
  try {

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
router.put('/change-password', authenticateToken, validateBody(ChangePasswordSchema), async (req: RequestWithUser, res: Response) => {
  try {

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
router.post('/me/add-credits', authenticateToken, async (req: RequestWithUser, res: Response) => {
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