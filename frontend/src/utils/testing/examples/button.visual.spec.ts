/**
 * Example visual regression tests for Button component
 * Demonstrates how to use the responsive testing utilities
 */

import { test, expect } from '@playwright/test';
import {
  testComponentAcrossBreakpoints,
  testFormVisualResponsive,
  createComponentVisualSuite,
  createContentMasks,
  VIEWPORT_SIZES,
} from '../index';

test.describe('Button Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with buttons or a component showcase
    await page.goto('/login'); // Using login page as it has buttons
  });

  test('button renders consistently across breakpoints', async ({ page }) => {
    const buttonSelector = 'button[type="submit"]';
    
    await testComponentAcrossBreakpoints(
      page,
      buttonSelector,
      'login-button',
      expect,
      {
        threshold: 0.1,
        animations: 'disabled',
      }
    );
  });

  test('button states across devices', async ({ page }) => {
    const buttonSuite = createComponentVisualSuite(
      'login-button',
      'button[type="submit"]',
      [
        {
          name: 'default',
          setup: async (page) => {
            // Default state - no additional setup needed
            await page.waitForTimeout(100);
          },
        },
        {
          name: 'hover',
          setup: async (page) => {
            const button = page.locator('button[type="submit"]');
            await button.hover();
            await page.waitForTimeout(200);
          },
        },
        {
          name: 'focus',
          setup: async (page) => {
            const button = page.locator('button[type="submit"]');
            await button.focus();
            await page.waitForTimeout(200);
          },
        },
        {
          name: 'disabled',
          setup: async (page) => {
            // Disable the button via JavaScript
            await page.locator('button[type="submit"]').evaluate(btn => {
              (btn as HTMLButtonElement).disabled = true;
            });
            await page.waitForTimeout(100);
          },
          cleanup: async (page) => {
            // Re-enable the button
            await page.locator('button[type="submit"]').evaluate(btn => {
              (btn as HTMLButtonElement).disabled = false;
            });
          },
        },
      ]
    );

    await buttonSuite.runTests(page, expect, {
      threshold: 0.15,
      animations: 'disabled',
    });
  });

  test('form layout with buttons', async ({ page }) => {
    await testFormVisualResponsive(
      page,
      'form',
      'login-form',
      expect,
      {
        threshold: 0.2,
        fullPage: false,
        mask: [
          // Mask any dynamic content
          ...Object.values(createContentMasks(page)),
        ],
      }
    );
  });

  test('button touch targets on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_MEDIUM);
    
    const button = page.locator('button[type="submit"]');
    const boundingBox = await button.boundingBox();
    
    // Visual test to ensure button is properly sized
    await expect(page).toHaveScreenshot('button-mobile-touch-target.png', {
      clip: boundingBox || undefined,
      threshold: 0.1,
    });
    
    // Verify minimum touch target size
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
  });

  test('button loading state', async ({ page }) => {
    const buttonSelector = 'button[type="submit"]';
    
    // Create loading state by adding a class or attribute
    await page.locator(buttonSelector).evaluate(btn => {
      btn.setAttribute('data-loading', 'true');
      btn.textContent = 'Loading...';
    });
    
    await testComponentAcrossBreakpoints(
      page,
      buttonSelector,
      'button-loading',
      expect,
      {
        threshold: 0.1,
        animations: 'disabled',
      }
    );
  });
});

test.describe('Button Accessibility Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('button focus indicators', async ({ page }) => {
    const button = page.locator('button[type="submit"]');
    
    // Test focus state across different viewports
    const viewports = [
      { name: 'mobile', ...VIEWPORT_SIZES.MOBILE_MEDIUM },
      { name: 'tablet', ...VIEWPORT_SIZES.TABLET_PORTRAIT },
      { name: 'desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await button.focus();
      await page.waitForTimeout(200);
      
      await expect(page).toHaveScreenshot(`button-focus-${viewport.name}.png`, {
        threshold: 0.1,
        animations: 'disabled',
      });
    }
  });

  test('high contrast mode compatibility', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            filter: contrast(150%);
          }
        }
      `
    });

    await testComponentAcrossBreakpoints(
      page,
      'button[type="submit"]',
      'button-high-contrast',
      expect,
      {
        threshold: 0.2,
        animations: 'disabled',
      }
    );
  });
});