/**
 * Visual regression testing utilities for responsive design
 * Provides tools for consistent screenshot comparison across devices
 */

import type { Page, Locator, expect as PlaywrightExpect } from '@playwright/test';
import { VIEWPORT_SIZES, TEST_DEVICES, type TestDevice } from './viewportUtils';
import { simulateDevice } from './deviceSimulation';

export interface VisualTestOptions {
  threshold?: number;
  animations?: 'disabled' | 'allow';
  clip?: { x: number; y: number; width: number; height: number };
  fullPage?: boolean;
  mask?: Locator[];
  mode?: 'light' | 'dark';
}

export interface ResponsiveVisualTestConfig {
  name: string;
  devices: string[];
  options?: VisualTestOptions;
  setup?: (page: Page, device: TestDevice) => Promise<void>;
  cleanup?: (page: Page, device: TestDevice) => Promise<void>;
}

/**
 * Default visual test configuration
 */
export const DEFAULT_VISUAL_OPTIONS: VisualTestOptions = {
  threshold: 0.2,
  animations: 'disabled',
  fullPage: false,
  mode: 'light',
};

/**
 * Captures screenshots across multiple devices for visual regression testing
 */
export const captureResponsiveScreenshots = async (
  page: Page,
  testName: string,
  config: ResponsiveVisualTestConfig,
  expect: typeof PlaywrightExpect
) => {
  const results: Array<{
    device: string;
    screenshot: string;
    success: boolean;
    error?: string;
  }> = [];

  for (const deviceName of config.devices) {
    try {
      const device = TEST_DEVICES.find(d => d.name === deviceName);
      if (!device) {
        throw new Error(`Device "${deviceName}" not found`);
      }

      // Simulate device
      await simulateDevice(page, deviceName);
      
      // Run setup if provided
      if (config.setup) {
        await config.setup(page, device);
      }

      // Disable animations for consistent screenshots
      if (config.options?.animations === 'disabled') {
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
          `
        });
      }

      // Wait for any layout shifts to complete
      await page.waitForTimeout(500);

      // Take screenshot and compare
      const screenshotName = `${testName}-${deviceName.toLowerCase().replace(/\s+/g, '-')}`;
      
      await expect(page).toHaveScreenshot(`${screenshotName}.png`, {
        threshold: config.options?.threshold || DEFAULT_VISUAL_OPTIONS.threshold,
        clip: config.options?.clip,
        fullPage: config.options?.fullPage || DEFAULT_VISUAL_OPTIONS.fullPage,
        mask: config.options?.mask,
        animations: config.options?.animations || DEFAULT_VISUAL_OPTIONS.animations,
      });

      // Run cleanup if provided
      if (config.cleanup) {
        await config.cleanup(page, device);
      }

      results.push({
        device: deviceName,
        screenshot: screenshotName,
        success: true,
      });

    } catch (error) {
      results.push({
        device: deviceName,
        screenshot: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};

/**
 * Tests component visual consistency across breakpoints
 */
export const testComponentAcrossBreakpoints = async (
  page: Page,
  componentSelector: string,
  testName: string,
  expect: typeof PlaywrightExpect,
  options?: VisualTestOptions
) => {
  const breakpointDevices = [
    'iPhone SE',      // Mobile
    'iPad',           // Tablet
    'Desktop Small',  // Desktop
  ];

  const config: ResponsiveVisualTestConfig = {
    name: testName,
    devices: breakpointDevices,
    options: { ...DEFAULT_VISUAL_OPTIONS, ...options },
    setup: async (page) => {
      // Ensure component is visible
      await page.locator(componentSelector).waitFor({ state: 'visible' });
    },
  };

  return await captureResponsiveScreenshots(page, testName, config, expect);
};

/**
 * Tests page layout across all device types
 */
export const testPageLayoutResponsive = async (
  page: Page,
  pagePath: string,
  testName: string,
  expect: typeof PlaywrightExpect,
  options?: VisualTestOptions
) => {
  const allDevices = TEST_DEVICES.map(d => d.name);

  const config: ResponsiveVisualTestConfig = {
    name: testName,
    devices: allDevices,
    options: { 
      ...DEFAULT_VISUAL_OPTIONS, 
      fullPage: true,
      ...options 
    },
    setup: async (page) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
    },
  };

  return await captureResponsiveScreenshots(page, testName, config, expect);
};

/**
 * Tests form layouts across devices
 */
export const testFormResponsive = async (
  page: Page,
  formSelector: string,
  testName: string,
  expect: typeof PlaywrightExpect,
  options?: VisualTestOptions
) => {
  const formDevices = [
    'iPhone SE',      // Small mobile
    'iPhone 12',      // Large mobile
    'iPad',           // Tablet
    'Desktop Medium', // Desktop
  ];

  const config: ResponsiveVisualTestConfig = {
    name: testName,
    devices: formDevices,
    options: { ...DEFAULT_VISUAL_OPTIONS, ...options },
    setup: async (page) => {
      const form = page.locator(formSelector);
      await form.waitFor({ state: 'visible' });
      
      // Focus first input to show mobile keyboard behavior
      const firstInput = form.locator('input, textarea, select').first();
      if (await firstInput.count() > 0) {
        await firstInput.focus();
      }
    },
  };

  return await captureResponsiveScreenshots(page, testName, config, expect);
};

/**
 * Tests navigation components across devices
 */
export const testNavigationResponsive = async (
  page: Page,
  testName: string,
  expect: typeof PlaywrightExpect,
  options?: VisualTestOptions
) => {
  const navigationDevices = [
    'iPhone SE',      // Mobile - should show hamburger menu
    'iPad',           // Tablet - hybrid navigation
    'Desktop Large',  // Desktop - full navigation
  ];

  const config: ResponsiveVisualTestConfig = {
    name: testName,
    devices: navigationDevices,
    options: { ...DEFAULT_VISUAL_OPTIONS, ...options },
    setup: async (page, device) => {
      // For mobile devices, test both closed and open menu states
      if (device.touchEnabled && device.viewport.width < 768) {
        // First capture closed state
        await page.waitForTimeout(300);
        
        // Then open mobile menu for second capture
        const mobileMenuButton = page.getByTestId('mobile-menu-button');
        if (await mobileMenuButton.count() > 0) {
          await mobileMenuButton.click();
          await page.waitForTimeout(300);
        }
      }
    },
  };

  return await captureResponsiveScreenshots(page, testName, config, expect);
};

/**
 * Tests modal and overlay components across devices
 */
export const testModalResponsive = async (
  page: Page,
  modalTriggerSelector: string,
  testName: string,
  expect: typeof PlaywrightExpect,
  options?: VisualTestOptions
) => {
  const modalDevices = [
    'iPhone SE',      // Mobile - full screen modal
    'iPad',           // Tablet - centered modal
    'Desktop Medium', // Desktop - centered modal
  ];

  const config: ResponsiveVisualTestConfig = {
    name: testName,
    devices: modalDevices,
    options: { ...DEFAULT_VISUAL_OPTIONS, ...options },
    setup: async (page) => {
      // Open modal
      await page.locator(modalTriggerSelector).click();
      await page.waitForTimeout(500); // Wait for modal animation
    },
    cleanup: async (page) => {
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    },
  };

  return await captureResponsiveScreenshots(page, testName, config, expect);
};

/**
 * Creates a visual regression test suite for a component
 */
export const createComponentVisualSuite = (
  componentName: string,
  componentSelector: string,
  variants: Array<{
    name: string;
    setup: (page: Page) => Promise<void>;
    cleanup?: (page: Page) => Promise<void>;
  }>
) => {
  return {
    componentName,
    componentSelector,
    variants,
    
    async runTests(
      page: Page,
      expect: typeof PlaywrightExpect,
      options?: VisualTestOptions
    ) {
      const results = [];
      
      for (const variant of variants) {
        await variant.setup(page);
        
        const testName = `${componentName}-${variant.name}`;
        const result = await testComponentAcrossBreakpoints(
          page,
          componentSelector,
          testName,
          expect,
          options
        );
        
        if (variant.cleanup) {
          await variant.cleanup(page);
        }
        
        results.push({ variant: variant.name, result });
      }
      
      return results;
    },
  };
};

/**
 * Utility to mask dynamic content for consistent screenshots
 */
export const createContentMasks = (page: Page) => {
  return {
    // Mask timestamps and dynamic dates
    timestamps: page.locator('[data-testid*="timestamp"], .timestamp, time'),
    
    // Mask user avatars and profile images
    avatars: page.locator('[data-testid*="avatar"], .avatar, img[alt*="avatar"]'),
    
    // Mask loading states and spinners
    loading: page.locator('[data-testid*="loading"], .loading, .spinner'),
    
    // Mask random IDs or generated content
    dynamicIds: page.locator('[data-testid*="dynamic"], [id*="random"]'),
    
    // Mask notification badges with counts
    badges: page.locator('.badge, [data-testid*="badge"]'),
  };
};

/**
 * Performance-aware visual testing
 */
export const testWithPerformanceMetrics = async (
  page: Page,
  testFn: () => Promise<void>,
  deviceName: string
) => {
  const device = TEST_DEVICES.find(d => d.name === deviceName);
  if (!device) {
    throw new Error(`Device "${deviceName}" not found`);
  }

  // Start performance monitoring
  await page.evaluate(() => {
    (window as any).performanceMarks = [];
    performance.mark('visual-test-start');
  });

  // Run the visual test
  await testFn();

  // Collect performance metrics
  const metrics = await page.evaluate(() => {
    performance.mark('visual-test-end');
    performance.measure('visual-test-duration', 'visual-test-start', 'visual-test-end');
    
    const measure = performance.getEntriesByName('visual-test-duration')[0];
    return {
      duration: measure.duration,
      devicePixelRatio: window.devicePixelRatio,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  });

  return {
    device: deviceName,
    metrics,
  };
};