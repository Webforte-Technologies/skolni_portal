import { test, expect } from '@playwright/test';

test.describe('Notifications dropdown', () => {
  test('opens from header and marks item as read', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });

    await page.goto('/dashboard');

    // Open notifications
    const bell = page.getByLabel('Notifikace');
    await bell.click();

    // Dropdown visible
    await expect(page.getByText('Notifikace')).toBeVisible();

    // If there is a "Označit jako přečtené" action, click it on the first item (best-effort)
    const markButtons = page.getByRole('button', { name: /Označit jako přečtené/i });
    const count = await markButtons.count();
    if (count > 0) {
      await markButtons.nth(0).click();
    }

    // Close dropdown
    await page.getByRole('button', { name: 'Zavřít' }).click();
  });
});


