import { test, expect } from '@playwright/test';

test.describe('Authentication Core Functionality', () => {
  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    // Wait for the page to be ready, but don't wait for network idle
    await page.waitForLoadState('domcontentloaded');

    // Verify login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Přihlásit")')).toBeVisible();
  });

  test('Registration page loads correctly', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    // Verify registration form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Vytvořit účet")')).toBeVisible();
  });

  test('School registration page loads correctly', async ({ page }) => {
    await page.goto('/register-school');
    await page.waitForLoadState('domcontentloaded');

    // Verify school registration form is visible
    await expect(page.locator('input[name="school_name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Založit školu")')).toBeVisible();
  });

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify landing page content
    await expect(page.locator('h1:has-text("Revoluce")')).toBeVisible();

    // Look for navigation to login/register - be more flexible
    const loginLink = page.locator('a[href="/login"], button:has-text("Přihlásit")');
    const registerLink = page.locator('a[href="/register"], a[href="/register-school"], button:has-text("Registrovat"), button:has-text("Začít zdarma")');
    
    // Check if at least one navigation element is visible
    const hasLoginLink = await loginLink.count() > 0;
    const hasRegisterLink = await registerLink.count() > 0;
    
    expect(hasLoginLink || hasRegisterLink).toBe(true);
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Verify mobile-friendly layout
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Přihlásit")')).toBeVisible();
  });

  test('Responsive Design - Tablet View', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Verify tablet-friendly layout
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Přihlásit")')).toBeVisible();
  });
});
