import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// This simplified config uses the DATABASE_URL you already set in Coolify.
// The `ssl` object ensures the connection works in production.
const pool = new Pool({
  // CORRECTED: Use bracket notation to satisfy the TypeScript strictness rule.
  connectionString: process.env['DATABASE_URL'],
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the connection
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;