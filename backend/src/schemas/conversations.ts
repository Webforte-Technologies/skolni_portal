import { z } from 'zod';
import { UUIDSchema, MessageContentSchema, SchoolSubjectSchema, PaginationSchema } from './common';

/**
 * Conversation and message-related Zod schemas
 */

// Create conversation schema
export const CreateConversationSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title is too long'),
  subject: SchoolSubjectSchema.optional(),
  description: z.string()
    .trim()
    .max(500, 'Description is too long')
    .optional()
});

// Update conversation schema
export const UpdateConversationSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title is too long')
    .optional(),
  subject: SchoolSubjectSchema.optional(),
  description: z.string()
    .trim()
    .max(500, 'Description is too long')
    .optional()
});

// Create message schema
export const CreateMessageSchema = z.object({
  conversation_id: UUIDSchema,
  content: MessageContentSchema,
  message_type: z.enum(['user', 'assistant']).default('user'),
  metadata: z.object({
    tokens_used: z.number().int().min(0).optional(),
    model_used: z.string().optional(),
    processing_time_ms: z.number().int().min(0).optional(),
    cost: z.number().min(0).optional()
  }).optional()
});

// Message search schema
export const MessageSearchSchema = z.object({
  conversation_id: UUIDSchema.optional(),
  query: z.string().trim().min(1, 'Search query is required').max(200, 'Search query is too long'),
  message_type: z.enum(['user', 'assistant', 'all']).default('all'),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  ...PaginationSchema.shape
});

// Conversation search schema
export const ConversationSearchSchema = z.object({
  query: z.string().trim().min(1, 'Search query is required').max(200, 'Search query is too long').optional(),
  subject: SchoolSubjectSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  has_messages: z.boolean().optional(),
  ...PaginationSchema.shape
});

// Conversation export schema
export const ConversationExportSchema = z.object({
  conversation_ids: z.array(UUIDSchema).min(1, 'At least one conversation must be selected'),
  format: z.enum(['json', 'csv', 'pdf', 'txt']).default('json'),
  include_metadata: z.boolean().default(false),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional()
});

// Conversation sharing schema
export const ConversationSharingSchema = z.object({
  conversation_id: UUIDSchema,
  recipient_email: z.string().email('Invalid email format'),
  permission_level: z.enum(['view', 'comment', 'edit']).default('view'),
  expiry_date: z.string().datetime().optional(),
  include_user_messages: z.boolean().default(true),
  include_assistant_messages: z.boolean().default(true)
});

// Conversation analytics schema
export const ConversationAnalyticsSchema = z.object({
  conversation_ids: z.array(UUIDSchema).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  group_by: z.enum(['day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum([
    'message_count', 
    'token_usage', 
    'response_time', 
    'user_engagement', 
    'cost'
  ])).min(1).default(['message_count'])
});

// Message rating schema
export const MessageRatingSchema = z.object({
  message_id: UUIDSchema,
  rating: z.number().int().min(1).max(5),
  feedback: z.string().trim().max(1000, 'Feedback is too long').optional()
});

// Conversation archival schema
export const ConversationArchivalSchema = z.object({
  conversation_ids: z.array(UUIDSchema).min(1),
  archive: z.boolean(),
  reason: z.string().trim().max(200, 'Reason is too long').optional()
});

// Type exports for TypeScript usage
export type CreateConversation = z.infer<typeof CreateConversationSchema>;
export type UpdateConversation = z.infer<typeof UpdateConversationSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type MessageSearch = z.infer<typeof MessageSearchSchema>;
export type ConversationSearch = z.infer<typeof ConversationSearchSchema>;
export type ConversationExport = z.infer<typeof ConversationExportSchema>;
export type ConversationSharing = z.infer<typeof ConversationSharingSchema>;
export type ConversationAnalytics = z.infer<typeof ConversationAnalyticsSchema>;
export type MessageRating = z.infer<typeof MessageRatingSchema>;
export type ConversationArchival = z.infer<typeof ConversationArchivalSchema>;
