import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface SettingsData {
  theme: 'light' | 'dark';
  highContrast: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  reducedMotion: boolean;
  focusIndicator: boolean;
  tooltips: boolean;
}

const STORAGE_KEY = 'eduai.settings.v1';

const DEFAULT_SETTINGS: SettingsData = {
  theme: 'light',
  highContrast: false,
  fontSize: 'md',
  reducedMotion: false,
  focusIndicator: true,
  tooltips: true,
};

interface SettingsContextValue {
  settings: SettingsData;
  updateSettings: (partial: Partial<SettingsData>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as SettingsData) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.style.setProperty('--eduai-font-scale', settings.fontSize === 'lg' ? '1.1' : settings.fontSize === 'sm' ? '0.95' : '1');
    document.documentElement.classList.toggle('hc', settings.highContrast);
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const value = useMemo<SettingsContextValue>(() => ({ settings, updateSettings, resetSettings }), [settings, updateSettings, resetSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};


