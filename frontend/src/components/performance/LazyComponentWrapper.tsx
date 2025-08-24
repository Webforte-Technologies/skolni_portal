import React, { Suspense, lazy } from 'react';
import { useResponsiveLazyLoading, useComponentLazyLoad } from '../../hooks/useLazyLoading';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from './LoadingSkeleton';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
  mobileOnly?: boolean;
  threshold?: number;
  rootMargin?: string;
}

const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback: FallbackComponent = LoadingSkeleton,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  priority = 'medium',
  mobileOnly = false
}) => {
  const { elementRef, shouldLoad } = useResponsiveLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true,
  });
  const { isMobile } = useResponsive();
  
  // Use priority for future enhancements
  const loadingPriority = priority;

  // If mobileOnly is true, only apply lazy loading on mobile
  const shouldApplyLazyLoading = mobileOnly ? isMobile : true;
  
  // Consider loading priority for future optimizations
  console.debug('Loading priority:', loadingPriority);

  if (!shouldApplyLazyLoading || shouldLoad) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={elementRef} className={className}>
      <FallbackComponent />
    </div>
  );
};

LazyComponentWrapper.displayName = 'LazyComponentWrapper';

export default LazyComponentWrapper;

interface DynamicLazyComponentProps {
  componentLoader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ComponentType;
  props?: Record<string, any>;
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  className?: string;
}

export const DynamicLazyComponent: React.FC<DynamicLazyComponentProps> = ({
  componentLoader,
  fallback: FallbackComponent = LoadingSkeleton,
  props = {},
  priority = 'medium',
  delay = 0,
  className = '',
}) => {
  const { elementRef, shouldLoad } = useResponsiveLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  const {
    Component,
    isLoading,
    error,
    loadComponent,
  } = useComponentLazyLoad(componentLoader, {
    fallback: FallbackComponent,
    delay,
    priority,
  });

  React.useEffect(() => {
    if (shouldLoad && !Component && !isLoading) {
      loadComponent();
    }
  }, [shouldLoad, Component, isLoading, loadComponent]);

  if (error) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        <p>Chyba při načítání komponenty</p>
        <button 
          onClick={loadComponent}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  if (!shouldLoad || isLoading || !Component) {
    return (
      <div ref={elementRef} className={className}>
        <FallbackComponent />
      </div>
    );
  }

  return (
    <div className={className}>
      <Component {...props} />
    </div>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    fallback?: React.ComponentType;
    priority?: 'high' | 'medium' | 'low';
    mobileOnly?: boolean;
  } = {}
) => {
  const LazyWrappedComponent = React.forwardRef<any, P & React.RefAttributes<any>>((props, ref) => {
    const { fallback, priority = 'medium', mobileOnly = false } = options;

    return (
      <LazyComponentWrapper
        fallback={fallback}
        priority={priority}
        mobileOnly={mobileOnly}
      >
        <WrappedComponent {...(props as P)} ref={ref} />
      </LazyComponentWrapper>
    );
  });

  LazyWrappedComponent.displayName = `withLazyLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return LazyWrappedComponent;
};

// Utility for creating lazy-loaded components
export const createLazyComponent = <P extends object>(
  componentLoader: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(componentLoader);

  const ForwardedComponent = React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={fallback ? React.createElement(fallback) : <LoadingSkeleton />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));

  ForwardedComponent.displayName = 'LazyComponent';
  return ForwardedComponent;
};