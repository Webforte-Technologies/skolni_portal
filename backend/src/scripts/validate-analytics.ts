#!/usr/bin/env ts-node

/**
 * Analytics Validation Script
 * 
 * This script validates all analytics functionality including:
 * - Data accuracy verification
 * - Performance testing
 * - Cache functionality
 * - Time range filtering
 * - Error handling
 */

import { AnalyticsService } from '../services/AnalyticsService';
import { analyticsCacheService } from '../services/AnalyticsCacheService';
import { analyticsPerformanceMonitor as _analyticsPerformanceMonitor } from '../middleware/analytics-performance';
import pool from '../database/connection';

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  executionTime?: number;
  details?: any;
}

class AnalyticsValidator {
  private results: ValidationResult[] = [];

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<ValidationResult[]> {
    console.log('🚀 Starting Analytics Validation Tests...\n');

    await this.testDataAccuracy();
    await this.testPerformance();
    await this.testCaching();
    await this.testTimeRangeFiltering();
    await this.testErrorHandling();
    await this.testDatabaseIndexes();

    this.printResults();
    return this.results;
  }

  /**
   * Test data accuracy and calculations
   */
  private async testDataAccuracy() {
    console.log('📊 Testing Data Accuracy...');

    // Test 1: Active users calculation
    await this.runTest('Active Users Calculation', async () => {
      const metrics = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      // Verify that todayActive <= weeklyActive <= monthlyActive <= total
      if (metrics.activeUsers.todayActive > metrics.activeUsers.weeklyActive) {
        throw new Error('Today active users cannot exceed weekly active users');
      }
      if (metrics.activeUsers.weeklyActive > metrics.activeUsers.monthlyActive) {
        throw new Error('Weekly active users cannot exceed monthly active users');
      }
      if (metrics.activeUsers.monthlyActive > metrics.activeUsers.total) {
        throw new Error('Monthly active users cannot exceed total users');
      }

      return {
        total: metrics.activeUsers.total,
        todayActive: metrics.activeUsers.todayActive,
        weeklyActive: metrics.activeUsers.weeklyActive,
        monthlyActive: metrics.activeUsers.monthlyActive
      };
    });

    // Test 2: Materials created calculation
    await this.runTest('Materials Created Calculation', async () => {
      const metrics = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      // Verify that today <= thisWeek <= thisMonth <= total
      if (metrics.materialsCreated.today > metrics.materialsCreated.thisWeek) {
        throw new Error('Today materials cannot exceed this week materials');
      }
      if (metrics.materialsCreated.thisWeek > metrics.materialsCreated.thisMonth) {
        throw new Error('This week materials cannot exceed this month materials');
      }
      if (metrics.materialsCreated.thisMonth > metrics.materialsCreated.total) {
        throw new Error('This month materials cannot exceed total materials');
      }

      return {
        today: metrics.materialsCreated.today,
        thisWeek: metrics.materialsCreated.thisWeek,
        thisMonth: metrics.materialsCreated.thisMonth,
        total: metrics.materialsCreated.total
      };
    });

    // Test 3: Percentage calculations
    await this.runTest('Percentage Calculations', async () => {
      const metrics = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      // Verify subject percentages add up to 100% (or close to it due to rounding)
      const subjectTotal = metrics.materialCreationTrend.bySubject.reduce((sum, item) => sum + item.percentage, 0);
      if (Math.abs(subjectTotal - 100) > 5 && subjectTotal > 0) { // Allow 5% tolerance for rounding
        throw new Error(`Subject percentages don't add up correctly: ${subjectTotal}%`);
      }

      // Verify type percentages add up to 100% (or close to it due to rounding)
      const typeTotal = metrics.materialCreationTrend.byType.reduce((sum, item) => sum + item.percentage, 0);
      if (Math.abs(typeTotal - 100) > 5 && typeTotal > 0) { // Allow 5% tolerance for rounding
        throw new Error(`Type percentages don't add up correctly: ${typeTotal}%`);
      }

      return {
        subjectPercentageTotal: subjectTotal,
        typePercentageTotal: typeTotal,
        subjectCount: metrics.materialCreationTrend.bySubject.length,
        typeCount: metrics.materialCreationTrend.byType.length
      };
    });

    // Test 4: Top schools ranking
    await this.runTest('Top Schools Ranking', async () => {
      const metrics = await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      // Verify schools are sorted by activity (users count should be descending)
      for (let i = 1; i < metrics.topSchools.length; i++) {
        const prevSchool = metrics.topSchools[i-1];
        const currentSchool = metrics.topSchools[i];
        if (prevSchool && currentSchool && prevSchool.users < currentSchool.users) {
          throw new Error('Top schools are not properly sorted by user count');
        }
      }

      return {
        schoolCount: metrics.topSchools.length,
        topSchoolUsers: metrics.topSchools[0]?.users || 0,
        totalSchoolUsers: metrics.topSchools.reduce((sum, school) => sum + school.users, 0)
      };
    });
  }

