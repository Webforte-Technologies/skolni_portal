import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  executionTime: number;
  queryCount: number;
  timestamp: Date;
  userId?: string;
  timeRange?: string;
}

class AnalyticsPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Middleware to track analytics endpoint performance
   */
  trackPerformance = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    let queryCount = 0;

    // Track database queries if pool is available
    const originalQuery = req.app.locals['pool']?.query;
    if (originalQuery) {
      req.app.locals['pool'].query = (...args: any[]) => {
        queryCount++;
        return originalQuery.apply(req.app.locals['pool'], args);
      };
    }

    // Override res.json to capture when response is sent
    const originalJson = res.json;
    res.json = function(data: any) {
      const executionTime = Date.now() - startTime;
      
      // Record metrics
      const metric: PerformanceMetrics = {
        endpoint: req.path,
        method: req.method,
        executionTime,
        queryCount,
        timestamp: new Date(),
        userId: (req as any).user?.id,
        timeRange: req.query['timeRange'] as string
      };

      req.app.locals['analyticsPerformanceMonitor']?.recordMetric(metric);

      // Log slow queries (> 2 seconds)
      if (executionTime > 2000) {
        console.warn(`Slow analytics query detected:`, {
          endpoint: req.path,
          executionTime: `${executionTime}ms`,
          queryCount,
          timeRange: req.query['timeRange'],
          userId: (req as any).user?.id
        });
      }

      // Restore original query function
      if (originalQuery) {
        req.app.locals['pool'].query = originalQuery;
      }

      return originalJson.call(this, data);
    };

    next();
  };

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(timeRangeMinutes: number = 60) {
    const cutoffTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        averageQueryCount: 0,
        endpointStats: {},
        timeRange: `${timeRangeMinutes} minutes`
      };
    }

    const totalExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const totalQueryCount = recentMetrics.reduce((sum, m) => sum + m.queryCount, 0);
    const slowQueries = recentMetrics.filter(m => m.executionTime > 2000).length;

    // Group by endpoint
    const endpointStats: Record<string, {
      count: number;
      averageTime: number;
      slowQueries: number;
      averageQueryCount: number;
    }> = {};

    recentMetrics.forEach(metric => {
      if (!endpointStats[metric.endpoint]) {
        endpointStats[metric.endpoint] = {
          count: 0,
          averageTime: 0,
          slowQueries: 0,
          averageQueryCount: 0
        };
      }

      const stats = endpointStats[metric.endpoint];
      if (stats) {
        stats.count++;
        stats.averageTime = ((stats.averageTime * (stats.count - 1)) + metric.executionTime) / stats.count;
        stats.averageQueryCount = ((stats.averageQueryCount * (stats.count - 1)) + metric.queryCount) / stats.count;
        
        if (metric.executionTime > 2000) {
          stats.slowQueries++;
        }
      }
    });

    return {
      totalRequests: recentMetrics.length,
      averageExecutionTime: Math.round(totalExecutionTime / recentMetrics.length),
      slowQueries,
      averageQueryCount: Math.round(totalQueryCount / recentMetrics.length),
      endpointStats,
      timeRange: `${timeRangeMinutes} minutes`
    };
  }

  /**
   * Get slow query alerts
   */
  getSlowQueryAlerts(thresholdMs: number = 2000, timeRangeMinutes: number = 60) {
    const cutoffTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
    const slowQueries = this.metrics.filter(m => 
      m.timestamp >= cutoffTime && m.executionTime > thresholdMs
    );

    return slowQueries.map(metric => ({
      endpoint: metric.endpoint,
      executionTime: metric.executionTime,
      queryCount: metric.queryCount,
      timestamp: metric.timestamp,
      userId: metric.userId,
      timeRange: metric.timeRange,
      severity: metric.executionTime > 5000 ? 'high' : 'medium'
    }));
  }

  /**
   * Clear all metrics (for testing)
   */
  clearMetrics() {
    this.metrics = [];
  }
}

// Singleton instance
export const analyticsPerformanceMonitor = new AnalyticsPerformanceMonitor();

export default analyticsPerformanceMonitor;
