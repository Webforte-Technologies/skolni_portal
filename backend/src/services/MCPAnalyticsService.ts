import { Pool } from 'pg';

export interface MCPAnalyticsData {
  // Overview metrics
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  cacheHitRate: number;

  // Time series data
  requestsOverTime: { date: string; requests: number; success: number; errors: number }[];
  tokensOverTime: { date: string; tokens: number; cost: number }[];
  responseTimeOverTime: { date: string; avg_response_time: number }[];

  // Model performance
  modelStats: {
    model: string;
    requests: number;
    success_rate: number;
    avg_response_time: number;
    total_tokens: number;
    total_cost: number;
  }[];

  // Provider health
  providerHealth: {
    provider: string;
    status: string;
    requests: number;
    error_rate: number;
    avg_response_time: number;
  }[];

  // Request types breakdown
  requestTypeBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];

  // Recent errors
  recentErrors: {
    timestamp: string;
    model: string;
    error_code: string;
    error_message: string;
    user_id: string;
  }[];

  // Cache performance
  cacheStats: {
    total_cached_responses: number;
    cache_hit_count: number;
    cache_miss_count: number;
    cache_efficiency: number;
    avg_cache_ttl: number;
  };
}

export class MCPAnalyticsService {
  constructor(private pool: Pool) {}

