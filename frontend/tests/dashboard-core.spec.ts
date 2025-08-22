import { test, expect } from '@playwright/test';

test.describe('Dashboard Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'test-token-123');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 100,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        role: 'teacher_school',
        school: null
      }));
    });

    // Mock ALL network requests to prevent any real API calls
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Handle API requests
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/ai/')) {
        console.log(`Mocking API request: ${method} ${url}`);
        
        if (url.includes('/auth/profile')) {
          const user = {
            id: 'u1',
            email: 'teacher@example.com',
            first_name: 'Test',
            last_name: 'Učitel',
            credits_balance: 100,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            role: 'teacher_school',
            school: null
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: user,
              error: null
            })
          });
        } else if (url.includes('/ai/features')) {
          const features = [
            {
              id: 'math',
              name: 'Matematika',
              description: 'AI asistent pro matematiku',
              icon: 'calculator',
              color: 'blue'
            },
            {
              id: 'czech',
              name: 'Český jazyk',
              description: 'AI asistent pro český jazyk',
              icon: 'book',
              color: 'green'
            }
          ];
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: features,
              error: null
            })
          });
        } else if (url.includes('/dashboard/stats')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                total_materials: 25,
                total_conversations: 150,
                credits_used: 75,
                credits_remaining: 25
              },
              error: null
            })
          });
        } else if (url.includes('/materials/recent')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [],
              error: null
            })
          });
        } else if (url.includes('/conversations/recent')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [],
              error: null
            })
          });
        } else {
          // Default mock for any other API calls
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: {},
              error: null
            })
          });
        }
      } else {
        // Allow all other requests (CSS, JS, images, etc.) to continue
        await route.continue();
      }
    });
  });

  test('Dashboard loads and shows user information', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Wait for React to load and render
    await page.waitForTimeout(5000);

    // Check if there's an error message first
    const errorMessage = page.locator('text=Something went wrong');
    if (await errorMessage.isVisible()) {
      console.log('Dashboard is showing error message, checking if it resolves...');
      // Wait a bit more to see if it resolves
      await page.waitForTimeout(3000);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'dashboard-test-screenshot.png', fullPage: true });

    // Get page content for debugging
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);

    // Get all text content on the page for debugging
    const pageText = await page.locator('body').innerText();
    console.log('Page text preview:', pageText.substring(0, 500));

    // Verify dashboard loads - look for the welcome message
    await expect(page.locator('text=Vítejte zpět!')).toBeVisible({ timeout: 15000 });

    // Verify user info is displayed - use first() to avoid strict mode violations
    await expect(page.locator('text=Test Učitel').first()).toBeVisible({ timeout: 15000 });
  });

  test('Dashboard shows credit balance', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Look for credit information - the actual text on the page
    await expect(page.locator('text=100').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=DOSTUPNÉ KREDITY').first()).toBeVisible({ timeout: 15000 });
  });

  test('Dashboard navigation works', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Look for navigation elements - the actual buttons on the page
    await expect(page.locator('text=Chat s AI')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Vytvořit materiál').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Materiály').first()).toBeVisible({ timeout: 15000 });
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Verify mobile-friendly layout
    await expect(page.locator('text=Vítejte zpět!')).toBeVisible({ timeout: 15000 });

    // Check that content is readable on mobile
    await expect(page.locator('text=Test Učitel').first()).toBeVisible({ timeout: 15000 });
  });

  test('Responsive Design - Tablet View', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Verify tablet-friendly layout
    await expect(page.locator('text=Vítejte zpět!')).toBeVisible({ timeout: 15000 });

    // Check that content is readable on tablet
    await expect(page.locator('text=Test Učitel').first()).toBeVisible({ timeout: 15000 });
  });
});
