-- Phase 19: MCP (Model Context Protocol) Infrastructure
-- Creates tables for AI provider management, request logging, caching, and model routing

-- AI Providers table - Store AI provider configurations
CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('openai', 'anthropic', 'google', 'custom')),
    api_key TEXT NOT NULL,
    base_url TEXT,
    models JSONB NOT NULL DEFAULT '[]',
    rate_limits JSONB NOT NULL DEFAULT '{"requests_per_minute": 60, "tokens_per_minute": 150000}',
    priority INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    fallback_provider_id UUID REFERENCES ai_providers(id),
    health_check_url TEXT,
    timeout_ms INTEGER DEFAULT 30000,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Requests table - Log all AI requests for analytics and debugging
CREATE TABLE IF NOT EXISTS ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('chat', 'generation', 'analysis')),
    provider_id UUID REFERENCES ai_providers(id),
    model_used VARCHAR(100),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    parameters JSONB NOT NULL DEFAULT '{}',
    response_data JSONB,
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    cost DECIMAL(10, 6) DEFAULT 0,
    success BOOLEAN NOT NULL DEFAULT false,
    error_code VARCHAR(100),
    error_message TEXT,
    cached BOOLEAN NOT NULL DEFAULT false,
    cache_key VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Response Cache table - Cache AI responses for cost optimization
CREATE TABLE IF NOT EXISTS ai_response_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    request_hash VARCHAR(64) NOT NULL,
    response_data JSONB NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES ai_providers(id),
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Model Routing Rules table - Rules for intelligent model selection
CREATE TABLE IF NOT EXISTS model_routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    conditions JSONB NOT NULL DEFAULT '{}',
    target_model VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES ai_providers(id),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GPT-5 Model Configurations table - GPT-5 specific model configurations
CREATE TABLE IF NOT EXISTS gpt5_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(50) NOT NULL UNIQUE CHECK (model_name IN ('gpt-5o', 'gpt-5o-mini', 'gpt-5o-flash', 'gpt-5o-turbo')),
    max_tokens INTEGER NOT NULL,
    context_window INTEGER NOT NULL,
    supports_multimodal BOOLEAN NOT NULL DEFAULT false,
    cost_tier VARCHAR(20) NOT NULL CHECK (cost_tier IN ('ultra-low', 'low', 'medium', 'high')),
    speed_tier VARCHAR(20) NOT NULL CHECK (speed_tier IN ('ultra-fast', 'fast', 'standard', 'comprehensive')),
    default_temperature DECIMAL(3, 2) DEFAULT 0.7,
    optimal_use_cases JSONB DEFAULT '[]',
    recommended_for JSONB DEFAULT '{}',
    input_cost_per_token DECIMAL(10, 8),
    output_cost_per_token DECIMAL(10, 8),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Performance Metrics table - Track performance of different models
CREATE TABLE IF NOT EXISTS model_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES ai_providers(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    avg_tokens_per_request DECIMAL(8, 2) DEFAULT 0,
    cache_hit_rate DECIMAL(5, 4) DEFAULT 0,
    user_satisfaction_avg DECIMAL(3, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_name, provider_id, date)
);

