/**
 * Component testing utilities for responsive behavior
 * Provides helpers for testing React components across different viewports
 */

import type { Page, Locator } from '@playwright/test';
import type { ViewportState } from '../../types';
import { VIEWPORT_SIZES, createTestViewportState, TEST_DEVICES } from './viewportUtils';
import { simulateDevice, validateTouchTargets } from './deviceSimulation';

export interface ResponsiveComponentTest {
  name: string;
  selector: string;
  viewports: Array<{ width: number; height: number }>;
  assertions: Array<{
    viewport: { width: number; height: number };
    test: (element: Locator, viewportState: ViewportState) => Promise<void>;
  }>;
}

export interface TouchTargetTest {
  selector: string;
  minimumSize: number;
  description: string;
}

export interface AccessibilityTest {
  selector: string;
  expectedRole: string;
  expectedAttributes: Record<string, string | boolean>;
  keyboardNavigation: boolean;
}

/**
 * Tests a component's responsive behavior across multiple viewports
 */
export const testComponentResponsive = async (
  page: Page,
  test: ResponsiveComponentTest
) => {
  const results: Array<{
    viewport: { width: number; height: number };
    success: boolean;
    error?: string;
  }> = [];

  for (const viewport of test.viewports) {
    try {
      // Set viewport
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200); // Allow for responsive changes

      // Get viewport state
      const viewportState = createTestViewportState(viewport);

      // Find element
      const element = page.locator(test.selector);
      await element.waitFor({ state: 'visible', timeout: 5000 });

      // Run viewport-specific assertions
      const viewportAssertions = test.assertions.filter(
        a => a.viewport.width === viewport.width && a.viewport.height === viewport.height
      );

      for (const assertion of viewportAssertions) {
        await assertion.test(element, viewportState);
      }

      results.push({ viewport, success: true });
    } catch (error) {
      results.push({
        viewport,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};

/**
 * Tests touch target sizes across mobile devices
 */
export const testTouchTargets = async (
  page: Page,
  tests: TouchTargetTest[]
) => {
  const mobileViewports = [
    VIEWPORT_SIZES.MOBILE_SMALL,
    VIEWPORT_SIZES.MOBILE_MEDIUM,
    VIEWPORT_SIZES.MOBILE_LARGE,
  ];

  const results: Array<{
    viewport: { width: number; height: number };
    tests: Array<{
      selector: string;
      description: string;
      width: number;
      height: number;
      valid: boolean;
      minimumSize: number;
    }>;
  }> = [];

  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(200);

    const testResults = [];

    for (const test of tests) {
      const element = page.locator(test.selector);
      const boundingBox = await element.boundingBox();

      if (boundingBox) {
        const valid = boundingBox.width >= test.minimumSize && boundingBox.height >= test.minimumSize;
        testResults.push({
          selector: test.selector,
          description: test.description,
          width: boundingBox.width,
          height: boundingBox.height,
          valid,
          minimumSize: test.minimumSize,
        });
      }
    }

    results.push({ viewport, tests: testResults });
  }

  return results;
};

/**
 * Tests component accessibility across different devices
 */
export const testComponentAccessibility = async (
  page: Page,
  tests: AccessibilityTest[]
) => {
  const accessibilityViewports = [
    { name: 'Mobile', ...VIEWPORT_SIZES.MOBILE_MEDIUM },
    { name: 'Tablet', ...VIEWPORT_SIZES.TABLET_PORTRAIT },
    { name: 'Desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM },
  ];

  const results: Array<{
    viewport: { name: string; width: number; height: number };
    tests: Array<{
      selector: string;
      role: { expected: string; actual: string | null; valid: boolean };
      attributes: Array<{ name: string; expected: string | boolean; actual: string | null; valid: boolean }>;
      keyboardNavigation: { tested: boolean; success: boolean };
    }>;
  }> = [];

  for (const viewport of accessibilityViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(200);

    const testResults = [];

    for (const test of tests) {
      const element = page.locator(test.selector);
      await element.waitFor({ state: 'visible' });

      // Test role
      const actualRole = await element.getAttribute('role') || 
                        await element.evaluate(el => el.tagName.toLowerCase());
      const roleValid = actualRole === test.expectedRole || 
                       (test.expectedRole === 'button' && actualRole === 'button');

      // Test attributes
      const attributeResults = [];
      for (const [attrName, expectedValue] of Object.entries(test.expectedAttributes)) {
        const actualValue = await element.getAttribute(attrName);
        const valid = typeof expectedValue === 'boolean' 
          ? (actualValue !== null) === expectedValue
          : actualValue === expectedValue;

        attributeResults.push({
          name: attrName,
          expected: expectedValue,
          actual: actualValue,
          valid,
        });
      }

      // Test keyboard navigation
      let keyboardNavigation = { tested: false, success: false };
      if (test.keyboardNavigation) {
        try {
          await element.focus();
          const isFocused = await element.evaluate(el => document.activeElement === el);
          
          // Test Enter key activation
          await page.keyboard.press('Enter');
          await page.waitForTimeout(100);
          
          keyboardNavigation = { tested: true, success: isFocused };
        } catch (error) {
          keyboardNavigation = { tested: true, success: false };
        }
      }

      testResults.push({
        selector: test.selector,
        role: { expected: test.expectedRole, actual: actualRole, valid: roleValid },
        attributes: attributeResults,
        keyboardNavigation,
      });
    }

    results.push({ viewport, tests: testResults });
  }

  return results;
};

/**
 * Tests component layout behavior during viewport changes
 */
export const testLayoutStability = async (
  page: Page,
  componentSelector: string,
  viewportTransitions: Array<{
    from: { width: number; height: number };
    to: { width: number; height: number };
    description: string;
  }>
) => {
  const results = [];

  for (const transition of viewportTransitions) {
    // Set initial viewport
    await page.setViewportSize(transition.from);
    await page.waitForTimeout(300);

    const element = page.locator(componentSelector);
    await element.waitFor({ state: 'visible' });

    // Get initial layout
    const initialBox = await element.boundingBox();
    const initialStyles = await element.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        position: styles.position,
        overflow: styles.overflow,
      };
    });

    // Change viewport
    await page.setViewportSize(transition.to);
    await page.waitForTimeout(300);

    // Get final layout
    const finalBox = await element.boundingBox();
    const finalStyles = await element.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        position: styles.position,
        overflow: styles.overflow,
      };
    });

    // Check for layout shift
    const layoutShift = initialBox && finalBox ? {
      x: Math.abs(initialBox.x - finalBox.x),
      y: Math.abs(initialBox.y - finalBox.y),
      width: Math.abs(initialBox.width - finalBox.width),
      height: Math.abs(initialBox.height - finalBox.height),
    } : null;

    results.push({
      transition: transition.description,
      from: transition.from,
      to: transition.to,
      initialBox,
      finalBox,
      initialStyles,
      finalStyles,
      layoutShift,
      stable: layoutShift ? (layoutShift.x < 1 && layoutShift.y < 1) : false,
    });
  }

  return results;
};

