import pool from '../database/connection';

interface CacheEntry {
  key: string;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  averageQueryTime: number;
}

export class AnalyticsCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    totalQueryTime: 0,
    queryCount: 0
  };

  // Default cache TTL in minutes
  private readonly DEFAULT_TTL = 15; // 15 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached entries

  /**
   * Generate cache key for analytics query
   */
  private generateCacheKey(method: string, params: any): string {
    const paramString = JSON.stringify(params || {});
    return `analytics:${method}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Get cached data or execute query function
   */
  async getCachedOrExecute<T>(
    method: string,
    params: any,
    queryFunction: () => Promise<T>,
    ttlMinutes: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(method, params);
    const startTime = Date.now();

    // Check if data exists in cache and is not expired
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > new Date()) {
      this.stats.hits++;
      console.log(`Analytics cache HIT for ${method}`, { 
        key: cacheKey.substring(0, 50) + '...',
        age: Date.now() - cachedEntry.createdAt.getTime()
      });
      return cachedEntry.data;
    }

    // Cache miss - execute query
    this.stats.misses++;
    console.log(`Analytics cache MISS for ${method}`, { 
      key: cacheKey.substring(0, 50) + '...',
      expired: cachedEntry ? cachedEntry.expiresAt < new Date() : false
    });

    try {
      const data = await queryFunction();
      const queryTime = Date.now() - startTime;
      
      this.stats.totalQueryTime += queryTime;
      this.stats.queryCount++;

      // Store in cache
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
      this.cache.set(cacheKey, {
        key: cacheKey,
        data,
        expiresAt,
        createdAt: new Date()
      });

      // Clean up old entries if cache is too large
      this.cleanupCache();

      console.log(`Analytics query executed and cached`, {
        method,
        queryTime: `${queryTime}ms`,
        cacheSize: this.cache.size,
        ttl: `${ttlMinutes}min`
      });

      return data;
    } catch (error) {
      console.error(`Analytics query failed for ${method}:`, error);
      throw error;
    }
  }

  /**
   * Clean up expired entries and enforce size limit
   */
  private cleanupCache() {
    const now = new Date();
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }

    // If still too large, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime());
      
      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
      
      console.log(`Analytics cache cleanup: removed ${toRemove.length} old entries`);
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: string) {
    let removedCount = 0;
    
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    console.log(`Analytics cache invalidation: removed ${removedCount} entries matching pattern "${pattern}"`);
    return removedCount;
  }

  /**
   * Clear specific cache entry
   */
  invalidate(method: string, params: any) {
    const cacheKey = this.generateCacheKey(method, params);
    const removed = this.cache.delete(cacheKey);
    
    if (removed) {
      console.log(`Analytics cache entry invalidated: ${method}`);
    }
    
    return removed;
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`Analytics cache cleared: ${size} entries removed`);
    return size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const averageQueryTime = this.stats.queryCount > 0 ? this.stats.totalQueryTime / this.stats.queryCount : 0;

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      averageQueryTime: Math.round(averageQueryTime)
    };
  }

  /**
   * Get cache entries info (for debugging)
   */
  getCacheInfo() {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key: key.substring(0, 50) + '...',
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
      isExpired: entry.expiresAt <= new Date(),
      ageMinutes: Math.round((Date.now() - entry.createdAt.getTime()) / 60000)
    }));

    return {
      totalEntries: this.cache.size,
      entries: entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    };
  }

  /**
   * Preload commonly used analytics data
   */
  async preloadCommonQueries() {
    console.log('Preloading common analytics queries...');
    
    const commonQueries = [
      { method: 'getPlatformOverviewMetrics', params: '30d', ttl: 10 },
      { method: 'getPlatformOverviewMetrics', params: '7d', ttl: 5 },
      { method: 'getUserMetrics', params: undefined, ttl: 15 },
      { method: 'getCreditMetrics', params: undefined, ttl: 15 }
    ];

    const { AnalyticsService } = await import('./AnalyticsService');

    for (const query of commonQueries) {
      try {
        switch (query.method) {
          case 'getPlatformOverviewMetrics':
            await this.getCachedOrExecute(
              query.method,
              query.params,
              () => AnalyticsService.getPlatformOverviewMetrics(query.params as any),
              query.ttl
            );
            break;
          case 'getUserMetrics':
            await this.getCachedOrExecute(
              query.method,
              query.params,
              () => AnalyticsService.getUserMetrics(),
              query.ttl
            );
            break;
          case 'getCreditMetrics':
            await this.getCachedOrExecute(
              query.method,
              query.params,
              () => AnalyticsService.getCreditMetrics(),
              query.ttl
            );
            break;
        }
      } catch (error) {
        console.error(`Failed to preload ${query.method}:`, error);
      }
    }

    console.log('Analytics cache preloading completed');
  }

  /**
   * Setup automatic cache warming (run periodically)
   */
  setupCacheWarming(intervalMinutes: number = 30) {
    setInterval(() => {
      this.preloadCommonQueries().catch(error => {
        console.error('Cache warming failed:', error);
      });
    }, intervalMinutes * 60 * 1000);

    console.log(`Analytics cache warming scheduled every ${intervalMinutes} minutes`);
  }
}

// Singleton instance
export const analyticsCacheService = new AnalyticsCacheService();

export default analyticsCacheService;
