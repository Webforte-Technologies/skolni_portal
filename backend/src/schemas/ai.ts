import { z } from 'zod';
import { 
  UUIDSchema, 
  MessageContentSchema, 
  SchoolSubjectSchema, 
  MaterialTypeSchema, 
  DifficultyLevelSchema,
  GPT5ModelSchema,
  RequestPrioritySchema,
  PositiveIntegerSchema,
  NonNegativeIntegerSchema
} from './common';

/**
 * AI-related Zod schemas for MCP server and AI generation
 */

// Chat message schema
export const ChatMessageSchema = z.object({
  message: MessageContentSchema,
  session_id: UUIDSchema.optional(),
  conversation_id: UUIDSchema.optional(),
  subject: SchoolSubjectSchema.optional(),
  priority: RequestPrioritySchema.optional().default('normal')
});

// AI generation parameters schema
export const AIGenerationParametersSchema = z.object({
  subject: SchoolSubjectSchema,
  material_type: MaterialTypeSchema,
  difficulty_level: DifficultyLevelSchema,
  topic: z.string().trim().min(1, 'Topic is required').max(200, 'Topic is too long'),
  description: z.string().trim().min(1, 'Description is required').max(1000, 'Description is too long'),
  target_audience: z.string().trim().max(200, 'Target audience description is too long').optional(),
  language: z.string().default('cs-CZ'),
  custom_instructions: z.string().trim().max(500, 'Custom instructions are too long').optional(),
  generate_answers: z.boolean().default(true),
  question_count: PositiveIntegerSchema.optional(),
  max_tokens: PositiveIntegerSchema.optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  model_preference: GPT5ModelSchema.optional()
});

// Lesson plan generation schema
export const LessonPlanGenerationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  subject: z.string().trim().min(1, 'Subject is required').max(100, 'Subject is too long'),
  grade_level: z.string().trim().min(1, 'Grade level is required').max(50, 'Grade level is too long'),
  duration: z.string().trim().min(1, 'Duration is required').max(20, 'Duration is too long').optional(),
  assignment_description: z.string().trim().min(1, 'Assignment description is required').max(1000, 'Assignment description is too long').optional(),
  subtype_id: UUIDSchema.optional(),
  class_size: z.number().int().min(1).max(50).optional(),
  teaching_methods: z.array(z.string()).optional(),
  available_resources: z.array(z.string()).optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().trim().max(500, 'Custom instructions are too long').optional()
});

// Exercise generation schema
export const ExerciseGenerationSchema = z.object({
  subject: SchoolSubjectSchema,
  topic: z.string().trim().min(1, 'Topic is required').max(200, 'Topic is too long'),
  difficulty_level: DifficultyLevelSchema,
  exercise_type: z.enum(['multiple_choice', 'open_ended', 'fill_in_blanks', 'true_false', 'matching', 'calculation']),
  question_count: PositiveIntegerSchema.default(5),
  include_solutions: z.boolean().default(true),
  include_explanations: z.boolean().default(false),
  custom_instructions: z.string().trim().max(500, 'Custom instructions are too long').optional(),
  model_preference: GPT5ModelSchema.optional()
});

// Worksheet generation schema
export const WorksheetGenerationSchema = z.object({
  topic: z.string().trim().min(3, 'Topic must be between 3 and 200 characters').max(200).optional(),
  assignment_description: z.string().trim().min(10, 'Assignment description must be between 10 and 1000 characters').max(1000).optional(),
  subtype_id: UUIDSchema.optional(),
  question_count: z.number().int().min(5).max(100).optional(),
  difficulty: z.string().max(20).optional(),
  teaching_style: z.string().max(50).optional(),
  exercise_types: z.array(z.string()).optional(),
  include_answers: z.boolean().optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().max(500).optional()
});

