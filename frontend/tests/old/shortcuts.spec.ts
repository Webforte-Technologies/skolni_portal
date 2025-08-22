import { test, expect } from '@playwright/test';

test.describe('Keyboard shortcuts smoke', () => {
  test('Ctrl/Cmd+K opens Command Palette and Esc closes it', async ({ page }) => {
    await page.route('**/auth/profile', async (route) => {
      const user = {
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        role: 'teacher_school', credits_balance: 100, is_active: true, created_at: '', updated_at: ''
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });

    await page.goto('/chat');
    await page.waitForSelector('textarea, [role="textbox"]', { timeout: 10000 });

    // Open palette
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+K' : 'Control+K');

    await expect(page.getByText('Command Palette', { exact: false })).toBeVisible();

    // Close palette
    await page.keyboard.press('Escape');
    await expect(page.getByText('Command Palette', { exact: false })).toBeHidden();
  });
});


