import express from 'express';
import { authenticateToken, requireRole, RequestWithUser } from '../../middleware/auth';
import { auditLoggerForAdmin } from '../../middleware/audit';
import { AnalyticsService } from '../../services/AnalyticsService';
import { realTimeService } from '../../services/RealTimeService';
import { webSocketService } from '../../services/WebSocketService';
import { enhancedMetricsMiddleware, getEnhancedMetrics } from '../../middleware/enhanced-metrics';
import pool from '../../database/connection';
import { MCPAnalyticsService } from '../../services/MCPAnalyticsService';


const router = express.Router();
const mcpAnalyticsService = new MCPAnalyticsService(pool);

// Helper function to convert timeRange parameter to proper format
function parseTimeRange(timeRangeParam: any) {
  if (!timeRangeParam) return undefined;
  
  try {
    const parsed = typeof timeRangeParam === 'string' ? JSON.parse(timeRangeParam) : timeRangeParam;
    
    if (parsed.days) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - parsed.days);
      return { start, end };
    }
    
    if (parsed.months) {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - parsed.months);
      return { start, end };
    }
    
    if (parsed.start && parsed.end) {
      return {
        start: new Date(parsed.start),
        end: new Date(parsed.end)
      };
    }
    
    // If no valid format found, return undefined instead of crashing
    console.warn('Invalid timeRange format:', timeRangeParam);
    return undefined;
  } catch (error) {
    console.error('Failed to parse timeRange:', error, 'Raw value:', timeRangeParam);
    return undefined;
  }
}

// Guard entire router - Allow both platform_admin and admin roles
router.use(authenticateToken, requireRole(['platform_admin', 'admin']));
router.use(auditLoggerForAdmin);
router.use(enhancedMetricsMiddleware);

// Helper: standard envelope
const ok = (res: express.Response, data: any) => res.status(200).json({ success: true, data });
const bad = (res: express.Response, code: number, error: string, details?: any) => res.status(code).json({ success: false, error, details });

/**
 * GET /admin/analytics/dashboard
 * Get comprehensive dashboard metrics
 */
router.get('/dashboard', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const metrics = await AnalyticsService.getDashboardMetrics();
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get dashboard metrics:', error);
    return bad(res, 500, 'Failed to retrieve dashboard metrics');
  }
});

/**
 * GET /admin/analytics/users/real-time
 * Get real-time user statistics
 */
router.get('/users/real-time', async (req: RequestWithUser, res: express.Response) => {
  try {
    // Only log in development mode to reduce console spam
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Users real-time analytics request:', { 
        timeRange: req.query['timeRange'],
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    const timeRange = parseTimeRange(req.query['timeRange']);
    const metrics = await AnalyticsService.getUserMetrics(timeRange);
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get user metrics:', error);
    return bad(res, 500, 'Failed to retrieve user metrics');
  }
});

/**
 * GET /admin/analytics/credits/real-time
 * Get real-time credit usage statistics
 */
router.get('/credits/real-time', async (req: RequestWithUser, res: express.Response) => {
  try {
    // Only log in development mode to reduce console spam
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Credits real-time analytics request:', { 
        timeRange: req.query['timeRange'],
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    const timeRange = parseTimeRange(req.query['timeRange']);
    const metrics = await AnalyticsService.getCreditMetrics(timeRange);
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get credit metrics:', error);
    return bad(res, 500, 'Failed to retrieve credit metrics');
  }
});

/**
 * GET /admin/analytics/content/real-time
 * Get real-time content creation statistics
 */
router.get('/content/real-time', async (req: RequestWithUser, res: express.Response) => {
  try {
    const timeRange = parseTimeRange(req.query['timeRange']);
    const metrics = await AnalyticsService.getContentMetrics(timeRange);
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get content metrics:', error);
    return bad(res, 500, 'Failed to retrieve content metrics');
  }
});

/**
 * GET /admin/analytics/system/performance
 * Get enhanced system performance metrics
 */
