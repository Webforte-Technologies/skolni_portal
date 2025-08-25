import { test, expect, Page } from '@playwright/test';

// Performance validation tests for Enhanced User CRUD system
test.describe('Performance Validation Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Page Load Performance', () => {
    test('should load user management page within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check if skeleton loading was shown
      const hadSkeleton = await page.locator('[data-testid="table-skeleton"]').count() > 0;
      expect(hadSkeleton).toBeTruthy();
    });

    test('should show loading states during data fetch', async () => {
      await page.goto('/admin/users');
      
      // Check if loading skeleton appears immediately
      const skeleton = page.locator('[data-testid="table-skeleton"]');
      await expect(skeleton).toBeVisible();
      
      // Wait for actual content to load
      await page.waitForLoadState('networkidle');
      
      // Check if skeleton is replaced with actual content
      await expect(skeleton).not.toBeVisible();
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
    });
  });

  test.describe('Search Performance', () => {
    test('should debounce search input to reduce API calls', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      // Monitor network requests
      const requests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/admin/users')) {
          requests.push(request.url());
        }
      });
      
      const searchInput = page.locator('input[placeholder="Hledat uživatele..."]');
      
      // Type quickly (should be debounced)
      await searchInput.type('john', { delay: 50 });
      
      // Wait for debounce delay
      await page.waitForTimeout(1000);
      
      // Should have made fewer requests than characters typed
      expect(requests.length).toBeLessThan(4);
    });

    test('should cache search results for repeated queries', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder="Hledat uživatele..."]');
      
      // First search
      const startTime1 = Date.now();
      await searchInput.fill('admin');
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      const firstSearchTime = Date.now() - startTime1;
      
      // Clear and search again (should be cached)
      await searchInput.fill('');
      await page.waitForTimeout(500);
      
      const startTime2 = Date.now();
      await searchInput.fill('admin');
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      const secondSearchTime = Date.now() - startTime2;
      
      // Second search should be faster (cached)
      expect(secondSearchTime).toBeLessThan(firstSearchTime * 0.8);
    });
  });

  test.describe('Filtering Performance', () => {
    test('should apply filters efficiently', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      // Switch to enhanced filters
      await page.click('button:has-text("Rozšířené filtry")');
      
      const startTime = Date.now();
      
      // Apply multiple filters
      await page.selectOption('select[name="role"]', 'teacher_individual');
      await page.selectOption('select[name="status"]', 'active');
      await page.selectOption('select[name="lastLogin"]', '30d');
      
      await page.click('button:has-text("Použít filtry")');
      await page.waitForLoadState('networkidle');
      
      const filterTime = Date.now() - startTime;
      
      // Should apply filters within 2 seconds
      expect(filterTime).toBeLessThan(2000);
    });

    test('should persist filter state in URL', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      await page.click('button:has-text("Rozšířené filtry")');
      await page.selectOption('select[name="role"]', 'teacher_school');
      await page.click('button:has-text("Použít filtry")');
      await page.waitForLoadState('networkidle');
      
      // Check if URL contains filter parameters
      const url = page.url();
      expect(url).toContain('role=teacher_school');
      
      // Reload page and check if filters are restored
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Filters should be restored from URL
      const roleSelect = page.locator('select[name="role"]');
      await expect(roleSelect).toHaveValue('teacher_school');
    });
  });

  test.describe('Sorting Performance', () => {
    test('should sort large datasets efficiently', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      const startTime = Date.now();
      
      // Click on name column to sort
      await page.click('th:has-text("Jméno")');
      await page.waitForLoadState('networkidle');
      
      const sortTime = Date.now() - startTime;
      
      // Should sort within 1.5 seconds
      expect(sortTime).toBeLessThan(1500);
      
      // Check if sort indicator is visible
      await expect(page.locator('th:has-text("Jméno") .sort-indicator')).toBeVisible();
    });

    test('should maintain sort state during pagination', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      // Sort by name
      await page.click('th:has-text("Jméno")');
      await page.waitForLoadState('networkidle');
      
      // Go to next page if available
      const nextButton = page.locator('button:has-text("Další")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        
        // Sort indicator should still be visible
        await expect(page.locator('th:has-text("Jméno") .sort-indicator')).toBeVisible();
      }
    });
  });

  test.describe('Bulk Operations Performance', () => {
    test('should handle bulk operations efficiently', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      // Select multiple users
      await page.check('input[type="checkbox"]', { nth: 1 });
      await page.check('input[type="checkbox"]', { nth: 2 });
      await page.check('input[type="checkbox"]', { nth: 3 });
      
      const startTime = Date.now();
      
      // Perform bulk credit addition
      await page.click('button:has-text("Přidat kredity")');
      await page.fill('input[name="creditAmount"]', '10');
      await page.click('button:has-text("Potvrdit")');
      
      // Wait for success message
      await expect(page.locator('.toast-success')).toBeVisible();
      
      const bulkTime = Date.now() - startTime;
      
      // Should complete within 3 seconds
      expect(bulkTime).toBeLessThan(3000);
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks during navigation', async () => {
      // Navigate between pages multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');
        
        await page.goto('/admin/dashboard');
        await page.waitForLoadState('networkidle');
      }
      
      // Check if page is still responsive
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder="Hledat uživatele..."]');
      await searchInput.fill('test');
      
      // Should still be responsive
      await expect(searchInput).toHaveValue('test');
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 4 seconds on mobile (allowing for slower processing)
      expect(loadTime).toBeLessThan(4000);
      
      // Check if mobile-optimized elements are visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    });

    test('should handle touch interactions efficiently', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      // Test touch-based interactions
      const startTime = Date.now();
      
      // Tap on enhanced filters
      await page.tap('button:has-text("Rozšířené filtry")');
      
      const interactionTime = Date.now() - startTime;
      
      // Should respond to touch within 500ms
      expect(interactionTime).toBeLessThan(500);
      
      // Check if filters panel opened
      await expect(page.locator('[data-testid="enhanced-filters"]')).toBeVisible();
    });
  });

  test.describe('Error Handling Performance', () => {
    test('should handle API errors gracefully without blocking UI', async () => {
      // Intercept API calls and simulate errors
      await page.route('**/api/admin/users*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      const startTime = Date.now();
      
      await page.goto('/admin/users');
      
      // Should show error state quickly
      await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
      
      const errorTime = Date.now() - startTime;
      
      // Should show error within 2 seconds
      expect(errorTime).toBeLessThan(2000);
      
      // UI should remain responsive
      const retryButton = page.locator('button:has-text("Zkusit znovu")');
      await expect(retryButton).toBeVisible();
      await expect(retryButton).toBeEnabled();
    });
  });

  test.describe('Accessibility Performance', () => {
    test('should maintain accessibility features without performance impact', async () => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      const startTime = Date.now();
      
      // Navigate using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      const keyboardTime = Date.now() - startTime;
      
      // Keyboard navigation should be responsive
      expect(keyboardTime).toBeLessThan(1000);
      
      // Check if focus indicators are visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Bundle Size and Loading', () => {
    test('should load JavaScript bundles efficiently', async () => {
      // Monitor resource loading
      const resources: Array<{ url: string; size: number; duration: number }> = [];
      
      page.on('response', async response => {
        if (response.url().includes('.js') || response.url().includes('.css')) {
          const headers = response.headers();
          const size = parseInt(headers['content-length'] || '0');
          
          resources.push({
            url: response.url(),
            size,
            duration: response.timing().responseEnd
          });
        }
      });
      
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      
      // Check if main bundle is reasonably sized (< 1MB)
      const mainBundle = resources.find(r => r.url.includes('main') || r.url.includes('index'));
      if (mainBundle) {
        expect(mainBundle.size).toBeLessThan(1024 * 1024); // 1MB
      }
      
      // Check if resources loaded quickly
      const slowResources = resources.filter(r => r.duration > 2000);
      expect(slowResources.length).toBe(0);
    });
  });
});

// Performance metrics collection
test.describe('Performance Metrics Collection', () => {
  test('should collect and report performance metrics', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    console.log('Performance Metrics:', metrics);
    
    // Assert performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5 seconds
    expect(metrics.totalLoadTime).toBeLessThan(5000); // 5 seconds
  });
});
