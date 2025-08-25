-- Test MCP Analytics Infrastructure
-- This script tests the MCP analytics system and populates sample data

-- Check if MCP tables exist
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_requests') as ai_requests_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_providers') as ai_providers_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_response_cache') as ai_response_cache_exists;

-- Check current data in MCP tables
SELECT 'ai_providers' as table_name, COUNT(*) as record_count FROM ai_providers
UNION ALL
SELECT 'ai_requests' as table_name, COUNT(*) as record_count FROM ai_requests
UNION ALL
SELECT 'ai_response_cache' as table_name, COUNT(*) as record_count FROM ai_response_cache;

-- Check request types distribution
SELECT 
  request_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ai_requests 
GROUP BY request_type
ORDER BY count DESC;

-- Check model usage
SELECT 
  model_used,
  COUNT(*) as request_count,
  SUM(tokens_used) as total_tokens,
  AVG(processing_time_ms) as avg_response_time_ms,
  SUM(cost) as total_cost
FROM ai_requests 
WHERE success = true
GROUP BY model_used
ORDER BY request_count DESC;

-- Check recent material generation requests (last 7 days)
SELECT 
  created_at,
  request_type,
  model_used,
  tokens_used,
  processing_time_ms,
  cost,
  success,
  cached
FROM ai_requests 
WHERE request_type = 'generation'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- Sample query to test MCP analytics service
-- This simulates what the MCPAnalyticsService.getAnalytics() method does
SELECT 
  COUNT(*) as total_requests,
  AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate,
  AVG(processing_time_ms) as avg_response_time,
  SUM(tokens_used) as total_tokens,
  SUM(cost) as total_cost,
  AVG(CASE WHEN cached THEN 1 ELSE 0 END) * 100 as cache_hit_rate
FROM ai_requests 
WHERE created_at >= NOW() - INTERVAL '30 days';
