import { Request, Response, NextFunction } from 'express';
import pool from '../database/connection';

export interface SystemMetrics {
  uptime: number;
  memory_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu_usage: number;
  active_connections: number;
  database_connections: number;
}

export interface PerformanceMetrics {
  total_requests: number;
  avg_response_ms: number;
  p95_response_ms: number;
  p99_response_ms: number;
  error_count_by_status: Record<string, number>;
  request_count_by_endpoint: Record<string, number>;
  started_at: string;
}

export interface BusinessMetrics {
  total_users: number;
  active_users_24h: number;
  total_schools: number;
  active_schools_24h: number;
  total_credits_purchased: number;
  total_credits_used: number;
  revenue_24h: number;
  revenue_7d: number;
  revenue_30d: number;
}

export interface UserMetrics {
  users_by_role: Record<string, number>;
  users_by_school: Record<string, number>;
  new_users_24h: number;
  new_users_7d: number;
  new_users_30d: number;
  users_with_subscriptions: number;
  users_with_credits: number;
}

export interface ContentMetrics {
  total_chat_sessions: number;
  total_messages: number;
  total_generated_files: number;
  content_by_type: Record<string, number>;
  content_creation_24h: number;
  content_creation_7d: number;
  content_creation_30d: number;
}

export interface AlertMetrics {
  total_alerts: number;
  alerts_by_severity: Record<string, number>;
  unacknowledged_alerts: number;
  critical_alerts: number;
}

export interface EnhancedMetrics {
  system: SystemMetrics;
  performance: PerformanceMetrics;
  business: BusinessMetrics;
  user: UserMetrics;
  content: ContentMetrics;
  alerts: AlertMetrics;
  timestamp: string;
}

const state = {
  totalRequests: 0,
  totalResponseMs: 0,
  responseTimes: [] as number[],
  errorCountByStatus: {} as Record<string, number>,
  requestCountByEndpoint: {} as Record<string, number>,
  startedAt: new Date(),
  activeConnections: 0,
};

export const enhancedMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  
  // Track active connections
  state.activeConnections++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    state.totalRequests += 1;
    state.totalResponseMs += duration;
    state.responseTimes.push(duration);
    
    // Keep only last 1000 response times for percentile calculations
    if (state.responseTimes.length > 1000) {
      state.responseTimes.shift();
    }
    
    const status = res.statusCode;
    if (status >= 400) {
      state.errorCountByStatus[String(status)] = (state.errorCountByStatus[String(status)] || 0) + 1;
    }
    
    // Track endpoint usage
    state.requestCountByEndpoint[endpoint] = (state.requestCountByEndpoint[endpoint] || 0) + 1;
    
    // Decrease active connections
    state.activeConnections--;
  });
  
  next();
};

export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  // Get database connection info
  let dbConnections = 0;
  try {
    const result = await pool.query('SELECT count(*) as connections FROM pg_stat_activity WHERE state = $1', ['active']);
    dbConnections = parseInt(result.rows[0].connections);
  } catch (error) {
    console.error('Failed to get database connections:', error);
  }
  
  return {
    uptime: Math.round(uptime),
    memory_usage: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    },
    cpu_usage: Math.round(process.cpuUsage().user / 1000), // ms
    active_connections: state.activeConnections,
    database_connections: dbConnections
  };
};

export const getPerformanceMetrics = (): PerformanceMetrics => {
  const avg = state.totalRequests > 0 ? state.totalResponseMs / state.totalRequests : 0;
  
  // Calculate percentiles
  const sortedTimes = [...state.responseTimes].sort((a, b) => a - b);
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p99Index = Math.floor(sortedTimes.length * 0.99);
  
  return {
    total_requests: state.totalRequests,
    avg_response_ms: Math.round(avg),
    p95_response_ms: sortedTimes[p95Index] || 0,
    p99_response_ms: sortedTimes[p99Index] || 0,
    error_count_by_status: { ...state.errorCountByStatus },
    request_count_by_endpoint: { ...state.requestCountByEndpoint },
    started_at: state.startedAt.toISOString()
  };
};

