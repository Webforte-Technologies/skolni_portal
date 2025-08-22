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

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('⚠️  Using default values for development. Set these in production.');
}

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
import analyticsRoutes from './routes/admin/analytics';
import notificationsRoutes from './routes/notifications';
import { metricsMiddleware } from './middleware/metrics';
import { realTimeService } from './services/RealTimeService';
import { webSocketService } from './services/WebSocketService';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = parseInt(process.env['PORT'] || '3001', 10);

// Set default values for critical environment variables
if (!process.env['JWT_SECRET']) {
  process.env['JWT_SECRET'] = 'dev-secret-key-change-in-production';
}
if (!process.env['JWT_REFRESH_SECRET']) {
  process.env['JWT_REFRESH_SECRET'] = 'dev-refresh-key-change-in-production';
}

// Security middleware
try {
  app.use(helmet());
  try {
    console.log('✅ Helmet security middleware configured');
  } catch (error) {
    console.warn('⚠️ Failed to log helmet configuration:', error);
  }
} catch (error) {
  try {
    console.warn('⚠️ Helmet configuration failed:', error);
  } catch (logError) {
    console.warn('⚠️ Failed to log helmet configuration failure:', logError);
  }
}

// Compression and logging (configurable)
if ((process.env['ENABLE_COMPRESSION'] || 'true') === 'true') {
  try {
    app.use(compression());
    try {
      console.log('✅ Compression middleware configured');
    } catch (error) {
      console.warn('⚠️ Failed to log compression configuration:', error);
    }
  } catch (error) {
    try {
      console.warn('⚠️ Compression configuration failed:', error);
    } catch (logError) {
      console.warn('⚠️ Failed to log compression configuration failure:', logError);
    }
  }
}

const logFormat = process.env['LOG_FORMAT'] || 'dev';
if ((process.env['ENABLE_LOGGER'] || 'true') === 'true') {
  try {
    app.use(morgan(logFormat));
    try {
      console.log('✅ Morgan logging middleware configured');
    } catch (error) {
      console.warn('⚠️ Failed to log morgan configuration:', error);
    }
  } catch (error) {
    try {
      console.warn('⚠️ Morgan logging configuration failed:', error);
    } catch (logError) {
      console.warn('⚠️ Failed to log morgan configuration failure:', logError);
    }
  }
}

// CORS configuration - more flexible for development and production
const isDevelopment = process.env['NODE_ENV'] === 'development';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:4173', // Vite preview port
  process.env['FRONTEND_URL']
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    try {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all localhost origins and specified origins
      if (isDevelopment) {
        // Allow any localhost origin for development
        if (origin.includes('localhost') || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          try {
            console.log('CORS blocked origin:', origin);
          } catch (error) {
            console.warn('⚠️ Failed to log CORS blocked origin:', error);
          }
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        // In production, allow all origins (you can restrict this further if needed)
        callback(null, true);
      }
    } catch (error) {
      try {
        console.error('CORS error:', error);
      } catch (logError) {
        console.warn('⚠️ Failed to log CORS error:', logError);
      }
      callback(error instanceof Error ? error : new Error('Unknown CORS error'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (configurable / skippable in development, enforced in tests)
const rateWindowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || String(15 * 60 * 1000), 10);
const rateMax = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10);
const isTestEnv = process.env['NODE_ENV'] === 'test';

try {
  const limiter = rateLimit({
    windowMs: rateWindowMs,
    max: rateMax,
    message: 'Too many requests from this IP, please try again later.',
    // In production always enforce. In development enforce only if explicitly enabled.
    // In tests always enforce (so we can assert behavior).
    skip: () => {
      if (isTestEnv) return false;
      const isProd = process.env['NODE_ENV'] === 'production';
      const enableInDev = process.env['ENABLE_RATE_LIMIT_IN_DEV'] === 'true';
      if (!isProd && !enableInDev) return true;
      return rateMax <= 0;
    },
  });
  app.use(limiter);
  try {
    console.log(`✅ Rate limiting configured: ${rateMax} requests per ${rateWindowMs / 1000 / 60} minutes`);
  } catch (error) {
    console.warn('⚠️ Failed to log rate limiting configuration:', error);
  }
} catch (error) {
  try {
    console.warn('⚠️ Rate limiting configuration failed, continuing without rate limiting:', error);
  } catch (logError) {
    console.warn('⚠️ Failed to log rate limiting configuration failure:', logError);
  }
}

// Body parsing middleware
try {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  try {
    console.log('✅ Body parsing middleware configured');
  } catch (error) {
    console.warn('⚠️ Failed to log body parsing configuration:', error);
  }
} catch (error) {
  try {
    console.warn('⚠️ Body parsing middleware configuration failed:', error);
  } catch (logError) {
    console.warn('⚠️ Failed to log body parsing middleware configuration failure:', logError);
  }
}

// Metrics middleware (must be before routes)
try {
  app.use(metricsMiddleware);
  try {
    console.log('✅ Metrics middleware configured');
  } catch (error) {
    console.warn('⚠️ Failed to log metrics configuration:', error);
  }
} catch (error) {
  try {
    console.warn('⚠️ Metrics middleware configuration failed:', error);
  } catch (logError) {
    console.warn('⚠️ Failed to log metrics middleware configuration failure:', logError);
  }
}

// Note: Health check and root endpoints are defined later in the file

// Test database connection
async function testDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    try {
      console.log('✅ Database connection successful');
    } catch (error) {
      console.warn('⚠️ Failed to log database connection success:', error);
    }
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    return false;
  }
}

