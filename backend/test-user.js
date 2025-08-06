const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'eduai_asistent.db');
const db = new sqlite3.Database(dbPath);

async function createTestUser() {
  try {
    console.log('🗄️  Creating test user...');
    
    // Hash the password
    const passwordHash = await bcrypt.hash('testpass123', 12);
    
    // Create a simple UUID
    const userId = 'test-user-' + Date.now();
    
    // Insert test user
    db.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, credits_balance, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, 'test@example.com', passwordHash, 'Test', 'User', 'teacher', 100, 1], function(err) {
      if (err) {
        console.error('❌ Error creating test user:', err);
      } else {
        console.log('✅ Test user created successfully!');
        console.log('📧 Email: test@example.com');
        console.log('🔑 Password: testpass123');
        console.log('💰 Credits: 100');
      }
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
  }
}

createTestUser(); 