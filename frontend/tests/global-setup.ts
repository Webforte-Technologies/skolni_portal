import { chromium } from '@playwright/test';

async function globalSetup() {
  // Setup any global test environment
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set up any global test data or environment
  await page.goto('http://localhost:4173');
  
  // Verify the application is running
  await page.waitForLoadState('networkidle');
  
  await browser.close();
}

export default globalSetup;
