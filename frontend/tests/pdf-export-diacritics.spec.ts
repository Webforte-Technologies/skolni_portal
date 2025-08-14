import { test, expect } from '@playwright/test';

test.describe('PDF export diacritics', () => {
  test('chat export triggers download with Czech diacritics text', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school'
      }));
    });

    await page.route('**/auth/profile', async (route) => {
      const user = {
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school'
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) });
    });

    await page.goto('/chat');
    const textbox = page.locator('textarea, [role="textbox"]');
    await page.waitForSelector('textarea, [role="textbox"]', { timeout: 10000 });
    await textbox.fill('Příliš žluťoučký kůň úpěl ďábelské ódy');
    await page.keyboard.press('Enter');

    // Wait a tick for render
    await page.waitForTimeout(300);

    const exportBtn = page.getByRole('button', { name: /Export/i });
    await expect(exportBtn).toBeEnabled();

    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();
    const download = await downloadPromise;
    const suggested = download.suggestedFilename();
    expect(suggested).toMatch(/konverzace|pdf/i);
  });
});


