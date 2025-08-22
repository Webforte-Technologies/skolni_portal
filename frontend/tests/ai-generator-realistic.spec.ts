import { test, expect } from '@playwright/test';

test.describe('AI Generator - Realistic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

    // Seed auth in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'e2e-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 100,
        is_active: true,
        created_at: '',
        updated_at: '',
        school: { id: 's1', name: 'ZŠ Test' }
      }));
    });
  });

  test('Complete AI Generator Flow - Quiz Creation', async ({ page }) => {
    // Mock the quiz generation API
    await page.route('**/ai/generate-quiz', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.title).toBe('Kvadratické rovnice');
      expect(postData.grade_level).toBe('9. třída ZŠ');

      // Simulate streaming response
      const streamData = [
        'data: {"type":"start","message":"Starting quiz generation..."}\n\n',
        'data: {"type":"chunk","content":"Generuji kvíz o kvadratických rovnicích..."}\n\n',
        'data: {"type":"end","quiz":{"title":"Kvadratické rovnice","questions":[]},"file_id":"quiz-123","file_type":"quiz","credits_used":2,"credits_balance":98}\n\n'
      ].join('');

      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        body: streamData
      });
    });

    // Navigate to generator page
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Fill in the topic
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Kvadratické rovnice');
    
    // Select grade level
    await page.selectOption('select', '9. třída ZŠ');
    
    // Select quiz type
    await page.click('button:has-text("Kvíz")');
    await expect(page.locator('button:has-text("Kvíz")')).toHaveClass(/border-blue-500/);

    // Verify quiz-specific settings appear
    await expect(page.locator('h3:has-text("Nastavení kvízu")')).toBeVisible();
    
    // Set question count
    await page.fill('input[type="number"]', '10');
    
    // Set time limit
    await page.selectOption('select:has(option[value="20 min"])', '20 min');

    // Click generate button
    await page.click('button:has-text("Vytvořit náhled aktivity")');

    // Wait for preview step
    await expect(page.locator('h2:has-text("Náhled aktivity")')).toBeVisible();
    
    // Approve and generate
    await page.click('button:has-text("Vygenerovat materiál")');

    // Wait for generation to start
    await expect(page.locator('pre')).toContainText('Generuji kvíz...');
    
    // Verify success
    await expect(page.locator('text=Kvadratické rovnice')).toBeVisible();
  });

  test('Complete AI Generator Flow - Lesson Plan Creation', async ({ page }) => {
    // Mock the lesson plan generation API
    await page.route('**/ai/generate-lesson-plan', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.title).toBe('Fotosyntéza');
      expect(postData.grade_level).toBe('6. třída ZŠ');

      // Simulate streaming response
      const streamData = [
        'data: {"type":"start","message":"Starting lesson plan generation..."}\n\n',
        'data: {"type":"chunk","content":"Generuji plán hodiny o fotosyntéze..."}\n\n',
        'data: {"type":"end","lesson_plan":{"title":"Fotosyntéza","objectives":[]},"file_id":"lesson-123","file_type":"lesson_plan","credits_used":3,"credits_balance":97}\n\n'
      ].join('');

      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        body: streamData
      });
    });

    // Navigate to generator page
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Fill in the topic
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Fotosyntéza');
    
    // Select grade level
    await page.selectOption('select', '6. třída ZŠ');
    
    // Select lesson plan type
    await page.click('button:has-text("Plán hodiny")');
    await expect(page.locator('button:has-text("Plán hodiny")')).toHaveClass(/border-blue-500/);

    // Verify lesson-specific settings appear
    await expect(page.locator('h3:has-text("Nastavení hodiny")')).toBeVisible();
    
    // Set lesson difficulty
    await page.selectOption('select:has(option[value="medium"])', 'easy');
    
    // Set lesson duration
    await page.selectOption('select:has(option[value="45 min"])', '60 min');

    // Click generate button
    await page.click('button:has-text("Vytvořit náhled aktivity")');

    // Wait for preview step
    await expect(page.locator('h2:has-text("Náhled aktivity")')).toBeVisible();
    
    // Approve and generate
    await page.click('button:has-text("Vygenerovat materiál")');

    // Wait for generation to start
    await expect(page.locator('pre')).toContainText('Generuji plán hodiny...');
    
    // Verify success
    await expect(page.locator('text=Fotosyntéza')).toBeVisible();
  });

  test('Assignment Analysis Feature', async ({ page }) => {
    // Mock the assignment analysis API
    await page.route('**/ai/analyze-assignment', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.description).toContain('fotosyntéza');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            subjectArea: 'Biologie',
            detectedDifficulty: 'Střední',
            estimatedDuration: '45 minut',
            suggestedMaterialTypes: ['lesson', 'worksheet']
          }
        })
      });
    });

    // Navigate to generator page
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Fill in assignment description
    await page.fill('textarea[placeholder*="Popište podrobně"]', 'Studenti se mají naučit o fotosyntéze, jak rostliny vyrábějí kyslík a cukry ze slunečního světla a oxidu uhličitého.');

    // Click analyze button
    await page.click('button:has-text("Analyzovat úkol")');

    // Wait for analysis results
    await expect(page.locator('text=Analýza úkolu dokončena')).toBeVisible();
    await expect(page.locator('text=Biologie')).toBeVisible();
    await expect(page.locator('text=Střední')).toBeVisible();
    await expect(page.locator('text=45 minut')).toBeVisible();
  });

  test('Form Validation - Required Fields', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Try to generate without filling required fields
    await page.click('button:has-text("Vytvořit náhled aktivity")');

    // Should stay on the same page (no navigation)
    await expect(page.locator('h2:has-text("Co chcete vyučovat?")')).toBeVisible();
  });

  test('Material Type Selection', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Test all material type buttons
    const materialTypes = ['Plán hodiny', 'Pracovní list', 'Kvíz', 'Projekt', 'Prezentace', 'Aktivita'];
    
    for (const type of materialTypes) {
      await page.click(`button:has-text("${type}")`);
      await expect(page.locator(`button:has-text("${type}")`)).toHaveClass(/border-blue-500/);
    }
  });

  test('Grade Level Selection', async ({ page }) => {
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Verify all grade options are available
    const expectedGrades = [
      '1. třída ZŠ', '2. třída ZŠ', '3. třída ZŠ', '4. třída ZŠ', '5. třída ZŠ',
      '6. třída ZŠ', '7. třída ZŠ', '8. třída ZŠ', '9. třída ZŠ',
      '1. ročník SŠ', '2. ročník SŠ', '3. ročník SŠ', '4. ročník SŠ'
    ];

    for (const grade of expectedGrades) {
      await expect(page.locator(`option[value="${grade}"]`)).toBeVisible();
    }
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Verify mobile-friendly layout
    await expect(page.locator('button:has-text("Kvíz")')).toBeVisible();
    await expect(page.locator('button:has-text("Plán hodiny")')).toBeVisible();
    
    // Check that form is usable on mobile
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Test téma');
    await page.selectOption('select', '7. třída ZŠ');
    
    // Verify mobile navigation works
    await expect(page.locator('button:has-text("Vytvořit náhled aktivity")')).toBeVisible();
  });

  test('Error Handling - API Failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/ai/generate-quiz', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/ai-generator');
    await page.waitForLoadState('networkidle');

    // Fill required fields
    await page.fill('input[placeholder*="např. Kvadratické rovnice"]', 'Test téma');
    await page.selectOption('select', '8. třída ZŠ');
    await page.click('button:has-text("Kvíz")');
    
    // Try to generate
    await page.click('button:has-text("Vytvořit náhled aktivity")');
    await page.click('button:has-text("Vygenerovat materiál")');

    // Should show error toast
    await expect(page.locator('text=Chyba při generování')).toBeVisible();
  });
});
