BEGIN;

-- Loosen constraints to allow data normalization
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_role_check;

-- Ensure role can hold new values
ALTER TABLE IF EXISTS users ALTER COLUMN role TYPE VARCHAR(32);

-- Normalize existing roles from old schema to Phase 11 roles
UPDATE users SET role = 'school_admin' WHERE role = 'admin';
UPDATE users SET role = 'teacher_school' WHERE role = 'teacher' AND school_id IS NOT NULL;
UPDATE users SET role = 'teacher_individual' WHERE role = 'teacher' AND school_id IS NULL;

-- Re-apply the new check and default
ALTER TABLE IF EXISTS users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('school_admin','teacher_school','teacher_individual'));

ALTER TABLE IF EXISTS users
  ALTER COLUMN role SET DEFAULT 'teacher_individual';

COMMIT;


