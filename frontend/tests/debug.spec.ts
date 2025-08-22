import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('Debug - Check what is rendered on login page', async ({ page }) => {
    // Set up console error listener before navigation
    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Also listen for page errors
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });

    // Mock all API calls to prevent failures
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Handle API requests
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/ai/')) {
        console.log(`Mocking API request: ${method} ${url}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            data: {},
            error: null
          })
        });
      } else {
        // Allow all other requests (CSS, JS, images, etc.) to continue
        await route.continue();
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Wait a bit longer for React to load
    await page.waitForTimeout(5000);

    // Take a screenshot to see what's actually rendered
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });

    // Log the page content
    const pageContent = await page.content();
    console.log('Page HTML length:', pageContent.length);

    // Check if React is loading
    const rootDiv = await page.locator('#root').innerHTML();
    console.log('Root div content length:', rootDiv.length);

    // Check for React elements - try multiple selectors
    const reactElements1 = await page.locator('[data-reactroot]').count();
    const reactElements2 = await page.locator('[data-reactid]').count();
    const reactElements3 = await page.locator('[data-testid]').count();
    const reactElements4 = await page.locator('div[class*="react"]').count();
    
    console.log('React elements found (data-reactroot):', reactElements1);
    console.log('React elements found (data-reactid):', reactElements2);
    console.log('React elements found (data-testid):', reactElements3);
    console.log('React elements found (class*="react"):', reactElements4);

    // Check for main script
    const mainScript = await page.locator('script[src*="main"]').count();
    console.log('Main script elements found:', mainScript);

    // Check if there are any script loading errors
    const scriptErrors = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src]');
      const errors: string[] = [];
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.includes('data:')) {
          // Check if script failed to load
          if (!document.querySelector(`script[src="${src}"]`)) {
            errors.push(`Script failed to load: ${src}`);
          }
        }
      });
      return errors;
    });

    console.log('Script errors:', scriptErrors);
    console.log('Console errors:', consoleErrors);
    console.log('Console logs:', consoleLogs);

    // Check for any content at all
    const bodyText = await page.locator('body').innerText();
    console.log('Body text length:', bodyText.length);
    console.log('Body text preview:', bodyText.substring(0, 200));

    // Verify basic elements are present - check for actual content instead of React attributes
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('Debug - Check what is rendered on landing page', async ({ page }) => {
    // Mock all API calls to prevent failures
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Handle API requests
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/ai/')) {
        console.log(`Mocking API request: ${method} ${url}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            data: {},
            error: null
          })
        });
      } else {
        // Allow all other requests (CSS, JS, images, etc.) to continue
        await route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take a screenshot
    await page.screenshot({ path: 'debug-landing-page.png', fullPage: true });

    // Check for React elements - try multiple selectors
    const reactElements1 = await page.locator('[data-reactroot]').count();
    const reactElements2 = await page.locator('[data-reactid]').count();
    const reactElements3 = await page.locator('[data-testid]').count();
    const reactElements4 = await page.locator('div[class*="react"]').count();
    
    console.log('Landing page React elements found (data-reactroot):', reactElements1);
    console.log('Landing page React elements found (data-reactid):', reactElements2);
    console.log('Landing page React elements found (data-testid):', reactElements3);
    console.log('Landing page React elements found (class*="react"):', reactElements4);

    // Check for navigation elements
    const buttons = await page.locator('button').allTextContents();
    const links = await page.locator('a').allTextContents();
    
    console.log('Landing page buttons:', buttons);
    console.log('Landing page links:', links);

    // Check for any content at all
    const bodyText = await page.locator('body').innerText();
    console.log('Landing page body text length:', bodyText.length);
    console.log('Landing page body text preview:', bodyText.substring(0, 200));

    // Verify basic elements are present - check for actual content instead of React attributes
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('Debug - Check school registration page', async ({ page }) => {
    // Mock all API calls to prevent failures
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Handle API requests
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/ai/')) {
        console.log(`Mocking API request: ${method} ${url}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            data: {},
            error: null
          })
        });
      } else {
        // Allow all other requests (CSS, JS, images, etc.) to continue
        await route.continue();
      }
    });

    await page.goto('/register-school');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take a screenshot
    await page.screenshot({ path: 'debug-school-registration.png', fullPage: true });

    // Check for React elements - try multiple selectors
    const reactElements1 = await page.locator('[data-reactroot]').count();
    const reactElements2 = await page.locator('[data-reactid]').count();
    const reactElements3 = await page.locator('[data-testid]').count();
    const reactElements4 = await page.locator('div[class*="react"]').count();
    
    console.log('School registration React elements found (data-reactroot):', reactElements1);
    console.log('School registration React elements found (data-reactid):', reactElements2);
    console.log('School registration React elements found (data-testid):', reactElements3);
    console.log('School registration React elements found (class*="react"):', reactElements4);

    // Check for any content at all
    const bodyText = await page.locator('body').innerText();
    console.log('School registration body text length:', bodyText.length);
    console.log('School registration body text preview:', bodyText.substring(0, 200));

    // Verify basic elements are present - check for actual content instead of React attributes
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('Debug - Check dashboard navigation', async ({ page }) => {
    // Set up authentication in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'test-token-123');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 100,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        role: 'teacher_school',
        school: null
      }));
    });

    // Mock all API calls
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Handle API requests
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/ai/')) {
        console.log(`Mocking API request: ${method} ${url}`);
        
        if (url.includes('/auth/profile')) {
          const user = {
            id: 'u1',
            email: 'teacher@example.com',
            first_name: 'Test',
            last_name: 'Učitel',
            credits_balance: 100,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            role: 'teacher_school',
            school: null
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: user,
              error: null
            })
          });
        } else if (url.includes('/ai/features')) {
          const features = [
            {
              id: 'math',
              name: 'Matematika',
              description: 'AI asistent pro matematiku',
              icon: 'calculator',
              color: 'blue'
            }
          ];
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: features,
              error: null
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: {},
              error: null
            })
          });
        }
      } else {
        // Allow all other requests (CSS, JS, images, etc.) to continue
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take a screenshot
    await page.screenshot({ path: 'debug-dashboard-navigation.png', fullPage: true });

    // Check localStorage after navigation
    const localStorageData = await page.evaluate(() => {
      return {
        authToken: localStorage.getItem('authToken'),
        user: localStorage.getItem('user')
      };
    });
    console.log('LocalStorage after navigation:', localStorageData);

    // Check for any error messages
    const errorMessages = await page.locator('text=error, text=chyba, text=Error, text=Chyba').count();
    console.log('Error messages found:', errorMessages);

    // Check for dashboard content
    const dashboardContent = await page.locator('text=Dashboard, text=Přehled, text=Vítejte, text=Welcome').count();
    console.log('Dashboard content found:', dashboardContent);

    // Check for any content at all
    const bodyText = await page.locator('body').innerText();
    console.log('Dashboard body text length:', bodyText.length);
    console.log('Dashboard body text preview:', bodyText.substring(0, 200));

    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
  });

  test('Debug - Check dashboard content', async ({ page }) => {
    // Set up authentication in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'test-token-123');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 100,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        role: 'teacher_school',
        school: null
      }));
    });

    // Mock all API calls
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Handle API requests
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/ai/')) {
        console.log(`Mocking API request: ${method} ${url}`);
        
        if (url.includes('/auth/profile')) {
          const user = {
            id: 'u1',
            email: 'teacher@example.com',
            first_name: 'Test',
            last_name: 'Učitel',
            credits_balance: 100,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            role: 'teacher_school',
            school: null
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: user,
              error: null
            })
          });
        } else if (url.includes('/ai/features')) {
          const features = [
            {
              id: 'math',
              name: 'Matematika',
              description: 'AI asistent pro matematiku',
              icon: 'calculator',
              color: 'blue'
            }
          ];
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: features,
              error: null
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true, 
              data: {},
              error: null
            })
          });
        }
      } else {
        // Allow all other requests (CSS, JS, images, etc.) to continue
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take a screenshot
    await page.screenshot({ path: 'debug-dashboard-content.png', fullPage: true });

    // Get all text content on the page
    const pageText = await page.locator('body').innerText();
    console.log('Dashboard page text length:', pageText.length);
    console.log('Dashboard page text preview:', pageText.substring(0, 500));

    // Check for any headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('Dashboard headings:', headings);

    // Check for any buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('Dashboard buttons:', buttons);

    // Check for any links
    const links = await page.locator('a').allTextContents();
    console.log('Dashboard links:', links);

    // Check for any error messages
    const errors = await page.locator('text=error, text=chyba, text=Error, text=Chyba, text=Something went wrong').count();
    console.log('Error messages found:', errors);

    // Check if the page has any content at all
    const hasContent = pageText.length > 0;
    console.log('Page has content:', hasContent);

    expect(hasContent).toBe(true);
  });
});
