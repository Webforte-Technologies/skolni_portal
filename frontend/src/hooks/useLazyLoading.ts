import { useState, useEffect, useRef, useCallback } from 'react';
import { useResponsive } from './useViewport';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
}

export const useLazyLoading = (options: LazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    disabled = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || (triggerOnce && hasTriggered)) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, disabled, hasTriggered]);

  const shouldLoad = disabled || isIntersecting || (triggerOnce && hasTriggered);

  return {
    elementRef,
    isIntersecting,
    shouldLoad,
    hasTriggered,
  };
};

export const useResponsiveLazyLoading = (options: LazyLoadOptions = {}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Enable lazy loading primarily on mobile devices for performance
  const shouldUseLazyLoading = isMobile || isTablet;
  
  return useLazyLoading({
    ...options,
    disabled: !shouldUseLazyLoading,
  });
};

interface ComponentLazyLoadOptions {
  fallback?: React.ComponentType;
  delay?: number;
  priority?: 'high' | 'medium' | 'low';
}

export const useComponentLazyLoad = (
  componentLoader: () => Promise<{ default: React.ComponentType<any> }>,
  options: ComponentLazyLoadOptions = {}
) => {
  const { fallback, delay = 0, priority = 'medium' } = options;
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isMobile } = useResponsive();

  const loadComponent = useCallback(async () => {
    if (Component || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add delay for low priority components on mobile
      if (isMobile && priority === 'low' && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const module = await componentLoader();
      setComponent(() => module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setIsLoading(false);
    }
  }, [componentLoader, Component, isLoading, isMobile, priority, delay]);

  return {
    Component,
    isLoading,
    error,
    loadComponent,
    FallbackComponent: fallback,
  };
};