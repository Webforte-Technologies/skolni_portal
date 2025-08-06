const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'eduai_asistent.db');
const db = new sqlite3.Database(dbPath);

function createTables() {
  console.log('🗄️  Creating database tables...');
  
  // Create users table
  db.run(`
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
  `, function(err) {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table created');
    }
  });

  // Create credit_transactions table
  db.run(`
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
  `, function(err) {
    if (err) {
      console.error('❌ Error creating credit_transactions table:', err);
    } else {
      console.log('✅ Credit transactions table created');
    }
  });

  // Create chat_sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_name TEXT,
      total_messages INTEGER NOT NULL DEFAULT 0,
      credits_used INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT datetime('now'),
      updated_at TEXT DEFAULT datetime('now')
    )
  `, function(err) {
    if (err) {
      console.error('❌ Error creating chat_sessions table:', err);
    } else {
      console.log('✅ Chat sessions table created');
    }
  });

  // Create chat_messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      message_type TEXT NOT NULL,
      content TEXT NOT NULL,
      credits_cost INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT datetime('now')
    )
  `, function(err) {
    if (err) {
      console.error('❌ Error creating chat_messages table:', err);
    } else {
      console.log('✅ Chat messages table created');
      console.log('🎉 All tables created successfully!');
      db.close();
    }
  });
}

createTables(); 