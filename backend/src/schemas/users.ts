import { z } from 'zod';
import { 
  UUIDSchema, 
  EmailSchema, 
  NameSchema, 
  RoleSchema, 
  PaginationSchema,
  CreditAmountSchema,
  PositiveIntegerSchema
} from './common';

/**
 * User management-related Zod schemas
 */

// Create user schema (admin only)
export const CreateUserSchema = z.object({
  email: EmailSchema,
  first_name: NameSchema,
  last_name: NameSchema,
  role: RoleSchema,
  school_id: UUIDSchema.optional(),
  initial_credits: CreditAmountSchema.optional().default(0),
  send_invitation: z.boolean().default(true)
});

// Update user schema
export const UpdateUserSchema = z.object({
  first_name: NameSchema.optional(),
  last_name: NameSchema.optional(),
  email: EmailSchema.optional(),
  role: RoleSchema.optional(),
  school_id: UUIDSchema.optional(),
  is_active: z.boolean().optional()
});

// User search schema
export const UserSearchSchema = z.object({
  query: z.string().trim().max(100, 'Search query is too long').optional(),
  role: RoleSchema.optional(),
  school_id: UUIDSchema.optional(),
  is_active: z.boolean().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  ...PaginationSchema.shape
});

// Credit transaction schema
export const CreditTransactionSchema = z.object({
  user_id: UUIDSchema,
  amount: z.number().int(),
  transaction_type: z.enum(['purchase', 'usage', 'refund', 'bonus', 'admin_adjustment']),
  description: z.string().trim().max(200, 'Description is too long'),
  reference_id: UUIDSchema.optional(),
  expires_at: z.string().datetime().optional()
});

// Bulk credit assignment schema
export const BulkCreditAssignmentSchema = z.object({
  user_ids: z.array(UUIDSchema).min(1, 'At least one user must be selected'),
  credits: CreditAmountSchema,
  description: z.string().trim().max(200, 'Description is too long'),
  expires_at: z.string().datetime().optional()
});

// User invitation schema
export const UserInvitationSchema = z.object({
  email: EmailSchema,
  role: RoleSchema,
  school_id: UUIDSchema.optional(),
  invited_by: UUIDSchema,
  expires_at: z.string().datetime().optional(),
  custom_message: z.string().trim().max(500, 'Custom message is too long').optional()
});

// User preferences schema
export const UserPreferencesSchema = z.object({
  language: z.string().default('cs-CZ'),
  timezone: z.string().default('Europe/Prague'),
  email_notifications: z.object({
    weekly_summary: z.boolean().default(true),
    new_features: z.boolean().default(true),
    system_updates: z.boolean().default(true),
    marketing: z.boolean().default(false)
  }).optional(),
  ui_preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
    sidebar_collapsed: z.boolean().default(false),
    items_per_page: PositiveIntegerSchema.max(100).default(20)
  }).optional(),
  ai_preferences: z.object({
    default_subject: z.string().optional(),
    preferred_difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    auto_save_conversations: z.boolean().default(true),
    show_token_usage: z.boolean().default(false)
  }).optional()
});

// User activity schema
export const UserActivitySchema = z.object({
  user_id: UUIDSchema,
  activity_type: z.enum([
    'login', 'logout', 'password_change', 'profile_update',
    'chat_message', 'material_generation', 'conversation_create',
    'conversation_delete', 'file_upload', 'file_download'
  ]),
  description: z.string().trim().max(200),
  metadata: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional()
});

// User statistics schema
export const UserStatisticsSchema = z.object({
  user_id: UUIDSchema,
  date_from: z.string().datetime(),
  date_to: z.string().datetime(),
  include_metrics: z.array(z.enum([
    'chat_messages',
    'materials_generated',
    'credits_used',
    'login_frequency',
    'session_duration',
    'conversation_count'
  ])).optional()
});

// School member management schema
export const SchoolMemberSchema = z.object({
  user_id: UUIDSchema,
  school_id: UUIDSchema,
  role: RoleSchema,
  joined_at: z.string().datetime().optional(),
  permissions: z.array(z.string()).optional()
});

// Bulk user action schema
export const BulkUserActionSchema = z.object({
  user_ids: z.array(UUIDSchema).min(1, 'At least one user must be selected'),
  action: z.enum(['activate', 'deactivate', 'delete', 'reset_password', 'send_invitation']),
  reason: z.string().trim().max(200, 'Reason is too long').optional()
});

// Type exports for TypeScript usage
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserSearch = z.infer<typeof UserSearchSchema>;
export type CreditTransaction = z.infer<typeof CreditTransactionSchema>;
export type BulkCreditAssignment = z.infer<typeof BulkCreditAssignmentSchema>;
export type UserInvitation = z.infer<typeof UserInvitationSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type UserStatistics = z.infer<typeof UserStatisticsSchema>;
export type SchoolMember = z.infer<typeof SchoolMemberSchema>;
export type BulkUserAction = z.infer<typeof BulkUserActionSchema>;
