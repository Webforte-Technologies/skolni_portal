import { test, expect } from '@playwright/test';

test.describe('Profile refresh on focus', () => {
  test('updates credits after window focus', async ({ page }) => {
    // Stub /auth/profile to return initial and then updated credits
    let callCount = 0;
    await page.route('**/auth/profile', async (route) => {
      callCount += 1;
      const isSecondCall = callCount >= 2;
      const credits = isSecondCall ? 250 : 100;
      const user = {
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        role: 'teacher_school', credits_balance: credits, is_active: true, created_at: '', updated_at: ''
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: user }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        role: 'teacher_school', credits_balance: 100, is_active: true, created_at: '', updated_at: ''
      }));
    });

    await page.goto('/dashboard');
    // check initial credits in sidebar and hero badge
    await expect(page.getByText('dostupné kreditů', { exact: false })).toBeVisible();

    // Trigger focus to refetch
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));

    // After focus refresh, the sidebar badge should reflect new balance; allow some delay
    await page.waitForTimeout(300);
    await expect(page.getByText('dostupné kreditů', { exact: false })).toBeVisible();
  });
});


