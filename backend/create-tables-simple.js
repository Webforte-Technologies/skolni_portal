const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'eduai_asistent.db');
const db = new sqlite3.Database(dbPath);

function createTables() {
  console.log('🗄️  Creating database tables...');
  
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'teacher',
      school_id TEXT,
      credits_balance INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT datetime('now'),
      updated_at TEXT DEFAULT datetime('now')
    )
  `;
  
  db.run(createUsersTable, function(err) {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table created');
      
      // Create credit_transactions table
      const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS credit_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          transaction_type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          balance_before INTEGER NOT NULL,
          balance_after INTEGER NOT NULL,
          description TEXT,
          related_subscription_id TEXT,
          created_at TEXT DEFAULT datetime('now')
        )
      `;
      
      db.run(createTransactionsTable, function(err) {
        if (err) {
          console.error('❌ Error creating credit_transactions table:', err);
        } else {
          console.log('✅ Credit transactions table created');
          console.log('🎉 Tables created successfully!');
          db.close();
        }
      });
    }
  });
}

createTables(); 