import React, { createContext, useContext, useEffect, useState } from 'react';
import { useResponsive } from '../hooks/useViewport';

interface ResponsiveFormState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  keyboardVisible: boolean;
  touchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  formLayout: 'single-column' | 'multi-column';
}

interface ResponsiveFormContextType extends ResponsiveFormState {
  setKeyboardVisible: (visible: boolean) => void;
}

const ResponsiveFormContext = createContext<ResponsiveFormContextType | undefined>(undefined);

export const useResponsiveForm = () => {
  const context = useContext(ResponsiveFormContext);
  if (!context) {
    throw new Error('useResponsiveForm must be used within a ResponsiveFormProvider');
  }
  return context;
};

interface ResponsiveFormProviderProps {
  children: React.ReactNode;
}

export const ResponsiveFormProvider: React.FC<ResponsiveFormProviderProps> = ({ children }) => {
  const { isMobile, isTablet, isDesktop, touchDevice, orientation } = useResponsive();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Determine form layout based on viewport
  const formLayout = isMobile ? 'single-column' : 'multi-column';

  // Handle keyboard visibility detection on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      // On mobile, if the viewport height decreases significantly, keyboard is likely visible
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.screen.height;
      const keyboardThreshold = screenHeight * 0.75; // 75% of screen height
      
      setKeyboardVisible(viewportHeight < keyboardThreshold);
    };

    const handleFocusIn = () => {
      // Small delay to allow viewport to adjust
      setTimeout(() => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const screenHeight = window.screen.height;
        const keyboardThreshold = screenHeight * 0.75;
        setKeyboardVisible(viewportHeight < keyboardThreshold);
      }, 300);
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setKeyboardVisible(false);
      }, 300);
    };

    // Listen for viewport changes (keyboard show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Listen for focus events on form inputs
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isMobile]);

  const value: ResponsiveFormContextType = {
    isMobile,
    isTablet,
    isDesktop,
    keyboardVisible,
    touchDevice,
    orientation,
    formLayout,
    setKeyboardVisible,
  };

  return (
    <ResponsiveFormContext.Provider value={value}>
      {children}
    </ResponsiveFormContext.Provider>
  );
};