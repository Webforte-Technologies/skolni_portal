export type ShortcutId =
  | 'new-chat'
  | 'focus-composer'
  | 'send-message'
  | 'dashboard'
  | 'help'
  | 'shortcuts'
  | 'toggle-theme'
  | 'high-contrast';

export interface PersistedShortcut {
  id: ShortcutId;
  key: string;
}

export const DEFAULT_SHORTCUTS: Record<ShortcutId, string> = {
  'new-chat': 'Ctrl+N',
  'focus-composer': 'Ctrl+L',
  'send-message': 'Ctrl+Enter',
  'dashboard': 'Ctrl+D',
  'help': 'F1',
  'shortcuts': 'Ctrl+/',
  'toggle-theme': 'Ctrl+T',
  'high-contrast': 'Ctrl+H',
};

const STORAGE_KEY = 'eduai.shortcuts.v1';

export const shortcutsStore = {
  getActiveShortcuts(): Record<ShortcutId, string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SHORTCUTS };
      const parsed = JSON.parse(raw) as PersistedShortcut[];
      const result: Record<ShortcutId, string> = { ...DEFAULT_SHORTCUTS };
      for (const item of parsed) {
        result[item.id] = item.key;
      }
      return result;
    } catch {
      return { ...DEFAULT_SHORTCUTS };
    }
  },
  setShortcut(id: ShortcutId, key: string): void {
    const current = this.getActiveShortcuts();
    current[id] = key;
    const persisted: PersistedShortcut[] = Object.entries(current).map(([sid, skey]) => ({ id: sid as ShortcutId, key: skey }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  },
  resetToDefaults(): void {
    const persisted: PersistedShortcut[] = Object.entries(DEFAULT_SHORTCUTS).map(([sid, skey]) => ({ id: sid as ShortcutId, key: skey }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }
};


