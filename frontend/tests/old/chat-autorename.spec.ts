import { test, expect } from '@playwright/test';

test.describe('Chat auto-rename and long message visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1', email: 'teacher@example.com', first_name: 'Test', last_name: 'Učitel',
        credits_balance: 100, is_active: true, created_at: '', updated_at: '', role: 'teacher_school'
      }));
    });
  });

  test('auto-renames after first AI response and shows long reply fully', async ({ page }) => {
    // Prepare a long AI reply (> 900 chars)
    const longChunk = 'Derivace je základní nástroj diferenciálního počtu. '.repeat(30) + 'Konec.';

    await page.route('**/api/ai/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"start"}',
          '',
          `data: {"type":"chunk","content":${JSON.stringify(longChunk)}}`,
          '',
          'data: {"type":"end","credits_used":1,"credits_balance":99,"session_id":"s1"}',
          '',
        ].join('\n')
      });
    });

    await page.goto('/chat');
    const textbox = page.locator('textarea, [role="textbox"]');
    await textbox.waitFor({ state: 'visible' });
    await textbox.fill('Začínám s derivacemi, můžete mi vysvětlit základy?');
    await page.keyboard.press('Enter');

    // Wait for AI text to appear
    await expect(page.getByText('Derivace je základní nástroj', { exact: false })).toBeVisible();

    // Sidebar should show updated title derived from AI reply (contains "Derivace")
    const sidebar = page.locator('div.w-80');
    await expect(sidebar.getByText(/Derivace/i)).toBeVisible();

    // Long message should be fully visible (assert an ending fragment)
    await expect(page.getByText('Konec.', { exact: true })).toBeVisible();
  });
});


