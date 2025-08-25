/**
 * Database query optimization utilities for Enhanced User CRUD operations
 */

import { Pool, PoolClient } from 'pg';

// Query performance monitoring
class QueryPerformanceMonitor {
  private static metrics = new Map<string, {
    totalTime: number;
    count: number;
    slowQueries: Array<{ query: string; duration: number; timestamp: Date }>;
  }>();

  static startTimer(queryName: string, query: string) {
    const start = process.hrtime.bigint();
    
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      this.recordQuery(queryName, query, duration);
      
      // Log slow queries (>1000ms)
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
        console.warn(`Query: ${query}`);
      }
      
      return duration;
    };
  }

  private static recordQuery(queryName: string, query: string, duration: number) {
    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, {
        totalTime: 0,
        count: 0,
        slowQueries: []
      });
    }

    const metric = this.metrics.get(queryName)!;
    metric.totalTime += duration;
    metric.count += 1;

    // Track slow queries
    if (duration > 1000) {
      metric.slowQueries.push({
        query,
        duration,
        timestamp: new Date()
      });

      // Keep only last 10 slow queries per query type
      if (metric.slowQueries.length > 10) {
        metric.slowQueries.shift();
      }
    }
  }

  static getMetrics() {
    const result: Record<string, {
      averageTime: number;
      totalTime: number;
      count: number;
      slowQueriesCount: number;
    }> = {};

    this.metrics.forEach((metric, queryName) => {
      result[queryName] = {
        averageTime: metric.totalTime / metric.count,
        totalTime: metric.totalTime,
        count: metric.count,
        slowQueriesCount: metric.slowQueries.length
      };
    });

    return result;
  }

  static getSlowQueries() {
    const slowQueries: Array<{
      queryName: string;
      query: string;
      duration: number;
      timestamp: Date;
    }> = [];

    this.metrics.forEach((metric, queryName) => {
      metric.slowQueries.forEach(sq => {
        slowQueries.push({
          queryName,
          ...sq
        });
      });
    });

    return slowQueries.sort((a, b) => b.duration - a.duration);
  }
}

