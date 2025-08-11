import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration that works for both local development and production
const pool = new Pool({
  // For local development, use individual environment variables
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  database: process.env['DB_NAME'] || 'eduai_asistent',
  user: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'],
  // Only use SSL in production (when DATABASE_URL is provided)
  ...(process.env['DATABASE_URL'] ? {
    connectionString: process.env['DATABASE_URL'],
    ssl: {
      rejectUnauthorized: false,
    },
  } : {
    // Local development - no SSL
    ssl: false,
  }),
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