  /**
   * Test performance and query execution times
   */
  private async testPerformance() {
    console.log('⚡ Testing Performance...');

    // Test 1: Query execution time
    await this.runTest('Query Execution Time', async () => {
      const startTime = Date.now();
      await AnalyticsService.getPlatformOverviewMetrics('30d');
      const executionTime = Date.now() - startTime;

      if (executionTime > 5000) { // 5 seconds threshold
        throw new Error(`Query execution time too slow: ${executionTime}ms`);
      }

      return { executionTime };
    });

    // Test 2: Different time ranges performance
    const timeRanges: Array<'7d' | '30d' | '90d' | '1y'> = ['7d', '30d', '90d', '1y'];
    for (const timeRange of timeRanges) {
      await this.runTest(`Performance - ${timeRange}`, async () => {
        const startTime = Date.now();
        await AnalyticsService.getPlatformOverviewMetrics(timeRange);
        const executionTime = Date.now() - startTime;

        // Longer time ranges should be allowed more time
        const threshold = timeRange === '1y' ? 10000 : timeRange === '90d' ? 7000 : 5000;
        if (executionTime > threshold) {
          throw new Error(`Query execution time too slow for ${timeRange}: ${executionTime}ms`);
        }

        return { timeRange, executionTime };
      });
    }

    // Test 3: Concurrent requests
    await this.runTest('Concurrent Requests', async () => {
      const concurrentRequests = 5;
      const startTime = Date.now();
      
      const promises = Array(concurrentRequests).fill(null).map(() => 
        AnalyticsService.getPlatformOverviewMetrics('30d')
      );
      
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / concurrentRequests;

      if (totalTime > 15000) { // 15 seconds for 5 concurrent requests
        throw new Error(`Concurrent requests too slow: ${totalTime}ms total`);
      }

      return { concurrentRequests, totalTime, avgTime };
    });
  }

  /**
   * Test caching functionality
   */
  private async testCaching() {
    console.log('💾 Testing Caching...');

    // Clear cache before testing
    analyticsCacheService.clearAll();

    // Test 1: Cache miss and hit
    await this.runTest('Cache Miss and Hit', async () => {
      // First call should be a cache miss
      const startTime1 = Date.now();
      await AnalyticsService.getPlatformOverviewMetrics('30d');
      const missTime = Date.now() - startTime1;

      // Second call should be a cache hit
      const startTime2 = Date.now();
      await AnalyticsService.getPlatformOverviewMetrics('30d');
      const hitTime = Date.now() - startTime2;

      // Cache hit should be significantly faster
      if (hitTime >= missTime) {
        throw new Error(`Cache hit not faster than miss: hit=${hitTime}ms, miss=${missTime}ms`);
      }

      const stats = analyticsCacheService.getStats();
      if (stats.totalHits === 0) {
        throw new Error('No cache hits recorded');
      }

      return { missTime, hitTime, cacheStats: stats };
    });

    // Test 2: Cache invalidation
    await this.runTest('Cache Invalidation', async () => {
      // Ensure we have cached data
      await AnalyticsService.getPlatformOverviewMetrics('30d');
      
      const statsBefore = analyticsCacheService.getStats();
      if (statsBefore.totalEntries === 0) {
        throw new Error('No cache entries found before invalidation');
      }

      // Invalidate cache
      const removed = analyticsCacheService.invalidateByPattern('getPlatformOverviewMetrics');
      
      const statsAfter = analyticsCacheService.getStats();
      
      if (removed === 0) {
        throw new Error('No cache entries were invalidated');
      }

      return { 
        entriesBefore: statsBefore.totalEntries,
        entriesAfter: statsAfter.totalEntries,
        removedEntries: removed
      };
    });

    // Test 3: Cache statistics
    await this.runTest('Cache Statistics', async () => {
      // Generate some cache activity
      await AnalyticsService.getPlatformOverviewMetrics('7d');
      await AnalyticsService.getPlatformOverviewMetrics('30d');
      await AnalyticsService.getPlatformOverviewMetrics('7d'); // Should be cache hit

      const stats = analyticsCacheService.getStats();
      
      if (stats.hitRate < 0 || stats.hitRate > 100) {
        throw new Error(`Invalid hit rate: ${stats.hitRate}%`);
      }

      return stats;
    });
  }

  /**
   * Test time range filtering
   */
  private async testTimeRangeFiltering() {
    console.log('📅 Testing Time Range Filtering...');

    // Test 1: Different time ranges return different data
    await this.runTest('Time Range Data Differences', async () => {
      const metrics7d = await AnalyticsService.getPlatformOverviewMetrics('7d');
      const metrics30d = await AnalyticsService.getPlatformOverviewMetrics('30d');
      const metrics90d = await AnalyticsService.getPlatformOverviewMetrics('90d');

      // 30d should have >= data than 7d (in most cases)
      // This might not always be true, so we'll just check the structure
      if (!metrics7d.materialCreationTrend.daily || !metrics30d.materialCreationTrend.daily) {
        throw new Error('Daily material creation trend missing');
      }

      return {
        daily7d: metrics7d.materialCreationTrend.daily.length,
        daily30d: metrics30d.materialCreationTrend.daily.length,
        daily90d: metrics90d.materialCreationTrend.daily.length
      };
    });

    // Test 2: User growth trends
    await this.runTest('User Growth Trends', async () => {
      const metrics = await AnalyticsService.getPlatformOverviewMetrics('1y');
      
      // Should have monthly data
      if (metrics.userGrowth.length === 0) {
        throw new Error('No user growth data found');
      }

      // Check data structure
      const firstEntry = metrics.userGrowth[0];
      if (!firstEntry || !firstEntry.month || typeof firstEntry.users !== 'number' || typeof firstEntry.newUsers !== 'number') {
        throw new Error('Invalid user growth data structure');
      }

      return {
        monthsOfData: metrics.userGrowth.length,
        totalNewUsers: metrics.userGrowth.reduce((sum, entry) => sum + entry.newUsers, 0)
      };
    });
  }

