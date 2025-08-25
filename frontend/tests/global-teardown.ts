import { request } from '@playwright/test';
import { TestDataSetup } from './utils/test-data-setup';

async function globalTeardown() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3001',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    const testDataSetup = new TestDataSetup(apiContext);
    
    // Clean up test users
    await testDataSetup.cleanupTestUser('admin@eduai.cz');
    await testDataSetup.cleanupTestUser('teacher@eduai.cz');
    
    console.log('✅ Test data cleanup complete');
    await apiContext.dispose();
  } catch (error) {
    console.warn('⚠️ Could not cleanup test data:', error);
  }

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
