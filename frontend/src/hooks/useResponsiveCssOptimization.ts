/**
 * React hook for responsive CSS optimization
 * Manages critical CSS loading, font optimization, and adaptive properties
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  optimizeCssLoading, 
  fontOptimizer, 
  cssOptimizer,
  type CriticalCssConfig 
} from '../utils/criticalCss';

export interface ResponsiveCssState {
  isLoading: boolean;
  fontsLoaded: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  criticalCssLoaded: boolean;
}

export interface UseResponsiveCssOptimizationOptions {
  enableCriticalCss?: boolean;
  enableFontOptimization?: boolean;
  enableAdaptiveProperties?: boolean;
  criticalCssConfig?: Partial<CriticalCssConfig>;
}

export function useResponsiveCssOptimization(
  options: UseResponsiveCssOptimizationOptions = {}
) {
  const {
    enableCriticalCss = true,
    enableFontOptimization = true,
    enableAdaptiveProperties = true,
    criticalCssConfig = {},
  } = options;

  const [state, setState] = useState<ResponsiveCssState>({
    isLoading: true,
    fontsLoaded: false,
    currentBreakpoint: 'mobile',
    prefersReducedMotion: false,
    prefersDarkMode: false,
    criticalCssLoaded: false,
  });

  // Initialize CSS optimizations
  useEffect(() => {
    if (enableCriticalCss) {
      optimizeCssLoading(criticalCssConfig);
      setState(prev => ({ ...prev, criticalCssLoaded: true }));
    }
  }, [enableCriticalCss, criticalCssConfig]);

  // Initialize font optimization
  useEffect(() => {
    if (!enableFontOptimization) return;

    let isMounted = true;

    const loadFonts = async () => {
      try {
        await fontOptimizer.preloadCriticalFonts();
        if (isMounted) {
          setState(prev => ({ ...prev, fontsLoaded: true }));
        }
      } catch (error) {
        console.warn('Font loading failed:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, fontsLoaded: true })); // Continue with fallback fonts
        }
      }
    };

    loadFonts();

    return () => {
      isMounted = false;
    };
  }, [enableFontOptimization]);

  // Subscribe to media query changes
  useEffect(() => {
    if (!enableAdaptiveProperties) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to breakpoint changes
    const unsubscribeBreakpoint = cssOptimizer.subscribe('mobile', () => {
      setState(prev => ({ 
        ...prev, 
        currentBreakpoint: cssOptimizer.getCurrentBreakpoint() 
      }));
    });
    unsubscribers.push(unsubscribeBreakpoint);

    // Subscribe to reduced motion preference
    const unsubscribeMotion = cssOptimizer.subscribe('prefers-reduced-motion', (matches) => {
      setState(prev => ({ ...prev, prefersReducedMotion: matches }));
    });
    unsubscribers.push(unsubscribeMotion);

    // Subscribe to dark mode preference
    const unsubscribeDark = cssOptimizer.subscribe('prefers-dark', (matches) => {
      setState(prev => ({ ...prev, prefersDarkMode: matches }));
    });
    unsubscribers.push(unsubscribeDark);

    // Set initial values
    setState(prev => ({
      ...prev,
      currentBreakpoint: cssOptimizer.getCurrentBreakpoint(),
      prefersReducedMotion: cssOptimizer.prefersReducedMotion(),
      prefersDarkMode: cssOptimizer.prefersDarkMode(),
    }));

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [enableAdaptiveProperties]);

  // Update loading state
  useEffect(() => {
    const isLoading = enableFontOptimization ? !state.fontsLoaded : false;
    setState(prev => ({ ...prev, isLoading }));
  }, [state.fontsLoaded, enableFontOptimization]);

  // Utility functions
  const loadFont = useCallback(async (
    fontFamily: string, 
    options?: { weight?: string; style?: string }
  ) => {
    if (!enableFontOptimization) return;
    
    try {
      await fontOptimizer.loadFont(fontFamily, options);
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}:`, error);
    }
  }, [enableFontOptimization]);

  const getAdaptiveValue = useCallback((
    mobileValue: string | number,
    tabletValue?: string | number,
    desktopValue?: string | number
  ) => {
    switch (state.currentBreakpoint) {
      case 'mobile':
        return mobileValue;
      case 'tablet':
        return tabletValue || mobileValue;
      case 'desktop':
        return desktopValue || tabletValue || mobileValue;
      default:
        return mobileValue;
    }
  }, [state.currentBreakpoint]);

  const getCssCustomProperty = useCallback((property: string) => {
    if (typeof document === 'undefined') return '';
    
    return getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim();
  }, []);

  const setCssCustomProperty = useCallback((property: string, value: string) => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.style.setProperty(property, value);
  }, []);

  // Responsive utility functions
  const isMobile = state.currentBreakpoint === 'mobile';
  const isTablet = state.currentBreakpoint === 'tablet';
  const isDesktop = state.currentBreakpoint === 'desktop';
  const isTouchDevice = isMobile || isTablet;

  return {
    // State
    ...state,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,

    // Actions
    loadFont,
    getAdaptiveValue,
    getCssCustomProperty,
    setCssCustomProperty,

    // Utilities
    breakpoint: state.currentBreakpoint,
    shouldReduceMotion: state.prefersReducedMotion,
    shouldUseDarkMode: state.prefersDarkMode,
  };
}

/**
 * Hook for managing adaptive CSS custom properties
 */
export function useAdaptiveProperties() {
  const { getCssCustomProperty, setCssCustomProperty, currentBreakpoint } = 
    useResponsiveCssOptimization({ enableAdaptiveProperties: true });

  const getSpacing = useCallback((size: string) => {
    return getCssCustomProperty(`--space-${size}`);
  }, [getCssCustomProperty]);

  const getRadius = useCallback((size: string) => {
    return getCssCustomProperty(`--radius-${size}`);
  }, [getCssCustomProperty]);

  const getShadow = useCallback((size: string) => {
    return getCssCustomProperty(`--shadow-${size}`);
  }, [getCssCustomProperty]);

  const getDuration = useCallback((speed: string) => {
    return getCssCustomProperty(`--duration-${speed}`);
  }, [getCssCustomProperty]);

  const updateAdaptiveProperty = useCallback((
    property: string, 
    mobileValue: string,
    tabletValue?: string,
    desktopValue?: string
  ) => {
    let value = mobileValue;
    
    switch (currentBreakpoint) {
      case 'tablet':
        value = tabletValue || mobileValue;
        break;
      case 'desktop':
        value = desktopValue || tabletValue || mobileValue;
        break;
    }
    
    setCssCustomProperty(property, value);
  }, [currentBreakpoint, setCssCustomProperty]);

  return {
    currentBreakpoint,
    getSpacing,
    getRadius,
    getShadow,
    getDuration,
    updateAdaptiveProperty,
    getCssCustomProperty,
    setCssCustomProperty,
  };
}

/**
 * Hook for critical CSS loading status
 */
export function useCriticalCssStatus() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      optimizeCssLoading();
      setIsLoaded(true);
    } catch (error) {
      console.error('Critical CSS loading failed:', error);
      setHasError(true);
    }
  }, []);

  return { isLoaded, hasError };
}