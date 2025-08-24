-- Phase 24: Add login_failed activity type
-- Adds support for tracking failed login attempts as a distinct activity type

-- Update the CHECK constraint to include 'login_failed'
ALTER TABLE user_activity_logs DROP CONSTRAINT IF EXISTS user_activity_logs_activity_type_check;

ALTER TABLE user_activity_logs ADD CONSTRAINT user_activity_logs_activity_type_check 
CHECK (activity_type IN (
    'login', 'login_failed', 'logout', 'page_view', 'api_call', 'file_generated', 
    'conversation_started', 'credits_used', 'profile_updated', 
    'password_changed', 'email_verified', 'subscription_changed'
));

-- Add comment to document the new activity type
COMMENT ON COLUMN user_activity_logs.activity_type IS 'Type of user activity: login, login_failed, logout, page_view, api_call, file_generated, conversation_started, credits_used, profile_updated, password_changed, email_verified, subscription_changed';
