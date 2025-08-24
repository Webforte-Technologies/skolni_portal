const NodeCache = require('node-cache');

/**
 * Cache Service for performance optimization
 * Used to cache frequently accessed data like user analytics, activity summaries, etc.
 */
export class CacheService {
  private cache: NodeCache;

  constructor() {
    // Cache TTL: 5 minutes for most data, 1 hour for analytics
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Don't clone objects (better performance)
    });
  }

  // Get cached data
  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  // Set cached data with optional TTL
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 300);
  }

  // Delete cached data
  del(key: string): number {
    return this.cache.del(key);
  }

  // Clear cache by pattern
  clearPattern(pattern: string): void {
    const keys = this.cache.keys().filter((key: string) => key.includes(pattern));
    this.cache.del(keys);
  }

  // Cache user analytics (1 hour TTL)
  setUserAnalytics(data: Record<string, unknown>): boolean {
    return this.cache.set('user_analytics', data, 3600);
  }

  getUserAnalytics(): Record<string, unknown> | undefined {
    return this.cache.get('user_analytics');
  }

  // Cache activity summary (30 minutes TTL)
  setActivitySummary(data: Record<string, unknown>): boolean {
    return this.cache.set('activity_summary', data, 1800);
  }

  getActivitySummary(): Record<string, unknown> | undefined {
    return this.cache.get('activity_summary');
  }

  // Cache notification stats (15 minutes TTL)
  setNotificationStats(data: Record<string, unknown>): boolean {
    return this.cache.set('notification_stats', data, 900);
  }

  getNotificationStats(): Record<string, unknown> | undefined {
    return this.cache.get('notification_stats');
  }

  // Cache user activity stats per user (10 minutes TTL)
  setUserActivityStats(userId: string, data: Record<string, unknown>): boolean {
    return this.cache.set(`user_activity_stats:${userId}`, data, 600);
  }

  getUserActivityStatsFromCache(userId: string): Record<string, unknown> | undefined {
    return this.cache.get(`user_activity_stats:${userId}`);
  }

  // Clear user-specific cache when user data changes
  clearUserCache(userId: string): void {
    this.clearPattern(`user_activity_stats:${userId}`);
    this.clearPattern(`user_profile:${userId}`);
  }

  // Cache user search results (5 minutes TTL)
  setSearchResults(searchKey: string, data: Record<string, unknown>): boolean {
    return this.cache.set(`search:${searchKey}`, data, 300);
  }

  getSearchResults(searchKey: string): Record<string, unknown> | undefined {
    return this.cache.get(`search:${searchKey}`);
  }

  // Get cache statistics
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }

  // Clear all cache
  clearAll(): void {
    this.cache.flushAll();
  }
}

// Singleton instance
export const cacheService = new CacheService();