export const getBusinessMetrics = async (): Promise<BusinessMetrics> => {
  try {
    // Get user counts
    const userResult = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_active = true');
    const totalUsers = parseInt(userResult.rows[0].total);
    
    // Get active users in last 24h
    const activeUsers24hResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as active FROM chat_sessions WHERE updated_at > NOW() - INTERVAL \'24 hours\''
    );
    const activeUsers24h = parseInt(activeUsers24hResult.rows[0].active);
    
    // Get school counts
    const schoolResult = await pool.query('SELECT COUNT(*) as total FROM schools WHERE is_active = true');
    const totalSchools = parseInt(schoolResult.rows[0].total);
    
    // Get active schools in last 24h
    const activeSchools24hResult = await pool.query(
      'SELECT COUNT(DISTINCT s.id) as active FROM schools s JOIN users u ON s.id = u.school_id WHERE u.updated_at > NOW() - INTERVAL \'24 hours\''
    );
    const activeSchools24h = parseInt(activeSchools24hResult.rows[0].active);
    
    // Get credit metrics
    const creditResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'purchase' THEN amount ELSE 0 END) as purchased,
        SUM(CASE WHEN transaction_type = 'usage' THEN amount ELSE 0 END) as used
      FROM credit_transactions
    `);
    const totalCreditsPurchased = parseInt(creditResult.rows[0].purchased) || 0;
    const totalCreditsUsed = parseInt(creditResult.rows[0].used) || 0;
    
    // Get revenue metrics (simplified - assuming 1 credit = 1 CZK for now)
    const revenue24hResult = await pool.query(`
      SELECT SUM(amount) as revenue FROM credit_transactions 
      WHERE transaction_type = 'purchase' AND created_at > NOW() - INTERVAL '24 hours'
    `);
    const revenue24h = parseInt(revenue24hResult.rows[0].revenue) || 0;
    
    const revenue7dResult = await pool.query(`
      SELECT SUM(amount) as revenue FROM credit_transactions 
      WHERE transaction_type = 'purchase' AND created_at > NOW() - INTERVAL '7 days'
    `);
    const revenue7d = parseInt(revenue7dResult.rows[0].revenue) || 0;
    
    const revenue30dResult = await pool.query(`
      SELECT SUM(amount) as revenue FROM credit_transactions 
      WHERE transaction_type = 'purchase' AND created_at > NOW() - INTERVAL '30 days'
    `);
    const revenue30d = parseInt(revenue30dResult.rows[0].revenue) || 0;
    
    return {
      total_users: totalUsers,
      active_users_24h: activeUsers24h,
      total_schools: totalSchools,
      active_schools_24h: activeSchools24h,
      total_credits_purchased: totalCreditsPurchased,
      total_credits_used: totalCreditsUsed,
      revenue_24h: revenue24h,
      revenue_7d: revenue7d,
      revenue_30d: revenue30d
    };
  } catch (error) {
    console.error('Failed to get business metrics:', error);
    return {
      total_users: 0,
      active_users_24h: 0,
      total_schools: 0,
      active_schools_24h: 0,
      total_credits_purchased: 0,
      total_credits_used: 0,
      revenue_24h: 0,
      revenue_7d: 0,
      revenue_30d: 0
    };
  }
};

export const getUserMetrics = async (): Promise<UserMetrics> => {
  try {
    // Get users by role
    const roleResult = await pool.query(`
      SELECT role, COUNT(*) as count FROM users WHERE is_active = true GROUP BY role
    `);
    const usersByRole: Record<string, number> = {};
    roleResult.rows.forEach(row => {
      usersByRole[row.role] = parseInt(row.count);
    });
    
    // Get users by school
    const schoolResult = await pool.query(`
      SELECT s.name, COUNT(u.id) as count 
      FROM schools s 
      JOIN users u ON s.id = u.school_id 
      WHERE u.is_active = true 
      GROUP BY s.id, s.name
    `);
    const usersBySchool: Record<string, number> = {};
    schoolResult.rows.forEach(row => {
      usersBySchool[row.name] = parseInt(row.count);
    });
    
    // Get new user counts
    const newUsers24hResult = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    const newUsers24h = parseInt(newUsers24hResult.rows[0].count);
    
    const newUsers7dResult = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    const newUsers7d = parseInt(newUsers7dResult.rows[0].count);
    
    const newUsers30dResult = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '30 days'
    `);
    const newUsers30d = parseInt(newUsers30dResult.rows[0].count);
    
    // Get subscription and credit counts
    const subscriptionResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM subscriptions WHERE status = 'active'
    `);
    const usersWithSubscriptions = parseInt(subscriptionResult.rows[0].count);
    
    const creditResult = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE credits_balance > 0
    `);
    const usersWithCredits = parseInt(creditResult.rows[0].count);
    
    return {
      users_by_role: usersByRole,
      users_by_school: usersBySchool,
      new_users_24h: newUsers24h,
      new_users_7d: newUsers7d,
      new_users_30d: newUsers30d,
      users_with_subscriptions: usersWithSubscriptions,
      users_with_credits: usersWithCredits
    };
  } catch (error) {
    console.error('Failed to get user metrics:', error);
    return {
      users_by_role: {},
      users_by_school: {},
      new_users_24h: 0,
      new_users_7d: 0,
      new_users_30d: 0,
      users_with_subscriptions: 0,
      users_with_credits: 0
    };
  }
};