router.get('/system/performance', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const metrics = await AnalyticsService.getSystemMetrics();
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get system metrics:', error);
    return bad(res, 500, 'Failed to retrieve system metrics');
  }
});

/**
 * GET /admin/analytics/revenue/real-time
 * Get real-time revenue data
 */
router.get('/revenue/real-time', async (req: RequestWithUser, res: express.Response) => {
  try {
    const timeRange = parseTimeRange(req.query['timeRange']);
    const metrics = await AnalyticsService.getRevenueMetrics(timeRange);
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get revenue metrics:', error);
    return bad(res, 500, 'Failed to retrieve revenue metrics');
  }
});

/**
 * GET /admin/analytics/alerts
 * Get real-time system alerts
 */
router.get('/alerts', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const alerts = await AnalyticsService.getRealTimeAlerts();
    return ok(res, alerts);
  } catch (error) {
    console.error('Failed to get system alerts:', error);
    return bad(res, 500, 'Failed to retrieve system alerts');
  }
});

/**
 * POST /admin/analytics/alerts/:id/acknowledge
 * Acknowledge a system alert
 */
router.post('/alerts/:id/acknowledge', async (req: RequestWithUser, res: express.Response) => {
  try {
    const alertId = req.params['id'] as string;
    const userId = req.user!.id;
    
    const result = await pool.query(`
      UPDATE system_alerts 
      SET acknowledged_at = NOW(), acknowledged_by = $1
      WHERE id = $2 AND acknowledged_at IS NULL
      RETURNING id, alert_type, severity, message, acknowledged_at
    `, [userId, alertId]);
    
    if (result.rowCount === 0) {
      return bad(res, 404, 'Alert not found or already acknowledged');
    }
    
    return ok(res, { 
      message: 'Alert acknowledged successfully',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
    return bad(res, 500, 'Failed to acknowledge alert');
  }
});

/**
 * POST /admin/analytics/alerts/:id/resolve
 * Resolve a system alert
 */
router.post('/alerts/:id/resolve', async (req: RequestWithUser, res: express.Response) => {
  try {
    const alertId = req.params['id'] as string;
    
    const result = await pool.query(`
      UPDATE system_alerts 
      SET resolved_at = NOW()
      WHERE id = $1 AND resolved_at IS NULL
      RETURNING id, alert_type, severity, message, resolved_at
    `, [alertId]);
    
    if (result.rowCount === 0) {
      return bad(res, 404, 'Alert not found or already resolved');
    }
    
    return ok(res, { 
      message: 'Alert resolved successfully',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to resolve alert:', error);
    return bad(res, 500, 'Failed to resolve alert');
  }
});

/**
 * GET /admin/analytics/trends
 * Get trend analysis with predictive insights
 */
router.get('/trends', async (req: RequestWithUser, res: express.Response) => {
  try {
    const timeRange = req.query['timeRange'] ? JSON.parse(req.query['timeRange'] as string) : { days: 30 };
    const metrics = req.query['metrics'] ? (req.query['metrics'] as string).split(',') : ['users', 'credits', 'content'];
    
    const trends = await AnalyticsService.getTrendAnalysis(timeRange, metrics);
    return ok(res, trends);
  } catch (error) {
    console.error('Failed to get trend analysis:', error);
    return bad(res, 500, 'Failed to retrieve trend analysis');
  }
});

/**
 * GET /admin/analytics/predictions
 * Get predictive insights for business metrics
 */
router.get('/predictions', async (req: RequestWithUser, res: express.Response) => {
  try {
    const timeRange = req.query['timeRange'] ? JSON.parse(req.query['timeRange'] as string) : { months: 3 };
    
    const predictions = await AnalyticsService.getPredictiveInsights(timeRange);
    return ok(res, predictions);
  } catch (error) {
    console.error('Failed to get predictions:', error);
    return bad(res, 500, 'Failed to retrieve predictions');
  }
});

/**
 * GET /admin/analytics/anomalies
 * Get anomaly detection results
 */
router.get('/anomalies', async (req: RequestWithUser, res: express.Response) => {
  try {
    const timeRange = req.query['timeRange'] ? JSON.parse(req.query['timeRange'] as string) : { days: 7 };
    
    const anomalies = await AnalyticsService.getAnomalyDetection(timeRange);
    return ok(res, anomalies);
  } catch (error) {
    console.error('Failed to get anomalies:', error);
    return bad(res, 500, 'Failed to retrieve anomalies');
  }
});

/**
 * GET /admin/analytics/dashboard-layouts
 * Get available dashboard layouts for different admin roles
 */
router.get('/dashboard-layouts', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const layouts = await AnalyticsService.getDashboardLayouts();
    return ok(res, layouts);
  } catch (error) {
    console.error('Failed to get dashboard layouts:', error);
    return bad(res, 500, 'Failed to retrieve dashboard layouts');
  }
});

/**
 * POST /admin/analytics/dashboard-layouts
 * Save custom dashboard layout for user
 */
router.post('/dashboard-layouts', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { layout, name, isDefault } = req.body as {
      layout: any;
      name: string;
      isDefault?: boolean;
    };
    
    if (!layout || !name) {
      return bad(res, 400, 'Layout and name are required');
    }
    
    const savedLayout = await AnalyticsService.saveDashboardLayout(
      req.user!.id,
      name,
      layout,
      isDefault || false
    );
    
    return ok(res, { 
      message: 'Dashboard layout saved successfully',
      layout: savedLayout
    });
  } catch (error) {
    console.error('Failed to save dashboard layout:', error);
    return bad(res, 500, 'Failed to save dashboard layout');
  }
});

