import { useState, useEffect } from 'react';

export interface TypingEffectSettings {
  enabled: boolean;
  speed: number; // milliseconds per character
  showCursor: boolean;
  cursorBlinkSpeed: number;
}

const DEFAULT_SETTINGS: TypingEffectSettings = {
  enabled: true,
  speed: 30,
  showCursor: true,
  cursorBlinkSpeed: 500,
};

const STORAGE_KEY = 'typingEffectSettings';

export const useTypingEffect = () => {
  const [settings, setSettings] = useState<TypingEffectSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load typing effect settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: Partial<TypingEffectSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save typing effect settings:', error);
    }
  };

  // Reset to default settings
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to reset typing effect settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  };
};
