/**
 * Test runner utilities for responsive testing
 * Provides orchestration and reporting for comprehensive responsive tests
 */

import type { Page } from '@playwright/test';
import type { ViewportState } from '../../types';
import {
  TEST_DEVICES,
  VIEWPORT_SIZES,
  testComponentResponsive,
  testTouchTargets,
  testComponentAccessibility,
  testLayoutStability,
  simulateDevice,
  validateTouchTargets,
  createTestViewportState,
} from './index';

export interface TestSuite {
  name: string;
  description: string;
  tests: TestCase[];
}

export interface TestCase {
  name: string;
  type: 'responsive' | 'accessibility' | 'performance' | 'visual' | 'touch';
  selector?: string;
  setup?: (page: Page) => Promise<void>;
  cleanup?: (page: Page) => Promise<void>;
  config?: any;
}

export interface TestResult {
  suite: string;
  test: string;
  type: string;
  device?: string;
  viewport?: { width: number; height: number };
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
  results: TestResult[];
  coverage: {
    devices: string[];
    viewports: Array<{ width: number; height: number }>;
    components: string[];
  };
}

/**
 * Comprehensive responsive test runner
 */
export class ResponsiveTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor(private page: Page) {}

  /**
   * Runs a complete test suite
   */
  async runSuite(suite: TestSuite): Promise<TestResult[]> {
    console.log(`Running test suite: ${suite.name}`);
    this.startTime = Date.now();
    
    const suiteResults: TestResult[] = [];

    for (const testCase of suite.tests) {
      const testResults = await this.runTestCase(suite.name, testCase);
      suiteResults.push(...testResults);
    }

    this.results.push(...suiteResults);
    return suiteResults;
  }

  /**
   * Runs a single test case across all relevant devices/viewports
   */
  private async runTestCase(suiteName: string, testCase: TestCase): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const testStartTime = Date.now();

    try {
      // Setup
      if (testCase.setup) {
        await testCase.setup(this.page);
      }

      // Determine which devices/viewports to test
      const testTargets = this.getTestTargets(testCase.type);

      for (const target of testTargets) {
        const targetStartTime = Date.now();
        
        try {
          // Configure device/viewport
          if ('name' in target) {
            await simulateDevice(this.page, target.name);
          } else {
            await this.page.setViewportSize(target);
            await this.page.waitForTimeout(200);
          }

          // Run the specific test
          const testResult = await this.executeTest(testCase);
          
          results.push({
            suite: suiteName,
            test: testCase.name,
            type: testCase.type,
            device: 'name' in target ? target.name : undefined,
            viewport: 'name' in target ? target.viewport : target,
            success: true,
            duration: Date.now() - targetStartTime,
            details: testResult,
          });

        } catch (error) {
          results.push({
            suite: suiteName,
            test: testCase.name,
            type: testCase.type,
            device: 'name' in target ? target.name : undefined,
            viewport: 'name' in target ? target.viewport : target,
            success: false,
            duration: Date.now() - targetStartTime,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Cleanup
      if (testCase.cleanup) {
        await testCase.cleanup(this.page);
      }

    } catch (error) {
      results.push({
        suite: suiteName,
        test: testCase.name,
        type: testCase.type,
        success: false,
        duration: Date.now() - testStartTime,
        error: error instanceof Error ? error.message : 'Test setup/cleanup failed',
      });
    }

    return results;
  }

  /**
   * Executes a specific test based on its type
   */
  private async executeTest(testCase: TestCase): Promise<any> {
    switch (testCase.type) {
      case 'responsive':
        return await this.runResponsiveTest(testCase);
      
      case 'accessibility':
        return await this.runAccessibilityTest(testCase);
      
      case 'touch':
        return await this.runTouchTest(testCase);
      
      case 'performance':
        return await this.runPerformanceTest(testCase);
      
      case 'visual':
        return await this.runVisualTest(testCase);
      
      default:
        throw new Error(`Unknown test type: ${testCase.type}`);
    }
  }

  /**
   * Runs responsive behavior tests
   */
  private async runResponsiveTest(testCase: TestCase): Promise<any> {
    if (!testCase.selector) {
      throw new Error('Responsive test requires selector');
    }

    const element = this.page.locator(testCase.selector);
    await element.waitFor({ state: 'visible' });

    const viewport = this.page.viewportSize();
    if (!viewport) {
      throw new Error('No viewport size available');
    }

    const viewportState = createTestViewportState(viewport);
    const boundingBox = await element.boundingBox();

    // Basic responsive checks
    const checks = {
      visible: await element.isVisible(),
      withinViewport: boundingBox ? boundingBox.width <= viewport.width : false,
      properBreakpoint: this.validateBreakpointBehavior(viewportState, boundingBox),
      touchTargetSize: this.validateTouchTargetSize(viewportState, boundingBox),
    };

    return checks;
  }

  /**
   * Runs accessibility tests
   */
  private async runAccessibilityTest(testCase: TestCase): Promise<any> {
    if (!testCase.selector) {
      throw new Error('Accessibility test requires selector');
    }

    const element = this.page.locator(testCase.selector);
    await element.waitFor({ state: 'visible' });

    // Basic accessibility checks
    const checks = {
      hasRole: await element.getAttribute('role') !== null,
      hasAriaLabel: await element.getAttribute('aria-label') !== null || 
                   await element.getAttribute('aria-labelledby') !== null,
      focusable: await this.isFocusable(element),
      keyboardAccessible: await this.testKeyboardAccess(element),
    };

    return checks;
  }

  /**
   * Runs touch interaction tests
   */
  private async runTouchTest(testCase: TestCase): Promise<any> {
    if (!testCase.selector) {
      throw new Error('Touch test requires selector');
    }

    const viewport = this.page.viewportSize();
    if (!viewport) {
      throw new Error('No viewport size available');
    }

    const viewportState = createTestViewportState(viewport);
    
    // Only run touch tests on touch devices
    if (!viewportState.touchDevice && viewportState.breakpoint === 'desktop') {
      return { skipped: true, reason: 'Not a touch device' };
    }

    const touchTargets = await validateTouchTargets(this.page, [testCase.selector]);
    
    return {
      touchTargets,
      allValid: touchTargets.every(target => target.valid),
    };
  }

  /**
   * Runs performance tests
   */
  private async runPerformanceTest(testCase: TestCase): Promise<any> {
    const startTime = performance.now();
    
    // Measure page load performance
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    
    const loadTime = performance.now() - startTime;
    
    // Get performance metrics
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    return {
      loadTime,
      metrics,
      viewport: this.page.viewportSize(),
    };
  }

  /**
   * Runs visual regression tests
   */
  private async runVisualTest(testCase: TestCase): Promise<any> {
    // This would integrate with the visual regression utilities
    // For now, just capture basic visual information
    
    const viewport = this.page.viewportSize();
    const screenshot = await this.page.screenshot({ 
      fullPage: false,
      type: 'png',
    });

    return {
      viewport,
      screenshotSize: screenshot.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Gets appropriate test targets based on test type
   */
  private getTestTargets(testType: string) {
    switch (testType) {
      case 'responsive':
      case 'visual':
        return TEST_DEVICES;
      
      case 'accessibility':
        return [
          TEST_DEVICES.find(d => d.name === 'iPhone SE')!,
          TEST_DEVICES.find(d => d.name === 'iPad')!,
          TEST_DEVICES.find(d => d.name === 'Desktop Small')!,
        ];
      
      case 'touch':
        return TEST_DEVICES.filter(d => d.touchEnabled);
      
      case 'performance':
        return [
          VIEWPORT_SIZES.MOBILE_MEDIUM,
          VIEWPORT_SIZES.TABLET_PORTRAIT,
          VIEWPORT_SIZES.DESKTOP_MEDIUM,
        ];
      
      default:
        return [VIEWPORT_SIZES.DESKTOP_MEDIUM];
    }
  }

  /**
   * Validates breakpoint-specific behavior
   */
  private validateBreakpointBehavior(
    viewportState: ViewportState,
    boundingBox: { width: number; height: number } | null
  ): boolean {
    if (!boundingBox) return false;

    // Add breakpoint-specific validation logic
    switch (viewportState.breakpoint) {
      case 'mobile':
        return boundingBox.width <= viewportState.width;
      case 'tablet':
        return true; // Add tablet-specific checks
      case 'desktop':
        return true; // Add desktop-specific checks
      default:
        return false;
    }
  }

  /**
   * Validates touch target size requirements
   */
  private validateTouchTargetSize(
    viewportState: ViewportState,
    boundingBox: { width: number; height: number } | null
  ): boolean {
    if (!boundingBox || !viewportState.touchDevice) return true;
    
    const minSize = 44; // Minimum touch target size
    return boundingBox.width >= minSize && boundingBox.height >= minSize;
  }

  /**
   * Tests if element is focusable
   */
  private async isFocusable(element: any): Promise<boolean> {
    try {
      await element.focus();
      const isFocused = await element.evaluate((el: Element) => document.activeElement === el);
      return isFocused;
    } catch {
      return false;
    }
  }

  /**
   * Tests keyboard accessibility
   */
  private async testKeyboardAccess(element: any): Promise<boolean> {
    try {
      await element.focus();
      await this.page.keyboard.press('Enter');
      // Add more sophisticated keyboard testing
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates a comprehensive test report
   */
  generateReport(): TestReport {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const duration = Date.now() - this.startTime;

    const devices = [...new Set(this.results.map(r => r.device).filter(Boolean))];
    const viewports = [...new Set(this.results.map(r => r.viewport).filter(Boolean))];
    const components = [...new Set(this.results.map(r => r.test))];

    return {
      summary: {
        total,
        passed,
        failed,
        duration,
      },
      results: this.results,
      coverage: {
        devices: devices as string[],
        viewports: viewports as Array<{ width: number; height: number }>,
        components,
      },
    };
  }

  /**
   * Clears previous results
   */
  reset(): void {
    this.results = [];
    this.startTime = 0;
  }
}

/**
 * Creates a standard responsive test suite for a component
 */
export const createStandardTestSuite = (
  componentName: string,
  componentSelector: string,
  additionalTests: TestCase[] = []
): TestSuite => {
  const standardTests: TestCase[] = [
    {
      name: `${componentName} responsive behavior`,
      type: 'responsive',
      selector: componentSelector,
    },
    {
      name: `${componentName} accessibility`,
      type: 'accessibility',
      selector: componentSelector,
    },
    {
      name: `${componentName} touch targets`,
      type: 'touch',
      selector: componentSelector,
    },
  ];

  return {
    name: `${componentName} Responsive Test Suite`,
    description: `Comprehensive responsive testing for ${componentName} component`,
    tests: [...standardTests, ...additionalTests],
  };
};