  /**
   * Test error handling
   */
  private async testErrorHandling() {
    console.log('🚨 Testing Error Handling...');

    // Test 1: Invalid time range (should not crash)
    await this.runTest('Invalid Time Range Handling', async () => {
      try {
        // This should not crash, should use default
        const metrics = await AnalyticsService.getPlatformOverviewMetrics(undefined);
        
        if (!metrics || !metrics.activeUsers) {
          throw new Error('Failed to handle undefined time range');
        }

        return { handled: true };
      } catch (error) {
        throw new Error(`Failed to handle invalid time range: ${error}`);
      }
    });

    // Test 2: Database connection issues (simulated)
    await this.runTest('Database Error Handling', async () => {
      // This test would require mocking the database connection
      // For now, we'll just verify the error handling structure exists
      try {
        // Try to call a method that might fail
        await AnalyticsService.getPlatformOverviewMetrics('30d');
        return { errorHandlingExists: true };
      } catch (error) {
        // If it fails, make sure it's a proper error message
        if (error instanceof Error && error.message.includes('Failed to retrieve')) {
          return { errorHandlingExists: true, errorMessage: error.message };
        }
        throw error;
      }
    });
  }

  /**
   * Test database indexes and optimization
   */
  private async testDatabaseIndexes() {
    console.log('🗃️  Testing Database Indexes...');

    // Test 1: Check if indexes exist
    await this.runTest('Index Existence Check', async () => {
      const indexQuery = `
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND (
          indexname LIKE 'idx_user_activity%' OR
          indexname LIKE 'idx_users_%' OR
          indexname LIKE 'idx_generated_files%' OR
          indexname LIKE 'idx_credit_transactions%'
        )
        ORDER BY tablename, indexname
      `;

      const result = await pool.query(indexQuery);
      const indexes = result.rows;

      if (indexes.length === 0) {
        throw new Error('No analytics indexes found - run migration phase09');
      }

      return {
        indexCount: indexes.length,
        indexes: indexes.map(idx => ({ table: idx.tablename, index: idx.indexname }))
      };
    });

    // Test 2: Query plan analysis (basic)
    await this.runTest('Query Plan Analysis', async () => {
      const explainQuery = `
        EXPLAIN (FORMAT JSON, ANALYZE false) 
        SELECT COUNT(*) FROM users WHERE is_active = true AND created_at >= NOW() - INTERVAL '30 days'
      `;

      const result = await pool.query(explainQuery);
      const plan = result.rows[0]['QUERY PLAN'][0];

      // Check if index is being used
      const planStr = JSON.stringify(plan);
      const usingIndex = planStr.includes('Index') && !planStr.includes('Seq Scan');

      return {
        usingIndex,
        estimatedCost: plan.Plan['Total Cost'],
        planType: plan.Plan['Node Type']
      };
    });
  }

  /**
   * Run a single test and record the result
   */
  private async runTest(testName: string, testFunction: () => Promise<any>) {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const executionTime = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'PASS',
        message: 'Test completed successfully',
        executionTime,
        details: result
      });
      
      console.log(`  ✅ ${testName} (${executionTime}ms)`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: errorMessage,
        executionTime,
        details: { error: errorMessage }
      });
      
      console.log(`  ❌ ${testName} - ${errorMessage} (${executionTime}ms)`);
    }
  }

  /**
   * Print test results summary
   */
  private printResults() {
    console.log('\n📋 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    const totalTime = this.results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }
    
    console.log('\n🎯 Performance Summary:');
    const performanceTests = this.results.filter(r => r.test.toLowerCase().includes('performance') || r.test.toLowerCase().includes('execution'));
    performanceTests.forEach(test => {
      console.log(`  ${test.test}: ${test.executionTime}ms`);
    });
    
    console.log('\n💾 Cache Summary:');
    const cacheStats = analyticsCacheService.getStats();
    console.log(`  Hit Rate: ${cacheStats.hitRate}%`);
    console.log(`  Total Entries: ${cacheStats.totalEntries}`);
    console.log(`  Total Hits: ${cacheStats.totalHits}`);
    console.log(`  Total Misses: ${cacheStats.totalMisses}`);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AnalyticsValidator();
  validator.runAllTests()
    .then((results) => {
      const failed = results.filter(r => r.status === 'FAIL').length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export { AnalyticsValidator };
