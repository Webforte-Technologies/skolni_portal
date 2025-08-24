import { test, expect } from '@playwright/test';

test.describe('Dashboard Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

    // Seed auth in localStorage
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
        school: { id: 's1', name: 'ZŠ Test' }
      }));
    });
  });

  test('Dashboard loads and shows user information', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard loads
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Přehled|Vítejte/);
    
    // Verify user info is displayed
    await expect(page.locator('text=Test Učitel')).toBeVisible();
    
    // Verify credit balance is shown
    await expect(page.locator('text=100')).toBeVisible();
  });

  test('Navigation to AI Generator', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for AI generator link/button
    const generatorLink = page.locator('a[href="/ai-generator"], button:has-text("AI Generator"), a:has-text("Generátor")');
    
    if (await generatorLink.isVisible()) {
      await generatorLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on generator page
      await expect(page.locator('h1, h2')).toContainText(/AI Generator|Generátor|Co chcete vyučovat/);
    }
  });

  test('Navigation to Materials', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for materials link/button
    const materialsLink = page.locator('a[href="/materials"], button:has-text("Materials"), a:has-text("Materiály")');
    
    if (await materialsLink.isVisible()) {
      await materialsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on materials page
      await expect(page.locator('h1, h2')).toContainText(/Materials|Materiály/);
    }
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify mobile-friendly layout
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Přehled|Vítejte/);
    
    // Check that content is readable on mobile
    await expect(page.locator('text=Test Učitel')).toBeVisible();
  });

  test('Responsive Design - Tablet View', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify tablet-friendly layout
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Přehled|Vítejte/);
    
    // Check that content is readable on tablet
    await expect(page.locator('text=Test Učitel')).toBeVisible();
  });
});
