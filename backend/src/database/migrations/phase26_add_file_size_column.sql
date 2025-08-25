-- Phase 26: Add file_size column to generated_files table
-- This column is required for analytics and content management

-- Add file_size column to generated_files table
ALTER TABLE generated_files 
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Create index for better performance on file_size queries
CREATE INDEX IF NOT EXISTS idx_generated_files_file_size ON generated_files(file_size);

-- Update existing records to calculate file_size from content
-- We'll calculate it as the length of the JSON content in bytes
UPDATE generated_files 
SET file_size = LENGTH(content::text)
WHERE file_size IS NULL;

-- Set a default value for any remaining NULL entries
UPDATE generated_files 
SET file_size = 0
WHERE file_size IS NULL;

-- Make the column NOT NULL after populating it
ALTER TABLE generated_files 
ALTER COLUMN file_size SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN generated_files.file_size IS 'Size of the generated file content in bytes';

-- Create a function to automatically calculate file_size on insert/update
CREATE OR REPLACE FUNCTION calculate_file_size()
RETURNS TRIGGER AS $$
BEGIN
  NEW.file_size := LENGTH(NEW.content::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update file_size
DROP TRIGGER IF EXISTS update_generated_files_file_size ON generated_files;
CREATE TRIGGER update_generated_files_file_size
  BEFORE INSERT OR UPDATE ON generated_files
  FOR EACH ROW
  EXECUTE FUNCTION calculate_file_size();
