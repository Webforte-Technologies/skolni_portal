import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication API responses
    await page.route('**/auth/profile', async (route) => {
      const user = {
        id: 'u1', 
        email: 'teacher@example.com', 
        first_name: 'Test', 
        last_name: 'Učitel',
        credits_balance: 100, 
        is_active: true, 
        created_at: '', 
        updated_at: '', 
        role: 'teacher_school'
      };
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ success: true, data: user }) 
      });
    });

    // Mock other necessary API endpoints
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ success: true, data: { token: 'e2e-token' } }) 
      });
    });

    // Seed auth in localStorage (mock login)
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', 
        email: 'teacher@example.com', 
        first_name: 'Test', 
        last_name: 'Učitel',
        credits_balance: 100, 
        is_active: true, 
        created_at: '', 
        updated_at: '', 
        role: 'teacher_school'
      }));
    });

    // Navigate directly to dashboard (bypassing login)
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="mobile-menu-button"], [data-testid="notifications-bell"]', { timeout: 10000 });
  });

  test('shows mobile navigation on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile menu button is visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check that desktop navigation elements are hidden on mobile
    // The notifications bell should not be visible on mobile viewports
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
    
    // Check that desktop navigation elements are visible
    // Look for any desktop navigation element that should be visible
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