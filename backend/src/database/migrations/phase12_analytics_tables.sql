-- Phase 12: Analytics Tables Migration
-- Add analytics tables for dynamic admin statistics

-- Analytics cache table for storing pre-computed metrics
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key VARCHAR(255) NOT NULL,
  metric_value JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(metric_key)
);

-- Analytics events table for tracking real-time events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  session_id UUID,
  metadata JSONB
);

-- System alerts table for threshold-based alerts
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  metric_value NUMERIC,
  threshold_value NUMERIC,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB
);

-- Analytics table indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(metric_key);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred ON analytics_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_triggered ON system_alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_acknowledged_by ON system_alerts(acknowledged_by);

-- Insert some sample system alerts for testing
INSERT INTO system_alerts (alert_type, severity, message, metric_value, threshold_value) VALUES
('system_performance', 'low', 'Response time increased above normal threshold', 1200, 1000),
('database_connections', 'medium', 'Database connection pool reaching capacity', 85, 80),
('memory_usage', 'high', 'Memory usage exceeded 90%', 92, 90)
ON CONFLICT DO NOTHING;

-- Add comment to track migration
COMMENT ON TABLE analytics_cache IS 'Analytics cache table for storing pre-computed metrics';
COMMENT ON TABLE analytics_events IS 'Analytics events table for tracking real-time events';
COMMENT ON TABLE system_alerts IS 'System alerts table for threshold-based alerts';
