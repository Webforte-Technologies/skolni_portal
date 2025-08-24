import { z } from 'zod';

/**
 * Common Zod schemas used across the application
 */

// UUID validation schema
export const UUIDSchema = z.string().uuid('Invalid UUID format');

// Email validation schema
export const EmailSchema = z.string().email('Invalid email format').toLowerCase();

// Password validation schema
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long');

// Name validation schema (for first_name, last_name)
export const NameSchema = z.string()
  .trim()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name is too long');

// Text content validation schema
export const TextContentSchema = z.string()
  .trim()
  .min(1, 'Content cannot be empty')
  .max(10000, 'Content is too long');

// Message content validation schema
export const MessageContentSchema = z.string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message must be between 1 and 2000 characters');

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

// Date validation schema
export const DateSchema = z.string().datetime('Invalid date format');

// Optional date validation schema
export const OptionalDateSchema = z.string().datetime('Invalid date format').optional();

// Boolean validation schema
export const BooleanSchema = z.boolean();

// Credit amount validation schema
export const CreditAmountSchema = z.number()
  .int('Credits must be a whole number')
  .min(0, 'Credits cannot be negative');

// Positive integer schema
export const PositiveIntegerSchema = z.number()
  .int('Must be a whole number')
  .min(1, 'Must be a positive number');

// Non-negative integer schema
export const NonNegativeIntegerSchema = z.number()
  .int('Must be a whole number')
  .min(0, 'Cannot be negative');

// School subject schema
export const SchoolSubjectSchema = z.enum([
  'mathematics',
  'czech_language',
  'english_language',
  'physics',
  'chemistry',
  'biology',
  'history',
  'geography',
  'computer_science',
  'art',
  'music',
  'physical_education',
  'ethics',
  'general'
], {
  errorMap: () => ({ message: 'Invalid school subject' })
});

// Role validation schema
export const RoleSchema = z.enum(['teacher', 'school_admin', 'student'], {
  errorMap: () => ({ message: 'Invalid role' })
});

// Material type schema
export const MaterialTypeSchema = z.enum([
  'lesson_plan',
  'exercise',
  'test',
  'worksheet',
  'presentation',
  'assignment',
  'quiz'
], {
  errorMap: () => ({ message: 'Invalid material type' })
});

// Difficulty level schema
export const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'], {
  errorMap: () => ({ message: 'Invalid difficulty level' })
});

// GPT-4 model variants schema
export const GPT5ModelSchema = z.enum([
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4'
], {
  errorMap: () => ({ message: 'Invalid GPT-4 model variant' })
});

// Request priority schema
export const RequestPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent'], {
  errorMap: () => ({ message: 'Invalid request priority' })
});
