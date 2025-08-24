/**
 * Model Context Protocol (MCP) type definitions
 * Provides types for the MCP server implementation
 */

export interface MCPServerConfig {
  providers: AIProviderConfig[];
  routing_rules: ModelRoutingRule[];
  caching: {
    enabled: boolean;
    default_ttl: number;
    max_cache_size: number;
  };
  rate_limiting: {
    enabled: boolean;
    default_rpm: number;
    default_tpm: number;
  };
  fallback: {
    enabled: boolean;
    max_retries: number;
    backoff_strategy: 'linear' | 'exponential';
  };
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'custom';
  api_key: string;
  base_url?: string;
  models: string[];
  rate_limits: {
    requests_per_minute: number;
    tokens_per_minute?: number;
  };
  priority: number;
  enabled: boolean;
  fallback_provider_id?: string;
  health_check_url?: string;
  timeout_ms?: number;
}

export interface ModelRoutingRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  conditions: {
    request_type?: string[];
    subject?: string[];
    complexity?: ('simple' | 'medium' | 'complex')[];
    real_time_required?: boolean;
    multimodal_content?: boolean;
    user_role?: string[];
    token_limit?: {
      min?: number;
      max?: number;
    };
  };
  target_model: string;
  provider_id: string;
  description?: string;
}

export interface MCPRequest {
  id: string;
  type: 'chat' | 'generation' | 'analysis';
  user_id: string;
  conversation_id?: string;
  model_preference?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  parameters: Record<string, any>;
  metadata: {
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
    session_id?: string;
    user_role?: string;
  };
  caching?: {
    enabled: boolean;
    ttl_seconds?: number;
    cache_key?: string;
  };
}

export interface MCPResponse {
  id: string;
  request_id: string;
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
    retry_after?: number;
  };
  metadata: {
    model_used?: string;
    provider_used?: string;
    tokens_used?: number;
    processing_time_ms: number;
    cached: boolean;
    cost?: number;
    rate_limit_remaining?: number;
  };
  timestamp: string;
}

export interface CacheEntry {
  id: string;
  cache_key: string;
  request_hash: string;
  response_data: any;
  metadata: {
    model_used: string;
    provider_used: string;
    tokens_used: number;
    cost?: number;
  };
  created_at: string;
  expires_at: string;
  hit_count: number;
  last_accessed_at: string;
}

export interface ProviderHealthStatus {
  provider_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  last_check: string;
  response_time_ms?: number;
  error_rate: number;
  rate_limit_remaining?: number;
  models_available: string[];
}

export interface MCPAnalytics {
  time_period: {
    start: string;
    end: string;
  };
  request_stats: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    cached_requests: number;
    average_response_time_ms: number;
  };
  model_usage: {
    model: string;
    request_count: number;
    total_tokens: number;
    average_tokens_per_request: number;
    total_cost?: number;
  }[];
  provider_performance: {
    provider_id: string;
    request_count: number;
    success_rate: number;
    average_response_time_ms: number;
    error_count: number;
  }[];
  cost_analysis: {
    total_cost: number;
    cost_by_model: { model: string; cost: number }[];
    cost_by_provider: { provider: string; cost: number }[];
    cost_savings_from_cache: number;
  };
}

export interface StreamingResponse {
  id: string;
  request_id: string;
  chunk_index: number;
  data: string;
  finished: boolean;
  metadata?: {
    tokens_generated?: number;
    processing_time_ms?: number;
  };
}

export interface ModelCapability {
  model: string;
  provider: string;
  max_tokens: number;
  supports_streaming: boolean;
  supports_multimodal: boolean;
  supports_function_calling: boolean;
  input_cost_per_token: number;
  output_cost_per_token: number;
  context_window: number;
  languages_supported: string[];
}

export interface RateLimitInfo {
  provider_id: string;
  model?: string;
  requests_remaining: number;
  tokens_remaining?: number;
  reset_time: string;
  retry_after?: number;
}

export interface MCPError extends Error {
  code: string;
  details?: any;
  provider_id?: string;
  model?: string;
  retry_after?: number;
  retryable: boolean;
}

export interface FallbackResult {
  success: boolean;
  response?: MCPResponse;
  attempts: {
    provider_id: string;
    model: string;
    error?: string;
    response_time_ms?: number;
  }[];
  final_provider?: string;
  final_model?: string;
}

// Event types for MCP server
export type MCPEvent = 
  | { type: 'request_started'; data: MCPRequest }
  | { type: 'request_completed'; data: MCPResponse }
  | { type: 'request_failed'; data: { request: MCPRequest; error: MCPError } }
  | { type: 'cache_hit'; data: { request_id: string; cache_key: string } }
  | { type: 'cache_miss'; data: { request_id: string; cache_key: string } }
  | { type: 'provider_health_changed'; data: ProviderHealthStatus }
  | { type: 'rate_limit_exceeded'; data: RateLimitInfo }
  | { type: 'fallback_triggered'; data: { request_id: string; original_provider: string; fallback_provider: string } };

// Configuration for different GPT-4 models
export interface GPT5ModelConfig {
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-4';
  max_tokens: number;
  context_window: number;
  supports_multimodal: boolean;
  optimal_use_cases: string[];
  cost_tier: 'high' | 'medium' | 'low' | 'ultra-low';
  speed_tier: 'ultra-fast' | 'fast' | 'standard' | 'comprehensive';
  default_temperature: number;
  recommended_for: {
    request_types: string[];
    complexity_levels: string[];
    real_time: boolean;
  };
}

export const GPT5_MODEL_CONFIGS: Record<string, GPT5ModelConfig> = {
  'gpt-4o': {
    model: 'gpt-4o',
    max_tokens: 8192,
    context_window: 128000,
    supports_multimodal: true,
    optimal_use_cases: ['complex_lesson_planning', 'curriculum_development', 'advanced_analysis'],
    cost_tier: 'medium',
    speed_tier: 'comprehensive',
    default_temperature: 0.7,
    recommended_for: {
      request_types: ['lesson_plan', 'complex_generation', 'multimodal_analysis'],
      complexity_levels: ['medium', 'complex'],
      real_time: false
    }
  },
  'gpt-4o-mini': {
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    context_window: 32000,
    supports_multimodal: false,
    optimal_use_cases: ['simple_exercises', 'basic_questions', 'quick_explanations'],
    cost_tier: 'ultra-low',
    speed_tier: 'fast',
    default_temperature: 0.5,
    recommended_for: {
      request_types: ['chat', 'simple_generation', 'basic_analysis'],
      complexity_levels: ['simple'],
      real_time: true
    }
  },
  'gpt-4-turbo': {
    model: 'gpt-4-turbo',
    max_tokens: 6144,
    context_window: 64000,
    supports_multimodal: false,
    optimal_use_cases: ['standard_generation', 'balanced_performance', 'general_teaching_tasks'],
    cost_tier: 'medium',
    speed_tier: 'standard',
    default_temperature: 0.6,
    recommended_for: {
      request_types: ['generation', 'analysis', 'standard_chat'],
      complexity_levels: ['simple', 'medium'],
      real_time: false
    }
  },
  'gpt-4': {
    model: 'gpt-4',
    max_tokens: 8192,
    context_window: 8192,
    supports_multimodal: false,
    optimal_use_cases: ['legacy_support', 'stable_performance'],
    cost_tier: 'high',
    speed_tier: 'standard',
    default_temperature: 0.7,
    recommended_for: {
      request_types: ['generation', 'analysis'],
      complexity_levels: ['medium', 'complex'],
      real_time: false
    }
  }
};
