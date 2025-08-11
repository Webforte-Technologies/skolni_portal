const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debugSharing() {
  try {
    console.log('🔍 Debugging sharing system...');
    
    // 1. Check if we have any users
    const usersResult = await pool.query('SELECT id, email, first_name, last_name, role, school_id FROM users LIMIT 5');
    console.log('\n👥 Users found:', usersResult.rows.length);
    usersResult.rows.forEach((user, i) => {
      console.log(`  ${i+1}. ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role} - School: ${user.school_id || 'None'}`);
    });
    
    // 2. Check if we have any schools
    const schoolsResult = await pool.query('SELECT id, name FROM schools LIMIT 5');
    console.log('\n🏫 Schools found:', schoolsResult.rows.length);
    schoolsResult.rows.forEach((school, i) => {
      console.log(`  ${i+1}. ${school.name} (ID: ${school.id})`);
    });
    
    // 3. Check if we have any generated files
    const filesResult = await pool.query('SELECT id, title, user_id, file_type, created_at FROM generated_files LIMIT 5');
    console.log('\n📄 Generated files found:', filesResult.rows.length);
    filesResult.rows.forEach((file, i) => {
      console.log(`  ${i+1}. "${file.title}" (${file.file_type}) - User: ${file.user_id} - Created: ${file.created_at}`);
    });
    
    // 4. Check if we have any shared materials
    const sharedResult = await pool.query('SELECT COUNT(*) as count FROM shared_materials');
    console.log('\n📊 Total shared materials in database:', sharedResult.rows[0].count);
    
    if (parseInt(sharedResult.rows[0].count) > 0) {
      const sharedDetails = await pool.query(`
        SELECT 
          sm.*,
          gf.title,
          u.first_name,
          u.last_name,
          s.name as school_name
        FROM shared_materials sm
        JOIN generated_files gf ON sm.material_id = gf.id
        JOIN users u ON sm.shared_by_user_id = u.id
        JOIN schools s ON sm.school_id = s.id
        LIMIT 5
      `);
      
      console.log('\n📋 Shared materials details:');
      sharedDetails.rows.forEach((shared, i) => {
        console.log(`  ${i+1}. "${shared.title}" shared by ${shared.first_name} ${shared.last_name} in ${shared.school_name}`);
        console.log(`     Material ID: ${shared.material_id}, School ID: ${shared.school_id}, Shared at: ${shared.shared_at}`);
      });
    }
    
    // 5. Test the sharing logic manually
    if (filesResult.rows.length > 0 && usersResult.rows.length > 0 && schoolsResult.rows.length > 0) {
      const testFile = filesResult.rows[0];
      const testUser = usersResult.rows.find(u => u.school_id) || usersResult.rows[0];
      const testSchool = schoolsResult.rows[0];
      
      console.log('\n🧪 Testing sharing logic...');
      console.log(`  Test file: "${testFile.title}" (ID: ${testFile.id})`);
      console.log(`  Test user: ${testUser.first_name} ${testUser.last_name} (School: ${testUser.school_id || 'None'})`);
      console.log(`  Test school: ${testSchool.name} (ID: ${testSchool.id})`);
      
      // Check if this file is already shared
      const existingShare = await pool.query(
        'SELECT * FROM shared_materials WHERE material_id = $1 AND school_id = $2',
        [testFile.id, testUser.school_id || testSchool.id]
      );
      
      if (existingShare.rows.length > 0) {
        console.log('  ❌ File is already shared in this school');
      } else {
        console.log('  ✅ File is not shared yet - can be shared');
        
        // Try to share it manually
        try {
          const shareQuery = `
            INSERT INTO shared_materials (material_id, shared_by_user_id, school_id, folder_id, is_public)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `;
          
          const shareValues = [
            testFile.id, 
            testUser.id, 
            testUser.school_id || testSchool.id, 
            null, // no folder
            false  // not public
          ];
          
          const shareResult = await pool.query(shareQuery, shareValues);
          console.log('  ✅ Successfully shared file manually!');
          console.log('  📊 New shared material ID:', shareResult.rows[0].id);
          
        } catch (shareError) {
          console.log('  ❌ Failed to share file manually:', shareError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging sharing system:', error);
  } finally {
    await pool.end();
  }
}

debugSharing();
