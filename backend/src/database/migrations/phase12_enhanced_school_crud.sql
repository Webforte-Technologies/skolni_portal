-- Phase 12: Enhanced School CRUD Operations with Action Monitoring
-- Migration for enhanced school management features

-- Create school_activity_logs table
CREATE TABLE IF NOT EXISTS school_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create school_notifications table
CREATE TABLE IF NOT EXISTS school_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'general',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    sent_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create school_preferences table
CREATE TABLE IF NOT EXISTS school_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    preference_type VARCHAR(50) NOT NULL DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, preference_key)
);

-- Create school_status_history table
CREATE TABLE IF NOT EXISTS school_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Add new fields to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification', 'inactive'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS admin_activity_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS verification_required BOOLEAN DEFAULT FALSE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'basic';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS max_teachers INTEGER DEFAULT 50;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 1000;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_activity_logs_school_id ON school_activity_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_school_activity_logs_action_type ON school_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_school_activity_logs_created_at ON school_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_school_activity_logs_user_id ON school_activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_school_notifications_school_id ON school_notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_school_notifications_type ON school_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_school_notifications_sent_at ON school_notifications(sent_at);

CREATE INDEX IF NOT EXISTS idx_school_preferences_school_id ON school_preferences(school_id);
CREATE INDEX IF NOT EXISTS idx_school_preferences_key ON school_preferences(preference_key);

CREATE INDEX IF NOT EXISTS idx_school_status_history_school_id ON school_status_history(school_id);
CREATE INDEX IF NOT EXISTS idx_school_status_history_changed_at ON school_status_history(changed_at);

-- Insert default preferences for existing schools
INSERT INTO school_preferences (school_id, preference_key, preference_value, preference_type, is_public)
SELECT 
    id,
    'default_language',
    'cs-CZ',
    'string',
    true
FROM schools
WHERE id NOT IN (SELECT school_id FROM school_preferences WHERE preference_key = 'default_language');

INSERT INTO school_preferences (school_id, preference_key, preference_value, preference_type, is_public)
SELECT 
    id,
    'notification_enabled',
    'true',
    'boolean',
    true
FROM schools
WHERE id NOT IN (SELECT school_id FROM school_preferences WHERE preference_key = 'notification_enabled');

-- Insert initial status history for existing schools
INSERT INTO school_status_history (school_id, old_status, new_status, reason, changed_by_user_id)
SELECT 
    id,
    'unknown',
    'active',
    'Initial status from migration',
    NULL
FROM schools
WHERE id NOT IN (SELECT school_id FROM school_status_history);

-- Update existing schools to have proper status
UPDATE schools SET status = 'active' WHERE status IS NULL;
UPDATE schools SET last_activity_at = created_at WHERE last_activity_at IS NULL;
UPDATE schools SET admin_activity_at = created_at WHERE admin_activity_at IS NULL;