export const getContentMetrics = async (): Promise<ContentMetrics> => {
  try {
    // Get basic counts
    const sessionResult = await pool.query('SELECT COUNT(*) as count FROM chat_sessions');
    const totalSessions = parseInt(sessionResult.rows[0].count);
    
    const messageResult = await pool.query('SELECT COUNT(*) as count FROM chat_messages');
    const totalMessages = parseInt(messageResult.rows[0].count);
    
    const fileResult = await pool.query('SELECT COUNT(*) as count FROM generated_files');
    const totalFiles = parseInt(fileResult.rows[0].count);
    
    // Get content by type (simplified)
    const contentByType: Record<string, number> = {
      'chat_sessions': totalSessions,
      'messages': totalMessages,
      'generated_files': totalFiles
    };
    
    // Get creation counts by time periods
    const content24hResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM chat_sessions WHERE created_at > NOW() - INTERVAL '24 hours') +
        (SELECT COUNT(*) FROM generated_files WHERE created_at > NOW() - INTERVAL '24 hours') as count
    `);
    const content24h = parseInt(content24hResult.rows[0].count);
    
    const content7dResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM chat_sessions WHERE created_at > NOW() - INTERVAL '7 days') +
        (SELECT COUNT(*) FROM generated_files WHERE created_at > NOW() - INTERVAL '7 days') as count
    `);
    const content7d = parseInt(content7dResult.rows[0].count);
    
    const content30dResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM chat_sessions WHERE created_at > NOW() - INTERVAL '30 days') +
        (SELECT COUNT(*) FROM generated_files WHERE created_at > NOW() - INTERVAL '30 days') as count
    `);
    const content30d = parseInt(content30dResult.rows[0].count);
    
    return {
      total_chat_sessions: totalSessions,
      total_messages: totalMessages,
      total_generated_files: totalFiles,
      content_by_type: contentByType,
      content_creation_24h: content24h,
      content_creation_7d: content7d,
      content_creation_30d: content30d
    };
  } catch (error) {
    console.error('Failed to get content metrics:', error);
    return {
      total_chat_sessions: 0,
      total_messages: 0,
      total_generated_files: 0,
      content_by_type: {},
      content_creation_24h: 0,
      content_creation_7d: 0,
      content_creation_30d: 0
    };
  }
};

export const getAlertMetrics = async (): Promise<AlertMetrics> => {
  try {
    // Get total alerts
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM system_alerts');
    const totalAlerts = parseInt(totalResult.rows[0].count);
    
    // Get alerts by severity
    const severityResult = await pool.query(`
      SELECT severity, COUNT(*) as count FROM system_alerts GROUP BY severity
    `);
    const alertsBySeverity: Record<string, number> = {};
    severityResult.rows.forEach(row => {
      alertsBySeverity[row.severity] = parseInt(row.count);
    });
    
    // Get unacknowledged alerts
    const unacknowledgedResult = await pool.query(`
      SELECT COUNT(*) as count FROM system_alerts WHERE acknowledged_at IS NULL
    `);
    const unacknowledgedAlerts = parseInt(unacknowledgedResult.rows[0].count);
    
    // Get critical alerts
    const criticalResult = await pool.query(`
      SELECT COUNT(*) as count FROM system_alerts WHERE severity = 'critical'
    `);
    const criticalAlerts = parseInt(criticalResult.rows[0].count);
    
    return {
      total_alerts: totalAlerts,
      alerts_by_severity: alertsBySeverity,
      unacknowledged_alerts: unacknowledgedAlerts,
      critical_alerts: criticalAlerts
    };
  } catch (error) {
    console.error('Failed to get alert metrics:', error);
    return {
      total_alerts: 0,
      alerts_by_severity: {},
      unacknowledged_alerts: 0,
      critical_alerts: 0
    };
  }
};

export const getEnhancedMetrics = async (): Promise<EnhancedMetrics> => {
  const [system, business, user, content, alerts] = await Promise.all([
    getSystemMetrics(),
    getBusinessMetrics(),
    getUserMetrics(),
    getContentMetrics(),
    getAlertMetrics()
  ]);
  
  return {
    system,
    performance: getPerformanceMetrics(),
    business,
    user,
    content,
    alerts,
    timestamp: new Date().toISOString()
  };
};
