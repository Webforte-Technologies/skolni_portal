import sqlite3 from 'sqlite3';
import path from 'path';

// Create database file in the project root
const dbPath = path.join(__dirname, '../../..', 'eduai_asistent.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Simple query function
const query = async (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows: rows || [] });
      }
    });
  });
};

// Simple run function for INSERT/UPDATE/DELETE
const run = async (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

// Initialize database tables
const initDatabase = async () => {
  try {
    console.log('🗄️  Initializing SQLite database...');
    
    // Create tables
    await run(`
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
    `);

    await run(`
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
    `);

    console.log('📊 SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Initialize database on import
initDatabase();

export { query, run }; 