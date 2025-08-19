import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and login
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('shows mobile navigation on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile menu button is visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check that desktop navigation is hidden
    const desktopNav = page.locator('[data-testid="notifications-bell"]');
    await expect(desktopNav).not.toBeVisible();
  });

  test('opens and closes mobile menu', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    
    // Open menu
    await mobileMenuButton.click();
    
    // Check that menu is open
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Close menu using close button
    const closeButton = page.getByTestId('mobile-menu-close');
    await closeButton.click();
    
    // Check that menu is closed
    await expect(drawer).not.toBeVisible();
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('displays navigation items in mobile menu', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByTestId('mobile-menu-button').click();
    
    // Check navigation items are present
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('nav-tools')).toBeVisible();
    await expect(page.getByTestId('nav-create-material')).toBeVisible();
    await expect(page.getByTestId('nav-my-materials')).toBeVisible();
    
    // Check action items are present
    await expect(page.getByTestId('nav-notifications')).toBeVisible();
    await expect(page.getByTestId('nav-shortcuts')).toBeVisible();
    await expect(page.getByTestId('nav-help')).toBeVisible();
    await expect(page.getByTestId('nav-settings')).toBeVisible();
    await expect(page.getByTestId('nav-logout')).toBeVisible();
  });

  test('navigates when clicking menu items', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByTestId('mobile-menu-button').click();
    
    // Click on tools navigation
    await page.getByTestId('nav-tools').click();
    
    // Check that we navigated to tools page and menu closed
    await page.waitForURL('/tools');
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).not.toBeVisible();
  });

  test('closes menu when clicking backdrop', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByTestId('mobile-menu-button').click();
    
    // Click on backdrop (outside the drawer)
    await page.locator('.bg-black.bg-opacity-50').click({ position: { x: 10, y: 10 } });
    
    // Check that menu is closed
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).not.toBeVisible();
  });

  test('closes menu when pressing Escape key', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByTestId('mobile-menu-button').click();
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Check that menu is closed
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).not.toBeVisible();
  });

  test('shows desktop navigation on larger screens', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check that mobile menu button is not visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).not.toBeVisible();
    
    // Check that desktop navigation is visible
    const desktopNav = page.locator('[data-testid="notifications-bell"]');
    await expect(desktopNav).toBeVisible();
  });

  test('has proper touch target sizes on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu button has proper touch target size
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    const buttonBox = await mobileMenuButton.boundingBox();
    
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    // Open menu and check navigation items
    await mobileMenuButton.click();
    
    const navItem = page.getByTestId('nav-dashboard');
    const navItemBox = await navItem.boundingBox();
    
    expect(navItemBox?.height).toBeGreaterThanOrEqual(44);
  });
});