  async getAnalytics(days: number = 30): Promise<MCPAnalyticsData> {
    console.log('MCPAnalyticsService.getAnalytics called with days:', days);
    const client = await this.pool.connect();
    
    try {
      // Check if tables exist and have data
      const tableCheck = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM ai_requests) as requests_count,
          (SELECT COUNT(*) FROM ai_providers) as providers_count
      `);
      
      console.log('Table check results:', tableCheck.rows[0]);
      
      if (tableCheck.rows[0].requests_count === 0) {
        console.log('No AI requests found in database');
        // Return empty analytics data instead of throwing error
        return {
          totalRequests: 0,
          successRate: 0,
          averageResponseTime: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          cacheHitRate: 0,
          requestsOverTime: [],
          tokensOverTime: [],
          responseTimeOverTime: [],
          modelStats: [],
          providerHealth: [],
          requestTypeBreakdown: [],
          recentErrors: [],
          cacheStats: {
            total_cached_responses: 0,
            cache_hit_count: 0,
            cache_miss_count: 0,
            cache_efficiency: 0,
            avg_cache_ttl: 0
          }
        };
      }
      // Get overview metrics
      const overviewQuery = `
        SELECT 
          COUNT(*) as total_requests,
          AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate,
          AVG(processing_time_ms) as avg_response_time,
          SUM(tokens_used) as total_tokens,
          SUM(cost) as total_cost,
          AVG(CASE WHEN cached THEN 1 ELSE 0 END) * 100 as cache_hit_rate
        FROM ai_requests 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
      `;
      const overviewResult = await client.query(overviewQuery);
      const overview = overviewResult.rows[0];

      // Get requests over time (daily)
      const requestsOverTimeQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as requests,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as success,
          SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as errors
        FROM ai_requests 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      const requestsOverTimeResult = await client.query(requestsOverTimeQuery);

      // Get tokens and cost over time
      const tokensOverTimeQuery = `
        SELECT 
          DATE(created_at) as date,
          SUM(tokens_used) as tokens,
          SUM(cost) as cost
        FROM ai_requests 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      const tokensOverTimeResult = await client.query(tokensOverTimeQuery);

      // Get response time over time
      const responseTimeQuery = `
        SELECT 
          DATE(created_at) as date,
          AVG(processing_time_ms) as avg_response_time
        FROM ai_requests 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
          AND processing_time_ms IS NOT NULL
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      const responseTimeResult = await client.query(responseTimeQuery);

      // Get model performance stats
      const modelStatsQuery = `
        SELECT 
          model_used as model,
          COUNT(*) as requests,
          AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate,
          AVG(processing_time_ms) as avg_response_time,
          SUM(tokens_used) as total_tokens,
          SUM(cost) as total_cost
        FROM ai_requests 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
          AND model_used IS NOT NULL
        GROUP BY model_used
        ORDER BY requests DESC
      `;
      const modelStatsResult = await client.query(modelStatsQuery);

      // Get provider health
      const providerHealthQuery = `
        SELECT 
          p.name as provider,
          COALESCE(h.status, 'unknown') as status,
          COUNT(r.id) as requests,
          AVG(CASE WHEN NOT r.success THEN 1 ELSE 0 END) * 100 as error_rate,
          AVG(r.processing_time_ms) as avg_response_time
        FROM ai_providers p
        LEFT JOIN ai_requests r ON p.id = r.provider_id 
          AND r.created_at >= NOW() - INTERVAL '${days} days'
        LEFT JOIN provider_health_status h ON p.id = h.provider_id 
          AND h.check_timestamp = (
            SELECT MAX(check_timestamp) 
            FROM provider_health_status h2 
            WHERE h2.provider_id = p.id
          )
        GROUP BY p.id, p.name, h.status
        ORDER BY requests DESC
      `;
      const providerHealthResult = await client.query(providerHealthQuery);

      // Get request type breakdown
      const requestTypeQuery = `
        SELECT 
          request_type as type,
          COUNT(*) as count,
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ai_requests WHERE created_at >= NOW() - INTERVAL '${days} days')) as percentage
        FROM ai_requests 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY request_type
        ORDER BY count DESC
      `;
      const requestTypeResult = await client.query(requestTypeQuery);

      // Get recent errors
      const recentErrorsQuery = `
        SELECT 
          created_at as timestamp,
          model_used as model,
          error_code,
          error_message,
          user_id
        FROM ai_requests 
        WHERE NOT success 
          AND created_at >= NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const recentErrorsResult = await client.query(recentErrorsQuery);

      // Get cache statistics
      const cacheStatsQuery = `
        SELECT 
          COUNT(*) as total_cached_responses,
          SUM(hit_count) as cache_hit_count,
          COUNT(*) - SUM(hit_count) as cache_miss_count,
          (SUM(hit_count) * 100.0 / NULLIF(COUNT(*), 0)) as cache_efficiency,
          AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) as avg_cache_ttl
        FROM ai_response_cache
        WHERE created_at >= NOW() - INTERVAL '${days} days'
      `;
      const cacheStatsResult = await client.query(cacheStatsQuery);
      const cacheStats = cacheStatsResult.rows[0] || {
        total_cached_responses: 0,
        cache_hit_count: 0,
        cache_miss_count: 0,
        cache_efficiency: 0,
        avg_cache_ttl: 0
      };

      return {
        totalRequests: parseInt(overview.total_requests) || 0,
        successRate: parseFloat(overview.success_rate) || 0,
        averageResponseTime: parseFloat(overview.avg_response_time) || 0,
        totalTokensUsed: parseInt(overview.total_tokens) || 0,
        totalCost: parseFloat(overview.total_cost) || 0,
        cacheHitRate: parseFloat(overview.cache_hit_rate) || 0,

        requestsOverTime: requestsOverTimeResult.rows.map(row => ({
          date: row.date,
          requests: parseInt(row.requests),
          success: parseInt(row.success),
          errors: parseInt(row.errors)
        })),

        tokensOverTime: tokensOverTimeResult.rows.map(row => ({
          date: row.date,
          tokens: parseInt(row.tokens) || 0,
          cost: parseFloat(row.cost) || 0
        })),

        responseTimeOverTime: responseTimeResult.rows.map(row => ({
          date: row.date,
          avg_response_time: parseFloat(row.avg_response_time) || 0
        })),

        modelStats: modelStatsResult.rows.map(row => ({
          model: row.model,
          requests: parseInt(row.requests),
          success_rate: parseFloat(row.success_rate) || 0,
          avg_response_time: parseFloat(row.avg_response_time) || 0,
          total_tokens: parseInt(row.total_tokens) || 0,
          total_cost: parseFloat(row.total_cost) || 0
        })),

        providerHealth: providerHealthResult.rows.map(row => ({
          provider: row.provider,
          status: row.status,
          requests: parseInt(row.requests) || 0,
          error_rate: parseFloat(row.error_rate) || 0,
          avg_response_time: parseFloat(row.avg_response_time) || 0
        })),

        requestTypeBreakdown: requestTypeResult.rows.map(row => ({
          type: row.type,
          count: parseInt(row.count),
          percentage: parseFloat(row.percentage) || 0
        })),

        recentErrors: recentErrorsResult.rows.map(row => ({
          timestamp: row.timestamp,
          model: row.model || 'unknown',
          error_code: row.error_code || 'unknown',
          error_message: row.error_message || 'No message',
          user_id: row.user_id
        })),

        cacheStats: {
          total_cached_responses: parseInt(cacheStats.total_cached_responses) || 0,
          cache_hit_count: parseInt(cacheStats.cache_hit_count) || 0,
          cache_miss_count: parseInt(cacheStats.cache_miss_count) || 0,
          cache_efficiency: parseFloat(cacheStats.cache_efficiency) || 0,
          avg_cache_ttl: parseFloat(cacheStats.avg_cache_ttl) || 0
        }
      };

    } finally {
      client.release();
    }
  }

  async getModelPerformanceTrends(model: string, days: number = 30): Promise<{
    performance_over_time: { date: string; avg_response_time: number; success_rate: number; cost: number }[];
    usage_breakdown: { hour: number; requests: number }[];
  }> {
    const client = await this.pool.connect();
    
    try {
      // Performance over time for specific model
      const performanceQuery = `
        SELECT 
          DATE(created_at) as date,
          AVG(processing_time_ms) as avg_response_time,
          AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate,
          SUM(cost) as cost
        FROM ai_requests 
        WHERE model_used = $1 
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      const performanceResult = await client.query(performanceQuery, [model]);

      // Usage by hour of day
      const usageQuery = `
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as requests
        FROM ai_requests 
        WHERE model_used = $1 
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour ASC
      `;
      const usageResult = await client.query(usageQuery, [model]);

      return {
        performance_over_time: performanceResult.rows.map(row => ({
          date: row.date,
          avg_response_time: parseFloat(row.avg_response_time) || 0,
          success_rate: parseFloat(row.success_rate) || 0,
          cost: parseFloat(row.cost) || 0
        })),
        usage_breakdown: usageResult.rows.map(row => ({
          hour: parseInt(row.hour),
          requests: parseInt(row.requests)
        }))
      };

    } finally {
      client.release();
    }
  }
}

export default MCPAnalyticsService;
