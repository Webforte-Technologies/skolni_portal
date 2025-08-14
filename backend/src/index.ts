import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './database/connection';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import conversationRoutes from './routes/conversations';
import schoolsRoutes from './routes/schools';
import filesRoutes from './routes/files';
import usersRoutes from './routes/users';
import foldersRoutes from './routes/folders';
import sharedMaterialsRoutes from './routes/shared-materials';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import notificationsRoutes from './routes/notifications';
import { metricsMiddleware } from './middleware/metrics';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = parseInt(process.env['PORT'] || '3001', 10);

// Security middleware
app.use(helmet());
// Compression and logging (configurable)
if ((process.env['ENABLE_COMPRESSION'] || 'true') === 'true') {
  app.use(compression());
}
const logFormat = process.env['LOG_FORMAT'] || 'dev';
if ((process.env['ENABLE_LOGGER'] || 'true') === 'true') {
  app.use(morgan(logFormat));
}

// CORS configuration - more flexible for production
const isDevelopment = process.env['NODE_ENV'] === 'development';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env['FRONTEND_URL']
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, check against allowed origins
    if (isDevelopment) {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In production, allow all origins (you can restrict this further if needed)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || String(15 * 60 * 1000), 10),
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Metrics middleware (must be before routes)
app.use(metricsMiddleware);

// Automatic SQL migrations runner (safe, idempotent).
// Enable by setting RUN_STARTUP_MIGRATIONS=true
async function runStartupMigrationsIfNeeded(): Promise<void> {
  if (process.env['RUN_STARTUP_MIGRATIONS'] !== 'true') return;
  try {
    // Resolve possible migrations directories both in dev (ts) and prod (dist)
    const candidates = [
      path.join(__dirname, 'database', 'migrations'),
      path.join(__dirname, 'migrations')
    ];
    const migrationsDir = candidates.find((p) => fs.existsSync(p));
    if (!migrationsDir) {
      console.warn('⚠️  No migrations directory found. Skipping startup migrations.');
      return;
    }

    // Ensure tracking table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if (rows.length) {
        continue; // already applied
      }
      const abs = path.join(migrationsDir, file);
      const sql = fs.readFileSync(abs, 'utf8');
      console.log(`📦 Applying migration: ${file}`);
      try {
        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await pool.query('COMMIT');
        console.log(`✅ Migration applied: ${file}`);
      } catch (e) {
        await pool.query('ROLLBACK');
        console.error(`❌ Migration failed: ${file}`, e);
        throw e;
      }
    }

    console.log('✅ All pending migrations applied');
  } catch (err) {
    console.error('⚠️  Startup migrations failed (continuing):', err);
  }
}

runStartupMigrationsIfNeeded().catch(() => void 0);

// Bootstrap platform admins from env (comma-separated emails)
async function bootstrapPlatformAdmins() {
  try {
    const emailsRaw = process.env['PLATFORM_ADMIN_EMAILS'];
    if (!emailsRaw) return;
    const emails = emailsRaw.split(',').map(e => e.trim()).filter(Boolean);
    for (const email of emails) {
      const result = await pool.query('UPDATE users SET role = $1, school_id = NULL WHERE email = $2 RETURNING id', ['platform_admin', email]);
      if (result.rowCount) {
        console.log(`🔒 Promoted platform admin: ${email}`);
      }
    }
  } catch (err) {
    console.warn('Failed to bootstrap platform admins:', err);
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  bootstrapPlatformAdmins().catch(() => void 0);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/shared-materials', sharedMaterialsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW() as current_time');
    
    res.status(200).json({
      status: 'OK',
      message: 'EduAI-Asistent Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        connected: true,
        current_time: dbTest.rows[0].current_time
      }
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Backend is running but database connection failed',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'EduAI-Asistent Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      ai: '/api/ai',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: unknown): void => {
  void _next;
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${_req.originalUrl} not found`
  });
});

// Start server only when not running in tests
if (process.env['NODE_ENV'] !== 'test') {
  // CORRECTED: Start server listening on 0.0.0.0 to be reachable in Docker
  app
    .listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 EduAI-Asistent Backend server running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`);
      console.log(`🤖 AI endpoints available at http://localhost:${PORT}/api/ai`);
      console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🔒 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
      console.log(
        `🗄️ Database config: ${process.env['DB_HOST']}:${process.env['DB_PORT']}/${process.env['DB_NAME']}`
      );
    })
    .on('error', (error) => {
      console.error('❌ Server failed to start:', error);
      process.exit(1);
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;