// Automatic SQL migrations runner (safe, idempotent).
// Enable by setting RUN_STARTUP_MIGRATIONS=true
async function runStartupMigrationsIfNeeded(): Promise<void> {
  if (process.env['RUN_STARTUP_MIGRATIONS'] !== 'true') return;
  
  // Test database connection first
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    try {
      console.warn('⚠️  Skipping migrations due to database connection failure');
    } catch (error) {
      console.warn('⚠️ Failed to log startup migrations skip warning:', error);
    }
    return;
  }
  
  try {
    // Resolve possible migrations directories both in dev (ts) and prod (dist)
    const candidates = [
      path.join(__dirname, 'database', 'migrations'),
      path.join(__dirname, 'migrations')
    ];
    const migrationsDir = candidates.find((p) => fs.existsSync(p));
    if (!migrationsDir) {
      try {
        console.warn('⚠️  No migrations directory found. Skipping startup migrations.');
      } catch (error) {
        console.warn('⚠️ Failed to log no migrations directory warning:', error);
      }
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
      try {
        const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
        if (rows.length) {
          continue; // already applied
        }
        const abs = path.join(migrationsDir, file);
        let sql: string;
        try {
          sql = fs.readFileSync(abs, 'utf8');
        } catch (readError) {
          console.error(`❌ Failed to read migration file ${file}:`, readError);
          continue;
        }
        try {
          console.log(`📦 Applying migration: ${file}`);
        } catch (error) {
          console.warn(`⚠️ Failed to log migration start for ${file}:`, error);
        }
        try {
          await pool.query('BEGIN');
          await pool.query(sql);
          await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await pool.query('COMMIT');
          try {
            console.log(`✅ Migration applied: ${file}`);
          } catch (error) {
            console.warn(`⚠️ Failed to log migration success for ${file}:`, error);
          }
        } catch (e) {
          try {
            await pool.query('ROLLBACK');
          } catch (rollbackError) {
            console.error(`❌ Failed to rollback migration ${file}:`, rollbackError);
          }
          console.error(`❌ Migration failed: ${file}`, e);
          throw e;
        }
      } catch (fileError) {
        console.error(`❌ Failed to process migration file ${file}:`, fileError);
        // Continue with other migrations
      }
    }

    try {
      console.log('✅ All pending migrations applied');
    } catch (error) {
      console.warn('⚠️ Failed to log migrations completion:', error);
    }
  } catch (err) {
    try {
      console.error('⚠️  Startup migrations failed (continuing):', err);
    } catch (error) {
      console.warn('⚠️ Failed to log startup migrations failure:', error);
    }
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  // Test database connection at startup
  testDatabaseConnection().then((isConnected) => {
    if (isConnected) {
      runStartupMigrationsIfNeeded().catch((error) => {
        try {
          console.warn('⚠️ Startup migrations failed:', error);
        } catch (logError) {
          console.warn('⚠️ Failed to log startup migrations failure:', logError);
        }
      });
    } else {
      try {
        console.warn('⚠️ Skipping startup migrations due to database connection failure');
      } catch (error) {
        console.warn('⚠️ Failed to log startup migrations skip warning:', error);
      }
    }
  }).catch((error) => {
    try {
      console.warn('⚠️ Database connection test failed:', error);
    } catch (logError) {
      console.warn('⚠️ Failed to log database connection test failure:', logError);
    }
  });
}

