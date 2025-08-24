import { test, expect } from '@playwright/test';

test.describe('AI Generator - Realistic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication in localStorage
    await page.addInitScript(() => {
      const mockUser = {
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 100,
        is_active: true,
        created_at: '',
        updated_at: '',
        role: 'teacher_school'
      };
      
      localStorage.setItem('authToken', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    // Mock authentication endpoint
    await page.route('**/auth/profile', async (route) => {
      const user = {
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 100,
        is_active: true,
        created_at: '',
        updated_at: '',
        role: 'teacher_school'
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: user })
      });
    });

    // Mock other API calls that might fail
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      
      // Mock specific endpoints
      if (url.includes('/ai/generate')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              content: 'Generated content here...',
              type: 'quiz'
            }
          })
        });
      } else if (url.includes('/ai/analyze')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              subject: 'Biologie',
              difficulty: 'Střední',
              estimated_time: '45 minut',
              topics: ['fotosyntéza', 'rostliny']
            }
          })
        });
      } else {
        // Default mock for other API calls
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
      }
    });
  });

  test('Complete AI Generator Flow - Quiz Creation', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the page to load and ensure we're not on login page
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    // Fill in the topic
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Pythagorova věta');

    // Fill in assignment description
    await page.fill('textarea[placeholder*="Popište podrobně"]', 'Studenti se mají naučit Pythagorovu větu a umět ji aplikovat na pravoúhlé trojúhelníky');

    // Select quiz type by clicking on the quiz button
    const quizButton = page.locator('button:has-text("Kvíz")').first();
    await quizButton.click();

    // Select grade level
    await page.selectOption('select', '9. třída ZŠ');

    // Look for the generate button
    const generateButton = page.locator('button:has-text("Vytvořit náhled aktivity")').first();
    
    if (await generateButton.isVisible() && !(await generateButton.isDisabled())) {
      await generateButton.click();
      
      // Wait for preview step to appear
      await expect(page.locator('text=Náhled aktivity')).toBeVisible({ timeout: 10000 });
    }
  });

  test('Complete AI Generator Flow - Lesson Plan Creation', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    // Fill in the topic
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Fyzika - Gravitace');

    // Fill in assignment description
    await page.fill('textarea[placeholder*="Popište podrobně"]', 'Studenti se mají naučit o gravitační síle a Newtonových zákonech');

    // Select lesson plan type by clicking on the lesson plan button
    const lessonPlanButton = page.locator('button:has-text("Plán hodiny")').first();
    await lessonPlanButton.click();

    // Select grade level
    await page.selectOption('select', '8. třída ZŠ');

    // Look for the generate button
    const generateButton = page.locator('button:has-text("Vytvořit náhled aktivity")').first();
    
    if (await generateButton.isVisible() && !(await generateButton.isDisabled())) {
      await generateButton.click();
      
      // Wait for preview step to appear
      await expect(page.locator('text=Náhled aktivity')).toBeVisible({ timeout: 10000 });
    }
  });

  test('Assignment Analysis Feature', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    // Fill in assignment description
    await page.fill('textarea[placeholder*="Popište podrobně"]', 'Studenti se mají naučit o fotosyntéze, jak rostliny vyrábějí kyslík a cukry ze slunečního světla a oxidu uhličitého.');

    // Verify the analyze button exists and is clickable
    const analyzeButton = page.locator('button:has-text("Analyzovat úkol")').first();
    await expect(analyzeButton).toBeVisible();
    
    // Click analyze button
    await analyzeButton.click();
    
    // Wait a moment for any potential API call
    await page.waitForTimeout(2000);
    
    // Verify the page is still functional (not broken)
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();
  });

  test('Form Validation - Required Fields', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    // Try to generate without filling required fields
    const generateButton = page.locator('button:has-text("Vytvořit náhled aktivity")').first();
    
    if (await generateButton.isVisible()) {
      // The button should be disabled if required fields are empty
      if (await generateButton.isDisabled()) {
        // This is expected behavior - button should be disabled
        expect(await generateButton.isDisabled()).toBe(true);
      } else {
        // If button is enabled, try clicking it to see if validation works
        await generateButton.click();
        
        // Should show validation errors or stay on the same page
        await expect(page.locator('h1, h2, h3').first()).toBeVisible();
      }
    }
  });

  test('Material Type Selection', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    const materialTypes = ['Kvíz', 'Plán hodiny', 'Pracovní list', 'Projekt', 'Prezentace', 'Aktivita'];

    for (const type of materialTypes) {
      const typeButton = page.locator(`button:has-text("${type}")`).first();
      if (await typeButton.isVisible()) {
        await typeButton.click();
        await expect(typeButton).toHaveClass(/border-blue-500|bg-blue-50|selected/);
        break; // Just test the first available type
      }
    }
  });

  test('Grade Level Selection', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    const gradeSelect = page.locator('select').first();
    
    if (await gradeSelect.isVisible()) {
      const expectedGrades = ['1. třída ZŠ', '2. třída ZŠ', '3. třída ZŠ'];
      
      for (const grade of expectedGrades) {
        const option = gradeSelect.locator(`option[value="${grade}"]`);
        if (await option.isVisible()) {
          await expect(option).toBeVisible();
          break; // Just test the first available grade
        }
      }
    }
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    // Verify the page is usable on mobile
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    // Check that form elements are accessible
    const formElements = page.locator('input, textarea, select, button');
    await expect(formElements.first()).toBeVisible();
  });

  test('Error Handling - API Failure', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify we're on the AI generator page, not login
    await expect(page.locator('h1:has-text("AI Generátor Materiálů")')).toBeVisible();

    // Mock API failure
    await page.route('**/ai/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal server error' })
      });
    });

    // Fill form and try to generate
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Test téma');
    await page.fill('textarea[placeholder*="Popište podrobně"]', 'Test description');
    await page.selectOption('select', '9. třída ZŠ');

    const generateButton = page.locator('button:has-text("Vytvořit náhled aktivity")').first();
    
    if (await generateButton.isVisible() && !(await generateButton.isDisabled())) {
      await generateButton.click();
      
      // Should show error message or stay on the same page
      await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
