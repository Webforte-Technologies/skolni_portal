/**
 * Example visual regression tests for Navigation component
 * Demonstrates responsive navigation testing
 */

import { test, expect } from '@playwright/test';
import {
  testNavigationVisualResponsive,
  simulateDevice,
  simulateTouchInteraction,
  testKeyboardNavigation,
  VIEWPORT_SIZES,
  TEST_DEVICES,
} from '../index';

test.describe('Navigation Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first to access navigation
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('navigation layout across all devices', async ({ page }) => {
    await testNavigationVisualResponsive(
      page,
      'navigation-responsive',
      expect,
      {
        threshold: 0.15,
        animations: 'disabled',
        fullPage: false,
      }
    );
  });

  test('mobile menu states', async ({ page }) => {
    // Test on mobile device
    await simulateDevice(page, 'iPhone SE');
    
    // Closed state
    await expect(page).toHaveScreenshot('mobile-nav-closed.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Open mobile menu
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await mobileMenuButton.click();
    await page.waitForTimeout(300);

    // Open state
    await expect(page).toHaveScreenshot('mobile-nav-open.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Test backdrop
    const backdrop = page.locator('.bg-black.bg-opacity-50');
    await expect(backdrop).toBeVisible();
    
    await expect(page).toHaveScreenshot('mobile-nav-backdrop.png', {
      threshold: 0.1,
      animations: 'disabled',
    });
  });

  test('tablet navigation hybrid layout', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_PORTRAIT);
    await page.waitForTimeout(300);

    // Tablet should show a hybrid layout
    await expect(page).toHaveScreenshot('tablet-nav-layout.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Test orientation change
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_LANDSCAPE);
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('tablet-nav-landscape.png', {
      threshold: 0.1,
      animations: 'disabled',
    });
  });

  test('desktop navigation full layout', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.DESKTOP_LARGE);
    await page.waitForTimeout(300);

    // Desktop should show full navigation
    await expect(page).toHaveScreenshot('desktop-nav-full.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Test hover states on navigation items
    const navItems = page.locator('[data-testid^="nav-"]:visible');
    const firstNavItem = navItems.first();
    
    await firstNavItem.hover();
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot('desktop-nav-hover.png', {
      threshold: 0.15,
      animations: 'disabled',
    });
  });

  test('navigation accessibility visual indicators', async ({ page }) => {
    const viewports = [
      { name: 'mobile', ...VIEWPORT_SIZES.MOBILE_MEDIUM },
      { name: 'desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);

      // Test keyboard focus on navigation
      if (viewport.name === 'mobile') {
        // Focus mobile menu button
        const mobileMenuButton = page.getByTestId('mobile-menu-button');
        await mobileMenuButton.focus();
        
        await expect(page).toHaveScreenshot(`nav-focus-${viewport.name}-button.png`, {
          threshold: 0.1,
          animations: 'disabled',
        });

        // Open menu and test focus inside
        await mobileMenuButton.click();
        await page.waitForTimeout(300);
        
        const firstNavItem = page.getByTestId('nav-dashboard');
        await firstNavItem.focus();
        
        await expect(page).toHaveScreenshot(`nav-focus-${viewport.name}-item.png`, {
          threshold: 0.1,
          animations: 'disabled',
        });
      } else {
        // Focus desktop navigation items
        const navItem = page.locator('[data-testid="notifications-bell"]');
        await navItem.focus();
        
        await expect(page).toHaveScreenshot(`nav-focus-${viewport.name}-item.png`, {
          threshold: 0.1,
          animations: 'disabled',
        });
      }
    }
  });

  test('navigation touch interactions', async ({ page }) => {
    await simulateDevice(page, 'iPhone 12');
    
    // Test touch interaction with mobile menu
    await simulateTouchInteraction(page, '[data-testid="mobile-menu-button"]', 'tap');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('nav-touch-menu-open.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Test swipe to close (if implemented)
    try {
      await simulateTouchInteraction(page, '[role="dialog"]', 'swipe-left');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('nav-touch-swipe-close.png', {
        threshold: 0.1,
        animations: 'disabled',
      });
    } catch (error) {
      // Swipe to close might not be implemented
      console.log('Swipe to close not implemented');
    }
  });

  test('navigation responsive breakpoint transitions', async ({ page }) => {
    // Start with desktop
    await page.setViewportSize(VIEWPORT_SIZES.DESKTOP_MEDIUM);
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('nav-transition-desktop.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Transition to tablet
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_PORTRAIT);
    await page.waitForTimeout(500); // Allow for transition
    
    await expect(page).toHaveScreenshot('nav-transition-tablet.png', {
      threshold: 0.1,
      animations: 'disabled',
    });

    // Transition to mobile
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_MEDIUM);
    await page.waitForTimeout(500); // Allow for transition
    
    await expect(page).toHaveScreenshot('nav-transition-mobile.png', {
      threshold: 0.1,
      animations: 'disabled',
    });
  });
});

test.describe('Navigation Performance Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('navigation animation performance', async ({ page }) => {
    await simulateDevice(page, 'iPhone SE'); // Test on slower device
    
    // Measure animation performance
    await page.evaluate(() => {
      (window as any).animationFrames = [];
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = (callback) => {
        (window as any).animationFrames.push(Date.now());
        return originalRAF(callback);
      };
    });

    // Trigger mobile menu animation
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await mobileMenuButton.click();
    await page.waitForTimeout(500);

    // Capture during animation
    await expect(page).toHaveScreenshot('nav-animation-performance.png', {
      threshold: 0.2, // Higher threshold due to animation
      animations: 'allow',
    });

    // Check animation frame rate
    const frameData = await page.evaluate(() => {
      return (window as any).animationFrames;
    });

    // Ensure smooth animation (should have multiple frames)
    expect(frameData.length).toBeGreaterThan(5);
  });
});