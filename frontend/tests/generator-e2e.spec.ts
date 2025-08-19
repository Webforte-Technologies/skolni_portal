import { test, expect } from '@playwright/test';

test.describe('AI Generator Happy Paths', () => {
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

  test('Generate quiz - success flow with toast and redirect', async ({ page }) => {
    const fileId = 'quiz-123';
    
    // Mock the streaming quiz generation API
    await page.route('**/ai/generate-quiz', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.title).toBe('Matematický kvíz');
      expect(postData.subject).toBe('Matematika');
      expect(postData.grade_level).toBe('7. třída');
      expect(postData.question_count).toBe(5);

      // Simulate streaming response
      const streamData = [
        'data: {"type":"start","message":"Starting quiz generation..."}\n\n',
        'data: {"type":"chunk","content":"{\\"title\\": \\"Matematický kvíz\\","}\n\n',
        'data: {"type":"chunk","content":"\\"subject\\": \\"Matematika\\","}\n\n',
        'data: {"type":"chunk","content":"\\"questions\\": []}"}\n\n',
        `data: {"type":"end","quiz":{"title":"Matematický kvíz","subject":"Matematika","questions":[]},"file_id":"${fileId}","file_type":"quiz","credits_used":2,"credits_balance":98}\n\n`
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
    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    // Select quiz type
    await page.click('button:has-text("Kvíz")');
    await expect(page.locator('button:has-text("Kvíz")')).toHaveClass(/primary/);

    // Fill in quiz parameters
    await page.fill('input[placeholder*="Úvod do zlomků"]', 'Matematický kvíz');
    await page.fill('input[placeholder*="Matematika"]', 'Matematika');
    await page.fill('input[placeholder*="7. třída"]', '7. třída');
    await page.selectOption('select', '15 min'); // Change time limit
    
    // Change question count
    await page.fill('input[type="number"]', '5');

    // Click generate button
    await page.click('button:has-text("Vygenerovat")');

    // Wait for generation to start
    await expect(page.locator('button:has-text("Vygenerovat")')).toBeDisabled();
    await expect(page.locator('pre')).toContainText('Starting quiz generation...');

    // Wait for success toast
    await expect(page.locator('.toast, [role="alert"]')).toContainText('Kvíz vygenerován a uložen do knihovny');

    // Wait for redirect to materials page
    await page.waitForURL(`**/materials/${fileId}`, { timeout: 10000 });
    expect(page.url()).toContain(`/materials/${fileId}`);
  });

  test('Generate lesson plan - success flow with toast and redirect', async ({ page }) => {
    const fileId = 'lesson-456';
    
    // Mock the streaming lesson plan generation API
    await page.route('**/ai/generate-lesson-plan', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.title).toBe('Úvod do geometrie');
      expect(postData.subject).toBe('Matematika');
      expect(postData.grade_level).toBe('8. třída');

      const streamData = [
        'data: {"type":"start","message":"Starting lesson plan generation..."}\n\n',
        'data: {"type":"chunk","content":"{\\"title\\": \\"Úvod do geometrie\\","}\n\n',
        'data: {"type":"chunk","content":"\\"duration\\": \\"45 min\\","}\n\n',
        'data: {"type":"chunk","content":"\\"activities\\": []}"}\n\n',
        `data: {"type":"end","lesson_plan":{"title":"Úvod do geometrie","duration":"45 min","activities":[]},"file_id":"${fileId}","file_type":"lesson_plan","credits_used":2,"credits_balance":96}\n\n`
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

    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    // Select lesson plan type
    await page.click('button:has-text("Plán hodiny")');
    await expect(page.locator('button:has-text("Plán hodiny")')).toHaveClass(/primary/);

    // Fill in lesson plan parameters
    await page.fill('input[placeholder*="Úvod do zlomků"]', 'Úvod do geometrie');
    await page.fill('input[placeholder*="Matematika"]', 'Matematika');
    await page.fill('input[placeholder*="7. třída"]', '8. třída');

    // Click generate button
    await page.click('button:has-text("Vygenerovat")');

    // Wait for generation process
    await expect(page.locator('button:has-text("Vygenerovat")')).toBeDisabled();
    await expect(page.locator('pre')).toContainText('Starting lesson plan generation...');

    // Wait for success toast
    await expect(page.locator('.toast, [role="alert"]')).toContainText('Plán hodiny vygenerován a uložen do knihovny');

    // Wait for redirect
    await page.waitForURL(`**/materials/${fileId}`, { timeout: 10000 });
    expect(page.url()).toContain(`/materials/${fileId}`);
  });

  test('Generate worksheet - success flow with toast and redirect', async ({ page }) => {
    const fileId = 'worksheet-789';
    
    // Mock the streaming worksheet generation API
    await page.route('**/ai/generate-worksheet', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.topic).toBe('Kvadratické rovnice');
      expect(postData.question_count).toBe(8);

      const streamData = [
        'data: {"type":"start","message":"Starting worksheet generation..."}\n\n',
        'data: {"type":"chunk","content":"{\\"title\\": \\"Cvičení na kvadratické rovnice\\","}\n\n',
        'data: {"type":"chunk","content":"\\"instructions\\": \\"Vyřešte následující příklady\\","}\n\n',
        'data: {"type":"chunk","content":"\\"questions\\": []}"}\n\n',
        `data: {"type":"end","worksheet":{"title":"Cvičení na kvadratické rovnice","instructions":"Vyřešte následující příklady","questions":[]},"file_id":"${fileId}","file_type":"worksheet","credits_used":2,"credits_balance":94}\n\n`
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

    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    // Select worksheet type (should be default or click it)
    await page.click('button:has-text("Pracovní list")');
    await expect(page.locator('button:has-text("Pracovní list")')).toHaveClass(/primary/);

    // Fill in worksheet parameters
    await page.fill('input[placeholder*="Kvadratické rovnice"]', 'Kvadratické rovnice');
    
    // Change question count
    await page.fill('input[type="number"]', '8');

    // Click generate button
    await page.click('button:has-text("Vygenerovat")');

    // Wait for generation process
    await expect(page.locator('button:has-text("Vygenerovat")')).toBeDisabled();
    await expect(page.locator('pre')).toContainText('Starting worksheet generation...');

    // Wait for success toast
    await expect(page.locator('.toast, [role="alert"]')).toContainText('Pracovní list vygenerován a uložen do knihovny');

    // Wait for redirect
    await page.waitForURL(`**/materials/${fileId}`, { timeout: 10000 });
    expect(page.url()).toContain(`/materials/${fileId}`);
  });

  test('Generate batch - lesson plan + worksheet + quiz', async ({ page }) => {
    const lessonId = 'lesson-batch-1';
    const worksheetId = 'worksheet-batch-2';
    const quizId = 'quiz-batch-3';
    
    // Mock all three generation endpoints
    await page.route('**/ai/generate-lesson-plan', async (route) => {
      const streamData = [
        'data: {"type":"start","message":"Starting lesson plan generation..."}\n\n',
        'data: {"type":"chunk","content":"{\\"title\\": \\"Batch Lesson\\""}\n\n',
        `data: {"type":"end","lesson_plan":{"title":"Batch Lesson"},"file_id":"${lessonId}","file_type":"lesson_plan","credits_used":2,"credits_balance":96}\n\n`
      ].join('');

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: streamData
      });
    });

    await page.route('**/ai/generate-worksheet', async (route) => {
      const streamData = [
        'data: {"type":"start","message":"Starting worksheet generation..."}\n\n',
        'data: {"type":"chunk","content":"{\\"title\\": \\"Batch Worksheet\\""}\n\n',
        `data: {"type":"end","worksheet":{"title":"Batch Worksheet"},"file_id":"${worksheetId}","file_type":"worksheet","credits_used":2,"credits_balance":94}\n\n`
      ].join('');

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: streamData
      });
    });

    await page.route('**/ai/generate-quiz', async (route) => {
      const streamData = [
        'data: {"type":"start","message":"Starting quiz generation..."}\n\n',
        'data: {"type":"chunk","content":"{\\"title\\": \\"Batch Quiz\\""}\n\n',
        `data: {"type":"end","quiz":{"title":"Batch Quiz"},"file_id":"${quizId}","file_type":"quiz","credits_used":2,"credits_balance":92}\n\n`
      ].join('');

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: streamData
      });
    });

    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    // Fill basic info for batch generation
    await page.fill('input[placeholder*="Úvod do zlomků"]', 'Batch Topic');
    await page.fill('input[placeholder*="Matematika"]', 'Matematika');
    await page.fill('input[placeholder*="7. třída"]', '9. třída');

    // Enable batch mode
    await page.check('input[type="checkbox"]:has-text("Vygenerovat balíček")');
    await expect(page.locator('input[type="checkbox"]:has-text("Vygenerovat balíček")')).toBeChecked();

    // Click generate
    await page.click('button:has-text("Vygenerovat")');

    // Should show multiple generation phases
    await expect(page.locator('pre')).toContainText('Starting lesson plan generation...');
    
    // Wait for final success toast
    await expect(page.locator('.toast, [role="alert"]')).toContainText('Balíček vygenerován');

    // Should redirect to the first generated item
    await page.waitForURL(`**/materials/${lessonId}`, { timeout: 15000 });
    expect(page.url()).toContain(`/materials/${lessonId}`);
  });

  test('Handle insufficient credits error', async ({ page }) => {
    // Mock user with low credits
    await page.route('**/auth/profile', async (route) => {
      const user = {
        id: 'u1',
        email: 'teacher@example.com',
        first_name: 'Test',
        last_name: 'Učitel',
        credits_balance: 1, // Only 1 credit, need 2
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

    // Mock insufficient credits response
    await page.route('**/ai/generate-quiz', async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Insufficient credits',
          data: {
            credits_balance: 1,
            credits_required: 2,
            message: 'You have 1 credits but need 2 credits for this request.'
          }
        })
      });
    });

    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    // Try to generate a quiz
    await page.click('button:has-text("Kvíz")');
    await page.fill('input[placeholder*="Úvod do zlomků"]', 'Test Quiz');
    await page.click('button:has-text("Vygenerovat")');

    // Should show error toast
    await expect(page.locator('.toast, [role="alert"]')).toContainText('Insufficient credits');

    // Should not redirect
    expect(page.url()).toContain('/generator');
  });

  test('Handle validation errors', async ({ page }) => {
    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    // Select worksheet but don't fill topic (should be disabled)
    await page.click('button:has-text("Pracovní list")');
    
    // Leave topic empty (less than 3 characters)
    await page.fill('input[placeholder*="Kvadratické rovnice"]', 'AB');

    // Generate button should be disabled or show validation error
    const generateBtn = page.locator('button:has-text("Vygenerovat")');
    await expect(generateBtn).toBeDisabled();

    // Should show validation message
    await expect(page.locator('text="Zadejte prosím téma alespoň o 3 znacích"')).toBeVisible();
  });

  test('Stream preview shows content during generation', async ({ page }) => {
    // Mock streaming with detailed chunks
    await page.route('**/ai/generate-quiz', async (route) => {
      const streamData = [
        'data: {"type":"start","message":"Starting quiz generation..."}\n\n',
        'data: {"type":"chunk","content":"{"}\n\n',
        'data: {"type":"chunk","content":"\\"title\\": \\"Test Quiz\\","}\n\n',
        'data: {"type":"chunk","content":"\\"subject\\": \\"Math\\","}\n\n',
        'data: {"type":"chunk","content":"\\"questions\\": ["}\n\n',
        'data: {"type":"chunk","content":"{\\"type\\": \\"multiple_choice\\","}\n\n',
        'data: {"type":"chunk","content":"\\"question\\": \\"What is 2+2?\\""}\n\n',
        'data: {"type":"chunk","content":"}"}\n\n',
        'data: {"type":"chunk","content":"]}"}\n\n',
        'data: {"type":"end","quiz":{"title":"Test Quiz"},"file_id":"quiz-preview","file_type":"quiz","credits_used":2,"credits_balance":98}\n\n'
      ].join('');

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: streamData
      });
    });

    await page.goto('/generator');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Kvíz")');
    await page.fill('input[placeholder*="Úvod do zlomků"]', 'Test Quiz');
    await page.click('button:has-text("Vygenerovat")');

    // Check that preview shows streaming content
    const preview = page.locator('pre');
    await expect(preview).toContainText('Starting quiz generation...');
    await expect(preview).toContainText('"title": "Test Quiz"');
    await expect(preview).toContainText('"subject": "Math"');
    await expect(preview).toContainText('What is 2+2?');

    // Wait for completion
    await expect(page.locator('.toast, [role="alert"]')).toContainText('Kvíz vygenerován a uložen do knihovny');
  });
});