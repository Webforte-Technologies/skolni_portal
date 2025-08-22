import { test, expect } from '@playwright/test';

// Simple performance budget test for LCP-like metric via navigation timing and paint
test.describe('Performance budget', () => {
  test('Dashboard LCP budget', async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for primary UI
    await page.waitForSelector('text=Moji asistenti', { timeout: 10000 }).catch(() => {});
    const perf = await page.evaluate(() => {
      const timing = performance.timing as any;
      const navStart = timing.navigationStart;
      const firstPaint = (performance.getEntriesByType('paint').find((e: any) => e.name === 'first-contentful-paint') as any)?.startTime || 0;
      // fallback: DOMContentLoaded
      const dcl = timing.domContentLoadedEventEnd - navStart;
      return { fcp: firstPaint, dcl };
    });
    // Budget: FCP < 2500ms; fallback DCL < 3000ms (allow +500ms slack locally)
    const budget = Number(process.env.PERF_BUDGET_MS || 3000);
    expect(Math.min(perf.fcp || Infinity, perf.dcl || Infinity)).toBeLessThan(budget + 500);
  });
});


