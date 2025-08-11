import pool from './connection';

async function checkDatabaseSchema() {
  try {
    console.log('🗄️  Checking database schema...');
    
    // Get all tables in the database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('📋 Existing tables:');
    existingTables.forEach(table => {
      console.log(`   ✅ ${table}`);
    });
    
    // Expected tables based on the application
    const expectedTables = [
      'schools',
      'users', 
      'subscriptions',
      'credit_transactions',
      'chat_sessions',
      'chat_messages',
      'conversations',
      'messages',
      'generated_files'
    ];
    
    console.log('\n🎯 Expected tables:');
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
      }
    });
    
    // Check for missing tables
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('\n🎉 All expected tables are present!');
    } else {
      console.log(`\n⚠️  Missing ${missingTables.length} table(s): ${missingTables.join(', ')}`);
    }
    
    // Check table structures for key tables
    console.log('\n🔍 Checking key table structures...');
    
    for (const table of ['users', 'schools', 'conversations', 'generated_files']) {
      if (existingTables.includes(table)) {
        try {
          const structureQuery = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = $1 
            ORDER BY ordinal_position
          `;
          
          const structureResult = await pool.query(structureQuery, [table]);
          console.log(`\n📊 ${table} table structure:`);
          structureResult.rows.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`   ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`);
          });
        } catch (error: any) {
          console.log(`   ❌ Error checking ${table} structure:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check database schema:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('\n📊 PostgreSQL connection closed');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkDatabaseSchema()
    .then(() => {
      console.log('\n✅ Schema check complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema check failed:', error);
      process.exit(1);
    });
}

export { checkDatabaseSchema };
