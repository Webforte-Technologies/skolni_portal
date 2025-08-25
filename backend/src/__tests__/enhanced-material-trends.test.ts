import { AnalyticsService } from '../services/AnalyticsService';

// Mock the database connection
jest.mock('../database/connection', () => ({
  query: jest.fn(),
}));

// Mock the analytics cache service
jest.mock('../services/AnalyticsCacheService', () => ({
  analyticsCacheService: {
    getCachedOrExecute: jest.fn(),
    clearAll: jest.fn(),
  },
}));

// Import the mocked services
import pool from '../database/connection';
import { analyticsCacheService } from '../services/AnalyticsCacheService';

// Import the mocked module and properly type it
const mockPool = pool as jest.Mocked<typeof pool>;
const mockCacheService = analyticsCacheService as jest.Mocked<typeof analyticsCacheService>;

describe('AnalyticsService - Enhanced Material Creation Trends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any cached data
    jest.clearAllTimers();
    
    // Set up default cache service mock to call the actual function
    (mockCacheService.getCachedOrExecute as jest.Mock).mockImplementation(
      async (method: string, params: any, queryFunction: () => Promise<any>) => {
        return await queryFunction();
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEnhancedMaterialCreationTrends', () => {
    it('should return enhanced material creation trends with all required metrics', async () => {
      // Mock hourly trend query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { hour: '09:00', materials: 5, unique_users: 3, avg_response_time: 120.5 },
          { hour: '10:00', materials: 8, unique_users: 5, avg_response_time: 95.2 },
          { hour: '11:00', materials: 12, unique_users: 7, avg_response_time: 110.8 }
        ]
      });

      // Mock subject engagement query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { subject: 'Matematika', materials: 45, unique_users: 15, avg_session_duration: 25.5, popularity_score: 27.0 },
          { subject: 'Čeština', materials: 32, unique_users: 12, avg_session_duration: 22.3, popularity_score: 20.0 },
          { subject: 'Angličtina', materials: 28, unique_users: 10, avg_session_duration: 18.7, popularity_score: 17.2 }
        ]
      });

      // Mock type efficiency query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { type: 'worksheet', materials: 65, avg_creation_time: 180.5, success_rate: 95.5, user_satisfaction: 4.2 },
          { type: 'test', materials: 25, avg_creation_time: 240.8, success_rate: 88.0, user_satisfaction: 4.0 },
          { type: 'assignment', materials: 15, avg_creation_time: 200.3, success_rate: 92.3, user_satisfaction: 4.1 }
        ]
      });

      // Mock user engagement metrics query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          total_active_creators: 45,
          avg_creations_per_user: 2.3,
          peak_creation_hour: '10:00',
          most_productive_day: 'Tuesday'
        }]
      });

      const result = await AnalyticsService.getEnhancedMaterialCreationTrends('30d');

      // Verify hourly trend data
      expect(result.hourlyTrend).toHaveLength(3);
      expect(result.hourlyTrend[0]).toEqual({
        hour: '09:00',
        materials: 5,
        uniqueUsers: 3,
        avgResponseTime: 120.5
      });

      // Verify subject engagement data
      expect(result.subjectEngagement).toHaveLength(3);
      expect(result.subjectEngagement[0]).toEqual({
        subject: 'Matematika',
        materials: 45,
        uniqueUsers: 15,
        avgSessionDuration: 25.5,
        popularityScore: 27.0
      });

      // Verify type efficiency data
      expect(result.typeEfficiency).toHaveLength(3);
      expect(result.typeEfficiency[0]).toEqual({
        type: 'worksheet',
        materials: 65,
        avgCreationTime: 180.5,
        successRate: 95.5,
        userSatisfaction: 4.2
      });

      // Verify user engagement metrics
      expect(result.userEngagementMetrics).toEqual({
        totalActiveCreators: 45,
        averageCreationsPerUser: 2.3,
        peakCreationHour: '10:00',
        mostProductiveDay: 'Tuesday'
      });
    });

    it('should handle empty database results gracefully', async () => {
      // Mock empty query responses
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // hourly trend
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // subject engagement
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // type efficiency
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}] }); // user engagement metrics

      const result = await AnalyticsService.getEnhancedMaterialCreationTrends('7d');

      expect(result.hourlyTrend).toEqual([]);
      expect(result.subjectEngagement).toEqual([]);
      expect(result.typeEfficiency).toEqual([]);
      expect(result.userEngagementMetrics).toEqual({
        totalActiveCreators: 0,
        averageCreationsPerUser: 0,
        peakCreationHour: '09:00',
        mostProductiveDay: 'Monday'
      });
    });

    it('should handle null values in database results', async () => {
      // Mock query responses with null values
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { hour: '09:00', materials: null, unique_users: null, avg_response_time: null }
        ]
      });

      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { subject: null, materials: null, unique_users: null, avg_session_duration: null, popularity_score: null }
        ]
      });

      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { type: null, materials: null, avg_creation_time: null, success_rate: null, user_satisfaction: null }
        ]
      });

      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          total_active_creators: null,
          avg_creations_per_user: null,
          peak_creation_hour: null,
          most_productive_day: null
        }]
      });

      const result = await AnalyticsService.getEnhancedMaterialCreationTrends('30d');

      // Verify default values are used for null results
      expect(result.hourlyTrend[0]).toEqual({
        hour: '09:00',
        materials: 0,
        uniqueUsers: 0,
        avgResponseTime: 0
      });

      expect(result.subjectEngagement[0]?.materials).toBe(0);
      expect(result.typeEfficiency[0]?.materials).toBe(0);
      expect(result.typeEfficiency[0]?.userSatisfaction).toBe(4.0); // default satisfaction

      expect(result.userEngagementMetrics.totalActiveCreators).toBe(0);
      expect(result.userEngagementMetrics.peakCreationHour).toBe('09:00');
      expect(result.userEngagementMetrics.mostProductiveDay).toBe('Monday');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(AnalyticsService.getEnhancedMaterialCreationTrends('30d'))
        .rejects
        .toThrow('Failed to retrieve enhanced material creation trends');
    });

    it('should use correct time ranges', async () => {
      // Mock successful responses
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      // Test different time ranges
      await AnalyticsService.getEnhancedMaterialCreationTrends('7d');
      await AnalyticsService.getEnhancedMaterialCreationTrends('30d');
      await AnalyticsService.getEnhancedMaterialCreationTrends('90d');
      await AnalyticsService.getEnhancedMaterialCreationTrends('1y');

      // Verify that queries were called with correct intervals
      const calls = (mockPool.query as jest.Mock).mock.calls;
      
      // Check that the queries contain the correct interval calculations
      // 7d should use 7 days, 30d should use 30 days, etc.
      expect(calls.some((call: any) => call[0].includes("INTERVAL '7 days'"))).toBe(true);
      expect(calls.some((call: any) => call[0].includes("INTERVAL '30 days'"))).toBe(true);
      expect(calls.some((call: any) => call[0].includes("INTERVAL '90 days'"))).toBe(true);
      expect(calls.some((call: any) => call[0].includes("INTERVAL '365 days'"))).toBe(true);
    });
  });
});
