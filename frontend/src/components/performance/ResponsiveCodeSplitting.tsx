import React, { Suspense, lazy } from 'react';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from './LoadingSkeleton';

// Device-specific component loaders
const MobileComponents = {
  Dashboard: lazy(() => import('../dashboard/MobileDashboard')),
  Chat: lazy(() => import('../chat/MobileChatInterface')),
  Navigation: lazy(() => import('../layout/MobileNavigation')),
};

const TabletComponents = {
  Dashboard: lazy(() => import('../dashboard/TabletDashboard')),
  Chat: lazy(() => import('../chat/TabletChatInterface')),
  Navigation: lazy(() => import('../layout/Header')),
};

const DesktopComponents = {
  Dashboard: lazy(() => import('../../pages/dashboard/DashboardPage')),
  Chat: lazy(() => import('../../pages/chat/ChatPage')),
  Navigation: lazy(() => import('../layout/Header')),
  FileExport: lazy(() => import('../ui/FileExport')),
  AdvancedCharts: lazy(() => import('../ui/ResponsiveChart').then(module => ({ default: module.ResponsiveChart }))),
};

interface ResponsiveComponentLoaderProps {
  component: keyof typeof MobileComponents | keyof typeof TabletComponents | keyof typeof DesktopComponents;
  fallback?: React.ComponentType;
  props?: Record<string, any>;
  className?: string;
}

export const ResponsiveComponentLoader: React.FC<ResponsiveComponentLoaderProps> = ({
  component,
  fallback: FallbackComponent = LoadingSkeleton,
  props = {},
  className = '',
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getComponent = () => {
    if (isMobile && component in MobileComponents) {
      return MobileComponents[component as keyof typeof MobileComponents];
    }
    if (isTablet && component in TabletComponents) {
      return TabletComponents[component as keyof typeof TabletComponents];
    }
    if (isDesktop && component in DesktopComponents) {
      return DesktopComponents[component as keyof typeof DesktopComponents];
    }
    
    // Fallback to desktop component if device-specific version doesn't exist
    if (component in DesktopComponents) {
      return DesktopComponents[component as keyof typeof DesktopComponents];
    }
    
    return null;
  };

  const Component = getComponent();

  if (!Component) {
    console.warn(`Component "${component}" not found for current device type`);
    return <FallbackComponent />;
  }

  return (
    <div className={className}>
      <Suspense fallback={<FallbackComponent />}>
        <Component {...(props as any)} />
      </Suspense>
    </div>
  );
};

// Higher-order component for responsive code splitting
export const withResponsiveCodeSplitting = <P extends object>(
  components: {
    mobile?: React.ComponentType<P>;
    tablet?: React.ComponentType<P>;
    desktop: React.ComponentType<P>;
  },
  fallback?: React.ComponentType
) => {
  return React.forwardRef<any, P & React.RefAttributes<any>>((props, ref) => {
    const { isMobile, isTablet, isDesktop } = useResponsive();

    const Component = React.useMemo(() => {
      if (isMobile && components.mobile) {
        return components.mobile;
      }
      if (isTablet && components.tablet) {
        return components.tablet;
      }
      return components.desktop;
    }, [isMobile, isTablet, isDesktop]);

    return (
      <Suspense fallback={fallback ? React.createElement(fallback) : <LoadingSkeleton />}>
        <Component {...(props as P)} ref={ref} />
      </Suspense>
    );
  });
};

// Utility for conditional loading based on device capabilities
interface ConditionalLoadProps {
  condition: (viewport: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }) => boolean;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ComponentType;
  props?: Record<string, any>;
}

export const ConditionalLoad: React.FC<ConditionalLoadProps> = ({
  condition,
  component,
  fallback: FallbackComponent = LoadingSkeleton,
  props = {},
}) => {
  const viewport = useResponsive();
  const shouldLoad = condition(viewport);

  if (!shouldLoad) {
    return <FallbackComponent />;
  }

  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Device-specific feature flags
export const DeviceFeatures = {
  // Features available on mobile
  mobile: {
    basicChat: true,
    simpleCalculations: true,
    fileUpload: false,
    advancedCharts: false,
    pdfExport: false,
    multipleWindows: false,
  },
  
  // Features available on tablet
  tablet: {
    basicChat: true,
    simpleCalculations: true,
    fileUpload: true,
    advancedCharts: true,
    pdfExport: false,
    multipleWindows: false,
  },
  
  // Features available on desktop
  desktop: {
    basicChat: true,
    simpleCalculations: true,
    fileUpload: true,
    advancedCharts: true,
    pdfExport: true,
    multipleWindows: true,
  },
};

// Hook for checking feature availability
export const useDeviceFeatures = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const features = React.useMemo(() => {
    if (isMobile) return DeviceFeatures.mobile;
    if (isTablet) return DeviceFeatures.tablet;
    return DeviceFeatures.desktop;
  }, [isMobile, isTablet, isDesktop]);

  return features;
};