// Lesson plan generation schema (enhanced)
export const EnhancedLessonPlanGenerationSchema = z.object({
  title: z.string().min(3, 'Title must be between 3 and 200 characters').max(200).optional(),
  subject: z.string().min(2, 'Subject must be between 2 and 100 characters').max(100).optional(),
  grade_level: z.string().min(2, 'Grade level must be between 2 and 100 characters').max(100).optional(),
  assignment_description: z.string().trim().min(10, 'Assignment description must be between 10 and 1000 characters').max(1000).optional(),
  subtype_id: UUIDSchema.optional(),
  duration: z.string().min(1).max(20).optional(),
  class_size: z.number().int().min(1).max(50).optional(),
  teaching_methods: z.array(z.string()).optional(),
  available_resources: z.array(z.string()).optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().max(500).optional()
});

// Batch materials generation schema
export const BatchMaterialsGenerationSchema = z.object({
  materials: z.array(z.object({
    type: z.enum(['worksheet', 'quiz', 'lesson-plan', 'project', 'presentation', 'activity']),
    title: z.string().min(3).max(200).optional(),
    subtype_id: UUIDSchema.optional()
  })).min(2, 'Materials array must contain 2-10 items').max(10),
  assignment_description: z.string().trim().min(10).max(1000).optional(),
  consistency_theme: z.string().max(200).optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().max(500).optional()
});

// Quiz generation schema
export const QuizGenerationSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  subject: z.string().min(2).max(100).optional(),
  grade_level: z.string().min(2).max(100).optional(),
  assignment_description: z.string().trim().min(10, 'Assignment description must be between 10 and 1000 characters').max(1000).optional(),
  subtype_id: UUIDSchema.optional(),
  question_count: z.number().int().min(5).max(100).optional(),
  time_limit: z.string().min(1).max(50).optional(),
  prompt_hint: z.string().max(500).optional(),
  question_types: z.array(z.string()).optional(),
  cognitive_levels: z.array(z.string()).optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().max(500).optional()
});

// Project generation schema
export const ProjectGenerationSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  subject: z.string().min(2).max(100).optional(),
  grade_level: z.string().min(2).max(100).optional(),
  assignment_description: z.string().trim().min(10).max(1000).optional(),
  subtype_id: UUIDSchema.optional()
});

// Presentation generation schema
export const PresentationGenerationSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  subject: z.string().min(2).max(100).optional(),
  grade_level: z.string().min(2).max(100).optional(),
  assignment_description: z.string().trim().min(10).max(1000).optional(),
  subtype_id: UUIDSchema.optional(),
  slide_count: z.number().int().min(5).max(50).optional(),
  presentation_style: z.string().optional(),
  target_audience: z.string().optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().max(500).optional()
});

// Activity generation schema
export const ActivityGenerationSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  subject: z.string().min(2).max(100).optional(),
  grade_level: z.string().min(2).max(100).optional(),
  duration: z.string().min(2).max(20).optional(),
  assignment_description: z.string().trim().min(10).max(1000).optional(),
  subtype_id: UUIDSchema.optional(),
  activity_type: z.string().optional(),
  group_size: z.number().int().min(1).max(10).optional(),
  required_materials: z.array(z.string()).optional(),
  quality_level: z.enum(['základní', 'standardní', 'vysoká', 'expertní']).optional(),
  custom_instructions: z.string().max(500).optional()
});

// Assignment analysis schema
export const AssignmentAnalysisSchema = z.object({
  description: z.string().trim().min(10, 'Assignment description must be between 10 and 1000 characters').max(1000)
});

// Analysis result schema
export const AnalysisResultSchema = z.object({
  analysis: z.object({}).passthrough()
});

// MCP request schema (internal)
export const MCPRequestSchema = z.object({
  id: UUIDSchema,
  type: z.enum(['chat', 'generation', 'analysis']),
  user_id: UUIDSchema,
  conversation_id: UUIDSchema.optional(),
  model_preference: GPT5ModelSchema.optional(),
  priority: RequestPrioritySchema.default('normal'),
  parameters: z.record(z.any()),
  metadata: z.object({
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
    timestamp: z.string().datetime(),
    session_id: UUIDSchema.optional()
  }),
  caching: z.object({
    enabled: z.boolean().default(true),
    ttl_seconds: NonNegativeIntegerSchema.optional(),
    cache_key: z.string().optional()
  }).optional()
});

