import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { DEFAULT_SHORTCUTS, shortcutsStore, ShortcutId } from '../utils/shortcuts';

interface ShortcutsContextValue {
  getActiveShortcuts: () => Record<ShortcutId, string>;
  setShortcut: (id: ShortcutId, key: string) => void;
  resetToDefaults: () => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export const ShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getActiveShortcuts = useCallback(() => shortcutsStore.getActiveShortcuts(), []);
  const setShortcut = useCallback((id: ShortcutId, key: string) => shortcutsStore.setShortcut(id, key), []);
  const resetToDefaults = useCallback(() => shortcutsStore.resetToDefaults(), []);

  const value = useMemo<ShortcutsContextValue>(() => ({ getActiveShortcuts, setShortcut, resetToDefaults }), [getActiveShortcuts, setShortcut, resetToDefaults]);
  return <ShortcutsContext.Provider value={value}>{children}</ShortcutsContext.Provider>;
};

export const useShortcuts = (): ShortcutsContextValue => {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error('useShortcuts must be used within ShortcutsProvider');
  return ctx;
};

export const defaultShortcuts = DEFAULT_SHORTCUTS;


