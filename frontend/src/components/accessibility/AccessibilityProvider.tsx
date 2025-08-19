import React, { createContext, useContext, useEffect } from 'react';
import { useAccessibility, useScreenReader } from '../../hooks/useAccessibility';
import { useSkipLinks } from '../../hooks/useKeyboardNavigation';

interface AccessibilityContextType {
  isScreenReaderActive: boolean;
  prefersReducedMotion: boolean;
  highContrastMode: boolean;
  keyboardNavigation: boolean;
  isMobile: boolean;
  isTablet: boolean;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  getResponsiveAriaLabel: (mobile: string, tablet?: string, desktop?: string) => string;
  getScreenReaderText: (text: string, context?: { action?: string; state?: string; position?: string }) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { addSkipLinks } = useSkipLinks();

  // Add skip links on mount
  useEffect(() => {
    const skipLinks = [
      { targetId: 'main-content', label: 'Přejít na hlavní obsah' },
      { targetId: 'navigation', label: 'Přejít na navigaci' },
      { targetId: 'footer', label: 'Přejít na zápatí' },
    ];

    const cleanup = addSkipLinks(skipLinks);
    return cleanup;
  }, [addSkipLinks]);

  // Announce page changes for screen readers
  useEffect(() => {
    const handleRouteChange = () => {
      const pageTitle = document.title;
      screenReader.announce(`Navigováno na stránku: ${pageTitle}`, 'polite');
    };

    // Listen for route changes (works with React Router)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [screenReader]);

  const contextValue: AccessibilityContextType = {
    ...accessibility,
    announce: screenReader.announce,
    getScreenReaderText: screenReader.getScreenReaderText,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};