import { Pool } from 'pg';
import crypto from 'crypto';
import { MCPRequest, MCPResponse, CacheEntry } from '../types/mcp';

/**
 * AI response caching service
 * Caches AI responses to reduce costs and improve performance
 */
export class ResponseCache {
  private db: Pool;
  private defaultTTL: number;
  private maxCacheSize: number;
  private enabled: boolean;
  
  constructor(
    database: Pool,
    options: {
      enabled?: boolean;
      defaultTTL?: number;
      maxCacheSize?: number;
    } = {}
  ) {
    this.db = database;
    this.enabled = options.enabled ?? true;
    this.defaultTTL = options.defaultTTL ?? 3600; // 1 hour default
    this.maxCacheSize = options.maxCacheSize ?? 10000;
  }
  
  /**
   * Get cached response for a request
   */
  async getCache(request: MCPRequest): Promise<MCPResponse | null> {
    if (!this.enabled || !this.shouldCache(request)) {
      return null;
    }
    
    const cacheKey = this.generateCacheKey(request);
    
    try {
      const query = `
        SELECT response_data, model_used, provider_id, tokens_used, cost, created_at
        FROM ai_response_cache 
        WHERE cache_key = $1 AND expires_at > CURRENT_TIMESTAMP
      `;
      
      const result = await this.db.query(query, [cacheKey]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const cacheEntry = result.rows[0];
      
      // Update hit count and last accessed
      await this.updateCacheHit(cacheKey);
      
      // Create response from cached data
      const cachedResponse: MCPResponse = {
        id: crypto.randomUUID(),
        request_id: request.id,
        success: true,
        data: cacheEntry.response_data,
        metadata: {
          model_used: cacheEntry.model_used,
          provider_used: await this.getProviderName(cacheEntry.provider_id),
          tokens_used: cacheEntry.tokens_used,
          processing_time_ms: 0, // Cached response is instant
          cached: true,
          cost: cacheEntry.cost
        },
        timestamp: new Date().toISOString()
      };
      
      return cachedResponse;
      
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, return null
      if (error.code === '42P01') { // relation does not exist
        return null;
      }
      console.error('Cache retrieval error:', error);
      return null;
    }
  }
  
  /**
   * Store response in cache
   */
  async setCache(request: MCPRequest, response: MCPResponse): Promise<void> {
    if (!this.enabled || !this.shouldCache(request) || !response.success) {
      return;
    }
    
    try {
      // Check cache size limits
      await this.enforceMaxCacheSize();
      
      const cacheKey = this.generateCacheKey(request);
      const requestHash = this.generateRequestHash(request);
      const ttl = this.getTTLForRequest(request);
      const expiresAt = new Date(Date.now() + ttl * 1000);
      
      const query = `
        INSERT INTO ai_response_cache (
          cache_key, request_hash, response_data, model_used, provider_id, 
          tokens_used, cost, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (cache_key) DO UPDATE SET
          response_data = EXCLUDED.response_data,
          model_used = EXCLUDED.model_used,
          provider_id = EXCLUDED.provider_id,
          tokens_used = EXCLUDED.tokens_used,
          cost = EXCLUDED.cost,
          expires_at = EXCLUDED.expires_at,
          last_accessed_at = CURRENT_TIMESTAMP
      `;
      
      const providerId = await this.getProviderIdByName(response.metadata.provider_used || '');
      
      await this.db.query(query, [
        cacheKey,
        requestHash,
        JSON.stringify(response.data),
        response.metadata.model_used,
        providerId,
        response.metadata.tokens_used || 0,
        response.metadata.cost || 0,
        expiresAt
      ]);
      
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, just log and continue
      if (error.code === '42P01') { // relation does not exist
        console.log('Cache storage skipped (tables not ready)');
      } else {
        console.error('Cache storage error:', error);
      }
    }
  }
  
  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<number> {
    try {
      const query = 'DELETE FROM ai_response_cache WHERE expires_at <= CURRENT_TIMESTAMP';
      const result = await this.db.query(query);
      return result.rowCount || 0;
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, return 0
      if (error.code === '42P01') { // relation does not exist
        return 0;
      }
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
  
  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<number> {
    try {
      const query = 'DELETE FROM ai_response_cache';
      const result = await this.db.query(query);
      return result.rowCount || 0;
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, return 0
      if (error.code === '42P01') { // relation does not exist
        return 0;
      }
      console.error('Cache clear error:', error);
      return 0;
    }
  }
  
  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    averageAge: number;
    topModels: { model: string; count: number }[];
  }> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_entries,
          SUM(hit_count) as total_hits,
          COUNT(*) FILTER (WHERE hit_count > 0) as entries_with_hits,
          AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at))) as avg_age_seconds
        FROM ai_response_cache
      `;
      
      const modelsQuery = `
        SELECT model_used, COUNT(*) as count
        FROM ai_response_cache
        GROUP BY model_used
        ORDER BY count DESC
        LIMIT 5
      `;
      
      const [statsResult, modelsResult] = await Promise.all([
        this.db.query(statsQuery),
        this.db.query(modelsQuery)
      ]);
      
      const stats = statsResult.rows[0];
      const totalHits = parseInt(stats.total_hits) || 0;
      const totalEntries = parseInt(stats.total_entries) || 0;
      const entriesWithHits = parseInt(stats.entries_with_hits) || 0;
      
      return {
        totalEntries,
        totalSize: totalEntries * 1024, // Rough estimate
        hitRate: entriesWithHits > 0 ? (totalHits / entriesWithHits) : 0,
        averageAge: parseFloat(stats.avg_age_seconds) || 0,
        topModels: modelsResult.rows
      };
      
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, return empty stats
      if (error.code === '42P01') { // relation does not exist
        return {
          totalEntries: 0,
          totalSize: 0,
          hitRate: 0,
          averageAge: 0,
          topModels: []
        };
      }
      console.error('Cache stats error:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        averageAge: 0,
        topModels: []
      };
    }
  }
  
  /**
   * Invalidate cache entries by pattern
   */
  async invalidateByPattern(pattern: {
    user_id?: string;
    model?: string;
    provider?: string;
    subject?: string;
  }): Promise<number> {
    try {
      let query = 'DELETE FROM ai_response_cache WHERE 1=1';
      const values: any[] = [];
      let paramIndex = 1;
      
      if (pattern.model) {
        query += ` AND model_used = $${paramIndex++}`;
        values.push(pattern.model);
      }
      
      if (pattern.provider) {
        const providerId = await this.getProviderIdByName(pattern.provider);
        if (providerId) {
          query += ` AND provider_id = $${paramIndex++}`;
          values.push(providerId);
        }
      }
      
      // For user_id and subject, we'd need to decode the cache key or store additional metadata
      // This is a simplified implementation
      
      const result = await this.db.query(query, values);
      return result.rowCount || 0;
      
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, return 0
      if (error.code === '42P01') { // relation does not exist
        return 0;
      }
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }
  
  /**
   * Generate cache key for a request
   */
  private generateCacheKey(request: MCPRequest): string {
    // Create a deterministic key based on request parameters
    const keyData = {
      type: request.type,
      parameters: this.normalizeParameters(request.parameters),
      // Don't include user_id for cross-user caching, but include it if needed for privacy
      model_preference: request.model_preference
    };
    
    const keyString = JSON.stringify(keyData, Object.keys(keyData).sort());
    return crypto.createHash('sha256').update(keyString).digest('hex').substring(0, 32);
  }
  
  /**
   * Generate request hash for deduplication
   */
  private generateRequestHash(request: MCPRequest): string {
    const hashData = {
      type: request.type,
      parameters: request.parameters,
      user_id: request.user_id
    };
    
    const hashString = JSON.stringify(hashData);
    return crypto.createHash('md5').update(hashString).digest('hex');
  }
  
  /**
   * Normalize parameters for consistent caching
   */
  private normalizeParameters(params: Record<string, any>): Record<string, any> {
    const normalized = { ...params };
    
    // Remove non-deterministic parameters
    delete normalized['timestamp'];
    delete normalized['session_id'];
    delete normalized['request_id'];
    
    // Normalize text content
    if (normalized['message']) {
      normalized['message'] = normalized['message'].trim().toLowerCase();
    }
    
    if (normalized['description']) {
      normalized['description'] = normalized['description'].trim().toLowerCase();
    }
    
    // Sort arrays for consistency
    if (normalized['objectives'] && Array.isArray(normalized['objectives'])) {
      normalized['objectives'] = [...normalized['objectives']].sort();
    }
    
    return normalized;
  }
  
  /**
   * Determine if a request should be cached
   */
  private shouldCache(request: MCPRequest): boolean {
    // Don't cache if explicitly disabled
    if (request.caching?.enabled === false) {
      return false;
    }
    
    // Don't cache urgent requests (they need fresh responses)
    if (request.priority === 'urgent') {
      return false;
    }
    
    // Don't cache requests with real-time requirements
    if (request.parameters['real_time_required']) {
      return false;
    }
    
    // Don't cache requests with user-specific content
    if (request.parameters['personal_data'] || request.parameters['user_specific']) {
      return false;
    }
    
    // Cache generation and analysis requests
    if (request.type === 'generation' || request.type === 'analysis') {
      return true;
    }
    
    // Cache chat requests only if they're educational and reusable
    if (request.type === 'chat' && request.parameters['subject']) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get TTL for a request
   */
  private getTTLForRequest(request: MCPRequest): number {
    // Use custom TTL if specified
    if (request.caching?.ttl_seconds) {
      return request.caching.ttl_seconds;
    }
    
    // Different TTL based on request type
    switch (request.type) {
      case 'generation':
        return this.defaultTTL * 2; // Generation results are more stable
      case 'analysis':
        return this.defaultTTL;
      case 'chat':
        return this.defaultTTL / 2; // Chat responses might be more context-dependent
      default:
        return this.defaultTTL;
    }
  }
  
  /**
   * Update cache hit count
   */
  private async updateCacheHit(cacheKey: string): Promise<void> {
    try {
      const query = `
        UPDATE ai_response_cache 
        SET hit_count = hit_count + 1, last_accessed_at = CURRENT_TIMESTAMP 
        WHERE cache_key = $1
      `;
      
      await this.db.query(query, [cacheKey]);
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, just continue
      if (error.code === '42P01') { // relation does not exist
        return;
      }
      console.error('Cache hit update error:', error);
    }
  }
  
  /**
   * Enforce maximum cache size by removing oldest entries
   */
  private async enforceMaxCacheSize(): Promise<void> {
    try {
      const countQuery = 'SELECT COUNT(*) as count FROM ai_response_cache';
      const countResult = await this.db.query(countQuery);
      const currentSize = parseInt(countResult.rows[0].count);
      
      if (currentSize >= this.maxCacheSize) {
        const deleteCount = Math.floor(this.maxCacheSize * 0.1); // Remove 10% of entries
        const deleteQuery = `
          DELETE FROM ai_response_cache 
          WHERE id IN (
            SELECT id FROM ai_response_cache 
            ORDER BY last_accessed_at ASC, created_at ASC 
            LIMIT $1
          )
        `;
        
        await this.db.query(deleteQuery, [deleteCount]);
      }
    } catch (error: any) {
      // If the ai_response_cache table doesn't exist yet, just continue
      if (error.code === '42P01') { // relation does not exist
        return;
      }
      console.error('Cache size enforcement error:', error);
    }
  }
  
  /**
   * Get provider name by ID
   */
  private async getProviderName(providerId: string): Promise<string> {
    try {
      const query = 'SELECT name FROM ai_providers WHERE id = $1';
      const result = await this.db.query(query, [providerId]);
      return result.rows[0]?.name || 'Unknown';
    } catch (error: any) {
      // If the ai_providers table doesn't exist yet, return 'Unknown'
      if (error.code === '42P01') { // relation does not exist
        return 'Unknown';
      }
      return 'Unknown';
    }
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
