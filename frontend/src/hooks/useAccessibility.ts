import { useEffect, useRef, useState, useCallback } from 'react';
import { useResponsive } from './useViewport';

interface AccessibilityState {
  isScreenReaderActive: boolean;
  prefersReducedMotion: boolean;
  highContrastMode: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
}

interface FocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  skipLinks?: boolean;
}

export const useAccessibility = () => {
  const { isMobile, isTablet } = useResponsive();
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderActive: false,
    prefersReducedMotion: false,
    highContrastMode: false,
    focusVisible: false,
    keyboardNavigation: false,
  });

  // Detect accessibility preferences
  useEffect(() => {
    const checkAccessibilityPreferences = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrastMode = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Detect screen reader by checking for common screen reader indicators
      const isScreenReaderActive = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis?.getVoices().length > 0;

      setAccessibilityState(prev => ({
        ...prev,
        prefersReducedMotion,
        highContrastMode,
        isScreenReaderActive,
      }));
    };

    checkAccessibilityPreferences();

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    reducedMotionQuery.addEventListener('change', checkAccessibilityPreferences);
    highContrastQuery.addEventListener('change', checkAccessibilityPreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', checkAccessibilityPreferences);
      highContrastQuery.removeEventListener('change', checkAccessibilityPreferences);
    };
  }, []);

  // Track keyboard navigation
  useEffect(() => {
    let keyboardTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        setAccessibilityState(prev => ({ ...prev, keyboardNavigation: true }));
        clearTimeout(keyboardTimeout);
        keyboardTimeout = setTimeout(() => {
          setAccessibilityState(prev => ({ ...prev, keyboardNavigation: false }));
        }, 3000);
      }
    };

    const handleMouseDown = () => {
      setAccessibilityState(prev => ({ ...prev, keyboardNavigation: false }));
      clearTimeout(keyboardTimeout);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      clearTimeout(keyboardTimeout);
    };
  }, []);

  // Get responsive ARIA attributes
  const getResponsiveAriaLabel = useCallback((
    mobileLabel: string,
    tabletLabel?: string,
    desktopLabel?: string
  ) => {
    if (isMobile) return mobileLabel;
    if (isTablet && tabletLabel) return tabletLabel;
    return desktopLabel || mobileLabel;
  }, [isMobile, isTablet]);

  // Get device-specific keyboard shortcuts
  const getKeyboardShortcuts = useCallback(() => {
    const baseShortcuts = {
      escape: 'Escape to close',
      enter: 'Enter to activate',
      space: 'Space to select',
      tab: 'Tab to navigate',
    };

    if (isMobile) {
      return {
        ...baseShortcuts,
        swipe: 'Swipe to navigate',
        doubleTap: 'Double tap to activate',
      };
    }

    return {
      ...baseShortcuts,
      arrows: 'Arrow keys to navigate',
      home: 'Home to go to start',
      end: 'End to go to end',
    };
  }, [isMobile]);

  return {
    ...accessibilityState,
    isMobile,
    isTablet,
    getResponsiveAriaLabel,
    getKeyboardShortcuts,
  };
};

export const useFocusManagement = (options: FocusManagementOptions = {}) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { isMobile } = useResponsive();

  // Focus trap for modals and overlays
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!options.trapFocus || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [options.trapFocus]);

  // Auto focus first element
  useEffect(() => {
    if (options.autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      // On mobile, delay focus to avoid keyboard issues
      const focusDelay = isMobile ? 300 : 0;
      setTimeout(() => {
        firstFocusable?.focus();
      }, focusDelay);
    }
  }, [options.autoFocus, isMobile]);

  // Store and restore focus
  const storeFocus = useCallback(() => {
    if (options.restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [options.restoreFocus]);

  const restoreFocus = useCallback(() => {
    if (options.restoreFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [options.restoreFocus]);

  // Add event listeners
  useEffect(() => {
    if (options.trapFocus) {
      document.addEventListener('keydown', trapFocus);
      return () => document.removeEventListener('keydown', trapFocus);
    }
  }, [trapFocus, options.trapFocus]);

  return {
    containerRef,
    storeFocus,
    restoreFocus,
  };
};

export const useScreenReader = () => {
  const { isScreenReaderActive, isMobile } = useAccessibility();
  
  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Get responsive screen reader text
  const getScreenReaderText = useCallback((
    text: string,
    context?: { action?: string; state?: string; position?: string }
  ) => {
    let screenReaderText = text;
    
    if (context?.action) {
      screenReaderText += `, ${context.action}`;
    }
    
    if (context?.state) {
      screenReaderText += `, ${context.state}`;
    }
    
    if (context?.position && !isMobile) {
      screenReaderText += `, ${context.position}`;
    }
    
    return screenReaderText;
  }, [isMobile]);

  return {
    isScreenReaderActive,
    announce,
    getScreenReaderText,
  };
};