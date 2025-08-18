import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewportState, ResponsiveConfig, ResponsiveComponentState } from '../types';
import { 
  getViewportState, 
  createDebouncedResizeHandler, 
  DEFAULT_RESPONSIVE_CONFIG 
} from '../utils/viewport';

interface ResponsiveContextType {
  viewport: ViewportState;
  config: ResponsiveConfig;
  state: ResponsiveComponentState;
  updateConfig: (newConfig: Partial<ResponsiveConfig>) => void;
  setMenuOpen: (open: boolean) => void;
  setKeyboardVisible: (visible: boolean) => void;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
  config?: Partial<ResponsiveConfig>;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ 
  children, 
  config: initialConfig 
}) => {
  const [config, setConfig] = useState<ResponsiveConfig>({
    ...DEFAULT_RESPONSIVE_CONFIG,
    ...initialConfig,
  });
  
  const [viewport, setViewport] = useState<ViewportState>(() => 
    getViewportState(config)
  );
  
  const [state, setState] = useState<ResponsiveComponentState>(() => ({
    isMobile: viewport.breakpoint === 'mobile',
    isTablet: viewport.breakpoint === 'tablet',
    isDesktop: viewport.breakpoint === 'desktop',
    orientation: viewport.orientation,
    menuOpen: false,
    keyboardVisible: false,
  }));

  // Update component state when viewport changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      isMobile: viewport.breakpoint === 'mobile',
      isTablet: viewport.breakpoint === 'tablet',
      isDesktop: viewport.breakpoint === 'desktop',
      orientation: viewport.orientation,
    }));
  }, [viewport]);

  // Set up resize listener with debounced handler
  useEffect(() => {
    const handleResize = createDebouncedResizeHandler(
      (newViewport: ViewportState) => {
        setViewport(newViewport);
      },
      150, // 150ms debounce delay
      config
    );

    // Initial viewport state
    setViewport(getViewportState(config));

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Add orientation change listener for mobile devices
    const handleOrientationChange = () => {
      // Small delay to ensure viewport dimensions are updated
      setTimeout(() => {
        const newViewport = getViewportState(config);
        setViewport(newViewport);
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [config]);

  // Handle keyboard visibility on mobile devices
  useEffect(() => {
    if (!viewport.touchDevice) return;

    let initialViewportHeight = window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // If viewport height decreased significantly, keyboard is likely visible
      const keyboardThreshold = 150; // pixels
      const isKeyboardVisible = heightDifference > keyboardThreshold;
      
      setState(prevState => ({
        ...prevState,
        keyboardVisible: isKeyboardVisible,
      }));
    };

    // Use both resize and visual viewport API if available
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }

    return () => {
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
    };
  }, [viewport.touchDevice]);

  // Auto-close mobile menu when switching to desktop
  useEffect(() => {
    if (viewport.breakpoint === 'desktop' && state.menuOpen) {
      setState(prevState => ({
        ...prevState,
        menuOpen: false,
      }));
    }
  }, [viewport.breakpoint, state.menuOpen]);

  const updateConfig = (newConfig: Partial<ResponsiveConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  };

  const setMenuOpen = (open: boolean) => {
    setState(prevState => ({
      ...prevState,
      menuOpen: open,
    }));
  };

  const setKeyboardVisible = (visible: boolean) => {
    setState(prevState => ({
      ...prevState,
      keyboardVisible: visible,
    }));
  };

  const value: ResponsiveContextType = {
    viewport,
    config,
    state,
    updateConfig,
    setMenuOpen,
    setKeyboardVisible,
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};