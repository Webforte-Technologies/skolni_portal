import { z } from 'zod';

// Validation schema for analytics time range query
export const AnalyticsTimeRangeSchema = z.object({
  days: z.string().optional().default('30').refine(val => !isNaN(parseInt(val, 10)), {
    message: "Days must be a number string",
  }).transform(val => parseInt(val, 10)),
});

// Validation schema for model performance query
export const ModelPerformanceSchema = z.object({
  model: z.string().min(1),
  days: z.number().int().min(1).max(365).optional().default(30)
});

// Response schemas for type safety
export const MCPAnalyticsResponseSchema = z.object({
  totalRequests: z.number(),
  successRate: z.number(),
  averageResponseTime: z.number(),
  totalTokensUsed: z.number(),
  totalCost: z.number(),
  cacheHitRate: z.number(),
  
  requestsOverTime: z.array(z.object({
    date: z.string(),
    requests: z.number(),
    success: z.number(),
    errors: z.number()
  })),
  
  tokensOverTime: z.array(z.object({
    date: z.string(),
    tokens: z.number(),
    cost: z.number()
  })),
  
  responseTimeOverTime: z.array(z.object({
    date: z.string(),
    avg_response_time: z.number()
  })),
  
  modelStats: z.array(z.object({
    model: z.string(),
    requests: z.number(),
    success_rate: z.number(),
    avg_response_time: z.number(),
    total_tokens: z.number(),
    total_cost: z.number()
  })),
  
  providerHealth: z.array(z.object({
    provider: z.string(),
    status: z.string(),
    requests: z.number(),
    error_rate: z.number(),
    avg_response_time: z.number()
  })),
  
  requestTypeBreakdown: z.array(z.object({
    type: z.string(),
    count: z.number(),
    percentage: z.number()
  })),
  
  recentErrors: z.array(z.object({
    timestamp: z.string(),
    model: z.string(),
    error_code: z.string(),
    error_message: z.string(),
    user_id: z.string()
  })),
  
  cacheStats: z.object({
    total_cached_responses: z.number(),
    cache_hit_count: z.number(),
    cache_miss_count: z.number(),
    cache_efficiency: z.number(),
    avg_cache_ttl: z.number()
  })
});

export const ModelPerformanceResponseSchema = z.object({
  performance_over_time: z.array(z.object({
    date: z.string(),
    avg_response_time: z.number(),
    success_rate: z.number(),
    cost: z.number()
  })),
  usage_breakdown: z.array(z.object({
    hour: z.number(),
    requests: z.number()
  }))
});

export type AnalyticsTimeRangeRequest = z.infer<typeof AnalyticsTimeRangeSchema>;
export type ModelPerformanceRequest = z.infer<typeof ModelPerformanceSchema>;
export type MCPAnalyticsResponse = z.infer<typeof MCPAnalyticsResponseSchema>;
export type ModelPerformanceResponse = z.infer<typeof ModelPerformanceResponseSchema>;
