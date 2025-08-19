import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useResponsive } from '../hooks/useViewport';

export interface AccessibilitySettings {
  highContrast: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  focusIndicator: boolean;
  keyboardNavigation: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface AccessibilityState {
  isScreenReaderActive: boolean;
  prefersReducedMotion: boolean;
  highContrastMode: boolean;
  focusVisible: boolean;
  keyboardNavigationActive: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  state: AccessibilityState;
  isMobile: boolean;
  isTablet: boolean;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetToDefaults: () => void;
  applyAccessibilityStyles: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  getResponsiveAriaLabel: (mobile: string, tablet?: string, desktop?: string) => string;
  getScreenReaderText: (text: string, context?: { action?: string; state?: string; position?: string }) => string;
  getKeyboardShortcuts: () => Record<string, string>;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  screenReader: false,
  fontSize: 'medium',
  reducedMotion: false,
  focusIndicator: true,
  keyboardNavigation: true,
  colorBlindness: 'none'
};

const defaultState: AccessibilityState = {
  isScreenReaderActive: false,
  prefersReducedMotion: false,
  highContrastMode: false,
  focusVisible: false,
  keyboardNavigationActive: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [state, setState] = useState<AccessibilityState>(defaultState);
  const { isMobile, isTablet } = useResponsive();

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

      setState(prev => ({
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
        setState(prev => ({ ...prev, keyboardNavigationActive: true }));
        clearTimeout(keyboardTimeout);
        keyboardTimeout = setTimeout(() => {
          setState(prev => ({ ...prev, keyboardNavigationActive: false }));
        }, 3000);
      }
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, keyboardNavigationActive: false }));
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

  useEffect(() => {
    // Load saved accessibility settings from localStorage
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply accessibility styles
    applyAccessibilityStyles();
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

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

  // Get device-specific keyboard shortcuts
  const getKeyboardShortcuts = useCallback(() => {
    const baseShortcuts = {
      escape: 'Escape pro zavření',
      enter: 'Enter pro aktivaci',
      space: 'Mezerník pro výběr',
      tab: 'Tab pro navigaci',
    };

    if (isMobile) {
      return {
        ...baseShortcuts,
        swipe: 'Přejetí pro navigaci',
        doubleTap: 'Dvojité klepnutí pro aktivaci',
      };
    }

    return {
      ...baseShortcuts,
      arrows: 'Šipky pro navigaci',
      home: 'Home pro začátek',
      end: 'End pro konec',
    };
  }, [isMobile]);

  const applyAccessibilityStyles = () => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (settings.highContrast || state.highContrastMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${settings.fontSize}`);

    // Apply reduced motion
    if (settings.reducedMotion || state.prefersReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply focus indicator
    if (settings.focusIndicator) {
      root.classList.add('focus-indicator');
    } else {
      root.classList.remove('focus-indicator');
    }

    // Apply color blindness simulation
    root.classList.remove('color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
    if (settings.colorBlindness !== 'none') {
      root.classList.add(`color-blind-${settings.colorBlindness}`);
    }

    // Apply keyboard navigation styles
    if (settings.keyboardNavigation || state.keyboardNavigationActive) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    // Apply device-specific classes
    if (isMobile) {
      root.classList.add('mobile-device');
    } else {
      root.classList.remove('mobile-device');
    }

    if (isTablet) {
      root.classList.add('tablet-device');
    } else {
      root.classList.remove('tablet-device');
    }
  };

  const value: AccessibilityContextType = {
    settings,
    state,
    isMobile,
    isTablet,
    updateSetting,
    updateSettings,
    resetToDefaults,
    applyAccessibilityStyles,
    announce,
    getResponsiveAriaLabel,
    getScreenReaderText,
    getKeyboardShortcuts,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
