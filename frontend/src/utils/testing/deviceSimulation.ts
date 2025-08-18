/**
 * Device simulation utilities for development and testing
 * Provides tools to simulate different device characteristics
 */

import type { Page } from '@playwright/test';
import type { ViewportState } from '../../types';
import { TEST_DEVICES, VIEWPORT_SIZES, createTestViewportState } from './viewportUtils';

export interface DeviceSimulationOptions {
  viewport: { width: number; height: number };
  userAgent?: string;
  devicePixelRatio?: number;
  touchEnabled?: boolean;
  reducedMotion?: boolean;
  colorScheme?: 'light' | 'dark';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Simulates a specific device in Playwright
 */
export const simulateDevice = async (
  page: Page,
  deviceName: string,
  options?: Partial<DeviceSimulationOptions>
) => {
  const device = TEST_DEVICES.find(d => d.name === deviceName);
  if (!device) {
    throw new Error(`Device "${deviceName}" not found in TEST_DEVICES`);
  }

  const config: DeviceSimulationOptions = {
    viewport: device.viewport,
    userAgent: device.userAgent,
    devicePixelRatio: device.devicePixelRatio || 1,
    touchEnabled: device.touchEnabled,
    reducedMotion: false,
    colorScheme: 'light',
    orientation: device.orientation,
    ...options,
  };

  // Set viewport
  await page.setViewportSize(config.viewport);

  // Set user agent if provided
  if (config.userAgent) {
    await page.setExtraHTTPHeaders({
      'User-Agent': config.userAgent,
    });
  }

  // Set device pixel ratio
  if (config.devicePixelRatio && config.devicePixelRatio !== 1) {
    await page.emulateMedia({
      reducedMotion: config.reducedMotion ? 'reduce' : 'no-preference',
      colorScheme: config.colorScheme,
    });
  }

  // Add touch simulation if needed
  if (config.touchEnabled) {
    await page.addInitScript(() => {
      // Add touch event simulation
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: false,
        value: 5,
      });
    });
  }

  return config;
};

/**
 * Simulates viewport changes (like device rotation)
 */
export const simulateViewportChange = async (
  page: Page,
  fromViewport: { width: number; height: number },
  toViewport: { width: number; height: number },
  animationDelay: number = 300
) => {
  // Set initial viewport
  await page.setViewportSize(fromViewport);
  await page.waitForTimeout(100);

  // Change to new viewport
  await page.setViewportSize(toViewport);
  
  // Wait for responsive changes to complete
  await page.waitForTimeout(animationDelay);
};

/**
 * Simulates device rotation
 */
export const simulateDeviceRotation = async (
  page: Page,
  currentViewport: { width: number; height: number }
) => {
  const rotatedViewport = {
    width: currentViewport.height,
    height: currentViewport.width,
  };

  await simulateViewportChange(page, currentViewport, rotatedViewport);
  return rotatedViewport;
};

/**
 * Tests responsive behavior across multiple viewports
 */
export const testAcrossViewports = async (
  page: Page,
  viewports: Array<{ width: number; height: number }>,
  testCallback: (viewport: { width: number; height: number }, viewportState: ViewportState) => Promise<void>
) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(200); // Allow for responsive changes
    
    const viewportState = createTestViewportState(viewport);
    await testCallback(viewport, viewportState);
  }
};

/**
 * Simulates touch interactions
 */
export const simulateTouchInteraction = async (
  page: Page,
  selector: string,
  interaction: 'tap' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch' | 'long-press'
) => {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });

  const boundingBox = await element.boundingBox();
  if (!boundingBox) {
    throw new Error(`Element ${selector} not found or not visible`);
  }

  const centerX = boundingBox.x + boundingBox.width / 2;
  const centerY = boundingBox.y + boundingBox.height / 2;

  switch (interaction) {
    case 'tap':
      await page.touchscreen.tap(centerX, centerY);
      break;
      
    case 'swipe-left':
      await page.touchscreen.tap(centerX + 50, centerY);
      await page.mouse.move(centerX + 50, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX - 50, centerY);
      await page.mouse.up();
      break;
      
    case 'swipe-right':
      await page.touchscreen.tap(centerX - 50, centerY);
      await page.mouse.move(centerX - 50, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 50, centerY);
      await page.mouse.up();
      break;
      
    case 'swipe-up':
      await page.mouse.move(centerX, centerY + 50);
      await page.mouse.down();
      await page.mouse.move(centerX, centerY - 50);
      await page.mouse.up();
      break;
      
    case 'swipe-down':
      await page.mouse.move(centerX, centerY - 50);
      await page.mouse.down();
      await page.mouse.move(centerX, centerY + 50);
      await page.mouse.up();
      break;
      
    case 'long-press':
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.waitForTimeout(800); // Long press duration
      await page.mouse.up();
      break;
      
    case 'pinch':
      // Simulate pinch gesture (zoom)
      await page.touchscreen.tap(centerX - 25, centerY);
      await page.touchscreen.tap(centerX + 25, centerY);
      break;
  }
};

