/**
 * Viewport testing utilities for responsive component testing
 * Provides standardized viewport sizes and testing helpers
 */

import type { ViewportState } from '../../types';

// Standard viewport sizes based on common devices and breakpoints
export const VIEWPORT_SIZES = {
  // Mobile devices
  MOBILE_SMALL: { width: 320, height: 568 }, // iPhone SE (1st gen)
  MOBILE_MEDIUM: { width: 375, height: 667 }, // iPhone SE (2nd gen)
  MOBILE_LARGE: { width: 390, height: 844 }, // iPhone 12
  MOBILE_XL: { width: 414, height: 896 }, // iPhone 11 Pro Max
  
  // Tablets
  TABLET_PORTRAIT: { width: 768, height: 1024 }, // iPad
  TABLET_LANDSCAPE: { width: 1024, height: 768 }, // iPad landscape
  TABLET_PRO: { width: 1024, height: 1366 }, // iPad Pro
  
  // Desktop
  DESKTOP_SMALL: { width: 1280, height: 720 }, // Small laptop
  DESKTOP_MEDIUM: { width: 1440, height: 900 }, // Standard desktop
  DESKTOP_LARGE: { width: 1920, height: 1080 }, // Full HD
  DESKTOP_XL: { width: 2560, height: 1440 }, // 2K display
} as const;

// Device configurations for testing
export interface TestDevice {
  name: string;
  viewport: { width: number; height: number };
  userAgent: string;
  touchEnabled: boolean;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio?: number;
}

export const TEST_DEVICES: TestDevice[] = [
  // Mobile Devices
  {
    name: 'iPhone SE',
    viewport: VIEWPORT_SIZES.MOBILE_MEDIUM,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    orientation: 'portrait',
    devicePixelRatio: 2,
  },
  {
    name: 'iPhone 12',
    viewport: VIEWPORT_SIZES.MOBILE_LARGE,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    orientation: 'portrait',
    devicePixelRatio: 3,
  },
  {
    name: 'Samsung Galaxy S21',
    viewport: { width: 384, height: 854 },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    touchEnabled: true,
    orientation: 'portrait',
    devicePixelRatio: 2.75,
  },
  
  // Tablets
  {
    name: 'iPad',
    viewport: VIEWPORT_SIZES.TABLET_PORTRAIT,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    orientation: 'portrait',
    devicePixelRatio: 2,
  },
  {
    name: 'iPad Pro',
    viewport: VIEWPORT_SIZES.TABLET_PRO,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    orientation: 'portrait',
    devicePixelRatio: 2,
  },
  
  // Desktop
  {
    name: 'Desktop Small',
    viewport: VIEWPORT_SIZES.DESKTOP_SMALL,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    touchEnabled: false,
    orientation: 'landscape',
    devicePixelRatio: 1,
  },
  {
    name: 'Desktop Large',
    viewport: VIEWPORT_SIZES.DESKTOP_LARGE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    touchEnabled: false,
    orientation: 'landscape',
    devicePixelRatio: 1,
  },
];

// Breakpoint testing utilities
export const BREAKPOINT_TESTS = {
  mobile: [
    VIEWPORT_SIZES.MOBILE_SMALL,
    VIEWPORT_SIZES.MOBILE_MEDIUM,
    VIEWPORT_SIZES.MOBILE_LARGE,
  ],
  tablet: [
    VIEWPORT_SIZES.TABLET_PORTRAIT,
    VIEWPORT_SIZES.TABLET_LANDSCAPE,
  ],
  desktop: [
    VIEWPORT_SIZES.DESKTOP_SMALL,
    VIEWPORT_SIZES.DESKTOP_MEDIUM,
    VIEWPORT_SIZES.DESKTOP_LARGE,
  ],
} as const;

/**
 * Creates a viewport state for testing
 */
export const createTestViewportState = (
  viewport: { width: number; height: number },
  touchEnabled: boolean = false
): ViewportState => {
  const getBreakpoint = (width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const getOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
    return width > height ? 'landscape' : 'portrait';
  };

  return {
    width: viewport.width,
    height: viewport.height,
    breakpoint: getBreakpoint(viewport.width),
    orientation: getOrientation(viewport.width, viewport.height),
    touchDevice: touchEnabled,
  };
};

/**
 * Gets all viewport sizes for a specific breakpoint
 */
export const getViewportsForBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
  return BREAKPOINT_TESTS[breakpoint];
};

/**
 * Gets test devices for a specific breakpoint
 */
export const getDevicesForBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
  return TEST_DEVICES.filter(device => {
    const deviceBreakpoint = createTestViewportState(device.viewport, device.touchEnabled).breakpoint;
    return deviceBreakpoint === breakpoint;
  });
};

/**
 * Creates a responsive test configuration
 */
export const createResponsiveTestConfig = (
  devices: TestDevice[] = TEST_DEVICES
) => {
  return devices.map(device => ({
    ...device,
    viewportState: createTestViewportState(device.viewport, device.touchEnabled),
  }));
};

/**
 * Utility to check if a viewport matches expected breakpoint behavior
 */
export const validateBreakpointBehavior = (
  viewport: { width: number; height: number },
  expectedBreakpoint: 'mobile' | 'tablet' | 'desktop'
): boolean => {
  const state = createTestViewportState(viewport);
  return state.breakpoint === expectedBreakpoint;
};

/**
 * Gets critical viewport sizes for comprehensive testing
 */
export const getCriticalViewports = () => {
  return [
    // Boundary testing - just below and above breakpoints
    { width: 639, height: 800 }, // Just below mobile breakpoint
    { width: 640, height: 800 }, // Mobile breakpoint
    { width: 1023, height: 800 }, // Just below tablet breakpoint  
    { width: 1024, height: 800 }, // Tablet breakpoint
    { width: 1279, height: 800 }, // Just below desktop breakpoint
    { width: 1280, height: 800 }, // Desktop breakpoint
    
    // Common device sizes
    ...Object.values(VIEWPORT_SIZES),
  ];
};

/**
 * Performance testing viewport configurations
 */
export const PERFORMANCE_TEST_VIEWPORTS = [
  { name: 'Mobile', ...VIEWPORT_SIZES.MOBILE_MEDIUM },
  { name: 'Tablet', ...VIEWPORT_SIZES.TABLET_PORTRAIT },
  { name: 'Desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM },
] as const;

/**
 * Accessibility testing viewport configurations
 */
export const ACCESSIBILITY_TEST_VIEWPORTS = [
  // Focus on mobile and tablet for touch accessibility
  { name: 'Mobile Small', ...VIEWPORT_SIZES.MOBILE_SMALL, touchEnabled: true },
  { name: 'Mobile Large', ...VIEWPORT_SIZES.MOBILE_LARGE, touchEnabled: true },
  { name: 'Tablet', ...VIEWPORT_SIZES.TABLET_PORTRAIT, touchEnabled: true },
  { name: 'Desktop', ...VIEWPORT_SIZES.DESKTOP_MEDIUM, touchEnabled: false },
] as const;