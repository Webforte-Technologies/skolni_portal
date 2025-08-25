import { chromium, request } from '@playwright/test';
import { TestDataSetup } from './utils/test-data-setup';

async function globalSetup() {
  console.log('🚀 Setting up global test environment...');
  
  // Setup any global test environment
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set up any global test data or environment
  await page.goto('http://localhost:4173');
  
  // Verify the application is running
  await page.waitForLoadState('networkidle');
  
  await browser.close();

  // Set up test data if backend is available
  try {
    console.log('📊 Setting up test data...');
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3001',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    const testDataSetup = new TestDataSetup(apiContext);
    await testDataSetup.setupTestUsers();
    
    console.log('✅ Test data setup complete');
    await apiContext.dispose();
  } catch (error) {
    console.warn('⚠️ Could not set up test data (backend may not be running):', error);
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
