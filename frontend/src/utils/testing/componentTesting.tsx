/**
 * Component testing utilities for responsive behavior
 * Provides helpers for testing React components across different viewports
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { EnhancedThemeProvider } from '../../contexts/EnhancedThemeContext';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { simulateDevice } from './deviceSimulation';
import type { Page } from '@playwright/test';

// Helper function to render components with all necessary providers
export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ResponsiveProvider>
      <EnhancedThemeProvider>
        <AccessibilityProvider>
          {component}
        </AccessibilityProvider>
      </EnhancedThemeProvider>
    </ResponsiveProvider>
  );
};

/**
 * Tests component responsiveness across different viewports
 */
export const testComponentResponsive = async (
  page: Page,
  componentUrl: string,
  devices: string[] = ['desktop', 'tablet', 'mobile'],
  options?: {
    waitForSelector?: string;
    screenshotName?: string;
    threshold?: number;
  }
) => {
  const results: Array<{
    device: string;
    success: boolean;
    error?: string;
  }> = [];

  for (const deviceName of devices) {
    try {
      // Navigate to component page
      await page.goto(componentUrl);
      
      // Simulate device
      await simulateDevice(page, deviceName);
      
      // Wait for component to load
      if (options?.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      } else {
        await page.waitForTimeout(1000);
      }

      // Take screenshot for visual regression testing
      const screenshotName = options?.screenshotName || 'component-responsive';
      await page.screenshot({
        path: `test-results/${screenshotName}-${deviceName}.png`,
        fullPage: true
      });

      results.push({ device: deviceName, success: true });
    } catch (error) {
      results.push({ 
        device: deviceName, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return results;
};

/**
 * Tests touch target sizes for accessibility
 */
export const testTouchTargets = async (
  page: Page,
  selectors: string[],
  minSize: number = 44
) => {
  const results: Array<{
    selector: string;
    size: { width: number; height: number };
    meetsRequirement: boolean;
  }> = [];

  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      const boundingBox = await element.boundingBox();
      
      if (boundingBox) {
        const meetsRequirement = boundingBox.width >= minSize && boundingBox.height >= minSize;
        results.push({
          selector,
          size: { width: boundingBox.width, height: boundingBox.height },
          meetsRequirement
        });
      }
    } catch (error) {
      results.push({
        selector,
        size: { width: 0, height: 0 },
        meetsRequirement: false
      });
    }
  }

  return results;
};

/**
 * Tests component accessibility features
 */
export const testComponentAccessibility = async (
  page: Page,
  options?: {
    checkARIA?: boolean;
    checkKeyboard?: boolean;
    checkColorContrast?: boolean;
  }
) => {
  const results: Array<{
    test: string;
    success: boolean;
    details?: string;
  }> = [];

  try {
    // Check for ARIA attributes
    if (options?.checkARIA !== false) {
      const ariaElements = await page.locator('[aria-*]').count();
      results.push({
        test: 'ARIA attributes present',
        success: ariaElements > 0,
        details: `Found ${ariaElements} elements with ARIA attributes`
      });
    }

    // Check keyboard navigation
    if (options?.checkKeyboard !== false) {
      const focusableElements = await page.locator('button, [tabindex], a, input, select, textarea').count();
      results.push({
        test: 'Keyboard navigation support',
        success: focusableElements > 0,
        details: `Found ${focusableElements} focusable elements`
      });
    }

    // Check color contrast (basic implementation)
    if (options?.checkColorContrast !== false) {
      const hasDarkText = await page.locator('body').evaluate((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        return color.includes('rgb(0, 0, 0)') || color.includes('rgb(33, 37, 41)');
      });
      
      results.push({
        test: 'Color contrast',
        success: hasDarkText,
        details: hasDarkText ? 'Dark text detected' : 'Light text may have contrast issues'
      });
    }
  } catch (error) {
    results.push({
      test: 'Accessibility testing',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
};

/**
 * Tests layout stability across viewport changes
 */
export const testLayoutStability = async (
  page: Page,
  viewports: Array<{ width: number; height: number }> = [
    { width: 1920, height: 1080 },
    { width: 768, height: 1024 },
    { width: 375, height: 667 }
  ]
) => {
  const results: Array<{
    viewport: { width: number; height: number };
    layoutShift: number;
    stable: boolean;
  }> = [];

  for (const viewport of viewports) {
    try {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // Measure layout shift (basic implementation)
      const layoutShift = await page.evaluate(() => {
        if ('PerformanceObserver' in window) {
          return new Promise<number>((resolve) => {
            let totalShift = 0;
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === 'layout-shift') {
                  totalShift += (entry as any).value;
                }
              }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
            
            setTimeout(() => {
              observer.disconnect();
              resolve(totalShift);
            }, 1000);
          });
        }
        return 0;
      });

      results.push({
        viewport,
        layoutShift,
        stable: layoutShift < 0.1
      });
    } catch (error) {
      results.push({
        viewport,
        layoutShift: 0,
        stable: false
      });
    }
  }

  return results;
};

/**
 * Tests form responsiveness
 */
export const testFormResponsive = async (
  page: Page,
  formSelector: string,
  devices: string[] = ['desktop', 'tablet', 'mobile']
) => {
  const results: Array<{
    device: string;
    formVisible: boolean;
    inputsAccessible: boolean;
    submitButtonVisible: boolean;
  }> = [];

  for (const deviceName of devices) {
    try {
      await simulateDevice(page, deviceName);
      await page.waitForTimeout(500);

      const formVisible = await page.locator(formSelector).isVisible();
      const inputsAccessible = await page.locator(`${formSelector} input, ${formSelector} select, ${formSelector} textarea`).count() > 0;
      const submitButtonVisible = await page.locator(`${formSelector} button[type="submit"], ${formSelector} input[type="submit"]`).isVisible();

      results.push({
        device: deviceName,
        formVisible,
        inputsAccessible,
        submitButtonVisible
      });
    } catch (error) {
      results.push({
        device: deviceName,
        formVisible: false,
        inputsAccessible: false,
        submitButtonVisible: false
      });
    }
  }

  return results;
};

/**
 * Tests navigation responsiveness
 */
export const testNavigationResponsive = async (
  page: Page,
  navSelector: string,
  devices: string[] = ['desktop', 'tablet', 'mobile']
) => {
  const results: Array<{
    device: string;
    navVisible: boolean;
    menuToggleVisible: boolean;
    linksAccessible: boolean;
  }> = [];

  for (const deviceName of devices) {
    try {
      await simulateDevice(page, deviceName);
      await page.waitForTimeout(500);

      const navVisible = await page.locator(navSelector).isVisible();
      const menuToggleVisible = await page.locator(`${navSelector} [aria-label*="menu"], ${navSelector} [aria-label*="Menu"]`).isVisible();
      const linksAccessible = await page.locator(`${navSelector} a, ${navSelector} button`).count() > 0;

      results.push({
        device: deviceName,
        navVisible,
        menuToggleVisible,
        linksAccessible
      });
    } catch (error) {
      results.push({
        device: deviceName,
        navVisible: false,
        menuToggleVisible: false,
        linksAccessible: false
      });
    }
  }

  return results;
};

/**
 * Creates a comprehensive component test suite
 */
export const createComponentTestSuite = (
  componentName: string,
  testCases: Array<{
    name: string;
    test: () => Promise<void>;
    devices?: string[];
  }>
) => {
  return {
    name: componentName,
    testCases,
    async runAll() {
      const results: Array<{
        testCase: string;
        success: boolean;
        error?: string;
        devices?: string[];
      }> = [];

      for (const testCase of testCases) {
        try {
          await testCase.test();
          results.push({
            testCase: testCase.name,
            success: true,
            devices: testCase.devices
          });
        } catch (error) {
          results.push({
            testCase: testCase.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            devices: testCase.devices
          });
        }
      }

      return results;
    }
  };
};
