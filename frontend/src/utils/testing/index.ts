/**
 * Responsive testing utilities
 * Comprehensive testing tools for responsive design validation
 */

// Viewport and device utilities
export * from './viewportUtils';
export * from './deviceSimulation';

// Visual regression testing
export * from './visualRegression';

// Component testing
export * from './componentTesting';

// Re-export commonly used types and constants
export type {
  ViewportState,
  ResponsiveConfig,
  ResponsiveComponentState,
} from '../../types';

// Convenience exports for common testing scenarios
export {
  VIEWPORT_SIZES,
  TEST_DEVICES,
  BREAKPOINT_TESTS,
  PERFORMANCE_TEST_VIEWPORTS,
  ACCESSIBILITY_TEST_VIEWPORTS,
} from './viewportUtils';

export {
  simulateDevice,
  simulateViewportChange,
  simulateDeviceRotation,
  testAcrossViewports,
  simulateTouchInteraction,
  validateTouchTargets,
  captureResponsiveScreenshots,
  testKeyboardNavigation,
  createDevicePresets,
} from './deviceSimulation';

export {
  captureResponsiveScreenshots as captureVisualScreenshots,
  testComponentAcrossBreakpoints,
  testPageLayoutResponsive,
  testFormResponsive as testFormVisualResponsive,
  testNavigationResponsive as testNavigationVisualResponsive,
  testModalResponsive,
  createComponentVisualSuite,
  createContentMasks,
  testWithPerformanceMetrics,
  DEFAULT_VISUAL_OPTIONS,
} from './visualRegression';

export {
  testComponentResponsive,
  testTouchTargets,
  testComponentAccessibility,
  testLayoutStability,
  testFormResponsive,
  testNavigationResponsive,
  createComponentTestSuite,
} from './componentTesting';