/**
 * Tests form component responsive behavior
 */
export const testFormResponsive = async (
  page: Page,
  formSelector: string,
  inputSelectors: string[]
) => {
  const formViewports = [
    { name: 'Mobile', ...VIEWPORT_SIZES.MOBILE_MEDIUM },
    { name: 'Tablet', ...VIEWPORT_SIZES.TABLET_PORTRAIT },
    { name: 'Desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM },
  ];

  const results = [];

  for (const viewport of formViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(200);

    const form = page.locator(formSelector);
    await form.waitFor({ state: 'visible' });

    // Test form layout
    const formBox = await form.boundingBox();
    const formStyles = await form.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
        gridTemplateColumns: styles.gridTemplateColumns,
        gap: styles.gap,
      };
    });

    // Test input field behavior
    const inputResults = [];
    for (const inputSelector of inputSelectors) {
      const input = page.locator(inputSelector);
      if (await input.count() > 0) {
        const inputBox = await input.boundingBox();
        const inputStyles = await input.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            width: styles.width,
            height: styles.height,
            fontSize: styles.fontSize,
            padding: styles.padding,
          };
        });

        // Test focus behavior
        await input.focus();
        const focusStyles = await input.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            boxShadow: styles.boxShadow,
            borderColor: styles.borderColor,
          };
        });

        inputResults.push({
          selector: inputSelector,
          box: inputBox,
          styles: inputStyles,
          focusStyles,
          touchTargetValid: inputBox ? (inputBox.height >= 44) : false,
        });
      }
    }

    results.push({
      viewport,
      form: {
        box: formBox,
        styles: formStyles,
      },
      inputs: inputResults,
    });
  }

  return results;
};