// MCP response schema (internal)
export const MCPResponseSchema = z.object({
  id: UUIDSchema,
  request_id: UUIDSchema,
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  metadata: z.object({
    model_used: GPT5ModelSchema.optional(),
    tokens_used: NonNegativeIntegerSchema.optional(),
    processing_time_ms: NonNegativeIntegerSchema.optional(),
    cached: z.boolean().default(false),
    provider: z.string().optional()
  }),
  timestamp: z.string().datetime()
});

// AI provider configuration schema
export const AIProviderConfigSchema = z.object({
  id: UUIDSchema,
  name: z.string().trim().min(1),
  type: z.enum(['openai', 'anthropic', 'google', 'custom']),
  api_key: z.string().min(1),
  base_url: z.string().url().optional(),
  models: z.array(z.string()).min(1),
  rate_limits: z.object({
    requests_per_minute: PositiveIntegerSchema,
    tokens_per_minute: PositiveIntegerSchema.optional()
  }),
  priority: NonNegativeIntegerSchema.default(0),
  enabled: z.boolean().default(true),
  fallback_provider_id: UUIDSchema.optional()
});

// Model routing rule schema
export const ModelRoutingRuleSchema = z.object({
  id: UUIDSchema,
  name: z.string().trim().min(1),
  conditions: z.object({
    request_type: z.array(z.string()).optional(),
    subject: z.array(SchoolSubjectSchema).optional(),
    complexity: z.array(z.enum(['simple', 'medium', 'complex'])).optional(),
    real_time_required: z.boolean().optional(),
    multimodal_content: z.boolean().optional()
  }),
  target_model: GPT5ModelSchema,
  priority: NonNegativeIntegerSchema.default(0),
  enabled: z.boolean().default(true)
});

// Content validation schema
export const ContentValidationSchema = z.object({
  content: z.string().min(1),
  content_type: z.enum(['lesson_plan', 'exercise', 'test', 'general']),
  validation_rules: z.array(z.string()).optional(),
  check_inappropriate: z.boolean().default(true),
  check_accuracy: z.boolean().default(true),
  language: z.string().default('cs-CZ')
});

// Batch generation request schema
export const BatchGenerationRequestSchema = z.object({
  requests: z.array(AIGenerationParametersSchema).min(1).max(10),
  batch_options: z.object({
    parallel_processing: z.boolean().default(true),
    fail_fast: z.boolean().default(false),
    priority: RequestPrioritySchema.default('normal')
  }).optional()
});

// Type exports for TypeScript usage
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type AIGenerationParameters = z.infer<typeof AIGenerationParametersSchema>;
export type LessonPlanGeneration = z.infer<typeof LessonPlanGenerationSchema>;
export type ExerciseGeneration = z.infer<typeof ExerciseGenerationSchema>;
export type WorksheetGeneration = z.infer<typeof WorksheetGenerationSchema>;
export type EnhancedLessonPlanGeneration = z.infer<typeof EnhancedLessonPlanGenerationSchema>;
export type BatchMaterialsGeneration = z.infer<typeof BatchMaterialsGenerationSchema>;
export type QuizGeneration = z.infer<typeof QuizGenerationSchema>;
export type ProjectGeneration = z.infer<typeof ProjectGenerationSchema>;
export type PresentationGeneration = z.infer<typeof PresentationGenerationSchema>;
export type ActivityGeneration = z.infer<typeof ActivityGenerationSchema>;
export type AssignmentAnalysis = z.infer<typeof AssignmentAnalysisSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type MCPRequest = z.infer<typeof MCPRequestSchema>;
export type MCPResponse = z.infer<typeof MCPResponseSchema>;
export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;
export type ModelRoutingRule = z.infer<typeof ModelRoutingRuleSchema>;
export type ContentValidation = z.infer<typeof ContentValidationSchema>;
export type BatchGenerationRequest = z.infer<typeof BatchGenerationRequestSchema>;
