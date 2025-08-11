-- Add folders and shared_materials tables for EduAI-Asistent
-- Simplified version without problematic constraints

-- Create folders table to organize materials
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    is_shared BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shared_materials table for school-wide sharing
CREATE TABLE IF NOT EXISTS shared_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES generated_files(id) ON DELETE CASCADE,
    shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add folder_id to generated_files table for organization
ALTER TABLE generated_files 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_school_id ON folders(school_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_folder_id ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_shared ON folders(is_shared);

CREATE INDEX IF NOT EXISTS idx_shared_materials_material_id ON shared_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_shared_materials_shared_by_user_id ON shared_materials(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_materials_school_id ON shared_materials(school_id);
CREATE INDEX IF NOT EXISTS idx_shared_materials_folder_id ON shared_materials(folder_id);

CREATE INDEX IF NOT EXISTS idx_generated_files_folder_id ON generated_files(folder_id);

-- Add comments for documentation
COMMENT ON TABLE folders IS 'Organizes materials into hierarchical folder structure';
COMMENT ON TABLE shared_materials IS 'Tracks materials shared within schools or publicly';
COMMENT ON COLUMN folders.parent_folder_id IS 'Self-referencing for nested folder structure';
COMMENT ON COLUMN folders.is_shared IS 'Whether the folder is shared within the school';

-- Create trigger to automatically update updated_at for folders
CREATE TRIGGER update_folders_updated_at 
    BEFORE UPDATE ON folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
