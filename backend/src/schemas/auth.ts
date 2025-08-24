import { z } from 'zod';
import { EmailSchema, PasswordSchema, NameSchema, RoleSchema } from './common';

/**
 * Authentication-related Zod schemas
 */

// User registration schema
export const RegistrationSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  first_name: NameSchema,
  last_name: NameSchema,
  role: RoleSchema.optional().default('teacher')
});

// User login schema
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required')
});

// School registration schema
export const SchoolRegistrationSchema = z.object({
  school_name: z.string()
    .trim()
    .min(2, 'School name must be at least 2 characters long')
    .max(100, 'School name is too long'),
  admin_email: EmailSchema,
  admin_password: PasswordSchema,
  admin_first_name: NameSchema,
  admin_last_name: NameSchema,
  school_address: z.string()
    .trim()
    .min(5, 'School address must be at least 5 characters long')
    .max(200, 'School address is too long')
    .optional(),
  school_phone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
  school_website: z.string()
    .url('Invalid website URL')
    .optional()
});

// Password reset request schema
export const PasswordResetRequestSchema = z.object({
  email: EmailSchema
});

// Password reset schema
export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  new_password: PasswordSchema
});

// Change password schema
export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: PasswordSchema
});

// Update profile schema
export const UpdateProfileSchema = z.object({
  first_name: NameSchema.optional(),
  last_name: NameSchema.optional(),
  email: EmailSchema.optional()
});

// Token refresh schema
export const TokenRefreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
});

// JWT token payload schema (for validation)
export const JWTPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: EmailSchema,
  role: RoleSchema,
  school_id: z.string().uuid().optional(),
  iat: z.number(),
  exp: z.number()
});

// Type exports for TypeScript usage
export type RegistrationData = z.infer<typeof RegistrationSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type SchoolRegistrationData = z.infer<typeof SchoolRegistrationSchema>;
export type PasswordResetRequestData = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof PasswordResetSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
export type TokenRefreshData = z.infer<typeof TokenRefreshSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
