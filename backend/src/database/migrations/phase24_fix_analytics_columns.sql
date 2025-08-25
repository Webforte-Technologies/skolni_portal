-- Phase 24: Fix Analytics Columns for generated_files table
-- Add missing columns required for enhanced analytics

-- Add missing columns to generated_files table
ALTER TABLE generated_files 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS user_rating DECIMAL(2,1) CHECK (user_rating >= 1.0 AND user_rating <= 5.0);

-- Create trigger to automatically update updated_at for generated_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_generated_files_updated_at'
  ) THEN
    CREATE TRIGGER update_generated_files_updated_at 
      BEFORE UPDATE ON generated_files 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_generated_files_updated_at ON generated_files(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_files_session_id ON generated_files(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_status ON generated_files(status);
CREATE INDEX IF NOT EXISTS idx_generated_files_user_rating ON generated_files(user_rating);

-- Update existing records to have reasonable default values
UPDATE generated_files 
SET 
  updated_at = created_at,
  status = 'completed',
  user_rating = 4.0
WHERE updated_at IS NULL OR status IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN generated_files.updated_at IS 'Timestamp when the file was last updated';
COMMENT ON COLUMN generated_files.session_id IS 'Reference to the chat session that generated this file';
COMMENT ON COLUMN generated_files.status IS 'Status of the file generation process';
COMMENT ON COLUMN generated_files.user_rating IS 'User rating for the generated file (1.0-5.0)';
