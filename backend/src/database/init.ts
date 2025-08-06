import fs from 'fs';
import path from 'path';
import pool from './connection';

async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schemaSQL);
    console.log('✅ Database schema created successfully');

    // Insert sample school data
    const sampleSchool = await pool.query(`
      INSERT INTO schools (name, city, contact_email) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `, ['Základní škola EduAI', 'Praha', 'info@eduai.cz']);

    console.log('✅ Sample school data inserted');

    // Insert sample admin user
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, credits_balance, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'admin@eduai.cz',
      adminPasswordHash,
      'Admin',
      'User',
      'admin',
      1000,
      true
    ]);

    console.log('✅ Sample admin user created (admin@eduai.cz / admin123)');

    // Insert sample teacher user
    const teacherPasswordHash = await bcrypt.hash('teacher123', 12);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, credits_balance, email_verified, school_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'teacher@eduai.cz',
      teacherPasswordHash,
      'Jan',
      'Novák',
      'teacher',
      100,
      true,
      sampleSchool.rows[0].id
    ]);

    console.log('✅ Sample teacher user created (teacher@eduai.cz / teacher123)');

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Sample credentials:');
    console.log('   Admin: admin@eduai.cz / admin123');
    console.log('   Teacher: teacher@eduai.cz / teacher123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase }; 