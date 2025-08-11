-- Phase 15: Audit logs table

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INT NOT NULL,
  action TEXT,
  ip TEXT,
  user_agent TEXT,
  meta JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_occurred_at ON audit_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_path ON audit_logs(path);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);


