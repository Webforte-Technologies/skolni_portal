import { test, expect } from '@playwright/test';

test.describe('Auth → Chat → Export flow', () => {
  test('login mock → chat page loads → export button disabled/enabled', async ({ page }) => {
    // Seed auth in localStorage (mock login)
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });

    await page.goto('/chat');
    await page.waitForSelector('textarea, [role="textbox"]', { timeout: 10000 });

    // Export initially disabled (no messages)
    const exportBtn = page.getByRole('button', { name: /Export/i });
    await expect(exportBtn).toBeDisabled();

    // Type and send a message
    const textbox = await page.locator('textarea, [role="textbox"]').first();
    await textbox.fill('Ahoj, vypočítej 2+2');
    await page.keyboard.press('Enter');

    // Wait briefly for render (no backend hookup in preview)
    await page.waitForTimeout(300);

    // Export button should now be enabled
    await expect(exportBtn).toBeEnabled();
  });
});