/**
 * GET /admin/analytics/export
 * Export analytics data with filters
 */
router.get('/export', async (req: RequestWithUser, res: express.Response) => {
  try {
          const { 
        type, 
        format = 'json', 
        timeRange
      } = req.query as {
      type: string;
      format: string;
      timeRange?: string;
      timeRangeStart?: string;
      timeRangeEnd?: string;
      metrics?: string;
    };

    let data: any;
    let timeRangeObj: any;

    // Parse time range
    if (timeRange) {
      timeRangeObj = JSON.parse(timeRange);
    } else if (req.query['timeRangeStart'] && req.query['timeRangeEnd']) {
      timeRangeObj = {
        start: new Date(req.query['timeRangeStart'] as string),
        end: new Date(req.query['timeRangeEnd'] as string)
      };
    }

    // Get data based on type
    switch (type) {
      case 'users':
        data = await AnalyticsService.getUserMetrics(timeRangeObj);
        break;
      case 'credits':
        data = await AnalyticsService.getCreditMetrics(timeRangeObj);
        break;
      case 'content':
        data = await AnalyticsService.getContentMetrics(timeRangeObj);
        break;
      case 'revenue':
        data = await AnalyticsService.getRevenueMetrics(timeRangeObj);
        break;
      case 'system':
        data = await AnalyticsService.getSystemMetrics();
        break;
      case 'all':
        data = await AnalyticsService.getAllMetrics();
        break;
      default:
        return bad(res, 400, 'Invalid export type');
    }

    // Set response headers for export
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `analytics-${type}-${timestamp}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      
      // Convert to CSV (simplified)
      const csvData = convertToCSV(data);
      return res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json({ success: true, data });
    }
  } catch (error) {
    console.error('Failed to export analytics data:', error);
    return bad(res, 500, 'Failed to export analytics data');
  }
});

/**
 * GET /admin/analytics/stream
 * Server-Sent Events endpoint for real-time data streaming
 */
router.get('/stream', (req: RequestWithUser, res: express.Response) => {
  try {
    const metrics = req.query['metrics'] ? (req.query['metrics'] as string).split(',') : [];
    
    // Initialize real-time service if not already done
    realTimeService.initialize();
    
    // Handle SSE connection
    realTimeService.handleSSEConnection(req, res, req.user!.id, metrics);
    return; // SSE connection doesn't return a response
  } catch (error) {
    console.error('Failed to establish SSE connection:', error);
    return bad(res, 500, 'Failed to establish real-time connection');
  }
});

/**
 * GET /admin/analytics/reconnect
 * Handle SSE reconnection attempts
 */
router.get('/reconnect', (req: RequestWithUser, res: express.Response) => {
  try {
    const reconnectToken = req.query['token'] as string;
    
    if (!reconnectToken) {
      return bad(res, 400, 'Reconnect token is required');
    }

    // Set SSE headers for reconnection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Attempt reconnection
    const reconnected = realTimeService.handleReconnection(reconnectToken, res);
    
    if (!reconnected) {
      // Send error message if reconnection failed
      const errorData = {
        type: 'reconnection_failed',
        data: { message: 'Reconnection failed - invalid or expired token' },
        timestamp: new Date().toISOString()
      };
      
      res.write(`data: ${JSON.stringify(errorData)}\n\n`);
      res.end();
    }
    
    return; // SSE connection doesn't return a response
  } catch (error) {
    console.error('Failed to handle reconnection:', error);
    return bad(res, 500, 'Failed to handle reconnection');
  }
});

/**
 * GET /admin/analytics/websocket-info
 * Get WebSocket connection information and instructions
 */
router.get('/websocket-info', (_req: RequestWithUser, res: express.Response) => {
  try {
    const wsInfo = {
      enabled: true,
      endpoint: '/api/admin/analytics/websocket',
      protocols: ['wss', 'ws'],
      connectionParams: {
        userId: 'user_id_from_auth',
        metrics: 'comma_separated_metrics_list'
      },
      messageTypes: [
        'subscribe',
        'unsubscribe',
        'ping'
      ],
      features: [
        'Automatic reconnection',
        'Message buffering',
        'Priority-based message handling',
        'Connection health monitoring'
      ]
    };
    
    return ok(res, wsInfo);
  } catch (error) {
    console.error('Failed to get WebSocket info:', error);
    return bad(res, 500, 'Failed to retrieve WebSocket information');
  }
});

/**
 * GET /admin/analytics/connection-stats
 * Get real-time connection statistics for both SSE and WebSocket
 */
router.get('/connection-stats', (_req: RequestWithUser, res: express.Response) => {
  try {
    const stats = realTimeService.getConnectionStats();
    return ok(res, stats);
  } catch (error) {
    console.error('Failed to get connection stats:', error);
    return bad(res, 500, 'Failed to retrieve connection statistics');
  }
});

/**
 * GET /admin/analytics/websocket-stats
 * Get WebSocket-specific connection statistics
 */
router.get('/websocket-stats', (_req: RequestWithUser, res: express.Response) => {
  try {
    const stats = webSocketService.getConnectionStats();
    return ok(res, stats);
  } catch (error) {
    console.error('Failed to get WebSocket stats:', error);
    return bad(res, 500, 'Failed to retrieve WebSocket statistics');
  }
});

/**
 * POST /admin/analytics/subscribe
 * Subscribe to specific metrics updates
 */
router.post('/subscribe', (req: RequestWithUser, res: express.Response) => {
  try {
    const { metrics } = req.body as { metrics: string[] };
    
    if (!Array.isArray(metrics)) {
      return bad(res, 400, 'Metrics must be an array');
    }

    realTimeService.subscribeToMetrics(req.user!.id, metrics);
    return ok(res, { message: 'Successfully subscribed to metrics', metrics });
  } catch (error) {
    console.error('Failed to subscribe to metrics:', error);
    return bad(res, 500, 'Failed to subscribe to metrics');
  }
});

/**
 * POST /admin/analytics/unsubscribe
 * Unsubscribe from specific metrics updates
 */
router.post('/unsubscribe', (req: RequestWithUser, res: express.Response) => {
  try {
    const { metrics } = req.body as { metrics: string[] };
    
    if (!Array.isArray(metrics)) {
      return bad(res, 400, 'Metrics must be an array');
    }

    realTimeService.unsubscribeFromMetrics(req.user!.id, metrics);
    return ok(res, { message: 'Successfully unsubscribed from metrics', metrics });
  } catch (error) {
    console.error('Failed to unsubscribe from metrics:', error);
    return bad(res, 500, 'Failed to unsubscribe from metrics');
  }
});

/**
 * POST /admin/analytics/test-connection
 * Test real-time connection health
 */
router.post('/test-connection', async (req: RequestWithUser, res: express.Response) => {
  try {
    const { connectionType = 'sse' } = req.body as { connectionType?: 'sse' | 'websocket' };
    
    let testResult: any;
    
    if (connectionType === 'sse') {
      // Test SSE connection by sending a test message
      await realTimeService.sendMetricsUpdateToUser(
        req.user!.id, 
        'test_message', 
        { message: 'Test message from SSE', timestamp: new Date().toISOString() },
        'low'
      );
      testResult = { type: 'sse', status: 'test_message_sent', userId: req.user!.id };
    } else {
      // Test WebSocket connection
      webSocketService.broadcastToUser(
        req.user!.id,
        {
          type: 'test_message',
          data: { message: 'Test message from WebSocket', timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        }
      );
      testResult = { type: 'websocket', status: 'test_message_sent', userId: req.user!.id };
    }
    
    return ok(res, testResult);
  } catch (error) {
    console.error('Failed to test connection:', error);
    return bad(res, 500, 'Failed to test connection');
  }
});

/**
 * GET /admin/analytics/enhanced
 * Get all enhanced metrics in one call
 */
router.get('/enhanced', async (_req: RequestWithUser, res: express.Response) => {
  try {
    const metrics = await getEnhancedMetrics();
    return ok(res, metrics);
  } catch (error) {
    console.error('Failed to get enhanced metrics:', error);
    return bad(res, 500, 'Failed to retrieve enhanced metrics');
  }
});

/**
 * GET /admin/analytics/cache/status
 * Get analytics cache status
 */
router.get('/cache/status', async (_req: RequestWithUser, res: express.Response) => {
  try {
    // This would check the analytics_cache table status
    // For now, return a placeholder
    const cacheStatus = {
      enabled: true,
      total_cached_metrics: 0,
      cache_hit_rate: 0,
      last_updated: new Date().toISOString()
    };
    
    return ok(res, cacheStatus);
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return bad(res, 500, 'Failed to retrieve cache status');
  }
});

/**
 * POST /admin/analytics/cache/refresh
 * Manually refresh analytics cache
 */
router.post('/cache/refresh', async (_req: RequestWithUser, res: express.Response) => {
  try {
    // This would trigger a cache refresh
    // For now, return success
    return ok(res, { message: 'Cache refresh initiated' });
  } catch (error) {
    console.error('Failed to refresh cache:', error);
    return bad(res, 500, 'Failed to refresh cache');
  }
});

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data: any): string {
  if (typeof data !== 'object' || data === null) {
    return String(data);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  } else {
    // Single object
    const headers = Object.keys(data);
    const values = headers.map(header => {
      const value = data[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    
    return [headers.join(','), values.join(',')].join('\n');
  }
}

/**
 * MCP ANALYTICS ENDPOINTS
 * Analytics endpoints for Model Context Protocol (MCP) server data
 */

/**
 * POST /admin/analytics/mcp/setup-sample-data
 * Add sample data for testing MCP analytics (development only)
 */
router.post('/mcp/setup-sample-data', async (_req: RequestWithUser, res: express.Response) => {
  try {
    // Only allow in development
    if (process.env['NODE_ENV'] !== 'development') {
      return bad(res, 403, 'Sample data setup only available in development');
    }

    console.log('Setting up sample MCP data...');
    
    // Insert sample AI provider
    const providerResult = await pool.query(`
      INSERT INTO ai_providers (name, type, api_key, models, rate_limits, priority, enabled) 
      VALUES (
        'OpenAI',
        'openai',
        'sk-test-key',
        '["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"]',
        '{"requests_per_minute": 60, "tokens_per_minute": 150000}',
        1,
        true
      ) ON CONFLICT (name) DO NOTHING RETURNING id
    `);
    
    const providerId = providerResult.rows[0]?.id;
    if (!providerId) {
      // Get existing provider
      const existingProvider = await pool.query('SELECT id FROM ai_providers WHERE name = $1', ['OpenAI']);
      if (existingProvider.rows.length === 0) {
        return bad(res, 500, 'Failed to create or find AI provider');
      }
    }
    
    // Get first user for sample data
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      return bad(res, 500, 'No users found in database');
    }
    const userId = userResult.rows[0].id;
    
    // Insert sample AI requests for the last 30 days
    for (let i = 0; i < 30; i++) {
      await pool.query(`
        INSERT INTO ai_requests (
          user_id, request_type, provider_id, model_used, priority, parameters,
          tokens_used, processing_time_ms, cost, success, cached, created_at
        ) VALUES 
        ($1, 'chat', $2, 'gpt-4o-mini', 'normal', '{"message": "Sample chat"}', 150, 1200, 0.003, true, false, NOW() - INTERVAL '1 day' * $3),
        ($1, 'generation', $2, 'gpt-4-turbo', 'normal', '{"type": "worksheet"}', 300, 2500, 0.006, true, true, NOW() - INTERVAL '1 day' * $3),
        ($1, 'analysis', $2, 'gpt-4o', 'high', '{"type": "content_analysis"}', 500, 3500, 0.012, true, false, NOW() - INTERVAL '1 day' * $3),
        ($1, 'chat', $2, 'gpt-4o-mini', 'normal', '{"message": "Quick question"}', 80, 800, 0.001, true, true, NOW() - INTERVAL '1 day' * $3),
        ($1, 'chat', $2, 'gpt-4o-mini', 'normal', '{"message": "Error test"}', 100, 5000, 0.002, false, false, NOW() - INTERVAL '1 day' * $3)
      `, [userId, providerId || 1, i]);
    }
    
    console.log('Sample MCP data setup completed');
    return ok(res, { message: 'Sample MCP data setup completed successfully' });
  } catch (error) {
    console.error('Error setting up sample MCP data:', error);
    return bad(res, 500, 'Failed to setup sample MCP data');
  }
});

/**
 * GET /admin/analytics/mcp/overview
 * Get MCP analytics overview with comprehensive metrics
 */
router.get('/mcp/overview', 
  async (req: RequestWithUser, res: express.Response) => {
    try {
      console.log('MCP Analytics request from user:', req.user?.email, 'with role:', req.user?.role);
      console.log('Query parameters:', req.query);
      
      const { days } = req.query;
      const daysNumber = typeof days === 'string' ? parseInt(days, 10) : 30;
      
      console.log('Fetching MCP analytics for days:', daysNumber);
      const analytics = await mcpAnalyticsService.getAnalytics(daysNumber);
      
      console.log('MCP Analytics fetched successfully');
      return ok(res, analytics);
    } catch (error) {
      console.error('Error fetching MCP analytics:', error);
      if (error instanceof Error) {
        return bad(res, 500, `Failed to fetch MCP analytics data: ${error.message}`);
      }
      return bad(res, 500, 'Failed to fetch MCP analytics data');
    }
  }
);

/**
 * GET /admin/analytics/mcp/models
 * Get model performance statistics and metrics
 */
router.get('/mcp/models',
  async (req: RequestWithUser, res: express.Response) => {
    try {
      const { days } = req.query;
      const daysNumber = typeof days === 'string' ? parseInt(days, 10) : 30;
      const analytics = await mcpAnalyticsService.getAnalytics(daysNumber);

      // Return only model-related statistics
      return ok(res, {
        modelStats: analytics.modelStats,
        requestTypeBreakdown: analytics.requestTypeBreakdown,
        totalRequests: analytics.totalRequests,
        successRate: analytics.successRate,
        averageResponseTime: analytics.averageResponseTime,
        totalTokensUsed: analytics.totalTokensUsed,
        totalCost: analytics.totalCost
      });
    } catch (error) {
      console.error('Error fetching MCP model analytics:', error);
      return bad(res, 500, 'Failed to fetch MCP model analytics');
    }
  }
);

/**
 * GET /admin/analytics/mcp/providers
 * Get AI provider health and performance data
 */
router.get('/mcp/providers',
  async (_req: RequestWithUser, res: express.Response) => {
    try {
      // Get provider summary using the view created in migration
      const result = await pool.query(`
        SELECT * FROM provider_performance_summary
        ORDER BY total_requests_last_30_days DESC
      `);

      return ok(res, result.rows);
    } catch (error) {
      console.error('Error fetching MCP provider data:', error);
      return bad(res, 500, 'Failed to fetch MCP provider data');
    }
  }
);

/**
 * GET /admin/analytics/mcp/cache
 * Get cache performance metrics
 */
router.get('/mcp/cache',
  async (req: RequestWithUser, res: express.Response) => {
    try {
      const { days } = req.query;
      const daysNumber = typeof days === 'string' ? parseInt(days, 10) : 30;
      const analytics = await mcpAnalyticsService.getAnalytics(daysNumber);

      return ok(res, {
        cacheStats: analytics.cacheStats,
        cacheHitRate: analytics.cacheHitRate
      });
    } catch (error) {
      console.error('Error fetching MCP cache analytics:', error);
      return bad(res, 500, 'Failed to fetch MCP cache analytics');
    }
  }
);

/**
 * GET /admin/analytics/mcp/errors
 * Get recent errors and error analytics
 */
router.get('/mcp/errors',
  async (_req: RequestWithUser, res: express.Response) => {
    try {
      const analytics = await mcpAnalyticsService.getAnalytics(7); // Last 7 days for errors

      return ok(res, {
        recentErrors: analytics.recentErrors,
        errorRate: 100 - analytics.successRate,
        totalRequests: analytics.totalRequests
      });
    } catch (error) {
      console.error('Error fetching MCP error analytics:', error);
      return bad(res, 500, 'Failed to fetch MCP error analytics');
    }
  }
);

/**
 * GET /admin/analytics/mcp/real-time
 * Get real-time MCP metrics for the last hour
 */
router.get('/mcp/real-time',
  async (_req: RequestWithUser, res: express.Response) => {
    try {
      // Get metrics for the last hour, grouped by 5-minute intervals
      const result = await pool.query(`
        SELECT 
          DATE_TRUNC('minute', created_at) + 
          INTERVAL '5 min' * FLOOR(EXTRACT('minute' FROM created_at) / 5) as time_bucket,
          COUNT(*) as requests,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
          AVG(processing_time_ms) as avg_response_time,
          SUM(tokens_used) as tokens_used,
          SUM(cost) as total_cost
        FROM ai_requests
        WHERE created_at >= NOW() - INTERVAL '1 hour'
        GROUP BY time_bucket
        ORDER BY time_bucket ASC
      `);

      // Get current active requests (in progress)
      const activeResult = await pool.query(`
        SELECT COUNT(*) as active_requests
        FROM ai_requests
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
          AND response_data IS NULL
      `);

      return ok(res, {
        time_series: result.rows.map(row => ({
          timestamp: row.time_bucket,
          requests: parseInt(row.requests),
          successful_requests: parseInt(row.successful_requests),
          avg_response_time: parseFloat(row.avg_response_time) || 0,
          tokens_used: parseInt(row.tokens_used) || 0,
          total_cost: parseFloat(row.total_cost) || 0
        })),
        active_requests: parseInt(activeResult.rows[0].active_requests) || 0
      });
    } catch (error) {
      console.error('Error fetching MCP real-time metrics:', error);
      return bad(res, 500, 'Failed to fetch MCP real-time metrics');
    }
  }
);

export default router;
