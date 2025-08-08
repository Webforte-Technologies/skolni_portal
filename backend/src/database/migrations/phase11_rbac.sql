-- Phase 11 RBAC and Schools updates

-- 1) Schools: add logo_url
ALTER TABLE IF EXISTS schools
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2) Users: prepare role changes (drop old check, widen type)
ALTER TABLE IF EXISTS users
  ALTER COLUMN role TYPE VARCHAR(32);

ALTER TABLE IF EXISTS users
  DROP CONSTRAINT IF EXISTS users_role_check;

-- 2a) Data migration for existing roles BEFORE adding new check
UPDATE users SET role = 'school_admin' WHERE role = 'admin';
UPDATE users SET role = 'teacher_school' WHERE role = 'teacher' AND school_id IS NOT NULL;
UPDATE users SET role = 'teacher_individual' WHERE role = 'teacher' AND school_id IS NULL;

-- 2b) Add new check and default
ALTER TABLE IF EXISTS users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('school_admin','teacher_school','teacher_individual'));

ALTER TABLE IF EXISTS users
  ALTER COLUMN role SET DEFAULT 'teacher_individual';

-- 3) Users: drop global unique(email) if present (created by initial schema)
ALTER TABLE IF EXISTS users
  DROP CONSTRAINT IF EXISTS users_email_key;

-- 4) Users: add partial unique indexes for emails based on role
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_individual
  ON users(email)
  WHERE role = 'teacher_individual';

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_school_email
  ON users(school_id, email)
  WHERE role IN ('teacher_school','school_admin');

-- 5) Users: enforce school_id consistency with role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_school_role_consistency'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_school_role_consistency
      CHECK (
        (role IN ('teacher_school','school_admin') AND school_id IS NOT NULL)
        OR (role = 'teacher_individual' AND school_id IS NULL)
      );
  END IF;
END $$;

-- 6) Users: add indexes if missing
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);

-- (moved earlier to 2a)


