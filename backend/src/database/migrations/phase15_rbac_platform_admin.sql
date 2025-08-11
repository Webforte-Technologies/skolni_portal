-- Phase 15: RBAC - add platform_admin global role

-- Widen role check to include platform_admin
ALTER TABLE IF EXISTS users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE IF EXISTS users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('platform_admin','school_admin','teacher_school','teacher_individual'));

-- Keep default as teacher_individual (unchanged)
ALTER TABLE IF EXISTS users
  ALTER COLUMN role SET DEFAULT 'teacher_individual';

-- Ensure existing partial unique indexes remain intact (re-create defensively)
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_individual
  ON users(email)
  WHERE role = 'teacher_individual';

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_school_email
  ON users(school_id, email)
  WHERE role IN ('teacher_school','school_admin');

-- Ensure role/school_id consistency constraint still present
-- Ensure consistency constraint exists and includes platform_admin
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_school_role_consistency;
ALTER TABLE users
  ADD CONSTRAINT users_school_role_consistency
  CHECK (
    (role IN ('teacher_school','school_admin') AND school_id IS NOT NULL)
    OR (role IN ('teacher_individual','platform_admin') AND school_id IS NULL)
  );