// Optimized query builder for user searches
export class OptimizedUserQueryBuilder {
  private baseQuery = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.role,
      u.is_active,
      u.status,
      u.credits_balance,
      u.created_at,
      u.updated_at,
      u.last_login_at,
      u.email_verified,
      s.id as school_id,
      s.name as school_name,
      s.city as school_city
    FROM users u
    LEFT JOIN schools s ON u.school_id = s.id
  `;

  private conditions: string[] = [];
  private parameters: any[] = [];
  private parameterIndex = 1;

  // Add search condition with full-text search optimization
  addSearchCondition(searchTerm: string) {
    if (searchTerm.trim()) {
      // Use PostgreSQL full-text search for better performance
      this.conditions.push(`
        (
          to_tsvector('simple', COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') || ' ' || COALESCE(u.email, ''))
          @@ plainto_tsquery('simple', $${this.parameterIndex})
          OR u.email ILIKE $${this.parameterIndex + 1}
          OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $${this.parameterIndex + 1}
        )
      `);
      this.parameters.push(searchTerm, `%${searchTerm}%`);
      this.parameterIndex += 2;
    }
    return this;
  }

  // Add role filter with index optimization
  addRoleFilter(role: string) {
    if (role && role !== 'all') {
      this.conditions.push(`u.role = $${this.parameterIndex}`);
      this.parameters.push(role);
      this.parameterIndex++;
    }
    return this;
  }

  // Add school filter with optimized join
  addSchoolFilter(schoolId: string) {
    if (schoolId && schoolId !== 'all') {
      if (schoolId === 'individual_only') {
        this.conditions.push('u.school_id IS NULL');
      } else if (schoolId === 'school_only') {
        this.conditions.push('u.school_id IS NOT NULL');
      } else {
        this.conditions.push(`u.school_id = $${this.parameterIndex}`);
        this.parameters.push(schoolId);
        this.parameterIndex++;
      }
    }
    return this;
  }

  // Add status filter
  addStatusFilter(status: string) {
    if (status && status !== 'all') {
      if (status === 'active') {
        this.conditions.push('u.is_active = true');
      } else if (status === 'inactive') {
        this.conditions.push('u.is_active = false');
      } else {
        this.conditions.push(`u.status = $${this.parameterIndex}`);
        this.parameters.push(status);
        this.parameterIndex++;
      }
    }
    return this;
  }

  // Add date range filter with index optimization
  addDateRangeFilter(field: string, dateRange: string) {
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'this_week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'this_month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last_3_months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          return this;
      }

      this.conditions.push(`u.${field} >= $${this.parameterIndex}`);
      this.parameters.push(startDate.toISOString());
      this.parameterIndex++;
    }
    return this;
  }

  // Add last login filter
  addLastLoginFilter(lastLogin: string) {
    if (lastLogin && lastLogin !== 'all') {
      const now = new Date();
      
      if (lastLogin === 'never') {
        this.conditions.push('u.last_login_at IS NULL');
      } else {
        let days: number;
        switch (lastLogin) {
          case '7d': days = 7; break;
          case '30d': days = 30; break;
          case '90d': days = 90; break;
          default: return this;
        }
        
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        this.conditions.push(`u.last_login_at >= $${this.parameterIndex}`);
        this.parameters.push(cutoffDate.toISOString());
        this.parameterIndex++;
      }
    }
    return this;
  }

  // Add credit range filter
  addCreditRangeFilter(creditRange: string) {
    if (creditRange && creditRange !== 'all') {
      switch (creditRange) {
        case 'low':
          this.conditions.push('u.credits_balance < 10');
          break;
        case 'medium':
          this.conditions.push('u.credits_balance >= 10 AND u.credits_balance <= 100');
          break;
        case 'high':
          this.conditions.push('u.credits_balance > 100');
          break;
      }
    }
    return this;
  }

  // Add email verification filter
  addEmailVerifiedFilter(emailVerified: boolean | undefined) {
    if (emailVerified !== undefined) {
      this.conditions.push(`u.email_verified = $${this.parameterIndex}`);
      this.parameters.push(emailVerified);
      this.parameterIndex++;
    }
    return this;
  }

  // Add sorting with index optimization
  addSorting(orderBy: string, orderDirection: 'asc' | 'desc') {
    // Map frontend field names to database columns
    const fieldMapping: Record<string, string> = {
      'first_name': 'u.first_name',
      'last_name': 'u.last_name',
      'email': 'u.email',
      'role': 'u.role',
      'school_name': 's.name',
      'credits_balance': 'u.credits_balance',
      'status': 'u.is_active',
      'created_at': 'u.created_at',
      'last_login_at': 'u.last_login_at'
    };

    const dbField = fieldMapping[orderBy] || 'u.created_at';
    const direction = orderDirection === 'desc' ? 'DESC' : 'ASC';
    
    return `ORDER BY ${dbField} ${direction}`;
  }

  // Build the final query
  build(orderBy?: string, orderDirection?: 'asc' | 'desc', limit?: number, offset?: number) {
    let query = this.baseQuery;

    if (this.conditions.length > 0) {
      query += ' WHERE ' + this.conditions.join(' AND ');
    }

    if (orderBy) {
      query += ' ' + this.addSorting(orderBy, orderDirection || 'asc');
    }

    if (limit) {
      query += ` LIMIT $${this.parameterIndex}`;
      this.parameters.push(limit);
      this.parameterIndex++;
    }

    if (offset) {
      query += ` OFFSET $${this.parameterIndex}`;
      this.parameters.push(offset);
      this.parameterIndex++;
    }

    return {
      query,
      parameters: this.parameters
    };
  }

  // Build count query for pagination
  buildCountQuery() {
    let query = 'SELECT COUNT(*) as total FROM users u LEFT JOIN schools s ON u.school_id = s.id';

    if (this.conditions.length > 0) {
      query += ' WHERE ' + this.conditions.join(' AND ');
    }

    return {
      query,
      parameters: this.parameters.slice(0, -2) // Remove LIMIT and OFFSET parameters
    };
  }
}

// Connection pool optimization
export class OptimizedPool {
  private pool: Pool;
  private connectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingClients: 0
  };

  constructor(config: any) {
    this.pool = new Pool({
      ...config,
      // Optimized pool settings
      max: 20, // Maximum number of clients in the pool
      min: 5,  // Minimum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
    });

    // Monitor pool events
    this.pool.on('connect', () => {
      this.connectionMetrics.totalConnections++;
      this.connectionMetrics.activeConnections++;
    });

    this.pool.on('remove', () => {
      this.connectionMetrics.totalConnections--;
      this.connectionMetrics.activeConnections--;
    });

    this.pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }

  async query(text: string, params?: any[], queryName?: string) {
    const endTimer = queryName ? 
      QueryPerformanceMonitor.startTimer(queryName, text) : 
      null;

    try {
      const result = await this.pool.query(text, params);
      return result;
    } finally {
      if (endTimer) {
        endTimer();
      }
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async end() {
    await this.pool.end();
  }

  getMetrics() {
    return {
      ...this.connectionMetrics,
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Query result caching
class QueryCache {
  private cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(pattern: string) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const queryCache = new QueryCache();

// Batch operations optimization
export class BatchOperationOptimizer {
  static async executeBatchUpdate(
    pool: OptimizedPool,
    tableName: string,
    updates: Array<{ id: string; data: Record<string, any> }>,
    batchSize: number = 100
  ) {
    const results = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchResult = await this.executeSingleBatch(pool, tableName, batch);
      results.push(...batchResult);
    }
    
    return results;
  }

  private static async executeSingleBatch(
    pool: OptimizedPool,
    tableName: string,
    batch: Array<{ id: string; data: Record<string, any> }>
  ) {
    const client = await pool.getClient();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const { id, data } of batch) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map((_, index) => `$${index + 2}`);
        
        const query = `
          UPDATE ${tableName} 
          SET ${fields.map((field, index) => `${field} = $${index + 2}`).join(', ')}, 
              updated_at = NOW()
          WHERE id = $1 
          RETURNING *
        `;
        
        const result = await client.query(query, [id, ...values]);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export performance monitoring
export { QueryPerformanceMonitor };
