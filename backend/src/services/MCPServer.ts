import { Pool } from 'pg';
import { EventEmitter } from 'events';
import { AIProvider } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { ModelRouter } from './ModelRouter';
import { ResponseCache } from './ResponseCache';
import { 
  MCPRequest, 
  MCPResponse, 
  MCPServerConfig, 
  AIProviderConfig, 
  StreamingResponse,
  MCPEvent,
  ProviderHealthStatus,
  MCPAnalytics,
  FallbackResult
} from '../types/mcp';

/**
 * Model Context Protocol (MCP) Server
 * Central service for managing AI provider interactions with intelligent routing,
 * caching, and fallback mechanisms
 */
export class MCPServer extends EventEmitter {
  private db: Pool;
  private config: MCPServerConfig;
  private providers: Map<string, AIProvider> = new Map();
  private modelRouter: ModelRouter;
  private responseCache: ResponseCache;
  private initialized = false;
  private healthCheckInterval?: NodeJS.Timeout;
  
  constructor(database: Pool) {
    super();
    this.db = database;
    this.modelRouter = new ModelRouter(database);
    this.responseCache = new ResponseCache(database);
    
    // Default configuration
    this.config = {
      providers: [],
      routing_rules: [],
      caching: {
        enabled: true,
        default_ttl: 3600,
        max_cache_size: 10000
      },
      rate_limiting: {
        enabled: true,
        default_rpm: 100,
        default_tpm: 200000
      },
      fallback: {
        enabled: true,
        max_retries: 3,
        backoff_strategy: 'exponential'
      }
    };
  }
  
