-- Phase 25: Add duration_minutes column to chat_sessions table
-- This migration adds the missing duration_minutes column required for analytics

-- Add duration_minutes column to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

-- Add index for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_duration_minutes 
ON chat_sessions(duration_minutes) WHERE duration_minutes > 0;

-- Add comment for documentation
COMMENT ON COLUMN chat_sessions.duration_minutes IS 'Duration of the chat session in minutes';

-- Update existing records with a reasonable default based on message count
-- Estimate: 2 minutes per message on average
UPDATE chat_sessions 
SET duration_minutes = GREATEST(1, total_messages * 2)
WHERE duration_minutes = 0 OR duration_minutes IS NULL;
