import { useEffect, useCallback, useRef } from 'react';
import { useResponsive } from './useViewport';

interface KeyboardNavigationOptions {
  enableArrowKeys?: boolean;
  enableHomeEnd?: boolean;
  enablePageUpDown?: boolean;
  enableEscape?: boolean;
  enableEnterSpace?: boolean;
  circular?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
}

interface NavigationCallbacks {
  onNext?: () => void;
  onPrevious?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  onActivate?: () => void;
  onEscape?: () => void;
}

export const useKeyboardNavigation = (
  options: KeyboardNavigationOptions = {},
  callbacks: NavigationCallbacks = {}
) => {
  const { isMobile, isTablet } = useResponsive();
  const containerRef = useRef<HTMLElement>(null);

  const {
    enableArrowKeys = true,
    enableHomeEnd = !isMobile,
    enablePageUpDown = !isMobile,
    enableEscape = true,
    enableEnterSpace = true,
    circular = false,
    orientation = 'both',
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { key, shiftKey, ctrlKey, metaKey } = e;
    
    // Don't handle if modifier keys are pressed (except shift for reverse navigation)
    if (ctrlKey || metaKey) return;

    switch (key) {
      case 'ArrowUp':
        if (enableArrowKeys && (orientation === 'vertical' || orientation === 'both')) {
          e.preventDefault();
          callbacks.onPrevious?.();
        }
        break;

      case 'ArrowDown':
        if (enableArrowKeys && (orientation === 'vertical' || orientation === 'both')) {
          e.preventDefault();
          callbacks.onNext?.();
        }
        break;

      case 'ArrowLeft':
        if (enableArrowKeys && (orientation === 'horizontal' || orientation === 'both')) {
          e.preventDefault();
          callbacks.onPrevious?.();
        }
        break;

      case 'ArrowRight':
        if (enableArrowKeys && (orientation === 'horizontal' || orientation === 'both')) {
          e.preventDefault();
          callbacks.onNext?.();
        }
        break;

      case 'Home':
        if (enableHomeEnd) {
          e.preventDefault();
          callbacks.onFirst?.();
        }
        break;

      case 'End':
        if (enableHomeEnd) {
          e.preventDefault();
          callbacks.onLast?.();
        }
        break;

      case 'PageUp':
        if (enablePageUpDown) {
          e.preventDefault();
          callbacks.onPrevious?.();
        }
        break;

      case 'PageDown':
        if (enablePageUpDown) {
          e.preventDefault();
          callbacks.onNext?.();
        }
        break;

      case 'Enter':
      case ' ':
        if (enableEnterSpace) {
          e.preventDefault();
          callbacks.onActivate?.();
        }
        break;

      case 'Escape':
        if (enableEscape) {
          e.preventDefault();
          callbacks.onEscape?.();
        }
        break;

      case 'Tab':
        // Handle tab navigation for custom components
        if (containerRef.current) {
          const focusableElements = Array.from(
            containerRef.current.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ) as HTMLElement[];

          const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
          
          if (currentIndex !== -1) {
            let nextIndex;
            
            if (shiftKey) {
              nextIndex = currentIndex - 1;
              if (nextIndex < 0 && circular) {
                nextIndex = focusableElements.length - 1;
              }
            } else {
              nextIndex = currentIndex + 1;
              if (nextIndex >= focusableElements.length && circular) {
                nextIndex = 0;
              }
            }

            if (nextIndex >= 0 && nextIndex < focusableElements.length) {
              e.preventDefault();
              focusableElements[nextIndex].focus();
            }
          }
        }
        break;
    }
  }, [
    enableArrowKeys,
    enableHomeEnd,
    enablePageUpDown,
    enableEscape,
    enableEnterSpace,
    circular,
    orientation,
    callbacks,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  // Get device-specific navigation instructions
  const getNavigationInstructions = useCallback(() => {
    const instructions: string[] = [];

    if (isMobile) {
      instructions.push('Swipe to navigate');
      if (enableEnterSpace) instructions.push('Double tap to activate');
    } else {
      if (enableArrowKeys) instructions.push('Use arrow keys to navigate');
      if (enableHomeEnd) instructions.push('Home/End for first/last');
      if (enableEnterSpace) instructions.push('Enter or Space to activate');
    }

    if (enableEscape) instructions.push('Escape to close');

    return instructions.join(', ');
  }, [isMobile, enableArrowKeys, enableHomeEnd, enableEnterSpace, enableEscape]);

  return {
    containerRef,
    getNavigationInstructions,
    isMobile,
    isTablet,
  };
};

// Hook for managing roving tabindex pattern
export const useRovingTabIndex = (items: HTMLElement[], activeIndex: number = 0) => {
  const { isMobile } = useResponsive();

  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
        
        // Add ARIA attributes for better screen reader support
        item.setAttribute('role', item.getAttribute('role') || 'option');
        item.setAttribute('aria-selected', (index === activeIndex).toString());
        
        if (isMobile) {
          // Add touch-friendly attributes for mobile
          item.setAttribute('aria-label', `${item.textContent || item.getAttribute('aria-label')}, item ${index + 1} of ${items.length}`);
        }
      }
    });
  }, [items, activeIndex, isMobile]);

  const focusItem = useCallback((index: number) => {
    if (items[index]) {
      items[index].focus();
    }
  }, [items]);

  return { focusItem };
};

// Hook for skip links
export const useSkipLinks = () => {
  const { isMobile } = useResponsive();
  
  const createSkipLink = useCallback((targetId: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
    
    // Add mobile-specific styling
    if (isMobile) {
      skipLink.className += ' focus:text-lg focus:px-6 focus:py-3';
    }
    
    return skipLink;
  }, [isMobile]);

  const addSkipLinks = useCallback((links: Array<{ targetId: string; label: string }>) => {
    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-links';
    
    links.forEach(({ targetId, label }) => {
      const skipLink = createSkipLink(targetId, label);
      skipContainer.appendChild(skipLink);
    });
    
    document.body.insertBefore(skipContainer, document.body.firstChild);
    
    return () => {
      if (skipContainer.parentNode) {
        skipContainer.parentNode.removeChild(skipContainer);
      }
    };
  }, [createSkipLink]);

  return { addSkipLinks };
};