-- Phase 9: Analytics Optimization - Database Indexes and Performance Improvements
-- This migration adds indexes to improve analytics query performance

-- Add indexes for user activity queries
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id_created_at 
ON user_activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at 
ON user_activity_logs(created_at DESC);

-- Add indexes for users table analytics queries
CREATE INDEX IF NOT EXISTS idx_users_is_active_created_at 
ON users(is_active, created_at DESC) WHERE is_active = true;

-- Removed problematic DATE_TRUNC index - use application-level grouping instead
-- CREATE INDEX IF NOT EXISTS idx_users_created_at_month 
-- ON users(DATE_TRUNC('month', created_at)) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_school_id_is_active 
ON users(school_id, is_active) WHERE is_active = true;

-- Add indexes for generated_files analytics queries
CREATE INDEX IF NOT EXISTS idx_generated_files_created_at 
ON generated_files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_files_user_id_created_at 
ON generated_files(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_files_ai_subject_created_at 
ON generated_files(ai_subject, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_files_file_type_created_at 
ON generated_files(file_type, created_at DESC);

-- Removed problematic DATE function index - use created_at with date range queries instead
-- CREATE INDEX IF NOT EXISTS idx_generated_files_date_created 
-- ON generated_files(DATE(created_at));

-- Add indexes for credit_transactions analytics queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type_created_at 
ON credit_transactions(transaction_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id_type_created_at 
ON credit_transactions(user_id, transaction_type, created_at DESC);

-- Removed problematic DATE_TRUNC index - use application-level grouping instead
-- CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at_month 
-- ON credit_transactions(DATE_TRUNC('month', created_at));

-- Add indexes for schools analytics queries
CREATE INDEX IF NOT EXISTS idx_schools_is_active 
ON schools(is_active) WHERE is_active = true;

-- Add indexes for chat_sessions analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id_updated_at 
ON chat_sessions(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at 
ON chat_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at 
ON chat_sessions(updated_at DESC);

-- Add indexes for chat_messages analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id_created_at 
ON chat_messages(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON chat_messages(created_at DESC);

-- Add composite indexes for complex analytics queries
CREATE INDEX IF NOT EXISTS idx_users_school_credits_composite 
ON users(school_id, is_active, credits_balance) WHERE is_active = true;

-- Removed partial indexes with NOW() function - these would become stale over time
-- Consider using application-level filtering or scheduled index recreation instead
-- CREATE INDEX IF NOT EXISTS idx_generated_files_recent 
-- ON generated_files(created_at DESC, user_id) 
-- WHERE created_at >= NOW() - INTERVAL '90 days';

-- CREATE INDEX IF NOT EXISTS idx_user_activity_recent 
-- ON user_activity_logs(user_id, created_at DESC) 
-- WHERE created_at >= NOW() - INTERVAL '90 days';

-- Create materialized view for top schools analytics (optional optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_school_analytics AS
SELECT 
  s.id,
  s.name,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.is_active THEN u.id END) as active_users,
  COALESCE(SUM(ct.amount) FILTER (WHERE ct.transaction_type = 'usage'), 0) as total_credits_used,
  COUNT(DISTINCT gf.id) as total_materials_created,
  COUNT(DISTINCT CASE WHEN gf.created_at >= NOW() - INTERVAL '30 days' THEN gf.id END) as materials_last_30_days,
  MAX(u.last_login_at) as last_activity
FROM schools s
LEFT JOIN users u ON s.id = u.school_id
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
LEFT JOIN generated_files gf ON u.id = gf.user_id
WHERE s.is_active = true
GROUP BY s.id, s.name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_school_analytics_id 
ON mv_school_analytics(id);

-- Create indexes on materialized view for sorting
CREATE INDEX IF NOT EXISTS idx_mv_school_analytics_users 
ON mv_school_analytics(active_users DESC);

CREATE INDEX IF NOT EXISTS idx_mv_school_analytics_credits 
ON mv_school_analytics(total_credits_used DESC);

CREATE INDEX IF NOT EXISTS idx_mv_school_analytics_materials 
ON mv_school_analytics(total_materials_created DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_school_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_school_analytics;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get analytics performance recommendations
CREATE OR REPLACE FUNCTION get_analytics_performance_recommendations()
RETURNS TABLE(
  recommendation_type text,
  description text,
  priority text,
  estimated_impact text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'index_usage'::text,
    'Monitor index usage and consider dropping unused indexes'::text,
    'medium'::text,
    'Reduced storage and faster writes'::text
  UNION ALL
  SELECT 
    'query_optimization'::text,
    'Review slow queries and optimize WHERE clauses'::text,
    'high'::text,
    'Significantly faster query execution'::text
  UNION ALL
  SELECT 
    'materialized_views'::text,
    'Consider materialized views for frequently accessed aggregated data'::text,
    'medium'::text,
    'Faster complex analytics queries'::text
  UNION ALL
  SELECT 
    'partitioning'::text,
    'Consider table partitioning for large time-series data'::text,
    'low'::text,
    'Better performance on large datasets'::text;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON INDEX idx_user_activity_logs_user_id_created_at IS 'Optimizes user activity lookups by user and time range';
COMMENT ON INDEX idx_generated_files_created_at IS 'Optimizes material creation trend queries';
COMMENT ON INDEX idx_credit_transactions_type_created_at IS 'Optimizes credit usage analytics queries';
COMMENT ON MATERIALIZED VIEW mv_school_analytics IS 'Precomputed school statistics for faster analytics dashboard';

-- Log the completion
-- Note: Migration tracking is handled automatically by the migration runner
-- No manual insert needed as it uses the filename as the name
