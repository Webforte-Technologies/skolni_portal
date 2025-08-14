-- Phase 21: Notifications schema

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NULL REFERENCES schools(id) ON DELETE CASCADE,
    severity VARCHAR(16) NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','error')),
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    meta JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT notifications_owner_present CHECK (user_id IS NOT NULL OR school_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_school_created_at ON notifications(school_id, created_at DESC);