/**
 * Tests navigation component responsive behavior
 */
export const testNavigationResponsive = async (
  page: Page,
  navigationSelector: string
) => {
  const navigationViewports = [
    { name: 'Mobile', ...VIEWPORT_SIZES.MOBILE_MEDIUM, expectMobile: true },
    { name: 'Tablet', ...VIEWPORT_SIZES.TABLET_PORTRAIT, expectMobile: false },
    { name: 'Desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM, expectMobile: false },
  ];

  const results = [];

  for (const viewport of navigationViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);

    const navigation = page.locator(navigationSelector);
    await navigation.waitFor({ state: 'visible' });

    // Check for mobile menu button
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    const hasMobileMenu = await mobileMenuButton.count() > 0;
    const mobileMenuVisible = hasMobileMenu ? await mobileMenuButton.isVisible() : false;

    // Check for desktop navigation items
    const desktopNavItems = page.locator('[data-testid^="nav-"]:not([data-testid="mobile-menu-button"])');
    const desktopNavCount = await desktopNavItems.count();
    const desktopNavVisible = desktopNavCount > 0 ? await desktopNavItems.first().isVisible() : false;

    // Test mobile menu functionality if present
    let mobileMenuTest = null;
    if (hasMobileMenu && mobileMenuVisible) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);

      const drawer = page.locator('[role="dialog"]');
      const drawerVisible = await drawer.isVisible();

      // Close menu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const drawerClosed = !(await drawer.isVisible());

      mobileMenuTest = {
        opens: drawerVisible,
        closesWithEscape: drawerClosed,
      };
    }

    results.push({
      viewport,
      mobileMenu: {
        expected: viewport.expectMobile,
        present: hasMobileMenu,
        visible: mobileMenuVisible,
        functional: mobileMenuTest,
      },
      desktopNav: {
        expected: !viewport.expectMobile,
        itemCount: desktopNavCount,
        visible: desktopNavVisible,
      },
    });
  }

  return results;
};

/**
 * Creates a comprehensive test suite for a component
 */
export const createComponentTestSuite = (
  componentName: string,
  componentSelector: string
) => {
  return {
    componentName,
    componentSelector,

    async testResponsiveBehavior(page: Page) {
      const test: ResponsiveComponentTest = {
        name: componentName,
        selector: componentSelector,
        viewports: [
          VIEWPORT_SIZES.MOBILE_MEDIUM,
          VIEWPORT_SIZES.TABLET_PORTRAIT,
          VIEWPORT_SIZES.DESKTOP_MEDIUM,
        ],
        assertions: [
          {
            viewport: VIEWPORT_SIZES.MOBILE_MEDIUM,
            test: async (element, viewportState) => {
              // Mobile-specific assertions
              const box = await element.boundingBox();
              if (box && viewportState.breakpoint === 'mobile') {
                // Component should be visible and properly sized
                if (box.width > viewportState.width) {
                  throw new Error('Component exceeds viewport width on mobile');
                }
              }
            },
          },
          {
            viewport: VIEWPORT_SIZES.DESKTOP_MEDIUM,
            test: async (element, viewportState) => {
              // Desktop-specific assertions
              const isVisible = await element.isVisible();
              if (!isVisible) {
                throw new Error('Component not visible on desktop');
              }
            },
          },
        ],
      };

      return await testComponentResponsive(page, test);
    },

    async testAccessibility(page: Page) {
      const tests: AccessibilityTest[] = [
        {
          selector: componentSelector,
          expectedRole: 'region',
          expectedAttributes: {
            'aria-label': true,
          },
          keyboardNavigation: true,
        },
      ];

      return await testComponentAccessibility(page, tests);
    },

    async testTouchTargets(page: Page) {
      const tests: TouchTargetTest[] = [
        {
          selector: `${componentSelector} button`,
          minimumSize: 44,
          description: 'Interactive buttons',
        },
        {
          selector: `${componentSelector} a`,
          minimumSize: 44,
          description: 'Links',
        },
      ];

      return await testTouchTargets(page, tests);
    },

    async runFullSuite(page: Page) {
      const results = {
        responsive: await this.testResponsiveBehavior(page),
        accessibility: await this.testAccessibility(page),
        touchTargets: await this.testTouchTargets(page),
      };

      return results;
    },
  };
};