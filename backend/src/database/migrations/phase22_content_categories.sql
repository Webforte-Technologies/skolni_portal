-- Phase 22: Content Categories Management
-- Add content_categories table for organizing educational materials

-- Create content_categories table
CREATE TABLE IF NOT EXISTS content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES content_categories(id),
    subject VARCHAR(100),
    grade VARCHAR(100),
    color VARCHAR(7) DEFAULT '#4A90E2',
    icon VARCHAR(50) DEFAULT 'folder',
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    material_count INTEGER DEFAULT 0,
    user_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_categories_parent_id ON content_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_subject ON content_categories(subject);
CREATE INDEX IF NOT EXISTS idx_content_categories_status ON content_categories(status);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_tags ON content_categories USING GIN(tags);

-- Add unique constraint for slug
CREATE UNIQUE INDEX IF NOT EXISTS ux_content_categories_slug ON content_categories(slug);

-- Add trigger for updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_content_categories_updated_at 
      BEFORE UPDATE ON content_categories
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default content categories
INSERT INTO content_categories (name, description, slug, subject, grade, color, icon, tags) VALUES
('Matematika - Základní školy', 'Výukové materiály pro matematiku na základních školách', 'matematika-zs', 'Matematika', '1. - 9. třída', '#3B82F6', 'calculator', ARRAY['matematika', 'základní škola', 'výuka']),
('Český jazyk - Literatura', 'Literární texty a cvičení pro výuku českého jazyka', 'cesky-jazyk-literatura', 'Český jazyk', '6. - 9. třída', '#10B981', 'book-open', ARRAY['čeština', 'literatura', 'gramatika']),
('Anglický jazyk - Gramatika', 'Gramatická cvičení a testy pro anglický jazyk', 'anglicky-jazyk-gramatika', 'Anglický jazyk', '4. - 9. třída', '#F59E0B', 'globe', ARRAY['angličtina', 'gramatika', 'cvičení']),
('Fyzika - Mechanika', 'Výukové materiály pro mechaniku na středních školách', 'fyzika-mechanika', 'Fyzika', 'SŠ', '#8B5CF6', 'zap', ARRAY['fyzika', 'mechanika', 'střední škola']),
('Dějepis - Starověk', 'Materiály pro výuku starověkých dějin', 'dejepis-starovek', 'Dějepis', '6. - 9. třída', '#EF4444', 'landmark', ARRAY['dějepis', 'starověk', 'historie']);

-- Add content_categories_id column to generated_files if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generated_files' AND column_name = 'content_category_id'
  ) THEN
    ALTER TABLE generated_files ADD COLUMN content_category_id UUID REFERENCES content_categories(id);
    CREATE INDEX IF NOT EXISTS idx_generated_files_category_id ON generated_files(content_category_id);
  END IF;
END $$;
