-- Phase 11: Pre-consistency fix for users.school_id vs role
-- Ensure existing data won't violate the users_school_role_consistency constraint

BEGIN;

-- 1) teacher_individual must have NULL school_id
UPDATE users
SET school_id = NULL
WHERE role = 'teacher_individual' AND school_id IS NOT NULL;

-- 2) school_admin/teacher_school must have non-NULL school_id
-- If school_id is NULL, demote to teacher_individual to maintain consistency
UPDATE users
SET role = 'teacher_individual'
WHERE role IN ('teacher_school','school_admin') AND school_id IS NULL;

COMMIT;


