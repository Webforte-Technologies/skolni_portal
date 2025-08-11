-- Phase 15: Moderation and Quality fields for generated_files

ALTER TABLE IF EXISTS generated_files
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS quality_score NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT;


