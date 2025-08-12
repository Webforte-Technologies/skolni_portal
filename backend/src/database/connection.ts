import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration that works for both local development and production
const useConnectionString = Boolean(process.env['DATABASE_URL']);
const isProduction = process.env['NODE_ENV'] === 'production';

// Allow explicit control via DB_SSL env: 'true' | 'false'.
// Defaults: if using connection string in production → SSL on; otherwise off.
const dbSslEnv = (process.env['DB_SSL'] || '').toLowerCase();
const sslOption = dbSslEnv === 'true'
  ? { rejectUnauthorized: false }
  : dbSslEnv === 'false'
    ? false
    : (useConnectionString && isProduction)
      ? { rejectUnauthorized: false }
      : false;

const pool = new Pool({
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  database: process.env['DB_NAME'] || 'eduai_asistent',
  user: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'],
  ...(useConnectionString ? { connectionString: process.env['DATABASE_URL'] } : {}),
  ssl: sslOption,
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