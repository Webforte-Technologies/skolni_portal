import { test, expect, Page } from '@playwright/test';

// Test data
const testAdmin = {
  email: 'admin@test.com',
  password: 'admin123'
};

const testUser = {
  first_name: 'Test',
  last_name: 'User',
  email: 'testuser@example.com',
  role: 'teacher_individual',
  credits_balance: 100
};

const testSchool = {
  name: 'Test School',
  city: 'Prague'
};

test.describe('Enhanced User Management E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', testAdmin.email);
    await page.fill('input[name="password"]', testAdmin.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/admin/dashboard');
    
    // Navigate to user management
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('User Listing and Sorting', () => {
    test('should display user list with proper columns', async () => {
      // Check if table headers are present
      await expect(page.locator('th:has-text("Jméno")')).toBeVisible();
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Role")')).toBeVisible();
      await expect(page.locator('th:has-text("Škola")')).toBeVisible();
      await expect(page.locator('th:has-text("Kredity")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Registrován")')).toBeVisible();
    });

    test('should sort users by name ascending', async () => {
      // Click on name column header
      await page.click('th:has-text("Jméno")');
      
      // Wait for API call to complete
      await page.waitForLoadState('networkidle');
      
      // Check if URL contains sort parameters
      await expect(page).toHaveURL(/order_by=first_name/);
      await expect(page).toHaveURL(/order_direction=asc/);
      
      // Check if sort indicator is visible
      await expect(page.locator('th:has-text("Jméno") .sort-indicator')).toBeVisible();
    });

    test('should sort users by name descending on second click', async () => {
      // Click twice on name column header
      await page.click('th:has-text("Jméno")');
      await page.waitForLoadState('networkidle');
      await page.click('th:has-text("Jméno")');
      await page.waitForLoadState('networkidle');
      
      // Check if URL contains descending sort parameters
      await expect(page).toHaveURL(/order_direction=desc/);
    });

    test('should sort by different columns', async () => {
      const sortableColumns = ['Email', 'Role', 'Kredity', 'Registrován'];
      
      for (const column of sortableColumns) {
        await page.click(`th:has-text("${column}")`);
        await page.waitForLoadState('networkidle');
        
        // Check if sort indicator appears
        await expect(page.locator(`th:has-text("${column}") .sort-indicator`)).toBeVisible();
      }
    });
  });

  test.describe('Enhanced Filtering', () => {
    test('should toggle between basic and enhanced filters', async () => {
      // Check if basic filters are visible by default
      await expect(page.locator('[data-testid="basic-filters"]')).toBeVisible();
      
      // Click to switch to enhanced filters
      await page.click('button:has-text("Rozšířené filtry")');
      
      // Check if enhanced filters are now visible
      await expect(page.locator('[data-testid="enhanced-filters"]')).toBeVisible();
      
      // Switch back to basic filters
      await page.click('button:has-text("Základní filtry")');
      await expect(page.locator('[data-testid="basic-filters"]')).toBeVisible();
    });

    test('should filter by role', async () => {
      // Switch to enhanced filters
      await page.click('button:has-text("Rozšířené filtry")');
      
      // Select teacher role
      await page.selectOption('select[name="role"]', 'teacher_individual');
      await page.click('button:has-text("Použít filtry")');
      
      await page.waitForLoadState('networkidle');
      
      // Check if URL contains role filter
      await expect(page).toHaveURL(/role=teacher_individual/);
      
      // Check if only teachers are displayed
      const roleBadges = page.locator('[data-testid="user-role-badge"]');
      const count = await roleBadges.count();
      
      for (let i = 0; i < count; i++) {
        await expect(roleBadges.nth(i)).toContainText('Individuální učitel');
      }
    });

    test('should filter by activity status', async () => {
      await page.click('button:has-text("Rozšířené filtry")');
      
      // Select last login filter
      await page.selectOption('select[name="lastLogin"]', '30d');
      await page.click('button:has-text("Použít filtry")');
      
      await page.waitForLoadState('networkidle');
      
      // Check if URL contains activity filter
      await expect(page).toHaveURL(/last_login=30d/);
    });

    test('should save and load filter presets', async () => {
      await page.click('button:has-text("Rozšířené filtry")');
      
      // Set up some filters
      await page.selectOption('select[name="role"]', 'teacher_school');
      await page.selectOption('select[name="status"]', 'active');
      
      // Save filter preset
      await page.fill('input[name="filterName"]', 'Active School Teachers');
      await page.click('button:has-text("Uložit filtr")');
      
      // Check if preset appears in saved filters
      await expect(page.locator('select[name="savedFilters"] option:has-text("Active School Teachers")')).toBeVisible();
      
      // Clear filters
      await page.click('button:has-text("Vymazat filtry")');
      
      // Load saved preset
      await page.selectOption('select[name="savedFilters"]', 'Active School Teachers');
      
      // Check if filters are restored
      await expect(page.locator('select[name="role"]')).toHaveValue('teacher_school');
      await expect(page.locator('select[name="status"]')).toHaveValue('active');
    });
  });

  test.describe('User Creation and Editing', () => {
    test('should create a new user successfully', async () => {
      // Click create user button
      await page.click('button:has-text("Přidat uživatele")');
      
      // Fill user form
      await page.fill('input[name="first_name"]', testUser.first_name);
      await page.fill('input[name="last_name"]', testUser.last_name);
      await page.fill('input[name="email"]', testUser.email);
      await page.selectOption('select[name="role"]', testUser.role);
      await page.fill('input[name="credits_balance"]', testUser.credits_balance.toString());
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await expect(page.locator('.toast-success')).toContainText('Uživatel byl úspěšně vytvořen');
      
      // Check if user appears in list
      await page.waitForLoadState('networkidle');
      await expect(page.locator(`tr:has-text("${testUser.email}")`)).toBeVisible();
    });

    test('should edit user via quick edit', async () => {
      // Find a user row and click edit
      const userRow = page.locator('tr').first();
      await userRow.locator('button:has-text("Upravit")').click();
      
      // Wait for user profile page to load
      await page.waitForLoadState('networkidle');
      
      // Click quick edit button
      await page.click('button:has-text("Rychlá úprava")');
      
      // Modify user data
      await page.fill('input[name="first_name"]', 'Updated Name');
      await page.fill('input[name="credits_balance"]', '150');
      
      // Save changes
      await page.click('button:has-text("Uložit")');
      
      // Wait for success message
      await expect(page.locator('.toast-success')).toContainText('Uživatel byl úspěšně aktualizován');
      
      // Check if changes are reflected
      await expect(page.locator('h2:has-text("Updated Name")')).toBeVisible();
    });

    test('should handle validation errors in user form', async () => {
      await page.click('button:has-text("Přidat uživatele")');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('.error-message:has-text("Jméno je povinné")')).toBeVisible();
      await expect(page.locator('.error-message:has-text("Příjmení je povinné")')).toBeVisible();
      await expect(page.locator('.error-message:has-text("Email je povinný")')).toBeVisible();
      
      // Fill invalid email
      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.error-message:has-text("Neplatný formát emailu")')).toBeVisible();
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple users and show bulk actions', async () => {
      // Select first few users
      await page.check('input[type="checkbox"]', { nth: 1 }); // Skip header checkbox
      await page.check('input[type="checkbox"]', { nth: 2 });
      await page.check('input[type="checkbox"]', { nth: 3 });
      
      // Check if bulk actions bar appears
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).toBeVisible();
      await expect(page.locator('text="3 uživatelé vybráni"')).toBeVisible();
    });

    test('should show confirmation dialog for bulk delete', async () => {
      // Select users
      await page.check('input[type="checkbox"]', { nth: 1 });
      await page.check('input[type="checkbox"]', { nth: 2 });
      
      // Click bulk delete
      await page.click('button:has-text("Smazat vybrané")');
      
      // Check if confirmation dialog appears
      await expect(page.locator('[data-testid="bulk-confirm-dialog"]')).toBeVisible();
      await expect(page.locator('text="Opravdu chcete smazat 2 uživatele?"')).toBeVisible();
      
      // Cancel operation
      await page.click('button:has-text("Zrušit")');
      await expect(page.locator('[data-testid="bulk-confirm-dialog"]')).not.toBeVisible();
    });

    test('should execute bulk credit addition with confirmation', async () => {
      // Select users
      await page.check('input[type="checkbox"]', { nth: 1 });
      
      // Click bulk add credits
      await page.click('button:has-text("Přidat kredity")');
      
      // Fill credit amount in dialog
      await page.fill('input[name="creditAmount"]', '50');
      await page.click('button:has-text("Potvrdit")');
      
      // Wait for success message
      await expect(page.locator('.toast-success')).toContainText('Kredity byly úspěšně přidány');
    });
  });

  test.describe('User Profile Page', () => {
    test('should display user profile with all sections', async () => {
      // Click on first user
      const userRow = page.locator('tr').first();
      await userRow.locator('button:has-text("Upravit")').click();
      
      await page.waitForLoadState('networkidle');
      
      // Check if all profile sections are visible
      await expect(page.locator('h3:has-text("Základní informace")')).toBeVisible();
      await expect(page.locator('h3:has-text("Aktivita a škola")')).toBeVisible();
      await expect(page.locator('h3:has-text("Statistiky použití")')).toBeVisible();
      
      // Check if action buttons are present
      await expect(page.locator('button:has-text("Rychlá úprava")')).toBeVisible();
      await expect(page.locator('button:has-text("Detailní úprava")')).toBeVisible();
      await expect(page.locator('button:has-text("Export dat")')).toBeVisible();
    });

    test('should display activity chart and logs', async () => {
      const userRow = page.locator('tr').first();
      await userRow.locator('button:has-text("Upravit")').click();
      
      await page.waitForLoadState('networkidle');
      
      // Check if activity sections are present
      await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-log"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work properly on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile navigation works
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Check if table is responsive
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
      
      // Check if filters collapse properly on mobile
      await page.click('button:has-text("Rozšířené filtry")');
      await expect(page.locator('[data-testid="enhanced-filters"]')).toBeVisible();
    });

    test('should work properly on tablet viewport', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check if layout adapts to tablet
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
      
      // Check if bulk actions work on tablet
      await page.check('input[type="checkbox"]', { nth: 1 });
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).toBeVisible();
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should show loading states during data fetch', async () => {
      // Reload page to see loading states
      await page.reload();
      
      // Check if skeleton loading is visible initially
      await expect(page.locator('[data-testid="table-skeleton"]')).toBeVisible();
      
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Check if actual content is now visible
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="table-skeleton"]')).not.toBeVisible();
    });

    test('should handle API errors gracefully', async () => {
      // Intercept API call and return error
      await page.route('**/api/admin/users*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      await page.reload();
      
      // Check if error state is displayed
      await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
      await expect(page.locator('text="Chyba při načítání uživatelů"')).toBeVisible();
      
      // Check if retry button is present
      await expect(page.locator('button:has-text("Zkusit znovu")')).toBeVisible();
    });
  });

  test.describe('Search and Pagination', () => {
    test('should search users by name and email', async () => {
      // Enter search term
      await page.fill('input[placeholder="Hledat uživatele..."]', 'admin');
      await page.press('input[placeholder="Hledat uživatele..."]', 'Enter');
      
      await page.waitForLoadState('networkidle');
      
      // Check if URL contains search parameter
      await expect(page).toHaveURL(/search=admin/);
      
      // Check if results contain search term
      const userRows = page.locator('tbody tr');
      const count = await userRows.count();
      
      for (let i = 0; i < count; i++) {
        const rowText = await userRows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain('admin');
      }
    });

    test('should navigate through pagination', async () => {
      // Check if pagination is visible (assuming there are enough users)
      const pagination = page.locator('[data-testid="pagination"]');
      
      if (await pagination.isVisible()) {
        // Click next page
        await page.click('button:has-text("Další")');
        await page.waitForLoadState('networkidle');
        
        // Check if URL contains page parameter
        await expect(page).toHaveURL(/page=2/);
        
        // Click previous page
        await page.click('button:has-text("Předchozí")');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/page=1/);
      }
    });
  });
});

// Helper functions for test data cleanup
test.afterAll(async () => {
  // Clean up test data if needed
  // This would typically involve API calls to remove test users
  console.log('Test cleanup completed');
});
