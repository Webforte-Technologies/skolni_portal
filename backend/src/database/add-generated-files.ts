import pool from './connection';

async function addGeneratedFilesTable() {
  try {
    console.log('🗄️  Adding generated_files table to database...');
    
    // SQL to create generated_files table
    const sql = `
      -- Create generated_files table to store AI-generated files
      CREATE TABLE IF NOT EXISTS generated_files (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content JSONB NOT NULL,
          file_type VARCHAR(50) NOT NULL DEFAULT 'worksheet',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for faster queries
      CREATE INDEX IF NOT EXISTS idx_generated_files_user_id ON generated_files(user_id);
      CREATE INDEX IF NOT EXISTS idx_generated_files_file_type ON generated_files(file_type);
      CREATE INDEX IF NOT EXISTS idx_generated_files_created_at ON generated_files(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_generated_files_user_type ON generated_files(user_id, file_type);

      -- Add comments for documentation
      COMMENT ON TABLE generated_files IS 'Stores AI-generated files like worksheets, tests, etc.';
      COMMENT ON COLUMN generated_files.content IS 'JSONB content of the generated file';
      COMMENT ON COLUMN generated_files.file_type IS 'Type of file (worksheet, test, lesson_plan, etc.)';
    `;
    
    // Execute the SQL
    await pool.query(sql);
    console.log('✅ Generated files table created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add generated files table:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('📊 PostgreSQL connection closed');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addGeneratedFilesTable()
    .then(() => {
      console.log('✅ Database update complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database update failed:', error);
      process.exit(1);
    });
}

export { addGeneratedFilesTable };
