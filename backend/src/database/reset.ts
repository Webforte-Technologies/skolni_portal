import fs from 'fs';
import path from 'path';
import pool from './connection';

async function resetDatabase() {
  try {
    console.log('🗄️  Resetting database...');

    // Drop all existing tables in the correct order (due to foreign key constraints)
    console.log('🗑️  Dropping existing tables...');
    
    await pool.query('DROP TABLE IF EXISTS chat_messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS chat_sessions CASCADE');
    await pool.query('DROP TABLE IF EXISTS credit_transactions CASCADE');
    await pool.query('DROP TABLE IF EXISTS subscriptions CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP TABLE IF EXISTS schools CASCADE');
    
    console.log('✅ All tables dropped successfully');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schemaSQL);
    console.log('✅ Database schema recreated successfully');

    // Insert sample school data
    const sampleSchool = await pool.query(`
      INSERT INTO schools (name, city, contact_email) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `, ['Základní škola EduAI', 'Praha', 'info@eduai.cz']);

    console.log('✅ Sample school data inserted');

    // Insert sample admin user (must have school_id due to constraint)
    const bcrypt = await import('bcryptjs');
    const adminPasswordHash = await bcrypt.default.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, credits_balance, email_verified, school_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'admin@eduai.cz',
      adminPasswordHash,
      'Admin',
      'User',
      'school_admin',
      1000,
      true,
      sampleSchool.rows[0].id
    ]);

    console.log('✅ Sample admin user created (admin@eduai.cz / admin123)');

    // Insert sample teacher user
    const teacherPasswordHash = await bcrypt.default.hash('teacher123', 12);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, credits_balance, email_verified, school_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'teacher@eduai.cz',
      teacherPasswordHash,
      'Jan',
      'Novák',
      'teacher_school',
      100,
      true,
      sampleSchool.rows[0].id
    ]);

    console.log('✅ Sample teacher user created (teacher@eduai.cz / teacher123)');

    console.log('🎉 Database reset completed successfully!');
    console.log('\n📋 Sample credentials:');
    console.log('   Admin: admin@eduai.cz / admin123');
    console.log('   Teacher: teacher@eduai.cz / teacher123');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('📊 PostgreSQL connection closed');
  }
}

// Run reset if this file is executed directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('✅ Database reset complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database reset failed:', error);
      process.exit(1);
    });
}

export { resetDatabase };