-- Provider Health Status table - Track AI provider health and availability
CREATE TABLE IF NOT EXISTS provider_health_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES ai_providers(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER,
    error_rate DECIMAL(5, 4) DEFAULT 0,
    rate_limit_remaining INTEGER,
    models_available JSONB DEFAULT '[]',
    last_error TEXT,
    check_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- MCP Server Configuration table - Store server-wide MCP settings
CREATE TABLE IF NOT EXISTS mcp_server_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_provider_model ON ai_requests(provider_id, model_used);
CREATE INDEX IF NOT EXISTS idx_ai_requests_conversation_id ON ai_requests(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_response_cache_key ON ai_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_response_cache_expires_at ON ai_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_response_cache_provider ON ai_response_cache(provider_id);

CREATE INDEX IF NOT EXISTS idx_model_routing_rules_priority ON model_routing_rules(priority DESC, enabled);
CREATE INDEX IF NOT EXISTS idx_model_routing_rules_provider ON model_routing_rules(provider_id);

CREATE INDEX IF NOT EXISTS idx_model_performance_date ON model_performance_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_model_performance_provider_model ON model_performance_metrics(provider_id, model_name);

CREATE INDEX IF NOT EXISTS idx_provider_health_provider_id ON provider_health_status(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_health_timestamp ON provider_health_status(check_timestamp DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_model_routing_rules_updated_at BEFORE UPDATE ON model_routing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gpt5_model_configs_updated_at BEFORE UPDATE ON gpt5_model_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mcp_server_config_updated_at BEFORE UPDATE ON mcp_server_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default OpenAI provider
INSERT INTO ai_providers (name, type, api_key, models, rate_limits, priority, enabled) 
VALUES (
    'OpenAI GPT-5',
    'openai',
    'your-openai-api-key-here',
    '["gpt-5o", "gpt-5o-mini", "gpt-5o-flash", "gpt-5o-turbo"]',
    '{"requests_per_minute": 100, "tokens_per_minute": 200000}',
    0,
    true
) ON CONFLICT (name) DO NOTHING;

-- Insert GPT-5 model configurations
INSERT INTO gpt5_model_configs (
    model_name, max_tokens, context_window, supports_multimodal, cost_tier, speed_tier, 
    default_temperature, optimal_use_cases, recommended_for
) VALUES 
(
    'gpt-5o',
    8192,
    128000,
    true,
    'high',
    'comprehensive',
    0.7,
    '["complex_lesson_planning", "curriculum_development", "advanced_analysis"]',
    '{"request_types": ["lesson_plan", "complex_generation", "multimodal_analysis"], "complexity_levels": ["medium", "complex"], "real_time": false}'
),
(
    'gpt-5o-mini',
    4096,
    32000,
    false,
    'ultra-low',
    'fast',
    0.5,
    '["simple_exercises", "basic_questions", "quick_explanations"]',
    '{"request_types": ["chat", "simple_generation", "basic_analysis"], "complexity_levels": ["simple"], "real_time": true}'
),
(
    'gpt-5o-flash',
    2048,
    16000,
    false,
    'low',
    'ultra-fast',
    0.3,
    '["real_time_chat", "instant_feedback", "quick_responses"]',
    '{"request_types": ["chat", "real_time_assistance"], "complexity_levels": ["simple", "medium"], "real_time": true}'
),
(
    'gpt-5o-turbo',
    6144,
    64000,
    false,
    'medium',
    'standard',
    0.6,
    '["standard_generation", "balanced_performance", "general_teaching_tasks"]',
    '{"request_types": ["generation", "analysis", "standard_chat"], "complexity_levels": ["simple", "medium"], "real_time": false}'
) ON CONFLICT (model_name) DO NOTHING;

-- Insert default routing rules
INSERT INTO model_routing_rules (name, priority, enabled, conditions, target_model, provider_id) 
SELECT 
    'Real-time Chat - Flash Model',
    100,
    true,
    '{"request_type": ["chat"], "real_time_required": true}',
    'gpt-5o-flash',
    p.id
FROM ai_providers p WHERE p.name = 'OpenAI GPT-5'
ON CONFLICT DO NOTHING;

INSERT INTO model_routing_rules (name, priority, enabled, conditions, target_model, provider_id) 
SELECT 
    'Simple Tasks - Mini Model',
    90,
    true,
    '{"complexity": ["simple"], "request_type": ["chat", "simple_generation"]}',
    'gpt-5o-mini',
    p.id
FROM ai_providers p WHERE p.name = 'OpenAI GPT-5'
ON CONFLICT DO NOTHING;

INSERT INTO model_routing_rules (name, priority, enabled, conditions, target_model, provider_id) 
SELECT 
    'Complex Tasks - Full Model',
    80,
    true,
    '{"complexity": ["complex"], "multimodal_content": true}',
    'gpt-5o',
    p.id
FROM ai_providers p WHERE p.name = 'OpenAI GPT-5'
ON CONFLICT DO NOTHING;

INSERT INTO model_routing_rules (name, priority, enabled, conditions, target_model, provider_id) 
SELECT 
    'Standard Tasks - Turbo Model',
    70,
    true,
    '{"complexity": ["medium"], "request_type": ["generation", "analysis"]}',
    'gpt-5o-turbo',
    p.id
FROM ai_providers p WHERE p.name = 'OpenAI GPT-5'
ON CONFLICT DO NOTHING;

-- Insert default MCP server configuration
INSERT INTO mcp_server_config (config_key, config_value, description) VALUES
('caching', '{"enabled": true, "default_ttl": 3600, "max_cache_size": 10000}', 'Response caching configuration'),
('rate_limiting', '{"enabled": true, "default_rpm": 100, "default_tpm": 200000}', 'Rate limiting configuration'),
('fallback', '{"enabled": true, "max_retries": 3, "backoff_strategy": "exponential"}', 'Fallback and retry configuration'),
('health_check', '{"enabled": true, "interval_seconds": 300, "timeout_ms": 5000}', 'Provider health check configuration'),
('analytics', '{"enabled": true, "retention_days": 90, "detailed_logging": true}', 'Analytics and logging configuration')
ON CONFLICT (config_key) DO NOTHING;

-- Create view for provider performance summary
CREATE OR REPLACE VIEW provider_performance_summary AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.enabled,
    COALESCE(h.status, 'unknown') as health_status,
    COALESCE(SUM(m.request_count), 0) as total_requests_last_30_days,
    COALESCE(AVG(m.avg_response_time_ms), 0) as avg_response_time,
    COALESCE(AVG(m.cache_hit_rate), 0) as avg_cache_hit_rate,
    COALESCE(SUM(m.total_cost), 0) as total_cost_last_30_days
FROM ai_providers p
LEFT JOIN provider_health_status h ON p.id = h.provider_id 
    AND h.check_timestamp = (
        SELECT MAX(check_timestamp) 
        FROM provider_health_status h2 
        WHERE h2.provider_id = p.id
    )
LEFT JOIN model_performance_metrics m ON p.id = m.provider_id 
    AND m.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.type, p.enabled, h.status;

COMMENT ON TABLE ai_providers IS 'Configuration for AI providers (OpenAI, Anthropic, etc.)';
COMMENT ON TABLE ai_requests IS 'Log of all AI requests for analytics and debugging';
COMMENT ON TABLE ai_response_cache IS 'Cache for AI responses to reduce costs and improve performance';
COMMENT ON TABLE model_routing_rules IS 'Rules for intelligent model selection based on request characteristics';
COMMENT ON TABLE gpt5_model_configs IS 'Configuration and capabilities of GPT-5 model variants';
COMMENT ON TABLE model_performance_metrics IS 'Performance metrics for different AI models';
COMMENT ON TABLE provider_health_status IS 'Health and availability status of AI providers';
COMMENT ON TABLE mcp_server_config IS 'Server-wide configuration for the MCP system';

-- Note: VACUUM ANALYZE statements removed as they cannot run inside transaction blocks
-- These should be run manually after migration completion if needed for performance optimization