/**
 * Validates touch target sizes
 */
export const validateTouchTargets = async (
  page: Page,
  selectors: string[],
  minimumSize: number = 44
) => {
  const results: Array<{ selector: string; width: number; height: number; valid: boolean }> = [];

  for (const selector of selectors) {
    const element = page.locator(selector);
    
    // Wait for element to be visible before getting bounding box
    try {
      await element.waitFor({ state: 'visible', timeout: 5000 });
      const boundingBox = await element.boundingBox();
      
      if (boundingBox) {
        const valid = boundingBox.width >= minimumSize && boundingBox.height >= minimumSize;
        results.push({
          selector,
          width: boundingBox.width,
          height: boundingBox.height,
          valid,
        });
      } else {
        results.push({
          selector,
          width: 0,
          height: 0,
          valid: false,
        });
      }
    } catch (error) {
      // Element not found or not visible
      results.push({
        selector,
        width: 0,
        height: 0,
        valid: false,
      });
    }
  }

  return results;
};

/**
 * Simulates network conditions for performance testing
 */
export const simulateNetworkConditions = async (
  page: Page,
  condition: 'fast-3g' | 'slow-3g' | 'offline' | 'fast'
) => {
  const conditions = {
    'fast-3g': {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 150,
    },
    'slow-3g': {
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8, // 500 Kbps
      latency: 400,
    },
    'offline': {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    },
    'fast': {
      offline: false,
      downloadThroughput: 100 * 1024 * 1024 / 8, // 100 Mbps
      uploadThroughput: 100 * 1024 * 1024 / 8, // 100 Mbps
      latency: 10,
    },
  };

  await page.route('**/*', route => {
    if (condition === 'offline') {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Note: Playwright doesn't have built-in network throttling like Puppeteer
  // This is a simplified simulation
};

/**
 * Captures responsive screenshots for visual regression testing
 */
export const captureResponsiveScreenshots = async (
  page: Page,
  testName: string,
  viewports: Array<{ name: string; width: number; height: number }>
) => {
  const screenshots: Array<{ name: string; path: string }> = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300); // Allow for responsive changes
    
    const screenshotPath = `test-results/screenshots/${testName}-${viewport.name}-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true,
    });
    
    screenshots.push({
      name: `${testName}-${viewport.name}`,
      path: screenshotPath,
    });
  }

  return screenshots;
};

/**
 * Utility to test keyboard navigation on different devices
 */
export const testKeyboardNavigation = async (
  page: Page,
  startSelector: string,
  expectedFocusOrder: string[]
) => {
  // Focus the starting element
  await page.locator(startSelector).focus();
  
  const focusOrder: string[] = [];
  
  for (let i = 0; i < expectedFocusOrder.length; i++) {
    // Get currently focused element
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused ? focused.tagName + (focused.id ? `#${focused.id}` : '') + 
        (focused.className ? `.${focused.className.split(' ').join('.')}` : '') : null;
    });
    
    if (focusedElement) {
      focusOrder.push(focusedElement);
    }
    
    // Move to next element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
  }
  
  return focusOrder;
};

/**
 * Development utilities for responsive testing
 */
export const createDevicePresets = () => {
  return {
    // Quick access to common device configurations
    iPhoneSE: () => simulateDevice,
    iPhone12: () => simulateDevice,
    iPad: () => simulateDevice,
    desktop: () => simulateDevice,
    
    // Utility functions for development
    testAllDevices: async (page: Page, testFn: (device: string) => Promise<void>) => {
      for (const device of TEST_DEVICES) {
        await simulateDevice(page, device.name);
        await testFn(device.name);
      }
    },
    
    testBreakpoints: async (page: Page, testFn: (viewport: { width: number; height: number }) => Promise<void>) => {
      const breakpointViewports = [
        VIEWPORT_SIZES.MOBILE_MEDIUM,
        VIEWPORT_SIZES.TABLET_PORTRAIT,
        VIEWPORT_SIZES.DESKTOP_MEDIUM,
      ];
      
      for (const viewport of breakpointViewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(200);
        await testFn(viewport);
      }
    },
  };
};