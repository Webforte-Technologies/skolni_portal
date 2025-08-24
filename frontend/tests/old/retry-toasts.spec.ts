import { test, expect } from '@playwright/test';

test.describe('Retry toasts for export and send failures', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school'
      }));
    });
    await page.goto('/chat');
  });

  test('send failure shows Retry toast and succeeds on retry', async ({ page }) => {
    // First call returns 500, second call returns a short stream
    let attempt = 0;
    await page.route('**/api/ai/chat', async route => {
      attempt += 1;
      if (attempt === 1) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Boom' }) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: [
            'data: {"type":"start"}',
            '',
            'data: {"type":"chunk","content":"OK"}',
            '',
            'data: {"type":"end","credits_used":1,"credits_balance":99,"session_id":"s1"}',
            ''
          ].join('\n')
        });
      }
    });

    const textbox = page.locator('textarea, [role="textbox"]');
    await textbox.fill('Testovací zpráva');
    await page.keyboard.press('Enter');

    // Expect toast with action "Zkusit znovu"
    const retryBtn = page.getByRole('button', { name: 'Zkusit znovu' });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();

    // After retry, "OK" chunk should appear
    await expect(page.getByText('OK')).toBeVisible();
  });
});


