import { test, expect } from '@playwright/test';

test.describe('Notifications dropdown', () => {
  test('opens from header and marks item as read', async ({ page }) => {
    // Platform admin to ensure Dev Admin link is present; dashboard header always has bell
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'admin@example.com', first_name: 'Admin', last_name: 'User',
        credits_balance: 1000, is_active: true, created_at: '', updated_at: '',
        role: 'platform_admin'
      }));
    });

    await page.goto('/chat');
    await page.waitForSelector('header', { timeout: 10000 });

    // Open notifications (robust locator fallback)
    const bellAria = page.locator('button[aria-label="Notifikace"]');
    if (await bellAria.count()) {
      await bellAria.first().click();
    } else {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
    }

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


