import { AnalyticsService } from '../services/AnalyticsService';
import pool from '../database/connection';

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
import { analyticsCacheService } from '../services/AnalyticsCacheService';

// Properly type the mocked pool
const mockPool = pool as jest.Mocked<typeof pool>;
const mockCacheService = analyticsCacheService as jest.Mocked<typeof analyticsCacheService>;

describe('AnalyticsService - Platform Overview', () => {
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

  describe('getPlatformOverviewMetrics', () => {
    it('should return correct active users metrics', async () => {
      // Mock active users query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          total: 150,
          today_active: 25,
          weekly_active: 89,
          monthly_active: 134
        }]
      });

      // Mock materials created query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          today: 12,
          this_week: 78,
          this_month: 234,
          total: 1567
        }]
      });

      // Mock user growth query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { month: '2024-01', new_users: 15, total_users: 100 },
          { month: '2024-02', new_users: 23, total_users: 123 },
          { month: '2024-03', new_users: 27, total_users: 150 }
        ]
      });

      // Mock credit usage query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { month: '2024-01', credits: 1500, transactions: 45 },
          { month: '2024-02', credits: 2100, transactions: 67 },
          { month: '2024-03', credits: 2800, transactions: 89 }
        ]
      });

      // Mock top schools query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: '1', name: 'ZŠ Praha 1', users: 25, credits: 500, materials_created: 45 },
          { id: '2', name: 'Gymnázium Brno', users: 18, credits: 350, materials_created: 32 }
        ]
      });

      // Mock daily materials query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { date: '2024-03-01', materials: 8, unique_users: 5 },
          { date: '2024-03-02', materials: 12, unique_users: 7 }
        ]
      });

      // Mock subject materials query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { subject: 'Matematika', materials: 45 },
          { subject: 'Čeština', materials: 32 },
          { subject: 'Angličtina', materials: 28 }
        ]
      });

      // Mock type materials query response
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { type: 'worksheet', materials: 65 },
          { type: 'test', materials: 25 },
          { type: 'assignment', materials: 15 }
        ]
      });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');

      expect(result.activeUsers.total).toBe(150);
      expect(result.activeUsers.todayActive).toBe(25);
      expect(result.activeUsers.weeklyActive).toBe(89);
      expect(result.activeUsers.monthlyActive).toBe(134);

      expect(result.materialsCreated.today).toBe(12);
      expect(result.materialsCreated.thisWeek).toBe(78);
      expect(result.materialsCreated.thisMonth).toBe(234);
      expect(result.materialsCreated.total).toBe(1567);

      expect(result.userGrowth).toHaveLength(3);
      expect(result.userGrowth[0]?.month).toBe('2024-01');
      expect(result.userGrowth[0]?.newUsers).toBe(15);

      expect(result.topSchools).toHaveLength(2);
      expect(result.topSchools[0]?.name).toBe('ZŠ Praha 1');
      expect(result.topSchools[0]?.users).toBe(25);

      expect(result.materialCreationTrend.bySubject).toHaveLength(3);
      expect(result.materialCreationTrend.bySubject[0]?.subject).toBe('Matematika');
      expect(result.materialCreationTrend.bySubject[0]?.percentage).toBe(43); // 45/105 * 100

      expect(result.materialCreationTrend.byType).toHaveLength(3);
      expect(result.materialCreationTrend.byType[0]?.type).toBe('worksheet');
      expect(result.materialCreationTrend.byType[0]?.percentage).toBe(62); // 65/105 * 100
    });

    it('should handle different time ranges correctly', async () => {
      // Test 7d time range
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [{ total: 100 }] });

      await AnalyticsService.getPlatformOverviewMetrics('7d');

      // Verify that queries use correct time intervals
      const calls = (mockPool.query as jest.Mock).mock.calls;
      expect(calls.some((call: any) => call[0].includes('7 days'))).toBe(true);
    });

    it('should handle empty data gracefully', async () => {
      // Mock empty responses for all queries
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');

      expect(result.activeUsers.total).toBe(0);
      expect(result.materialsCreated.today).toBe(0);
      expect(result.userGrowth).toEqual([]);
      expect(result.topSchools).toEqual([]);
    });

    it('should handle database errors properly', async () => {
      // Mock database error for the first query
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(AnalyticsService.getPlatformOverviewMetrics('30d'))
        .rejects.toThrow('Failed to retrieve platform overview metrics');
    });

    it('should validate time range parameters', async () => {
      // Test with invalid time range (should default to 30 days)
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [{ total: 100 }] });

      const result = await AnalyticsService.getPlatformOverviewMetrics(undefined);
      
      // Should not throw error and should use default values
      expect(result).toBeDefined();
    });
  });

  describe('Data accuracy tests', () => {
    it('should calculate percentages correctly for subject breakdown', async () => {
      // Mock all queries with specific data for this test
      (mockPool.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('ai_subject')) {
          return Promise.resolve({
            rows: [
              { subject: 'Matematika', materials: 50 },
              { subject: 'Čeština', materials: 30 },
              { subject: 'Angličtina', materials: 20 }
            ]
          });
        }
        // Mock other queries with minimal data
        if (query.includes('active_users')) {
          return Promise.resolve({ rows: [{ total: 0, today_active: 0, weekly_active: 0, monthly_active: 0 }] });
        }
        if (query.includes('materials_created')) {
          return Promise.resolve({ rows: [{ today: 0, this_week: 0, this_month: 0, total: 0 }] });
        }
        if (query.includes('user_growth')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('credit_usage')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('top_schools')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('daily_materials')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('file_type')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [{ total: 0 }] });
      });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      expect(result.materialCreationTrend.bySubject[0]?.percentage).toBe(50); // 50/100 * 100
      expect(result.materialCreationTrend.bySubject[1]?.percentage).toBe(30); // 30/100 * 100
      expect(result.materialCreationTrend.bySubject[2]?.percentage).toBe(20); // 20/100 * 100
    });

    it('should handle zero division in percentage calculations', async () => {
      // Mock all queries to return empty results
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      expect(result.materialCreationTrend.bySubject).toEqual([]);
    });
  });

  describe('Performance tests', () => {
    it('should execute queries within acceptable time limits', async () => {
      (mockPool.query as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ rows: [] }), 100))
      );

      const startTime = Date.now();
      await AnalyticsService.getPlatformOverviewMetrics('30d');
      const endTime = Date.now();

      // Should complete within 2 seconds (allowing for 8 queries with 100ms each + overhead)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
