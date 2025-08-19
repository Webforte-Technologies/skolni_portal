/**
 * Test to verify responsive testing utilities are working correctly
 */

import { test, expect } from '@playwright/test';
import {
  VIEWPORT_SIZES,
  TEST_DEVICES,
  createTestViewportState,
  simulateDevice,
  validateTouchTargets,
  testComponentResponsive,
  createComponentTestSuite,
} from '../src/utils/testing';

test.describe('Responsive Testing Utilities', () => {
  test('viewport utilities work correctly', async ({ page }) => {
    // Test viewport state creation
    const mobileState = createTestViewportState(VIEWPORT_SIZES.MOBILE_MEDIUM);
    expect(mobileState.breakpoint).toBe('mobile');
    expect(mobileState.width).toBe(375);
    expect(mobileState.height).toBe(667);

    const desktopState = createTestViewportState(VIEWPORT_SIZES.DESKTOP_MEDIUM);
    expect(desktopState.breakpoint).toBe('desktop');
    expect(desktopState.width).toBe(1440);
    expect(desktopState.height).toBe(900);
  });

  test('device simulation works', async ({ page }) => {
    await page.goto('/login');
    
    // Test device simulation
    await simulateDevice(page, 'iPhone SE');
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);
    
    // Verify page loads correctly on mobile
    await expect(page.locator('form')).toBeVisible();
  });

  test('touch target validation works', async ({ page }) => {
    await page.goto('/login');
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_MEDIUM);
    
    // Wait for the button to be visible
    await page.waitForSelector('button[type="submit"]', { state: 'visible' });
    
    // Test touch target validation
    const results = await validateTouchTargets(page, ['button[type="submit"]']);
    
    expect(results).toHaveLength(1);
    expect(results[0].selector).toBe('button[type="submit"]');
    expect(results[0].valid).toBe(true); // Should meet 44px minimum
  });

  test('component test suite creation works', async ({ page }) => {
    await page.goto('/login');
    
    // Create a test suite for the login form
    const suite = createComponentTestSuite('LoginForm', 'form');
    
    expect(suite.componentName).toBe('LoginForm');
    expect(suite.componentSelector).toBe('form');
    
    // Test that the suite has the expected methods
    expect(typeof suite.testResponsiveBehavior).toBe('function');
    expect(typeof suite.testAccessibility).toBe('function');
    expect(typeof suite.testTouchTargets).toBe('function');
    expect(typeof suite.runFullSuite).toBe('function');
  });

  test('responsive component testing works', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for form to be visible
    await page.waitForSelector('form', { state: 'visible' });
    
    // Test responsive behavior of login form
    const test = {
      name: 'LoginForm',
      selector: 'form',
      viewports: [
        VIEWPORT_SIZES.MOBILE_MEDIUM,
        VIEWPORT_SIZES.DESKTOP_MEDIUM,
      ],
      assertions: [
        {
          viewport: VIEWPORT_SIZES.MOBILE_MEDIUM,
          test: async (element, viewportState) => {
            const isVisible = await element.isVisible();
            if (!isVisible) {
              throw new Error('Form not visible on mobile');
            }
            if (viewportState.breakpoint !== 'mobile') {
              throw new Error(`Expected mobile breakpoint, got ${viewportState.breakpoint}`);
            }
          },
        },
        {
          viewport: VIEWPORT_SIZES.DESKTOP_MEDIUM,
          test: async (element, viewportState) => {
            const isVisible = await element.isVisible();
            if (!isVisible) {
              throw new Error('Form not visible on desktop');
            }
            if (viewportState.breakpoint !== 'desktop') {
              throw new Error(`Expected desktop breakpoint, got ${viewportState.breakpoint}`);
            }
          },
        },
      ],
    };

    const results = await testComponentResponsive(page, test);
    
    expect(results).toHaveLength(2);
    
    // Log any failures for debugging
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('Test failures:', failures);
    }
    
    expect(results.every(r => r.success)).toBe(true);
  });

  test('viewport constants are properly defined', () => {
    // Verify all viewport sizes are defined
    expect(VIEWPORT_SIZES.MOBILE_SMALL).toBeDefined();
    expect(VIEWPORT_SIZES.MOBILE_MEDIUM).toBeDefined();
    expect(VIEWPORT_SIZES.MOBILE_LARGE).toBeDefined();
    expect(VIEWPORT_SIZES.TABLET_PORTRAIT).toBeDefined();
    expect(VIEWPORT_SIZES.DESKTOP_SMALL).toBeDefined();
    expect(VIEWPORT_SIZES.DESKTOP_MEDIUM).toBeDefined();
    expect(VIEWPORT_SIZES.DESKTOP_LARGE).toBeDefined();

    // Verify test devices are defined
    expect(TEST_DEVICES.length).toBeGreaterThan(0);
    expect(TEST_DEVICES[0]).toHaveProperty('name');
    expect(TEST_DEVICES[0]).toHaveProperty('viewport');
    expect(TEST_DEVICES[0]).toHaveProperty('touchEnabled');
  });

  test('breakpoint detection works correctly', () => {
    // Test mobile breakpoint
    const mobileState = createTestViewportState({ width: 375, height: 667 });
    expect(mobileState.breakpoint).toBe('mobile');

    // Test tablet breakpoint  
    const tabletState = createTestViewportState({ width: 768, height: 1024 });
    expect(tabletState.breakpoint).toBe('tablet');

    // Test desktop breakpoint
    const desktopState = createTestViewportState({ width: 1280, height: 720 });
    expect(desktopState.breakpoint).toBe('desktop');
  });

  test('orientation detection works correctly', () => {
    // Portrait orientation
    const portraitState = createTestViewportState({ width: 375, height: 667 });
    expect(portraitState.orientation).toBe('portrait');

    // Landscape orientation
    const landscapeState = createTestViewportState({ width: 667, height: 375 });
    expect(landscapeState.orientation).toBe('landscape');
  });
});