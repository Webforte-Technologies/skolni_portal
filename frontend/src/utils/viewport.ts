import { ViewportState, ResponsiveConfig } from '../types';

// Default responsive configuration following Tailwind breakpoints
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    mobile: 640,   // sm breakpoint
    tablet: 1024,  // lg breakpoint  
    desktop: 1280, // xl breakpoint
  },
  touchTargetSize: 44, // Minimum 44px touch targets
  animations: {
    enabled: true,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  gestures: {
    swipeThreshold: 50,
    tapTimeout: 300,
  },
};

/**
 * Detects if the device supports touch interactions
 */
export const detectTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Determines the current breakpoint based on viewport width
 */
export const getBreakpoint = (
  width: number,
  config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG
): 'mobile' | 'tablet' | 'desktop' => {
  if (width < config.breakpoints.mobile) {
    return 'mobile';
  } else if (width < config.breakpoints.desktop) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Determines orientation based on viewport dimensions
 */
export const getOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
  return width > height ? 'landscape' : 'portrait';
};

/**
 * Gets the current viewport state
 */
export const getViewportState = (
  config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG
): ViewportState => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      width: 1024,
      height: 768,
      breakpoint: 'desktop',
      orientation: 'landscape',
      touchDevice: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    breakpoint: getBreakpoint(width, config),
    orientation: getOrientation(width, height),
    touchDevice: detectTouchDevice(),
  };
};

/**
 * Debounce utility for resize handlers
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle utility for performance-critical handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Creates a debounced resize handler
 */
export const createDebouncedResizeHandler = (
  callback: (viewport: ViewportState) => void,
  delay: number = 150,
  config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG
) => {
  return debounce(() => {
    const viewport = getViewportState(config);
    callback(viewport);
  }, delay);
};

/**
 * Checks if the current viewport matches a specific breakpoint
 */
export const matchesBreakpoint = (
  targetBreakpoint: 'mobile' | 'tablet' | 'desktop',
  currentBreakpoint?: 'mobile' | 'tablet' | 'desktop'
): boolean => {
  const breakpoint = currentBreakpoint || getViewportState().breakpoint;
  return breakpoint === targetBreakpoint;
};

/**
 * Checks if the current viewport is at or below a specific breakpoint
 */
export const isAtOrBelow = (
  targetBreakpoint: 'mobile' | 'tablet' | 'desktop',
  currentBreakpoint?: 'mobile' | 'tablet' | 'desktop'
): boolean => {
  const breakpoint = currentBreakpoint || getViewportState().breakpoint;
  const order = { mobile: 0, tablet: 1, desktop: 2 };
  return order[breakpoint] <= order[targetBreakpoint];
};

/**
 * Checks if the current viewport is at or above a specific breakpoint
 */
export const isAtOrAbove = (
  targetBreakpoint: 'mobile' | 'tablet' | 'desktop',
  currentBreakpoint?: 'mobile' | 'tablet' | 'desktop'
): boolean => {
  const breakpoint = currentBreakpoint || getViewportState().breakpoint;
  const order = { mobile: 0, tablet: 1, desktop: 2 };
  return order[breakpoint] >= order[targetBreakpoint];
};