  /**
   * Initialize the MCP server
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // Update API key from environment if available
      await this.updateApiKeyFromEnv();
      
      // Load configuration from database
      await this.loadConfiguration();
      
      // Initialize AI providers
      await this.initializeProviders();
      
      // Start health monitoring only if providers are available
      if (this.config.caching.enabled && this.config.providers.length > 0) {
        this.startHealthMonitoring();
      }
      
      this.initialized = true;
      this.emit('initialized');
      
      console.log('MCP Server initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize MCP Server:', error);
      throw error;
    }
  }
  
  /**
   * Process an AI request
   */
  async processRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.initialized) {
      throw new Error('MCP Server not initialized');
    }
    
    const startTime = Date.now();
    this.emit('request_started', { type: 'request_started', data: request });
    
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        const errorResponse = this.createErrorResponse(
          request,
          validation.error!,
          'VALIDATION_ERROR'
        );
        this.emit('request_failed', { 
          type: 'request_failed', 
          data: { request, error: new Error(validation.error!) } 
        });
        return errorResponse;
      }
      
      // Check cache first
      if (this.config.caching.enabled) {
        const cachedResponse = await this.responseCache.getCache(request);
        if (cachedResponse) {
          this.emit('cache_hit', { 
            type: 'cache_hit', 
            data: { request_id: request.id, cache_key: 'cached' } 
          });
          this.emit('request_completed', { type: 'request_completed', data: cachedResponse });
          await this.logRequest(request, cachedResponse);
          return cachedResponse;
        }
        
        this.emit('cache_miss', { 
          type: 'cache_miss', 
          data: { request_id: request.id, cache_key: 'missed' } 
        });
      }
      
      // Check if providers are available
      if (this.providers.size === 0) {
        const errorResponse = this.createErrorResponse(
          request,
          'No AI providers configured. Please configure AI providers in the database.',
          'NO_PROVIDERS_AVAILABLE'
        );
        this.emit('request_failed', { 
          type: 'request_failed', 
          data: { request, error: new Error('No AI providers configured') } 
        });
        await this.logRequest(request, errorResponse);
        return errorResponse;
      }
      
      // Route to appropriate provider
      const routing = await this.modelRouter.routeRequest(request);
      const provider = this.providers.get(routing.provider.id);
      
      if (!provider) {
        throw new Error(`Provider ${routing.provider.name} not available`);
      }
      
      // Process request with fallback handling
      const response = await this.processWithFallback(request, provider, routing.model);
      
      // Cache successful responses
      if (this.config.caching.enabled && response.success) {
        await this.responseCache.setCache(request, response);
      }
      
      // Log request
      await this.logRequest(request, response);
      
      this.emit('request_completed', { type: 'request_completed', data: response });
      return response;
      
    } catch (error: any) {
      const errorResponse = this.createErrorResponse(
        request,
        error.message || 'Unknown error occurred',
        'SERVER_ERROR'
      );
      
      this.emit('request_failed', { 
        type: 'request_failed', 
        data: { request, error } 
      });
      
      await this.logRequest(request, errorResponse);
      return errorResponse;
    }
  }
  
  /**
   * Process a streaming request
   */
  async processStreamingRequest(
    request: MCPRequest,
    onChunk: (chunk: StreamingResponse) => void
  ): Promise<MCPResponse> {
    if (!this.initialized) {
      throw new Error('MCP Server not initialized');
    }
    
    try {
      // Check if providers are available
      if (this.providers.size === 0) {
        const errorResponse = this.createErrorResponse(
          request,
          'No AI providers configured. Please configure AI providers in the database.',
          'NO_PROVIDERS_AVAILABLE'
        );
        await this.logRequest(request, errorResponse);
        return errorResponse;
      }
      
      // Route to appropriate provider
      const routing = await this.modelRouter.routeRequest(request);
      const provider = this.providers.get(routing.provider.id);
      
      if (!provider) {
        throw new Error(`Provider ${routing.provider.name} not available`);
      }
      
      // Process streaming request
      const response = await provider.processStreamingRequest(request, onChunk);
      
      // Log request
      await this.logRequest(request, response);
      
      return response;
      
    } catch (error: any) {
      const errorResponse = this.createErrorResponse(
        request,
        error.message || 'Streaming request failed',
        'STREAMING_ERROR'
      );
      
      await this.logRequest(request, errorResponse);
      return errorResponse;
    }
  }
  
  /**
   * Get server analytics
   */
  async getAnalytics(options: {
    startDate: Date;
    endDate: Date;
    granularity?: 'hour' | 'day' | 'week';
  }): Promise<MCPAnalytics> {
    const { startDate, endDate, granularity = 'day' } = options;
    
    try {
      // Request statistics
      const requestStatsQuery = `
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
          SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
          SUM(CASE WHEN cached THEN 1 ELSE 0 END) as cached_requests,
          AVG(processing_time_ms) as average_response_time_ms
        FROM ai_requests
        WHERE created_at BETWEEN $1 AND $2
      `;
      
      // Model usage statistics
      const modelUsageQuery = `
        SELECT 
          model_used as model,
          COUNT(*) as request_count,
          SUM(tokens_used) as total_tokens,
          AVG(tokens_used) as average_tokens_per_request,
          SUM(cost) as total_cost
        FROM ai_requests
        WHERE created_at BETWEEN $1 AND $2 AND success = true
        GROUP BY model_used
        ORDER BY request_count DESC
      `;
      
      // Provider performance
      const providerPerformanceQuery = `
        SELECT 
          p.name as provider_id,
          COUNT(r.*) as request_count,
          AVG(CASE WHEN r.success THEN 1.0 ELSE 0.0 END) as success_rate,
          AVG(r.processing_time_ms) as average_response_time_ms,
          SUM(CASE WHEN NOT r.success THEN 1 ELSE 0 END) as error_count
        FROM ai_requests r
        JOIN ai_providers p ON r.provider_id = p.id
        WHERE r.created_at BETWEEN $1 AND $2
        GROUP BY p.id, p.name
        ORDER BY request_count DESC
      `;
      
      const [requestStats, modelUsage, providerPerformance] = await Promise.all([
        this.db.query(requestStatsQuery, [startDate, endDate]),
        this.db.query(modelUsageQuery, [startDate, endDate]),
        this.db.query(providerPerformanceQuery, [startDate, endDate])
      ]);
      
      const stats = requestStats.rows[0] || {};
      
      return {
        time_period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        request_stats: {
          total_requests: parseInt(stats.total_requests) || 0,
          successful_requests: parseInt(stats.successful_requests) || 0,
          failed_requests: parseInt(stats.failed_requests) || 0,
          cached_requests: parseInt(stats.cached_requests) || 0,
          average_response_time_ms: parseFloat(stats.average_response_time_ms) || 0
        },
        model_usage: modelUsage.rows.map(row => ({
          model: row.model,
          request_count: parseInt(row.request_count),
          total_tokens: parseInt(row.total_tokens),
          average_tokens_per_request: parseFloat(row.average_tokens_per_request),
          total_cost: parseFloat(row.total_cost) || 0
        })),
        provider_performance: providerPerformance.rows.map(row => ({
          provider_id: row.provider_id,
          request_count: parseInt(row.request_count),
          success_rate: parseFloat(row.success_rate),
          average_response_time_ms: parseFloat(row.average_response_time_ms),
          error_count: parseInt(row.error_count)
        })),
        cost_analysis: {
          total_cost: modelUsage.rows.reduce((sum, row) => sum + (parseFloat(row.total_cost) || 0), 0),
          cost_by_model: modelUsage.rows.map(row => ({
            model: row.model,
            cost: parseFloat(row.total_cost) || 0
          })),
          cost_by_provider: providerPerformance.rows.map(row => ({
            provider: row.provider_id,
            cost: 0 // Would need additional query to calculate
          })),
          cost_savings_from_cache: 0 // Would need additional calculation
        }
      };
      
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get provider health status
   */
  async getProviderHealth(): Promise<ProviderHealthStatus[]> {
    const query = `
      SELECT DISTINCT ON (p.id)
        p.id as provider_id,
        p.name,
        COALESCE(h.status, 'unknown') as status,
        h.response_time_ms,
        h.error_rate,
        h.rate_limit_remaining,
        h.models_available,
        h.check_timestamp as last_check
      FROM ai_providers p
      LEFT JOIN provider_health_status h ON p.id = h.provider_id
      WHERE p.enabled = true
      ORDER BY p.id, h.check_timestamp DESC
    `;
    
    const result = await this.db.query(query);
    
    return result.rows.map(row => ({
      provider_id: row.provider_id,
      status: row.status as 'healthy' | 'degraded' | 'unhealthy',
      last_check: row.last_check || new Date().toISOString(),
      response_time_ms: row.response_time_ms,
      error_rate: parseFloat(row.error_rate) || 0,
      rate_limit_remaining: row.rate_limit_remaining,
      models_available: row.models_available || []
    }));
  }
  
  /**
   * Shutdown the MCP server
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.initialized = false;
    this.emit('shutdown');
    console.log('MCP Server shut down');
  }
  
  /**
   * Update API key from environment variable
   */
  private async updateApiKeyFromEnv(): Promise<void> {
    try {
      const apiKey = process.env['OPENAI_API_KEY'];
      
      if (!apiKey || apiKey === 'your-openai-api-key') {
        console.warn('⚠️ OPENAI_API_KEY not set or is placeholder value');
        return;
      }
      
      const result = await this.db.query(`
        UPDATE ai_providers 
        SET api_key = $1, updated_at = NOW()
        WHERE type = 'openai' AND name = 'OpenAI GPT-5'
        RETURNING id, name, enabled
      `, [apiKey]);
      
      if (result.rowCount && result.rowCount > 0) {
        console.log('✅ OpenAI API key updated from environment variable');
      }
      
    } catch (error) {
      console.warn('⚠️ Failed to update API key from environment:', error);
    }
  }

  /**
   * Load configuration from database
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const configQuery = 'SELECT config_key, config_value FROM mcp_server_config';
      const providersQuery = 'SELECT * FROM ai_providers WHERE enabled = true';
      
      const [configResult, providersResult] = await Promise.all([
        this.db.query(configQuery),
        this.db.query(providersQuery)
      ]);
      
      // Load server configuration
      configResult.rows.forEach(row => {
        const value = row.config_value;
        switch (row.config_key) {
          case 'caching':
            this.config.caching = { ...this.config.caching, ...value };
            break;
          case 'rate_limiting':
            this.config.rate_limiting = { ...this.config.rate_limiting, ...value };
            break;
          case 'fallback':
            this.config.fallback = { ...this.config.fallback, ...value };
            break;
        }
      });
      
      // Load providers
      this.config.providers = providersResult.rows;
      
    } catch (error: any) {
      // If tables don't exist yet (migration not applied), use default configuration
      if (error.code === '42P01') { // relation does not exist
        console.log('MCP Server tables not found, using default configuration');
        this.config.providers = [];
        // Keep default configuration values
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Initialize AI providers
   */
  private async initializeProviders(): Promise<void> {
    if (this.config.providers.length === 0) {
      console.log('No AI providers configured, MCP Server will use default fallback behavior');
      return;
    }
    
    for (const providerConfig of this.config.providers) {
      try {
        let provider: AIProvider;
        
        switch (providerConfig.type) {
          case 'openai':
            provider = new OpenAIProvider({
              apiKey: providerConfig.api_key,
              ...(providerConfig.base_url && { baseUrl: providerConfig.base_url }),
              ...(providerConfig.timeout_ms && { timeout: providerConfig.timeout_ms })
            });
            break;
          
          default:
            console.warn(`Unsupported provider type: ${providerConfig.type}`);
            continue;
        }
        
        this.providers.set(providerConfig.id, provider);
        console.log(`Initialized provider: ${providerConfig.name}`);
        
      } catch (error) {
        console.error(`Failed to initialize provider ${providerConfig.name}:`, error);
      }
    }
  }
  
  /**
   * Process request with fallback handling
   */
  private async processWithFallback(
    request: MCPRequest, 
    primaryProvider: AIProvider, 
    model: string
  ): Promise<MCPResponse> {
    const attempts: FallbackResult['attempts'] = [];
    let lastError: Error | null = null;
    
    try {
      // Try primary provider first
      const response = await primaryProvider.processRequest(request);
      attempts.push({
        provider_id: 'primary',
        model,
        response_time_ms: response.metadata.processing_time_ms
      });
      
      if (response.success) {
        return response;
      }
      
      lastError = new Error(response.error?.message || 'Primary provider failed');
    } catch (error: any) {
      lastError = error;
      attempts.push({
        provider_id: 'primary',
        model,
        error: error.message
      });
    }
    
    // Try fallback providers if enabled
    if (this.config.fallback.enabled) {
      const availableProviders = await this.modelRouter.getAvailableProviders();
      const fallbackProviders = availableProviders
        .filter(p => p.healthy && p.provider.id !== request.model_preference)
        .slice(0, this.config.fallback.max_retries);
      
      for (const fallbackProvider of fallbackProviders) {
        try {
          this.emit('fallback_triggered', {
            type: 'fallback_triggered',
            data: {
              request_id: request.id,
              original_provider: 'primary',
              fallback_provider: fallbackProvider.provider.name
            }
          });
          
          const provider = this.providers.get(fallbackProvider.provider.id);
          if (!provider) continue;
          
          const fallbackModel = fallbackProvider.models[0]; // Use first available model
          if (!fallbackModel) {
            console.warn(`No models available for fallback provider ${fallbackProvider.provider.id}`);
            continue;
          }
          const fallbackRequest = { ...request, model_preference: fallbackModel as string };
          
          const response = await provider.processRequest(fallbackRequest);
          attempts.push({
            provider_id: fallbackProvider.provider.id,
            model: fallbackModel,
            response_time_ms: response.metadata.processing_time_ms
          });
          
          if (response.success) {
            return response;
          }
          
        } catch (error: any) {
          const fallbackModel = fallbackProvider.models[0];
          attempts.push({
            provider_id: fallbackProvider.provider.id,
            model: fallbackModel || 'unknown',
            error: error.message
          });
        }
      }
    }
    
    // All attempts failed
    throw lastError || new Error('All providers failed');
  }
  
  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): Promise<void> {
    const interval = 5 * 60 * 1000; // 5 minutes
    
    this.healthCheckInterval = setInterval(async () => {
      for (const [providerId, provider] of this.providers) {
        try {
          const health = await provider.healthCheck();
          await this.updateProviderHealth(providerId, health);
        } catch (error) {
          console.error(`Health check failed for provider ${providerId}:`, error);
        }
      }
    }, interval);
    
    return Promise.resolve();
  }
  
  /**
   * Update provider health status
   */
  private async updateProviderHealth(
    providerId: string,
    health: { healthy: boolean; responseTime: number; error?: string }
  ): Promise<void> {
    const status = health.healthy ? 'healthy' : 'unhealthy';
    const query = `
      INSERT INTO provider_health_status (provider_id, status, response_time_ms, last_error)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.db.query(query, [
      providerId,
      status,
      health.responseTime,
      health.error || null
    ]);
  }
  
  /**
   * Log request and response
   */
  private async logRequest(request: MCPRequest, response: MCPResponse): Promise<void> {
    try {
      const query = `
        INSERT INTO ai_requests (
          id, user_id, conversation_id, request_type, provider_id, model_used,
          priority, parameters, response_data, tokens_used, processing_time_ms,
          cost, success, error_code, error_message, cached, metadata, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      `;
      
      const providerId = response.metadata.provider_used ? 
        await this.getProviderIdByName(response.metadata.provider_used) : null;
      
      await this.db.query(query, [
        request.id,
        request.user_id,
        request.conversation_id || null,
        request.type,
        providerId,
        response.metadata.model_used,
        request.priority,
        JSON.stringify(request.parameters),
        JSON.stringify(response.data),
        response.metadata.tokens_used || 0,
        response.metadata.processing_time_ms,
        response.metadata.cost || 0,
        response.success,
        response.error?.code || null,
        response.error?.message || null,
        response.metadata.cached || false,
        JSON.stringify(request.metadata),
        request.metadata.ip_address || null,
        request.metadata.user_agent || null
      ]);
    } catch (error: any) {
      // If the ai_requests table doesn't exist yet, just log to console
      if (error.code === '42P01') { // relation does not exist
        console.log(`Request logged to console (tables not ready): ${request.type} - ${response.success ? 'SUCCESS' : 'FAILED'}`);
      } else {
        console.error('Failed to log request to database:', error);
      }
    }
  }
  
  /**
   * Validate request structure
   */
  private validateRequest(request: MCPRequest): { valid: boolean; error?: string } {
    if (!request.id) {
      return { valid: false, error: 'Request ID is required' };
    }
    
    if (!request.user_id) {
      return { valid: false, error: 'User ID is required' };
    }
    
    if (!['chat', 'generation', 'analysis'].includes(request.type)) {
      return { valid: false, error: 'Invalid request type' };
    }
    
    if (!request.parameters) {
      return { valid: false, error: 'Request parameters are required' };
    }
    
    return { valid: true };
  }
  
  /**
   * Create error response
   */
  private createErrorResponse(
    request: MCPRequest,
    error: string,
    code: string = 'SERVER_ERROR'
  ): MCPResponse {
    return {
      id: crypto.randomUUID(),
      request_id: request.id,
      success: false,
      error: {
        code,
        message: error
      },
      metadata: {
        processing_time_ms: 0,
        cached: false
      },
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Get provider ID by name
   */
  private async getProviderIdByName(providerName: string): Promise<string | null> {
    try {
      const query = 'SELECT id FROM ai_providers WHERE name = $1';
      const result = await this.db.query(query, [providerName]);
      return result.rows[0]?.id || null;
    } catch (error: any) {
      // If the ai_providers table doesn't exist yet, return null
      if (error.code === '42P01') { // relation does not exist
        return null;
      }
      return null;
    }
  }
}
