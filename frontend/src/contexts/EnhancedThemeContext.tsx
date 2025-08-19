import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';
type ColorScheme = 'default' | 'high-contrast' | 'warm' | 'cool';

interface ThemePreferences {
  mode: ThemeMode;
  accentColor: AccentColor;
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  darkVariant: 'default' | 'oled' | 'soft';
}

interface ThemeContextType {
  preferences: ThemePreferences;
  actualTheme: 'light' | 'dark';
  updatePreferences: (updates: Partial<ThemePreferences>) => void;
  resetToDefaults: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const defaultPreferences: ThemePreferences = {
  mode: 'system',
  accentColor: 'blue',
  colorScheme: 'default',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  darkVariant: 'default'
};

const EnhancedThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
};

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
}

export const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultPreferences);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Determine actual theme based on preferences and system
  const actualTheme = preferences.mode === 'system' ? systemTheme : preferences.mode;

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eduai.theme.preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('eduai.theme.preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }, [preferences]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove(
      'theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red',
      'scheme-default', 'scheme-high-contrast', 'scheme-warm', 'scheme-cool',
      'text-small', 'text-medium', 'text-large',
      'reduced-motion', 'high-contrast',
      'dark-default', 'dark-oled', 'dark-soft'
    );

    // Apply current theme
    root.classList.add(actualTheme);
    
    // Apply accent color
    body.classList.add(`theme-${preferences.accentColor}`);
    
    // Apply color scheme
    body.classList.add(`scheme-${preferences.colorScheme}`);
    
    // Apply font size
    body.classList.add(`text-${preferences.fontSize}`);
    
    // Apply accessibility preferences
    if (preferences.reducedMotion) {
      body.classList.add('reduced-motion');
    }
    
    if (preferences.highContrast) {
      body.classList.add('high-contrast');
    }
    
    // Apply dark variant
    if (actualTheme === 'dark') {
      body.classList.add(`dark-${preferences.darkVariant}`);
    }

    // Set CSS custom properties for dynamic theming
    const accentColors = {
      blue: { primary: '#4A90E2', secondary: '#357ABD' },
      green: { primary: '#28A745', secondary: '#1E7E34' },
      purple: { primary: '#6F42C1', secondary: '#5A2D91' },
      orange: { primary: '#FD7E14', secondary: '#E8650E' },
      red: { primary: '#DC3545', secondary: '#C82333' }
    };

    const colors = accentColors[preferences.accentColor];
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);

    // Font size scaling
    const fontSizes = {
      small: '0.9',
      medium: '1.0',
      large: '1.1'
    };
    root.style.setProperty('--font-scale', fontSizes[preferences.fontSize]);

  }, [preferences, actualTheme]);

  // Listen for system accessibility preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && !preferences.reducedMotion) {
        setPreferences(prev => ({ ...prev, reducedMotion: true }));
      }
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (e.matches && !preferences.highContrast) {
        setPreferences(prev => ({ ...prev, highContrast: true }));
      }
    };

    prefersReducedMotion.addEventListener('change', handleMotionChange);
    prefersHighContrast.addEventListener('change', handleContrastChange);

    // Check initial state
    if (prefersReducedMotion.matches && !preferences.reducedMotion) {
      setPreferences(prev => ({ ...prev, reducedMotion: true }));
    }
    if (prefersHighContrast.matches && !preferences.highContrast) {
      setPreferences(prev => ({ ...prev, highContrast: true }));
    }

    return () => {
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
      prefersHighContrast.removeEventListener('change', handleContrastChange);
    };
  }, [preferences.reducedMotion, preferences.highContrast]);

  const updatePreferences = (updates: Partial<ThemePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  const exportPreferences = (): string => {
    return JSON.stringify(preferences, null, 2);
  };

  const importPreferences = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      
      // Validate the imported data
      const validKeys: (keyof ThemePreferences)[] = [
        'mode', 'accentColor', 'colorScheme', 'fontSize', 
        'reducedMotion', 'highContrast', 'darkVariant'
      ];
      
      const isValid = validKeys.every(key => key in parsed);
      if (!isValid) return false;
      
      setPreferences({ ...defaultPreferences, ...parsed });
      return true;
    } catch {
      return false;
    }
  };

  const value: ThemeContextType = {
    preferences,
    actualTheme,
    updatePreferences,
    resetToDefaults,
    exportPreferences,
    importPreferences
  };

  return (
    <EnhancedThemeContext.Provider value={value}>
      {children}
    </EnhancedThemeContext.Provider>
  );
};

export default EnhancedThemeProvider;