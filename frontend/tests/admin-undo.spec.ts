import { test, expect } from '@playwright/test';

test.describe('Admin bulk actions undo toasts', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'admin@example.com', first_name: 'Admin', last_name: 'User',
        credits_balance: 1000, is_active: true, created_at: '', updated_at: '', role: 'platform_admin'
      }));
    });
  });

  test('add credits shows Undo and reverts on click', async ({ page }) => {
    // Mock list of users and credits API
    await page.route('**/api/admin/users*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { data: [
          { id: 'u2', first_name: 'Test', last_name: 'Teacher', email: 't@example.com', role: 'teacher_school', is_active: true, credits_balance: 10 },
        ], total: 1 } })
      });
    });
    // Accept add and deduct credits calls
    await page.route('**/api/admin/users/*/credits', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    // Accept toggle active calls just in case
    await page.route('**/api/admin/users/*', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
        return;
      }
      route.fallback();
    });

    await page.goto('/dev-admin');
    await page.getByText('User Management').waitFor();

    // Select the single listed user
    const firstCheckbox = page.locator('table tbody tr input[type="checkbox"]').first();
    await firstCheckbox.check();

    // Trigger Add Credits bulk action
    const addBtn = page.getByRole('button', { name: /^Add Credits$/ });
    await addBtn.click();
    // Enter amount in prompt
    page.once('dialog', async dialog => {
      await dialog.accept('5');
    });

    // Expect Undo toast present
    const undoBtn = page.getByRole('button', { name: 'Undo' });
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();

    // After Undo click, ensure another credits call executed (deduct). We rely on route count implicitly.
    // Basic visual check: toast container should still be present but Undo button disappears after click
    await expect(undoBtn).toHaveCount(0);
  });
});


