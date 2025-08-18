/**
 * Playwright configuration for responsive visual regression testing
 */

import { defineConfig, devices } from '@playwright/test';

// Import viewport sizes - will be available after utils are created
const VIEWPORT_SIZES = {
  MOBILE_SMALL: { width: 320, height: 568 },
  MOBILE_MEDIUM: { width: 375, height: 667 },
  MOBILE_LARGE: { width: 390, height: 844 },
  TABLET_PORTRAIT: { width: 768, height: 1024 },
  TABLET_PRO: { width: 1024, height: 1366 },
  DESKTOP_MEDIUM: { width: 1440, height: 900 },
  DESKTOP_LARGE: { width: 1920, height: 1080 },
  DESKTOP_XL: { width: 2560, height: 1440 },
};

export default defineConfig({
  testDir: './src/utils/testing/examples',
  testMatch: '**/*.visual.spec.ts',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/responsive-results.json' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
    
    /* Disable animations for consistent screenshots */
    reducedMotion: 'reduce',
  },

  /* Configure projects for major browsers and devices */
  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { 
          width: VIEWPORT_SIZES.DESKTOP_MEDIUM.width, 
          height: VIEWPORT_SIZES.DESKTOP_MEDIUM.height 
        }
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { 
          width: VIEWPORT_SIZES.DESKTOP_MEDIUM.width, 
          height: VIEWPORT_SIZES.DESKTOP_MEDIUM.height 
        }
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { 
          width: VIEWPORT_SIZES.DESKTOP_MEDIUM.width, 
          height: VIEWPORT_SIZES.DESKTOP_MEDIUM.height 
        }
      },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { 
          width: VIEWPORT_SIZES.MOBILE_MEDIUM.width, 
          height: VIEWPORT_SIZES.MOBILE_MEDIUM.height 
        }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { 
          width: VIEWPORT_SIZES.MOBILE_LARGE.width, 
          height: VIEWPORT_SIZES.MOBILE_LARGE.height 
        }
      },
    },

    // Tablets
    {
      name: 'Tablet Chrome',
      use: { 
        ...devices['Galaxy Tab S4'],
        viewport: { 
          width: VIEWPORT_SIZES.TABLET_PORTRAIT.width, 
          height: VIEWPORT_SIZES.TABLET_PORTRAIT.height 
        }
      },
    },
    {
      name: 'iPad',
      use: { 
        ...devices['iPad Pro'],
        viewport: { 
          width: VIEWPORT_SIZES.TABLET_PRO.width, 
          height: VIEWPORT_SIZES.TABLET_PRO.height 
        }
      },
    },

    // Custom responsive breakpoint testing
    {
      name: 'Small Mobile (320px)',
      use: {
        viewport: { 
          width: VIEWPORT_SIZES.MOBILE_SMALL.width, 
          height: VIEWPORT_SIZES.MOBILE_SMALL.height 
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      },
    },
    {
      name: 'Large Desktop (1920px)',
      use: {
        viewport: { 
          width: VIEWPORT_SIZES.DESKTOP_LARGE.width, 
          height: VIEWPORT_SIZES.DESKTOP_LARGE.height 
        }
      },
    },
    {
      name: 'XL Desktop (2560px)',
      use: {
        viewport: { 
          width: VIEWPORT_SIZES.DESKTOP_XL.width, 
          height: VIEWPORT_SIZES.DESKTOP_XL.height 
        }
      },
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Global test timeout */
  timeout: 30 * 1000,
  
  /* Expect timeout for assertions */
  expect: {
    /* Timeout for expect() assertions */
    timeout: 10 * 1000,
    
    /* Threshold for visual comparisons */
    threshold: 0.2,
    
    /* Animation handling */
    animations: 'disabled',
  },

  /* Output directories */
  outputDir: 'test-results/responsive-screenshots',
  
  /* Test artifacts - merged with main use config above */
});