import { AnalyticsService } from '../services/AnalyticsService';
import pool from '../database/connection';

// Mock the database connection
jest.mock('../database/connection', () => ({
  query: jest.fn(),
}));

const mockPool = pool as jest.Mocked<typeof pool>;

describe('AnalyticsService - Platform Overview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlatformOverviewMetrics', () => {
    it('should return correct active users metrics', async () => {
      // Mock active users query response
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          total: 150,
          today_active: 25,
          weekly_active: 89,
          monthly_active: 134
        }]
      });

      // Mock materials created query response
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          today: 12,
          this_week: 78,
          this_month: 234,
          total: 1567
        }]
      });

      // Mock user growth query response
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { month: '2024-01', new_users: 15, total_users: 100 },
          { month: '2024-02', new_users: 23, total_users: 123 },
          { month: '2024-03', new_users: 27, total_users: 150 }
        ]
      });

      // Mock credit usage query response
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { month: '2024-01', credits: 1500, transactions: 45 },
          { month: '2024-02', credits: 2100, transactions: 67 },
          { month: '2024-03', credits: 2800, transactions: 89 }
        ]
      });

      // Mock top schools query response
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { id: '1', name: 'ZŠ Praha 1', users: 25, credits: 500, materials_created: 45 },
          { id: '2', name: 'Gymnázium Brno', users: 18, credits: 350, materials_created: 32 }
        ]
      });

      // Mock daily materials query response
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { date: '2024-03-01', materials: 8, unique_users: 5 },
          { date: '2024-03-02', materials: 12, unique_users: 7 }
        ]
      });

      // Mock subject materials query response
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { subject: 'Matematika', materials: 45 },
          { subject: 'Čeština', materials: 32 },
          { subject: 'Angličtina', materials: 28 }
        ]
      });

      // Mock type materials query response
      mockPool.query.mockResolvedValueOnce({
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
      expect(result.userGrowth[0].month).toBe('2024-01');
      expect(result.userGrowth[0].newUsers).toBe(15);

      expect(result.topSchools).toHaveLength(2);
      expect(result.topSchools[0].name).toBe('ZŠ Praha 1');
      expect(result.topSchools[0].users).toBe(25);

      expect(result.materialCreationTrend.bySubject).toHaveLength(3);
      expect(result.materialCreationTrend.bySubject[0].subject).toBe('Matematika');
      expect(result.materialCreationTrend.bySubject[0].percentage).toBe(43); // 45/105 * 100

      expect(result.materialCreationTrend.byType).toHaveLength(3);
      expect(result.materialCreationTrend.byType[0].type).toBe('worksheet');
      expect(result.materialCreationTrend.byType[0].percentage).toBe(62); // 65/105 * 100
    });

    it('should handle different time ranges correctly', async () => {
      // Test 7d time range
      mockPool.query.mockResolvedValue({ rows: [{ total: 100 }] });

      await AnalyticsService.getPlatformOverviewMetrics('7d');

      // Verify that queries use correct time intervals
      const calls = mockPool.query.mock.calls;
      expect(calls.some(call => call[0].includes('7 days'))).toBe(true);
    });

    it('should handle empty data gracefully', async () => {
      // Mock empty responses
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');

      expect(result.activeUsers.total).toBe(0);
      expect(result.materialsCreated.today).toBe(0);
      expect(result.userGrowth).toEqual([]);
      expect(result.topSchools).toEqual([]);
    });

    it('should handle database errors properly', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(AnalyticsService.getPlatformOverviewMetrics('30d'))
        .rejects.toThrow('Failed to retrieve platform overview metrics');
    });

    it('should validate time range parameters', async () => {
      // Test with invalid time range (should default to 30 days)
      mockPool.query.mockResolvedValue({ rows: [{ total: 100 }] });

      const result = await AnalyticsService.getPlatformOverviewMetrics(undefined);
      
      // Should not throw error and should use default values
      expect(result).toBeDefined();
    });
  });

  describe('Data accuracy tests', () => {
    it('should calculate percentages correctly for subject breakdown', async () => {
      mockPool.query.mockImplementation((query) => {
        if (query.includes('ai_subject')) {
          return Promise.resolve({
            rows: [
              { subject: 'Matematika', materials: 50 },
              { subject: 'Čeština', materials: 30 },
              { subject: 'Angličtina', materials: 20 }
            ]
          });
        }
        return Promise.resolve({ rows: [{ total: 0 }] });
      });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      expect(result.materialCreationTrend.bySubject[0].percentage).toBe(50); // 50/100 * 100
      expect(result.materialCreationTrend.bySubject[1].percentage).toBe(30); // 30/100 * 100
      expect(result.materialCreationTrend.bySubject[2].percentage).toBe(20); // 20/100 * 100
    });

    it('should handle zero division in percentage calculations', async () => {
      mockPool.query.mockImplementation((query) => {
        if (query.includes('ai_subject')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [{ total: 0 }] });
      });

      const result = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      expect(result.materialCreationTrend.bySubject).toEqual([]);
    });
  });

  describe('Performance tests', () => {
    it('should execute queries within acceptable time limits', async () => {
      mockPool.query.mockImplementation(() => 
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
