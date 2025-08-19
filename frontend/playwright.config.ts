import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: process.env.PW_PREVIEW_CMD || 'npm run preview:build',
    port: 4173,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'mobile-chromium-360x640',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 640 } },
    },
    {
      name: 'tablet-chromium-768x1024',
      use: { ...devices['iPad (gen 7)'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-chromium-1280x800',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
});


