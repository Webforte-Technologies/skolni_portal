-- Phase 16: AI Metadata and Content Analytics
-- Add missing columns for AI-powered features

-- Enable required extensions for GIN indexes
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Add AI metadata columns to generated_files table
ALTER TABLE generated_files 
ADD COLUMN IF NOT EXISTS ai_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS ai_subject VARCHAR(100),
ADD COLUMN IF NOT EXISTS ai_difficulty VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_grade_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_tags TEXT[],
ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_quality_score DECIMAL(3,2);

-- Add AI metadata columns to shared_materials table
ALTER TABLE shared_materials 
ADD COLUMN IF NOT EXISTS ai_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS ai_subject VARCHAR(100),
ADD COLUMN IF NOT EXISTS ai_difficulty VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_grade_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_tags TEXT[],
ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_quality_score DECIMAL(3,2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_files_ai_category ON generated_files(ai_category);
CREATE INDEX IF NOT EXISTS idx_generated_files_ai_subject ON generated_files(ai_subject);
CREATE INDEX IF NOT EXISTS idx_generated_files_ai_difficulty ON generated_files(ai_difficulty);
CREATE INDEX IF NOT EXISTS idx_generated_files_ai_grade_level ON generated_files(ai_grade_level);
CREATE INDEX IF NOT EXISTS idx_generated_files_ai_tags ON generated_files USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_generated_files_ai_quality_score ON generated_files(ai_quality_score);

CREATE INDEX IF NOT EXISTS idx_shared_materials_ai_category ON shared_materials(ai_category);
CREATE INDEX IF NOT EXISTS idx_shared_materials_ai_subject ON shared_materials(ai_subject);
CREATE INDEX IF NOT EXISTS idx_shared_materials_ai_difficulty ON shared_materials(ai_difficulty);
CREATE INDEX IF NOT EXISTS idx_shared_materials_ai_grade_level ON shared_materials(ai_grade_level);
CREATE INDEX IF NOT EXISTS idx_shared_materials_ai_tags ON shared_materials USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_shared_materials_ai_quality_score ON shared_materials(ai_quality_score);

-- Update existing records to have default values
UPDATE generated_files 
SET ai_category = 'Uncategorized', 
    ai_subject = 'General', 
    ai_difficulty = 'Medium', 
    ai_grade_level = 'Elementary',
    ai_tags = ARRAY['legacy'],
    ai_metadata = '{}',
    ai_quality_score = 0.75
WHERE ai_category IS NULL;

UPDATE shared_materials 
SET ai_category = 'Uncategorized', 
    ai_subject = 'General', 
    ai_difficulty = 'Medium', 
    ai_grade_level = 'Elementary',
    ai_tags = ARRAY['legacy'],
    ai_metadata = '{}',
    ai_quality_score = 0.75
WHERE ai_category IS NULL;
