import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/old/**',
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Increase workers for better parallelization
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    // Add action timeout for better performance
    actionTimeout: 10000,
    // Add navigation timeout
    navigationTimeout: 30000,
  },
  webServer: {
    command: process.env.PW_PREVIEW_CMD || 'npm run preview:build',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Set environment variables for the web server
    env: {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3001/api',
      NODE_ENV: 'test',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    // Add mobile testing for better coverage
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});


