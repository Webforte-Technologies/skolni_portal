import { test, expect } from '@playwright/test';

test.describe('Authentication Core Functionality', () => {
  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Přihlásit")')).toBeVisible();
  });

  test('Registration page loads correctly', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Verify registration form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Registrovat")')).toBeVisible();
  });

  test('School registration page loads correctly', async ({ page }) => {
    await page.goto('/register-school');
    await page.waitForLoadState('networkidle');

    // Verify school registration form is visible
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Registrovat školu")')).toBeVisible();
  });

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify landing page content
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Look for navigation to login/register
    const loginLink = page.locator('a[href="/login"], button:has-text("Přihlásit")');
    const registerLink = page.locator('a[href="/register"], button:has-text("Registrovat")');
    
    // At least one should be visible
    await expect(loginLink.or(registerLink)).toBeVisible();
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify mobile-friendly layout
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Přihlásit")')).toBeVisible();
  });

  test('Responsive Design - Tablet View', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify tablet-friendly layout
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Přihlásit")')).toBeVisible();
  });
});