// Bootstrap platform admins from env (comma-separated emails)
async function bootstrapPlatformAdmins() {
  try {
    const emailsRaw = process.env['PLATFORM_ADMIN_EMAILS'];
    if (!emailsRaw) return;
    
    const emails = emailsRaw.split(',').map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    
    for (const email of emails) {
      try {
        const result = await pool.query('UPDATE users SET role = $1, school_id = NULL WHERE email = $2 RETURNING id', ['platform_admin', email]);
        if (result.rowCount) {
          try {
            console.log(`🔒 Promoted platform admin: ${email}`);
          } catch (error) {
            console.warn(`⚠️ Failed to log platform admin promotion for ${email}:`, error);
          }
        } else {
          try {
            console.log(`⚠️  User not found for platform admin promotion: ${email}`);
          } catch (error) {
            console.warn(`⚠️ Failed to log platform admin promotion failure for ${email}:`, error);
          }
        }
      } catch (emailError) {
        console.warn(`Failed to promote user ${email} to platform admin:`, emailError);
      }
    }
  } catch (err) {
    try {
      console.warn('Failed to bootstrap platform admins:', err);
    } catch (error) {
      console.warn('⚠️ Failed to log platform admin bootstrap failure:', error);
    }
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  bootstrapPlatformAdmins().catch((error) => {
    console.warn('⚠️ Platform admin bootstrap failed:', error);
  });
}

// API Routes
try {
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
  app.use('/api/admin/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  try {
    console.log('✅ API routes configured');
  } catch (error) {
    console.warn('⚠️ Failed to log API routes configuration:', error);
  }
} catch (error) {
  try {
    console.error('❌ API routes configuration failed:', error);
  } catch (logError) {
    console.warn('⚠️ Failed to log API routes configuration failure:', logError);
  }
  process.exit(1);
}

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
    try {
      console.error('Health check failed:', error);
    } catch (logError) {
      console.warn('⚠️ Failed to log health check failure:', logError);
    }
    try {
      res.status(500).json({
        status: 'ERROR',
        message: 'Backend is running but database connection failed',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: {
          connected: false,
          error: error.message || 'Unknown database error'
        }
      });
    } catch (jsonError) {
      try {
        console.error('Failed to send health check error response:', jsonError);
      } catch (logError) {
        console.warn('⚠️ Failed to log health check error response failure:', logError);
      }
      res.status(500).send('Health check failed');
    }
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  try {
    res.json({
      message: 'EduAI-Asistent Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        ai: '/api/ai',
        admin: '/api/admin',
        analytics: '/api/admin/analytics',
        health: '/api/health'
      }
    });
  } catch (error) {
    try {
      console.error('Error in root endpoint:', error);
    } catch (logError) {
      console.warn('⚠️ Failed to log root endpoint error:', logError);
    }
    try {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate root endpoint response'
      });
    } catch (jsonError) {
      res.status(500).send('Internal Server Error');
    }
  }
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: unknown): void => {
  void _next;
  try {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong'
    });
  } catch (error) {
    console.error('Error in error handler:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
});

// 404 handler
app.use('*', (_req, res) => {
  try {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${_req.originalUrl} not found`
    });
  } catch (error) {
    console.error('Error in 404 handler:', error);
    res.status(404).json({
      error: 'Not Found',
      message: 'Route not found'
    });
  }
});

// Start server only when not running in tests
if (process.env['NODE_ENV'] !== 'test') {
  // CORRECTED: Start server listening on 0.0.0.0 to be reachable in Docker
  const server = app
    .listen(PORT, '0.0.0.0', () => {
      try {
        console.log(`🚀 EduAI-Asistent Backend server running on port ${PORT}`);
      } catch (error) {
        console.warn('⚠️ Failed to log server startup message:', error);
      }
      try {
        console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
        console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`);
        console.log(`🤖 AI endpoints available at http://localhost:${PORT}/api/ai`);
        console.log(`📈 Analytics endpoints available at http://localhost:${PORT}/api/admin/analytics`);
      } catch (error) {
        console.warn('⚠️ Failed to log endpoint information:', error);
      }
      try {
        console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      } catch (error) {
        console.warn('⚠️ Failed to log environment:', error);
      }
      try {
        console.log(`🔒 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
      } catch (error) {
        console.warn('⚠️ Failed to log CORS origins:', error);
      }
      try {
        console.log(
          `🗄️ Database config: ${process.env['DB_HOST'] || 'localhost'}:${process.env['DB_PORT'] || '5432'}/${process.env['DB_NAME'] || 'eduai_asistent'}`
        );
      } catch (error) {
        console.warn('⚠️ Failed to log database config:', error);
      }
      
      // Initialize real-time service
      try {
        realTimeService.initialize();
        console.log(`🔄 Real-time analytics service initialized`);
      } catch (error) {
        console.warn(`⚠️ Real-time service initialization failed:`, error);
        if (error instanceof Error) {
          console.warn('Error details:', error.message);
        }
      }
      
      // Initialize WebSocket service
      try {
        webSocketService.initialize(server);
        console.log(`🔌 WebSocket service initialized`);
      } catch (error) {
        console.warn(`⚠️ WebSocket service initialization failed:`, error);
        if (error instanceof Error) {
          console.warn('Error details:', error.message);
        }
      }
    })
    .on('error', (error) => {
      try {
        console.error('❌ Server failed to start:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          if (error.stack) {
            console.error('Stack trace:', error.stack);
          }
        }
      } catch (logError) {
        console.error('❌ Failed to log server startup error:', logError);
      }
      process.exit(1);
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  try {
    console.error('❌ Uncaught Exception:', error);
    // Give some time for logging before exit
    setTimeout(() => process.exit(1), 1000);
  } catch (logError) {
    console.error('❌ Failed to log uncaught exception:', logError);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Give some time for logging before exit
    setTimeout(() => process.exit(1), 1000);
  } catch (logError) {
    console.error('❌ Failed to log unhandled rejection:', logError);
    process.exit(1);
  }
});

export default app;