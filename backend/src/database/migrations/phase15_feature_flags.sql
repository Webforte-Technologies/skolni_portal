-- Phase 15: Feature flags table

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


