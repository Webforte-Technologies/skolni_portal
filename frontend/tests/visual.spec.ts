import { test, expect } from '@playwright/test';

test.describe('Visual snapshots', () => {
  test('Dashboard light', async ({ page }) => {
    await page.route('**/auth/profile', async (route) => {
      const user = { id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User', credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });
    await page.goto('/dashboard');
    await page.waitForSelector('text=Moji asistenti', { timeout: 10000 }).catch(() => {});
    await expect(page).toHaveScreenshot('dashboard-light.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
  });

  test('Dashboard dark', async ({ page }) => {
    await page.route('**/auth/profile', async (route) => {
      const user = { id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User', credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });
    await page.goto('/dashboard');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('dashboard-dark.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('Chat light', async ({ page }) => {
    await page.route('**/auth/profile', async (route) => {
      const user = { id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User', credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });
    await page.goto('/chat');
    await page.waitForSelector('textarea, [role="textbox"]', { timeout: 10000 }).catch(() => {});
    await expect(page).toHaveScreenshot('chat-light.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('Chat dark', async ({ page }) => {
    await page.route('**/auth/profile', async (route) => {
      const user = { id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User', credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'test@example.com', first_name: 'Test', last_name: 'User',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', school: { id: 's1', name: 'ZŠ Test' }
      }));
    });
    await page.goto('/chat');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('chat-dark.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });
});


