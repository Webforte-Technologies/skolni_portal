-- Phase 24: User Status Audit Trail
-- Adds user status change history tracking

-- User Status History table - Track status changes with reasons and audit trail
CREATE TABLE IF NOT EXISTS user_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('active', 'suspended', 'pending_verification', 'inactive')),
    reason TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_status_history_user_id ON user_status_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_history_created_at ON user_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_status_history_new_status ON user_status_history(new_status);
CREATE INDEX IF NOT EXISTS idx_user_status_history_user_created ON user_status_history(user_id, created_at DESC);

-- Add trigger to automatically log status changes
CREATE OR REPLACE FUNCTION log_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO user_status_history (user_id, old_status, new_status, created_at)
        VALUES (NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_user_status_change ON users;
CREATE TRIGGER trigger_user_status_change
    AFTER UPDATE OF status ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_status_change();
