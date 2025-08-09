-- Force update of users.role check constraint to Phase 11 values
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE IF EXISTS users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('school_admin','teacher_school','teacher_individual'));

ALTER TABLE IF EXISTS users
  ALTER COLUMN role SET DEFAULT 'teacher_individual';


