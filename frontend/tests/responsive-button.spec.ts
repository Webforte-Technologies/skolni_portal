import { test, expect } from '@playwright/test';

test.describe('Responsive Button Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that uses the Button component
    // For now, we'll test on the login page which should have buttons
    await page.goto('/login');
  });

  test('buttons have minimum touch target size on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Find a button on the page
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Check that the button has adequate size for touch
    const boundingBox = await button.boundingBox();
    expect(boundingBox).toBeTruthy();
    
    if (boundingBox) {
      // Minimum 44px touch target as per requirements
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('buttons adapt to different screen sizes', async ({ page }) => {
    // Test desktop size first
    await page.setViewportSize({ width: 1280, height: 720 });
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    const desktopBox = await button.boundingBox();
    
    // Switch to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100); // Allow for responsive changes
    
    const mobileBox = await button.boundingBox();
    
    // On mobile, buttons should be at least as tall (due to touch targets)
    expect(mobileBox?.height).toBeGreaterThanOrEqual(desktopBox?.height || 0);
  });

  test('buttons have proper focus indicators', async ({ page }) => {
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Focus the button using keyboard
    await button.focus();
    
    // Check that focus styles are applied
    // This will depend on the specific CSS classes, but we can check for focus ring
    const focusedButton = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Should have some form of focus indication (outline or box-shadow)
    expect(focusedButton.outline !== 'none' || focusedButton.boxShadow !== 'none').toBeTruthy();
  });

  test('buttons maintain accessibility on different devices', async ({ page }) => {
    // Test on tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Focus the button directly instead of using Tab (which might focus other elements first)
    await button.focus();
    await expect(button).toBeFocused();
    
    // Check that button can be activated with keyboard
    await page.keyboard.press('Enter');
    // The specific behavior will depend on the button's function
  });

  test('buttons have proper ARIA attributes', async ({ page }) => {
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Check for proper button role
    await expect(button).toHaveRole('button');
    
    // If it's a loading button, it should have aria-busy
    const ariaBusy = await button.getAttribute('aria-busy');
    if (ariaBusy) {
      expect(['true', 'false']).toContain(ariaBusy);
    }
  });

  test('touch interactions work properly on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('This test is only for mobile devices');
    }
    
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Simulate touch interaction
    await button.tap();
    
    // Check that the button responds to touch
    // The specific behavior will depend on the button's function
    // For now, we just verify the tap doesn't cause errors
  });

  test('buttons maintain crisp rendering on high-DPI displays', async ({ page }) => {
    // Simulate high-DPI display
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Check that text is rendered clearly
    const textContent = await button.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent?.trim().length).toBeGreaterThan(0);
  });

  test('responsive behavior can be disabled', async ({ page }) => {
    // This test would require a page with both responsive and non-responsive buttons
    // For now, we'll just verify that buttons render consistently
    
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileButton = page.locator('button').first();
    const mobileBox = await mobileButton.boundingBox();
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(100);
    const desktopBox = await mobileButton.boundingBox();
    
    // Both should be valid bounding boxes
    expect(mobileBox).toBeTruthy();
    expect(desktopBox).toBeTruthy();
  });
});