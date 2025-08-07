import fs from 'fs';
import path from 'path';
import pool from './connection';

async function addMissingTables() {
  try {
    console.log('🗄️  Adding missing tables...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'missing-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sqlContent);
    
    console.log('✅ Missing tables added successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add missing tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
addMissingTables().catch(console.error);
